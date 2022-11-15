import React, { useState, useEffect } from "react";
import "./../../App.css";
import "./SlackDailyVocab.css";
import "./Snackbar.css";

import * as Constants from './../../constants';

const SlackDailyVocab = (props) => {
  const [recordCount, setRecordCount] = useState(0);
  const [data, setData] = useState('');
  
  useEffect(() => {
    fetch(Constants.GET_SLACK_INFO_ENDPOINT)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
      }).catch((err) => {
        console.error(Constants.ERROR_STR, err);
      });
  },[]);

  const HandleRecordCountChange = ((e) => {
    setRecordCount(e.target.value);
  });

  const HandleSubmit = ((e) => {
    e.preventDefault();
    SendSlack(recordCount);
  });

  const ShowToast = (() => {
    let x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 5000);
  });

  const SendSlack = ((recordCount) => {
    fetch(Constants.SEND_SLACK_MSG_ENDPOINT, {
      method: Constants.POST_METHOD,
      body: JSON.stringify({
        recordCount: recordCount
      }),
      headers: {
        'Content-type': Constants.CONTENT_TYPE_JSON_UTF8,
      },
    }).then((res) => {
      ShowToast();
    });
  });

  return (
    <div className="SlackApp">
      <h1>Slack App</h1>
      <form onSubmit={HandleSubmit} className="slack-form">
        <div className="slack-form-inputs">
          <label>
            <input type="number" min={Constants.SLACK_RECORD_MIN} max={Constants.SLACK_RECORD_MAX} placeholder={Constants.SLACK_INPUT_PLACEHOLDER} name="recordsToSend" onChange={HandleRecordCountChange} required/>
          </label>
        </div>
        <div className="slack-form-controls">
          <input type="submit" value={!data ? Constants.LOADING_STR : data.sendDailySlackBtnLabel} />
        </div>
      </form>
      <div id="snackbar">{Constants.SLACK_SENT_CONFIRMATION}</div>
    </div>
  );
}

export default SlackDailyVocab;