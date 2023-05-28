import React, { useState, useEffect } from "react";

import "./../../App.css";
import "./../../Snackbar.css";

import * as Constants from './../../constants';
import DataTable from '../DataTable/DataTable';

const ReviewVocabEntries = (props) => {
  const [vocabRecords, setVocabRecords] = useState([]);

  useEffect(() => {
    fetch(Constants.GET_ALL_VOCAB_RECORDS)
      .then((res) => res.json())
      .then((records) => {
        setVocabRecords(records);
      }).catch((err) => {
        console.error(Constants.ERROR_STR, err);
      });
  },[]);

  return (
    <DataTable vocabRecords={vocabRecords} LIMIT="10"/>
  );
}

export default ReviewVocabEntries;