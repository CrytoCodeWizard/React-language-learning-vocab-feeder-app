// @/src/components/Table/index.jsx
import React, { useState } from "react";

import useTable from "../../hooks/useTable";
import styles from "./Table.module.css";
import TableFooter from "./TableFooter";

const Table = ({ data, rowsPerPage }) => {
  const [page, setPage] = useState(1);
  const { slice, range } = useTable(data, page, rowsPerPage);
  return (
    <>
      <table className={styles.table}>
        <thead className={styles.tableRowHeader}>
          <tr>
            <th className={styles.tableHeader}>Dutch</th>
            <th className={styles.tableHeader}>English</th>
            <th className={styles.tableHeader}>Categories</th>
            <th className={styles.tableHeader}>Pronunciation URL</th>
            <th className={styles.tableHeader}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {slice.map((el) => (
            <tr className={styles.tableRowItems} key={el.id}>
              <td className={styles.tableCell}>{el.dutch}</td>
              <td className={styles.tableCell}>{el.english}</td>
              <td className={styles.tableCell}>{el.set_name}</td>
              <td className={styles.tableCell}>{el.pronunciationlink}</td>
              <td className={styles.tableCell}><button className={styles.button}>EDIT</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <TableFooter range={range} slice={slice} setPage={setPage} page={page} />
    </>
  );
};

export default Table;