import React from "react";
import "./../../App.css";
import "./SlackDailyVocab.css";
import "./Snackbar.css";
import { withRouter } from './../../utils.js';

class SlackDailyVocab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {data: ''};

    this.handleRecordCountChange = this.handleRecordCountChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    fetch("/getSlackInfo")
      .then((res) => res.json())
      .then((data) => {
        this.setState({data: data})
      });
  }

  handleRecordCountChange(event) {
    this.setState({recordCount: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    this.sendSlack(this.state.recordCount);
  }

  showToast() {
    let x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 5000);
  }

  sendSlack(recordCount) {
    fetch('/sendSlack', {
      method: 'POST',
      body: JSON.stringify({
        recordCount: recordCount
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    }).then((res) => {
      this.showToast();
    });
  }

  render() {
    return (
      <div className="SlackApp">
        <h1>Slack App</h1>
        <form onSubmit={this.handleSubmit} className="slack-form">
          <div className="slack-form-inputs">
            <label>
              <input type="number" min="1" max="25" placeholder="# of Records to Send" name="recordsToSend" onChange={this.handleRecordCountChange} required/>
            </label>
          </div>
          <div className="slack-form-controls">
            <input type="submit" value={!this.state.data ? "Loading..." : this.state.data.sendDailySlackBtnLabel} />
          </div>
        </form>
        <div id="snackbar">Your vocab has been sent to Slack!</div>
      </div>
    );
  }
}

export default withRouter(SlackDailyVocab);