import React from "react";
import "./VocabCard.css";
import * as Constants from "./../../constants";

const VocabCard = (props) => {
  return (
    <div className="vocab-card-wrapper">
      <div className="vocab-card">
        <div className={props.css.frontCSS}>
          <a href={props.card.pronunciationlink} target="_blank" rel="noreferrer">
            <p className="vocab-card-text">{props.card.dutch}</p>
          </a>
        </div>
        <div className={props.css.backCSS}>
          <p className="vocab-card-text">{props.card.english}</p>
        </div>
      </div>
      <div className="vocab-card-controls">
        <div className="vocab-card-controls-flip">
          <button onClick={props.FlipCard} className="vocab-card-controls-flip-btn">{Constants.VOCAB_CARD_FLIP_BUTTON_STR}</button>
        </div>
        <br className="vocab-card-controls-spacer" />
        <div className="vocab-card-controls-nav">
          <button onClick={props.GetPrevCard} className={props.css.prevCSS}>{Constants.VOCAB_CARD_PREV_BUTTON_STR}</button>
          <button onClick={props.GetNextCard} className={props.css.nextCSS}>{Constants.VOCAB_CARD_NEXT_BUTTON_STR}</button>
        </div>
      </div>
    </div>
  );
}

export default VocabCard;