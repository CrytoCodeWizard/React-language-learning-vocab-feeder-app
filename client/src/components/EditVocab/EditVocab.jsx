import React from 'react';

const EditVocab = ({ editForm, handleChange, handleVocabUpdate, handleCancel }) => {
  let {id, dutch, english, pronunciationlink, notes, set_name} = editForm;

  // PATCH request; calls handleVocabUpdate to push changes to the page
  const handleEditForm = (e) => {
    e.preventDefault();
    fetch(`http://localhost:9292/vocabs/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type" : "application/json"
      },
      body: JSON.stringify(editForm),
    })
    .then(res => res.json())
    .then(updatedVocab => {
      handleVocabUpdate(updatedVocab)})
  }

  return (
    <div>
      <h4>Edit Vocab</h4>
      <form onSubmit={handleEditForm}>
        <input type="text" name="dutch" value={dutch} onChange={handleChange}/>
        <input type="text" name="english" value={english} onChange={handleChange}/>
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