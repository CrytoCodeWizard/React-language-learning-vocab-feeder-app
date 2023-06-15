import React from "react";

import * as Constants from "./../../constants";
import styles from "./EditVocab.module.css";
const EditVocab = ({ editForm, handleChange, setIsEditing, onUpdateVocab }) => {
  let { dutch, english, pronunciationlink, notes, set_name } = editForm;

  // PATCH request; calls handleVocabUpdate to push changes to the page
  const handleEditForm = (e) => {
    e.preventDefault();

    fetch(Constants.VOCAB_RECORDS_ENDPOINT, {
      method: Constants.PATCH_METHOD,
      body: JSON.stringify(editForm),
    })
      .then((res) => res.json())
      .then((updatedVocab) => {
        handleVocabUpdate(updatedVocab);
      })
      .catch((err) => {
        console.error(Constants.ERROR_STR, err);
      });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // when PATCH request happens; auto-hides the form, pushes changes to display
  const handleVocabUpdate = (updatedVocab) => {
    setIsEditing(false);
    onUpdateVocab(updatedVocab);
  };

  const labels = {
    Dutch: dutch,
    English: english,
    "Pronunciation URL": pronunciationlink,
    Notes: notes,
    Category: set_name,
  };

  return (
    <div className={styles.formStyles}>
      <form onSubmit={handleEditForm}>
        <div className="form-wrapper">
          <div className={styles.editFormInputWrapper}>
            {Object.entries(labels).map(([key, value], i) => (
              <div className={styles.editFormInput} key={key}>
                <div className={styles.inputLabel}>{key}</div>
                <div>
                  <input
                    type="text"
                    name={key.toLowerCase()}
                    value={value}
                    onChange={handleChange}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.editFormBtnRow}>
          <div className={styles.editFormBtns}>
            <button type="submit">Save</button>
          </div>
          <div className={styles.editFormBtns}>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditVocab;
