import React from "react";
import "./../../App.css";

const VocabCard = (props) => {
    return (
        <div className="vocab-card">
            <div className={props.css.frontCSS}>
                <p className="vocab-card-text">{props.card.dutch}</p>
            </div>
            <div className={props.css.backCSS}>
                <p className="vocab-card-text">{props.card.english}</p>
            </div>

            <button onClick={props.GetPrevCard} className={props.css.prevCSS}>Prev</button>
            <button onClick={props.GetNextCard} className={props.css.nextCSS}>Next</button>
            <button onClick={props.FlipCard}>Flip</button>
        </div>
    );
}

export default VocabCard;