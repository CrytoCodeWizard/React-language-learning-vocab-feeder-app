// @/src/components/DataTable/DataTable.jsx
import React, { useState } from "react";
import styles from "./Table.module.css";

import EditVocab from "./../EditVocab/EditVocab";
import AddVocab from "./../AddVocab/AddVocab";
import DisplayVocab from "../DisplayVocab/DisplayVocab";

const DataTable = ({ data, LIMIT, onCreateVocab, onUpdateVocab }) => {
  // state for conditional render of edit form
  const [editRecord, setEditRecord] = useState(false);
  const [addRecord, setAddRecord] = useState(false);

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
    set_name: "",
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
        addForm={addForm}
        addRecord={addRecord}
        editForm={editForm}
        editRecord={editRecord}
        setAddForm={setAddForm}
        setAddRecord={setAddRecord}
        setEditForm={setEditForm}
        setEditRecord={setEditRecord}
      />
    );
  }

  return <>{datatableMarkup}</>;
};

export default DataTable;
