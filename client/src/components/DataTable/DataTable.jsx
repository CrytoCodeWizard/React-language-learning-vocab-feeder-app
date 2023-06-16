// @/src/components/DataTable/DataTable.jsx
import React, { useState } from "react";
import styles from "./Table.module.css";

import EditVocab from "./../EditVocab/EditVocab";
import AddVocab from "./../AddVocab/AddVocab";
import DisplayVocab from "./../DisplayVocab/DisplayVocab";
import * as Constants from "./../../constants";

const DataTable = ({
  data,
  LIMIT,
  onCreateVocab,
  onUpdateVocab,
  setRefetch,
}) => {
  // state for conditional render of edit form
  const [editRecord, setEditRecord] = useState(false);
  const [addRecord, setAddRecord] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState(false);

  // state for edit form inputs
  const [editForm, setEditForm] = useState({
    id: "",
    dutch: "",
    english: "",
    pronunciationlink: "",
    notes: "",
    set_name: "",
  });

  // state for edit form inputs
  const [addForm, setAddForm] = useState({
    dutch: "",
    english: "",
    pronunciationlink: "",
    notes: "",
    category: "",
  });

  // state for edit form inputs
  const [deleteForm, setDeleteForm] = useState({
    dutch: "",
    english: "",
    pronunciationlink: "",
    notes: "",
    category: "",
  });

  // capture user input in edit form inputs
  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  // capture user input in edit form inputs
  const handleAddChange = (e) => {
    setAddForm({
      ...addForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCancel = () => {
    setAddRecord(false);
    setEditRecord(false);
  };

  // POST request; calls handleVocabCreate to push changes to the page
  const handleDeleteRecord = () => {
    fetch(Constants.VOCAB_RECORDS_ENDPOINT, {
      method: Constants.DELETE_METHOD,
      body: JSON.stringify(deleteForm),
    })
      .then((res) => res.json())
      .then(() => {
        setRefetch((prevState) => !prevState);
      })
      .catch((err) => {
        console.error(Constants.ERROR_STR, err);
      });
  };

  let datatableMarkup;
  if (editRecord) {
    datatableMarkup = (
      <EditVocab
        editForm={editForm}
        handleEditChange={handleEditChange}
        handleCancel={handleCancel}
        setEditRecord={setEditRecord}
        onUpdateVocab={onUpdateVocab}
        styles={styles}
      />
    );
  } else if (addRecord) {
    datatableMarkup = (
      <AddVocab
        addForm={addForm}
        handleAddChange={handleAddChange}
        handleCancel={handleCancel}
        setAddRecord={setAddRecord}
        onCreateVocab={onCreateVocab}
        styles={styles}
      />
    );
  } else {
    datatableMarkup = (
      <DisplayVocab
        data={data}
        LIMIT={LIMIT}
        editForm={editForm}
        editRecord={editRecord}
        deleteRecord={deleteRecord}
        setAddRecord={setAddRecord}
        setEditForm={setEditForm}
        setEditRecord={setEditRecord}
        setDeleteForm={setDeleteForm}
        setDeleteRecord={setDeleteRecord}
        handleDeleteRecord={handleDeleteRecord}
      />
    );
  }

  return <>{datatableMarkup}</>;
};

export default DataTable;
