import React, { useState, useEffect } from "react";

import "./../../App.css";
import "./../../Snackbar.css";
import styles from "./ReviewVocabEntries.module.css";

import * as Constants from './../../constants';
import Table from "./../Table";

const ReviewVocabEntries = (props) => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetch(Constants.GET_ALL_VOCAB_RECORDS)
      .then((res) => res.json())
      .then((data) => {
        setRecords(data);
      }).catch((err) => {
        console.error(Constants.ERROR_STR, err);
      });
  },[]);

  return (
    <div className="DeckVocabApp">
        <h1>{Constants.DECK_TITLE}</h1>
        <main className={styles.container}>
          <div className={styles.wrapper}>
            <Table data={records} rowsPerPage={10} />
          </div>
        </main>
    </div>
  );
}

export default ReviewVocabEntries;