import * as Constants from "../../constants";

import "./LessonNotes.css";
const LessonNotes = (props) => {
    const notes = props.GetNotes();

    return (
        <div className="LessonNotes">
            <h1>{Constants.LESSON_NOTES_TITLE + " (" + notes.person + ")"}</h1>
            <h2>{notes.lesson_title}</h2>
            <h2>{notes.lesson_date}</h2>
            <div className="lesson-notes-contents-wrapper">
                <div className="lesson-notes-contents" dangerouslySetInnerHTML={{__html: notes.notes}} />
            </div>
        </div>
    );
}

export default LessonNotes;