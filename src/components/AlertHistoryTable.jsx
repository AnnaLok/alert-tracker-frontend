import React from 'react';
import Axios from 'axios';
import moment from 'moment';
import 'moment-duration-format';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import './table.scss';

//Converts ISODate to MMM D HH:MMA format
function convertDateTime(ISODate){
  if (ISODate === undefined){
    return;
  }
  var ISOdate = moment(ISODate);
  var date = ISOdate.format('MMM D h:mmA');
  return date;
}

//Converts milliseconds to HH:MM:SS format
function msToTime(ms) {
  var time;
  if (ms === undefined || ms === 0){
    time = "00:00:00";
  } else if (ms < 3600000){
    time = "00:" + moment.duration(ms, "milliseconds").format("mm:ss");
  } else {
    time = moment.duration(ms, "milliseconds").format("HH:mm:ss");
  }
  return time;
}

//Returns which system alert belongs to using alert's name
function nameToSystem(name) {
  if (name === undefined){
    return;
  }
  var nameLower = name.toLowerCase();
  var fadminKeyWords = ["flyers.merchants.wishabi.ca", "db producer", "fadmin", "[jira]", "export_flyer_updates", "delayed job"];
  if (fadminKeyWords.some(str => nameLower.includes(str))){
    return "fadmin";
  } else {
    var systems = [ "ecom item auto categorizer", "flipp-bullwhip", "flipp-ocr", "flyer-item-ocr", "merchant-admin", "navi", "page item auto categorizer" ];
    return systems.find(sys => nameLower.includes(sys));
  }
}

//Create formatted data for table
function createData(alertDetail) {
  var reported = convertDateTime(alertDetail.createdAt);
  var fixed = convertDateTime(alertDetail.updatedAt);
  var timeToRestore = msToTime(moment(alertDetail.updatedAt) - moment(alertDetail.createdAt));
  var name = alertDetail.message;
  var system = nameToSystem(name);
  //Currently all OpsGenie alerts are S1
  var severity = "S1";
  return { reported, fixed, timeToRestore, name, system, severity };
}

export default class AlertHistoryTable extends React.Component {
  constructor(props){
    super(props);
    this.state = {alerts: []};
  }
  
  //HTTP request to AWS HTTP Gateway endpoint
  async callRequest(startDate, endDate){
    const response = await Axios.get('https://lanwolyn48.execute-api.us-east-1.amazonaws.com/default/content-layer-alerts-tracker/', 
      { headers: {
          'Content-Type': 'application/json', 
          //This key should be removed if we make the tool accessible over internet
          'x-api-key': 'JjVFvmiP1J6NvYIs5XvzgaFJnxWOTajU7adB2APB', 
          'Access-Control-Request-Method': "GET",
          'Access-Control-Request-Headers': 'x-api-key, Content-Type'
        },
        params: {
          startDateTime: startDate,
          endDateTime: endDate
        }
      });
    const alerts = response.data;
    this.setState({alerts});
  }

  //Called after the component gets mounted on the DOM
  componentDidMount() {
    //default is last 7 days of alerts
    var currentDate = moment().format('X');
    var last7Days = moment().subtract(1,'week').format('X');
    this.callRequest(last7Days, currentDate);
  }

  //Called after update occurs
  componentDidUpdate (prevProps) {
    if (prevProps.selectDate !== this.props.selectDate){
      var currentDate = moment().format('X');
      var startDate;
      if (this.props.selectDate === '7days'){
        startDate = moment().subtract(1,'week').format('X');
      } else if (this.props.selectDate === '2weeks'){
        startDate = moment().subtract(2,'week').format('X');
      } if (this.props.selectDate === '1month'){
        startDate = moment().subtract(1,'month').format('X');
      } else if (this.props.selectDate === '3months'){
        startDate = moment().subtract(3,'month').format('X');
      } else if (this.props.selectDate === '6months'){
        startDate = moment().subtract(6,'month').format('X');
      }
      this.callRequest(startDate, currentDate);
    }
  }

  //Create rows for table to render
  createRows(alerts){
    var rows = [];
    alerts.forEach(function(alertDetail) {
        rows.push(createData(alertDetail));
    });
    return rows;
  }

  render(){
    const rows = this.createRows(this.state.alerts)

    return (
      <div>
          <TableContainer>
            <Table size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell>Reported</TableCell>
                  <TableCell>Fixed</TableCell>
                  <TableCell>Time To Restore</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>System</TableCell>
                  <TableCell>Severity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row , index) => (
                  <TableRow className="body-row" key={index}>
                    <TableCell>{row.reported}</TableCell>
                    <TableCell>{row.fixed}</TableCell>
                    <TableCell>{row.timeToRestore}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.system}</TableCell>
                    <TableCell>{row.severity}</TableCell>
                  </TableRow> 
                ))}
              </TableBody>
            </Table>
          </TableContainer>
      </div>
    );
  } 
}

export {msToTime};