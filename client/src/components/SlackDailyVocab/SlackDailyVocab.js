import React from "react";
import "./../../App.css";
import "./SlackDailyVocab.css";
import "./Snackbar.css";
import { withRouter } from './../../utils.js';
import * as Constants from './../../constants';

class SlackDailyVocab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {data: ''};

    this.handleRecordCountChange = this.handleRecordCountChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    fetch(Constants.GET_SLACK_INFO_ENDPOINT)
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
    fetch(Constants.SEND_SLACK_MSG_ENDPOINT, {
      method: Constants.POST_METHOD,
      body: JSON.stringify({
        recordCount: recordCount
      }),
      headers: {
        'Content-type': Constants.CONTENT_TYPE_JSON_UTF8,
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
              <input type="number" min={Constants.SLACK_RECORD_MIN} max={Constants.SLACK_RECORD_MAX} placeholder={Constants.SLACK_INPUT_PLACEHOLDER} name="recordsToSend" onChange={this.handleRecordCountChange} required/>
            </label>
          </div>
          <div className="slack-form-controls">
            <input type="submit" value={!this.state.data ? Constants.LOADING_STR : this.state.data.sendDailySlackBtnLabel} />
          </div>
        </form>
        <div id="snackbar">{Constants.SLACK_SENT_CONFIRMATION}</div>
      </div>
    );
  }
}

export default withRouter(SlackDailyVocab);