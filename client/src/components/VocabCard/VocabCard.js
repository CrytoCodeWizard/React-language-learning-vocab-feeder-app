import React from "react";
import "./../../App.css";

const VocabCard = (props) => {
    return (
        <div className="vocab-card-wrapper">
            <div className="vocab-card">
                <div className={props.css.frontCSS}>
                    <a href={props.card.pronunciationlink} target="_blank">
                        <p className="vocab-card-text">{props.card.dutch}</p>
                    </a>
                </div>
                <div className={props.css.backCSS}>
                    <p className="vocab-card-text">{props.card.english}</p>
                </div>
            </div>
            <div className="vocab-card-controls">
                <div className="vocab-card-controls-flip">
                    <button onClick={props.FlipCard} className="vocab-card-controls-flip-btn">Flip</button>
                </div>
                <br className="vocab-card-controls-spacer" />
                <div className="vocab-card-controls-nav">
                    <button onClick={props.GetPrevCard} className={props.css.prevCSS}>❮ Prev</button>
                    <button onClick={props.GetNextCard} className={props.css.nextCSS}>Next ❯</button>
                </div>
            </div>
        </div>

    );
}

export default VocabCard;