// @/src/components/DataTable/DataTable.jsx
import React, { useState, useEffect } from "react";
import styles from "./Table.module.css";

import {
  Table,
  Header,
  HeaderRow,
  HeaderCell,
  Body,
  Row,
  Cell
} from '@table-library/react-table-library/table';
import { useTheme } from "@table-library/react-table-library/theme";

const DataTable = ({ vocabRecords, rowsPerPage }) => {
  const [search, setSearch] = React.useState('');

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  const data = {
    nodes: vocabRecords.filter((item) =>
    item.dutch.toLowerCase().includes(search.toLowerCase())
    ),
  };

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
      "label" : "Category",
      "field" : "set_name"
    },
    {
      "label" : "Actions",
      "field" : "editBtn"
    }
  ];

  const editRow = (clickedRow) => {
    console.log('editing...');
    console.log(clickedRow);
  }

  return (
    <>
      <label htmlFor="search">
        Search:
        <input id="search" type="text" onChange={handleSearch} />
      </label>
      <div className={styles.wrapper}>
        <Table data={data} theme={theme}>
          {(tableList) => (
            <>
              <Header>
                <HeaderRow>
                  {
                    columns.map((column) => (
                      <HeaderCell>{column.label}</HeaderCell>
                    ))
                  }
                </HeaderRow>
              </Header>

              <Body>
                {tableList.map((row) => (
                  <Row key={row.id} item={row}>
                    <Cell>{row.dutch}</Cell>
                    <Cell>{row.english}</Cell>
                    <Cell>{row.pronunciationlink}</Cell>
                    <Cell>{row.set_name}</Cell>
                    <Cell><button onClick={() => editRow(row)}>Edit</button></Cell>
                  </Row>
                ))}
              </Body>
            </>
          )}
        </Table>
      </div>
    </>
  );

};

export default DataTable;