import React from "react";
import { Row, Cell } from "@table-library/react-table-library/table";

const Vocab = ({
  vocab,
  vocab: { id, dutch, english, pronunciationlink, notes, set_name },
  captureEdit,
  changeEditState,
  captureDelete,
  changeDeleteState,
}) => {
  return (
    <Row key={id} item={vocab}>
      <Cell>{dutch}</Cell>
      <Cell>{english}</Cell>
      <Cell>{pronunciationlink}</Cell>
      <Cell>{notes}</Cell>
      <Cell>{set_name}</Cell>
      <Cell>
        <button
          onClick={() => {
            captureEdit(vocab);
            changeEditState(vocab);
          }}
        >
          Edit
        </button>
        <button
          onClick={() => {
            captureDelete(vocab);
            changeDeleteState(vocab);
          }}
        >
          Delete
        </button>
      </Cell>
    </Row>
  );
};

export default Vocab;
