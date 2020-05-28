import React from 'react';
import ReactDOM from 'react-dom';

import {MuiThemeProvider, createMuiTheme, Typography} from '@material-ui/core';

import './general.scss';
import App from './App';
import AlertTableContainer from './components/AlertTableContainer';
import MTTRTable from './components/MTTRTable';

//Material ui theme
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#4D3ED6',
      light: '#96A4F2',
      contrastText: '#FFF',
    },
    secondary: {
      main: '#464C4F'
    }
  }
});

ReactDOM.render(
  <React.StrictMode>
    <MuiThemeProvider theme={theme}>
      <App />
      <Typography className="metricTitle" color="secondary">Mean Time To Restore (MTTR)</Typography>
      <MTTRTable/>
      <AlertTableContainer />
    </MuiThemeProvider> 
  </React.StrictMode>,
  document.getElementById('root')
);

