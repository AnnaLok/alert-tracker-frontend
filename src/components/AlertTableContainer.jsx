import React from 'react';
import Paper from '@material-ui/core/Paper';
import { Typography } from '@material-ui/core';

import DateSelector from './DateSelector';
import AlertHistoryTable from './AlertHistoryTable';
import './table.scss';

export default class AlertTableContainer extends React.Component{
  constructor() {
    super();
    this.state = {
      selectDate: '7days'
    }
  }

  //Sets a new state for DateSelector when input is changed
  handleOnChange(e) {
    this.setState({
      selectDate: e.target.value
    });
  }

  render() {
    //State passed from DateSelector
    const {selectDate} = this.state;

    return (
      <div>
        <Paper className="paper-container">
          <div className="inline">
            <span>
              <Typography className="tableTitle">Alert History</Typography>
            </span>
            <span>
            <DateSelector
              handleOnChange={this.handleOnChange.bind(this)}
            />
            </span>
          </div>
        <AlertHistoryTable
          selectDate={selectDate}
        />
        </Paper>
      </div>
    )
  }
}