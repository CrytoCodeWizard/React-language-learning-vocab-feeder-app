// @src/components/Modal.jsx

import React from "react";
import styles from "./Modal.module.css";

const Modal = ({ setDeleteRecord }) => {
  return (
    <>
      <div className={styles.darkBG} onClick={() => setDeleteRecord(false)} />
      <div className={styles.centered}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h5 className={styles.heading}>Dialog</h5>
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => setDeleteRecord(false)}
          >
            X
          </button>
          <div className={styles.modalContent}>
            Are you sure you want to delete the vocab record?
          </div>
          <div className={styles.modalActions}>
            <div className={styles.actionsContainer}>
              <button
                className={styles.deleteBtn}
                onClick={() => setDeleteRecord(false)}
              >
                Delete
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => setDeleteRecord(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
