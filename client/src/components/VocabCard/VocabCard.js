import React from "react";
import "./../../App.css";

const VocabCard = (props) => {
    return (
        <div>
            <ul>
                <div className={props.frontCSS}>
                    <p className="vocab-card-text">{props.card.dutch}</p>
                </div>
                <div className={props.backCSS}>
                    <p className="vocab-card-text">{props.card.english}</p>
                </div>

                <button onClick={props.GetPrevCard}>Prev</button>
                <button onClick={props.GetNextCard}>Next</button>
                <button onClick={props.FlipCard}>Flip</button>
            </ul>
        </div>
    );
}

export default VocabCard;