import React from "react";
import { withStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import NativeSelect from "@material-ui/core/NativeSelect";
import InputBase from "@material-ui/core/InputBase";

//Syling for selector
const BootstrapInput = withStyles(theme => ({
  root: {
    "label + &": {
      marginTop: theme.spacing(2)
    }
  },
  input: {
    borderRadius: 4,
    position: "relative",
    backgroundColor: theme.palette.background.paper,
    border: "1px solid #ced4da",
    fontSize: 15,
    padding: "5px 26px 5px 12px",
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    fontFamily: "sans-serif",
    "&:focus": {
      borderRadius: 4,
      borderColor: "#80bdff",
      boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)"
    }
  }
}))(InputBase);

export default class DateSelector extends React.Component {
  render() {
    return (
      <div>
        <FormControl>
          <InputLabel htmlFor="alert-date">Date</InputLabel>
          <NativeSelect
            id="alert-date"
            name="alert-date"
            onChange={this.props.handleOnChange}
            input={<BootstrapInput />}
          >
            <option value={"7days"}>Last 7 days</option>
            <option value={"2weeks"}>Last 2 weeks</option>
            <option value={"1month"}>Last 1 month</option>
            <option value={"3months"}>Last 3 months</option>
            <option value={"6months"}>Last 6 months</option>
          </NativeSelect>
        </FormControl>
      </div>
    );
  }
}