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
                <div className="vocab-card-controls-nav">
                    <button onClick={props.GetPrevCard} className={props.css.prevCSS} style={{float: 'left'}}>&#8592;</button>
                    <button onClick={props.GetNextCard} className={props.css.nextCSS} style={{float: 'right'}}>&#8594;</button>
                </div>
                <div className="vocab-card-controls-flip">
                    <button onClick={props.FlipCard}>Flip</button>
                </div>
            </div>
        </div>

    );
}

export default VocabCard;