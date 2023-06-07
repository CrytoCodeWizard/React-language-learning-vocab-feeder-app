import React from 'react';

import * as Constants from './../../constants';
import styles from "./EditVocab.module.css";
const EditVocab = ({ editForm, handleChange, handleVocabUpdate, handleCancel }) => {
  let {id, dutch, english, pronunciationlink, notes, set_name} = editForm;

  // PATCH request; calls handleVocabUpdate to push changes to the page
  const handleEditForm = (e) => {
    e.preventDefault();

    fetch(Constants.VOCAB_RECORDS_ENDPOINT, {
      method: Constants.PATCH_METHOD,
      body: JSON.stringify(editForm),
    })
    .then(res => res.json()) 
    .then(updatedVocab => {
      handleVocabUpdate(updatedVocab)
    }).catch((err) => {
      console.error(Constants.ERROR_STR, err);
    });
  }

  const labels = {
    'Dutch' : dutch,
    'English' : english,
    'Pronunciation URL' : pronunciationlink,
    'Notes' : notes,
    'Category' : set_name
  };

  return (
    <div className={styles.alignCenter}>
      <h3 className={styles.editVocabHeader}>Edit Vocab</h3>
      <form onSubmit={handleEditForm}>

        <div className='form-wrapper'>
          {Object.entries(labels).map(([key, value], i) =>
            
            <div>
              <div style={{display: 'inline-block'}}>
                {key}
              </div>
              <div style={{display: 'inline-block'}}>
                <input type="text" name={key.toLowerCase()} value={value} onChange={handleChange}/>
              </div>
            </div>
          ) }
        </div>


        <input type="text" name="pronunciationlink" value={pronunciationlink} onChange={handleChange}/>
        <input type="text" name="notes" value={notes} onChange={handleChange}/>
        <input type="text" name="set_name" value={set_name} onChange={handleChange}/>
        <button type="submit">Submit Changes</button>
        <button onClick={handleCancel}>Cancel</button>
      </form>
    </div>
  )
};

export default EditVocab;