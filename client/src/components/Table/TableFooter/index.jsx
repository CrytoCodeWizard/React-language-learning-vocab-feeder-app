import React, { useEffect } from "react";

import styles from "./TableFooter.module.css";


const TableFooter = ({ range, setPage, page, slice }) => {
    useEffect(() => {
      console.log('footer');
      console.log(page);
      console.log(slice);
      console.log(range);
      if (slice.length < 1 && page !== 1) {
        setPage(page - 1);
      }
    }, [slice, page, setPage]);
    return (
      <div className={styles.tableFooter}>
        <button 
            className={`${styles.button} ${
              page !== 1 ? styles.activeButton : styles.inactiveButton
            }`}
            onClick={() => setPage(page-1)}
            disabled={page === 1}
       >
          Prev
        </button>
        <button 
            className={`${styles.button} ${
              page !== range.length ? styles.activeButton : styles.inactiveButton
            }`}  
            onClick={() => setPage(page+1)}
            disabled={page === range.length}
            >
          Next
        </button>
      </div>
    );
  };
  
  export default TableFooter;