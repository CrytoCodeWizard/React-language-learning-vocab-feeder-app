// @/src/components/DataTable/DataTable.jsx
import React, { useState } from "react";

import EditVocab from "./../EditVocab/EditVocab";
import DisplayVocab from "../DisplayVocab/DisplayVocab";

const DataTable = ({ data, LIMIT, onUpdateVocab }) => {
  // state for conditional render of edit form
  const [isEditing, setIsEditing] = useState(false);
  // state for edit form inputs
  const [editForm, setEditForm] = useState({
    id: "",
    dutch: "",
    english: "",
    pronunciationlink: "",
    notes: "",
    set_name: "",
  });

  // capture user input in edit form inputs
  const handleChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  let datatableMarkup;
  let isAdding = false;
  if (isEditing) {
    datatableMarkup = (
      <EditVocab
        editForm={editForm}
        handleChange={handleChange}
        setIsEditing={setIsEditing}
        onUpdateVocab={onUpdateVocab}
      />
    );
  } else if (isAdding) {
    datatableMarkup = <div>test</div>;
  } else {
    datatableMarkup = (
      <DisplayVocab
        data={data}
        LIMIT={LIMIT}
        isEditing={isEditing}
        editForm={editForm}
        setEditForm={setEditForm}
        setIsEditing={setIsEditing}
      />
    );
  }

  return <>{datatableMarkup}</>;
};

export default DataTable;
