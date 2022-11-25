import React, { useState, useEffect } from "react";

import * as Constants from "../../constants";

const ReviewLessonNotes = (props) => {
    const [peopleNames, setPeopleNames] = useState([]);

    useEffect(() => {
      fetch(Constants.GET_LESSON_PEOPLE_NAMES_ENDPOINT)
        .then((res) => res.json())
        .then((data) => {
          setPeopleNames(data);
        }).catch((err) => {
          console.error(Constants.ERROR_STR, err);
        });
    },[]);

    return (
      <div>
        <h1>{Constants.LESSON_NOTES_TITLE}</h1>

        {peopleNames.map((person) =>
          <p>{person}</p>
        )};
      </div>
    );
};

export default ReviewLessonNotes;