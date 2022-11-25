import * as Constants from "../../constants";

const LessonNotes = (props) => {
    const notes = props.GetNotes();

    return (
        <div className="LessonNotes">
            <h1>{Constants.LESSON_NOTES_TITLE + " (" + notes.person + ")"}</h1>
            <h2>{notes.lesson_date}</h2>
            <h2>{notes.notes}</h2>
        </div>
    );
}

export default LessonNotes;