import React from 'react';
import Axios from 'axios';
import moment from 'moment';
import 'moment-duration-format';

import { Typography } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import {msToTime} from './AlertHistoryTable.jsx';
import './table.scss';

//Converts ISODate to MMM D format
function convertDate(ISODate){
  if (ISODate === undefined){
    return;
  }
  var ISOdate = moment(ISODate);
  var date = ISOdate.format('MMM D');
  return date;
}

//Returns calculations data for every sprint
function sprintData(alerts){
  var sprints = [];
  var today = moment();
  //Set date to earliest sprint
  var startDate = moment(new Date("2019-10-03T20:00:00.000Z"));
  var endDate = moment(startDate).add(14, 'd');
  //Skip sprints with no alert data
  var lastSprint = alerts.slice(alerts.length-1, alerts.length);
  lastSprint.forEach(sprintDetail => {
    while (moment(sprintDetail.createdAt) > endDate){
      startDate = startDate.add(14,'d');
      endDate = endDate.add(14,'d');
    }
  });
  //Sprint calculations for date, MTTR, alerts, OffHourCalls
  while (endDate <= today){
    var MTTR = 0;
    var alertCount = 0;  
    var offHoursCount = 0;
    alerts.forEach(function(alertDetail) {
      var alertDate = moment(alertDetail.createdAt, "YYYY-MM-DDTHH:mm:ss.SSSZ");
      if (alertDate >= startDate && alertDate <= endDate){
        alertCount++;
        MTTR += alertDetail.closeTime;
        //On Hours are Mon to Fri 10:00AM - 5:00PM
        if (alertDate.hours() < 10 || (alertDate.hours() >= 17 && alertDate.minutes !== 0) || alertDate.day() === 6 || alertDate.day() === 7){
          offHoursCount++;
        }
      }
    });
    MTTR /= alertCount;
    var date = startDate.format();
    sprints.push({date, MTTR, alertCount, offHoursCount});
    startDate = startDate.add(14,'d');
    endDate = endDate.add(14,'d');
  }
  return sprints;
}

//Returns calculations for the most 4 recent sprints
function createLast4Sprints(sprints){
  var last4Sprints = [];
  if (sprints.length > 4){
    last4Sprints = sprints.slice(sprints.length - 4, sprints.length);
  } else {
    var date = "N/A";
    var MTTR = "N/A";
    var alertCount = "N/A";
    var offHoursCount = "N/A";
    last4Sprints = sprints;
    for (let i = sprints.length; i < 4; i++){
      last4Sprints.push({date, MTTR, alertCount, offHoursCount});
    }
  }
  return last4Sprints;
}

//Returns calculations for the lifetime average of all sprint data
function createLifeTimeAvg(sprints){
  var MTTR = 0;
  var alertCount = 0;
  var sprintCount = 0;
  var offHoursCount = 0;
  sprints.forEach(function(sprint) {
    sprintCount++;
    MTTR += sprint.MTTR;
    alertCount += sprint.alertCount;
    offHoursCount += sprint.offHoursCount;
  });
  MTTR /= sprintCount;
  alertCount /= sprintCount;
  offHoursCount /= sprintCount;
  return {MTTR, alertCount, offHoursCount};
}

//Returns the difference of the most recent sprint compared to the lifetime average
function createDiffToAvg(lastSprint, lifeTimeAvg){
  var MTTR = (lastSprint.MTTR - lifeTimeAvg.MTTR)/lifeTimeAvg.MTTR * 100;
  var alertCount = (lastSprint.alertCount - lifeTimeAvg.alertCount)/lifeTimeAvg.alertCount * 100;
  var offHoursCount = (lastSprint.offHoursCount - lifeTimeAvg.offHoursCount)/lifeTimeAvg.offHoursCount * 100;
  return {MTTR, alertCount, offHoursCount};
}

//Create formatted data for table
function createData(alerts) {
  const sprints = sprintData(alerts);
  const last4Sprints = createLast4Sprints(sprints);
  const lifeTimeAvg = createLifeTimeAvg(sprints);
  const diffToAvg = createDiffToAvg(last4Sprints[3], lifeTimeAvg);

  var rows = [];
  rows.push('Measurement', 'Target', 'Lifetime Average', 'Units', '% Diff To Average', convertDate(last4Sprints[0].date), convertDate(last4Sprints[1].date), convertDate(last4Sprints[2].date), convertDate(last4Sprints[3].date));
  rows.push('Time To Restore', '1:00:00', msToTime(lifeTimeAvg.MTTR), 'Hours', Math.round(diffToAvg.MTTR) + '%', msToTime(last4Sprints[0].MTTR), msToTime(last4Sprints[1].MTTR), msToTime(last4Sprints[2].MTTR), msToTime(last4Sprints[3].MTTR));
  rows.push('Alerts', '10', Math.round(lifeTimeAvg.alertCount), 'Alerts Per Sprint', Math.round(diffToAvg.alertCount) + '%', last4Sprints[0].alertCount, last4Sprints[1].alertCount, last4Sprints[2].alertCount, last4Sprints[3].alertCount) ;
  rows.push('Off Call Hours', '0', Math.round(lifeTimeAvg.offHoursCount), 'Calls Per Sprint', Math.round(diffToAvg.offHoursCount) + '%', last4Sprints[0].offHoursCount, last4Sprints[1].offHoursCount, last4Sprints[2].offHoursCount, last4Sprints[3].offHoursCount);
  return rows;
}
  
export default class MTTRTable extends React.Component {
  constructor(props){
    super(props);
    this.state = {alerts: []};
  }

  //Called after the component gets mounted on the DOM
  async componentDidMount() {
    var currentTime = moment().format('X');
    var lastYear = moment().subtract(1,'year').format('X');
    const response = await Axios.get('https://lanwolyn48.execute-api.us-east-1.amazonaws.com/default/content-layer-alerts-tracker/', 
      { headers: {
          'Content-Type': 'application/json', 
          //This key should be removed if we make the tool accessible over internet
          'x-api-key': 'X_API_KEY', 
          'Access-Control-Request-Method': "GET",
          'Access-Control-Request-Headers': 'x-api-key, Content-Type'
        },
        params: {
          startDateTime: lastYear,
          endDateTime: currentTime
        }
      });
    const alerts = response.data;
    this.setState({alerts});
  }

  //Create header for table to render
  createHeader(rows) {
    let header = [];
    for (let j = 0; j < 9; j++) {
      header.push(<TableCell align="center">{rows[j]}</TableCell>)
    }
    return header;
  }

  //Create rows for table to render
  createTable(rows) {
    let table = [];
    let j = 9;
    for (let i = 2; i < 5; i++) {
      let children = [];
      for (; j < i*9; j++) {
        children.push(<TableCell align="center">{rows[j]}</TableCell>)
      }
      table.push(<TableRow>{children}</TableRow>)
    }
    return table;
  }

  render(){
    const rows = createData(this.state.alerts);
    
    return (
      <div>
        <Paper className="paper-container">
          <div className="inline">
            <span>
              <Typography className="tableTitle">Summary</Typography>
            </span>
          </div>
          <TableContainer>
            <Table size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                {this.createHeader(rows)}
                </TableRow>
              </TableHead>
              <TableBody>
                {this.createTable(rows)}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </div>
      );
    }
  }
