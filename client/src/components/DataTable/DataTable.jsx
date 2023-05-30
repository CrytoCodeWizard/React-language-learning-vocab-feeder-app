// @/src/components/DataTable/DataTable.jsx
import React, { useState } from "react";
import styles from "./Table.module.css";

import {
  Table,
  Header,
  HeaderRow,
  HeaderCell,
  Body
} from '@table-library/react-table-library/table';
import { useTheme } from "@table-library/react-table-library/theme";
import { usePagination } from '@table-library/react-table-library/pagination';

import TableSearch from './TableSearch/TableSearch';
import TableFooter from './TableFooter/TableFooter';
import Vocab from './../Vocab/Vocab';
import EditVocab from './../EditVocab/EditVocab';

const DataTable = ({ vocabRecords, LIMIT, onUpdateVocab }) => {
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
      "label" : "Dutch",
      "field" : "dutch"
    },
    {
      "label" : "English",
      "field" : "english"
    },
    {
      "label" : "Pronunciation URL",
      "field" : "pronunciationlink"
    },
    {
      "label" : "Notes",
      "field" : "notes"
    },
    {
      "label" : "Category",
      "field" : "set_name"
    },
    {
      "label" : "Actions",
      "field" : "editBtn"
    }
  ];

  const [search, setSearch] = useState('');
  // state for conditional render of edit form
  const [isEditing, setIsEditing] = useState(false);
  // state for edit form inputs
  const [editForm, setEditForm] = useState({
    id: "",
    dutch: "",
    english: "",
    pronunciationlink: "",
    notes: "",
    set_name: ""
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
      [e.target.name]: e.target.value
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // needed logic for conditional rendering of the form - shows the vocab you want when you want them, and hides it when you don't
  const changeEditState = (vocab) => {
    if(vocab.id === editForm.id) {
      setIsEditing(isEditing => !isEditing) // hides the form
    } else if(isEditing === false) {
      setIsEditing(isEditing => !isEditing) // shows the form
    }
  };

  // capture the vocab you wish to edit, set to state
  const captureEdit = (clickedVocab) => {
    let filtered = vocabRecords.filter(vocab => vocab.id === clickedVocab.id);
    setEditForm(filtered[0]);
  };

  const data = ({
    nodes: vocabRecords.filter((vocabRecord) =>
      vocabRecord.dutch.toLowerCase().includes(search.toLowerCase())
    ),
  });

  const pageCount = parseInt(vocabRecords.length / LIMIT) + 1;
  const pagination = usePagination(
    data,
    {
      state: {
        page: 0,
        size: LIMIT,
      }
    }
  );

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  return (
    <>
    {isEditing?
      (
        <EditVocab
          editForm={editForm}
          handleChange={handleChange}
          handleVocabUpdate={handleVocabUpdate}
          handleCancel={handleCancel} />
      ) :
      (
        <>
        <TableSearch styles={styles} handleSearch={handleSearch} searchValue={search} />

        <div className={styles.wrapper}>
          <Table data={data} theme={theme} pagination={pagination}>
            {(tableList) => (
              <>
                <Header>
                  <HeaderRow>
                    {
                      columns.map((column) => (
                        <HeaderCell key={column.field}>{column.label}</HeaderCell>
                      ))
                    }
                  </HeaderRow>
                </Header>

                <Body>
                { tableList.map(vocab =>
                  <Vocab
                    key={vocab.id}
                    vocab={vocab}
                    captureEdit={captureEdit}
                    changeEditState={changeEditState}
                  />) }
                </Body>
              </>
            )}
          </Table>
          
          <TableFooter pagination={pagination} pageCount={pageCount}/>
        </div>
        </>
      )
    }
    </>
  );

};

export default DataTable;