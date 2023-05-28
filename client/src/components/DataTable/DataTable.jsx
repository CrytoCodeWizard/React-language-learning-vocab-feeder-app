// @/src/components/DataTable/DataTable.jsx
import React from "react";
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
import { usePagination } from '@table-library/react-table-library/pagination';

import TableSearch from './TableSearch/TableSearch';
import TableFooter from './TableFooter/TableFooter';

const DataTable = ({ vocabRecords, LIMIT }) => {
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

  const [search, setSearch] = React.useState('');

  const data = {
    nodes: vocabRecords.filter((item) =>
    item.dutch.toLowerCase().includes(search.toLowerCase())
    ),
  };

  const pageCount = parseInt(data.nodes.length / LIMIT) + 1;
  const pagination = usePagination(
    data,
    {
      state: {
        page: 0,
        size: LIMIT,
      }
    }
  );

  const editRow = (clickedRow) => {
    console.log(clickedRow);
  }

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  return (
    <>
      <TableSearch styles={styles} handleSearch={handleSearch} />

      <div className={styles.wrapper}>
        <Table data={data} theme={theme} pagination={pagination}>
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

        <TableFooter pagination={pagination} pageCount={pageCount}/>
      </div>
    </>
  );

};

export default DataTable;