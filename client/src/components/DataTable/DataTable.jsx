// @/src/components/DataTable/DataTable.jsx
import React, { useState } from "react";

import { useTheme } from "@table-library/react-table-library/theme";

import EditVocab from "./../EditVocab/EditVocab";
import DisplayVocab from "../DisplayVocab/DisplayVocab";

const DataTable = ({ data, LIMIT, onUpdateVocab }) => {
  console.log(data.length);
  const theme = useTheme({
    HeaderRow: `
        background-color: #eaf5fd;
        .th {
          border-bottom: 1px solid #a0a8ae;
        }
      `,
    Row: `
        &:nth-of-type(odd) {
          background-color: #d2e9fb;
        }

        &:nth-of-type(even) {
          background-color: #eaf5fd;
        }
      `,
    BaseCell: `
        padding: 11px;
      `,
    Cell: `
        &:not(:last-of-type) {
          border-right: 1px solid #a0a8ae;
        }
      `,
  });

  const columns = [
    {
      label: "Dutch",
      field: "dutch",
    },
    {
      label: "English",
      field: "english",
    },
    {
      label: "Pronunciation URL",
      field: "pronunciationlink",
    },
    {
      label: "Notes",
      field: "notes",
    },
    {
      label: "Category",
      field: "set_name",
    },
    {
      label: "Actions",
      field: "editBtn",
    },
  ];

  const [search, setSearch] = useState("");
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

  // when PATCH request happens; auto-hides the form, pushes changes to display
  const handleVocabUpdate = (updatedVocab) => {
    setIsEditing(false);
    onUpdateVocab(updatedVocab);
  };

  // capture user input in edit form inputs
  const handleChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  let datatableMarkup;
  let isAdding = false;
  if (isEditing) {
    datatableMarkup = (
      <EditVocab
        editForm={editForm}
        handleChange={handleChange}
        handleVocabUpdate={handleVocabUpdate}
        handleCancel={handleCancel}
        columns={columns}
        theme={theme}
      />
    );
  } else if (isAdding) {
    datatableMarkup = <div>test</div>;
  } else {
    datatableMarkup = (
      <DisplayVocab
        data={data}
        columns={columns}
        theme={theme}
        LIMIT={LIMIT}
        search={search}
        handleSearch={handleSearch}
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
