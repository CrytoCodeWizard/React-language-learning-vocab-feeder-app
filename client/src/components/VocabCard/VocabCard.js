import React, { useState } from "react";
import { useSearchParams  } from 'react-router-dom';

import "./VocabCard.css";
import * as Constants from "./../../constants";

const VocabCard = (props) => {
  const [searchParams] = useSearchParams();
  const [answer, setAnswer] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [css, setCSS] = useState({
    buttonCSS : Constants.VOCAB_CARD_ORIGINAL_BUTTON_CSS
  });

  const HandleSubmit = (e) => {
    e.preventDefault();
    if(props.card.english.includes(answer)) {
      props.setCorrectCount((props.correctCount)+1);
      setIsDisabled(true);
      setCSS({buttonCSS : Constants.VOCAB_CARD_DISABLED_BUTTON_CSS});
    } else {
      console.log('incorrect.');
    }
  }

  const HandleAnswerChange = (e) => {
    e.preventDefault();
    setAnswer(e.target.value);
  }

  if(searchParams.get(Constants.REVIEWTYPE_QUERY_PARAM) === Constants.VOCAB_CARD_REVIEWTYPE_PRACTICE_STR) {
    return (
      <div className="vocab-card-wrapper">
        <div className="vocab-card">
          <img className="vocab-card-img" src={Constants.S3_BUCKET_URL + props.card.id + '.png'} alt="" onError={(event) => event.target.src='image-needed.png'} onLoad={(event) => event.target.style.visibility = 'visible'}/>
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
            <button onClick={props.FlipCard} className={css.buttonCSS}>{Constants.VOCAB_CARD_FLIP_BUTTON_STR}</button>
          </div>
          <br className="vocab-card-controls-spacer" />
          <div className="vocab-card-controls-nav">
            <button onClick={props.GetPrevCard} className={props.css.prevCSS}>{Constants.VOCAB_CARD_PREV_BUTTON_STR}</button>
            <button onClick={props.GetNextCard} className={props.css.nextCSS}>{Constants.VOCAB_CARD_NEXT_BUTTON_STR}</button>
          </div>
        </div>
      </div>
    );
  } else if(searchParams.get(Constants.REVIEWTYPE_QUERY_PARAM) === Constants.VOCAB_CARD_REVIEWTYPE_TEST_STR) {
    return(
      <div className="vocab-card-wrapper">
        <h4 key={props.correctCount}>You have gotten {props.correctCount} correct.</h4>
        <form onSubmit={HandleSubmit} className="slack-form">
          <div className="vocab-card">
            <img className="vocab-card-img" src={Constants.S3_BUCKET_URL + props.card.id + '.png'} alt="" onError={(event) => event.target.src='image-needed.png'} onLoad={(event) => event.target.style.visibility = 'visible'}/>
            <div className={props.css.frontCSS}>
              <a href={props.card.pronunciationlink} target="_blank" rel="noreferrer">
                <p className="vocab-card-text">{props.card.dutch}</p>
              </a>
            </div>
            <div className={props.css.backCSS}>
              <p className="vocab-card-text">{props.card.english}</p>
            </div>
          </div>
          <div className="vocab-card-input">
              <input type="text" placeholder="Enter your answer" onChange={HandleAnswerChange} required/>
          </div>
          <div className="vocab-card-controls">
            <div className="vocab-card-controls-flip">
              <input type="submit" className={css.buttonCSS} placeholder={Constants.VOCAB_CARD_SUBMIT_BUTTON_STR} disabled={isDisabled}></input>
            </div>
            <br className="vocab-card-controls-spacer" />
            <div className="vocab-card-controls-nav">
              <button onClick={props.GetPrevCard} className={props.css.prevCSS}>{Constants.VOCAB_CARD_PREV_BUTTON_STR}</button>
              <button onClick={props.GetNextCard} className={props.css.nextCSS}>{Constants.VOCAB_CARD_NEXT_BUTTON_STR}</button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default VocabCard;