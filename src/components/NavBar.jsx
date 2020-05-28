import React from 'react';
import {AppBar, Toolbar, Typography }  from '@material-ui/core';
import TrackChanges from '@material-ui/icons/TrackChanges'


export default function NavBar(){
    return(
        <div>
            <AppBar position="static" color="primary">
                <Toolbar>
                    <TrackChanges style={{marginRight:15, fontSize:35}} color="contrastText"/>
                    <Typography variant="overline" color="contrastText">
                        Alert Tracker
                    </Typography>
                </Toolbar>
            </AppBar>
        </div>
    )
}
