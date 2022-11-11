import React from "react";
import "./../../App.css";

const VocabCard = (props) => {
    return (
        <div>
            <ul>
                <li key={props.card.id}>{props.card.dutch}</li>
                <button onClick={props.GetPrevCard}>Prev</button>
                <button onClick={props.GetNextCard}>Next</button>
            </ul>
        </div>
    );
}

export default VocabCard;