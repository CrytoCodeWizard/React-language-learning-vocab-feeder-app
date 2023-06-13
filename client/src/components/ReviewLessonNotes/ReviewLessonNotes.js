import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

import * as Constants from "../../constants";
import LessonNotes from "../LessonNotes/LessonNotes";

const ReviewLessonNotes = (props) => {
  const [lessons, setLessons] = useState({});
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetch(Constants.GET_LESSON_PEOPLE_NAMES_ENDPOINT)
      .then((res) => res.json())
      .then((data) => {
        setLessons(data);
      })
      .catch((err) => {
        console.error(Constants.ERROR_STR, err);
      });
  }, []);

  const GetNotes = () => {
    const PERSON = searchParams.get(Constants.PERSON_QUERY_PARAM);
    for (let i in lessons[PERSON]) {
      if (
        lessons[PERSON][i].lesson_date ===
        searchParams.get(Constants.LESSONDATE_QUERY_PARAM)
      ) {
        return lessons[PERSON][i];
      }
    }
  };

  if (
    searchParams.get(Constants.PERSON_QUERY_PARAM) &&
    searchParams.get(Constants.LESSONDATE_QUERY_PARAM)
  ) {
    return (
      <div className="ReviewApp">
        <LessonNotes GetNotes={GetNotes} />
      </div>
    );
  } else if (searchParams.get(Constants.PERSON_QUERY_PARAM)) {
    return (
      <div className="ReviewApp">
        <h1>{Constants.LESSON_NOTES_TITLE}</h1>
        <ul>
          {lessons[searchParams.get(Constants.PERSON_QUERY_PARAM)].map(
            (lesson) => (
              <li key={lesson.lesson_date}>
                <Link
                  className="category-list-item"
                  to={
                    Constants.LESSON_ENDPOINT_PERSON_PARAM +
                    searchParams.get(Constants.PERSON_QUERY_PARAM) +
                    "&" +
                    Constants.LESSONDATE_QUERY_PARAM +
                    "=" +
                    lesson.lesson_date
                  }
                >
                  {lesson.lesson_date}
                </Link>
              </li>
            )
          )}
          ;
        </ul>
      </div>
    );
  } else {
    return (
      <div className="ReviewApp">
        <h1>{Constants.LESSON_NOTES_TITLE}</h1>
        <ul>
          {Object.keys(lessons).map((person) => (
            <li key={person}>
              <Link
                className="category-list-item"
                to={Constants.LESSON_ENDPOINT_PERSON_PARAM + person}
              >
                {person}
              </Link>
            </li>
          ))}
          ;
        </ul>
      </div>
    );
  }
};

export default ReviewLessonNotes;
