import SlackDailyVocab from "../components/SlackDailyVocab/SlackDailyVocab";
import ReviewVocab from "../components/ReviewVocab/ReviewVocab";
import Home from "../components/Home/Home";
import ReviewLessonNotes from "../components/ReviewLessonNotes/ReviewLessonNotes";

// App.js
export const APP_HEADER_TITLE = "De Nederlandse App";
export const ROUTES = [
    {   
        route: "/",
        linkLabel: "Home",
        element: <Home/>
    },
    {
        route: "/slack",
        linkLabel: "Slack App",
        element: <SlackDailyVocab/>
    },
    {
        route: "/review",
        linkLabel: "Flash Cards",
        element: <ReviewVocab/>
    },
    {
        route: "/lessons",
        linkLabel: "Lesson Notes",
        element: <ReviewLessonNotes/>
    }
];

// ReviewVocab.js
export const SETNAME_QUERY_PARAM = "set_name";
export const REVIEWTYPE_QUERY_PARAM = "review_type";
export const GET_REVIEW_CATEGORIES_ENDPOINT = "/getReviewCategories";
export const GET_VOCAB_FOR_CATEGORY_ENDPOINT = "/getVocabForCategory";
export const SHOW_CARD_SIDE_CSS = "vocab-card-show-side";
export const HIDE_CARD_SIDE_CSS = "vocab-card-hide-side";
export const HIDE_NEXT_BTN_CSS = "vocab-card-hide-next-btn";
export const HIDE_PREV_BTN_CSS = "vocab-card-hide-prev-btn";

// CategoryList.js
export const REVIEW_ENDPOINT_SETNAME_PARAM = "/review?" + SETNAME_QUERY_PARAM + "=";
export const REVIEW_ENDPOINT_REVIEW_TYPE_PARAM = "/review?" + REVIEWTYPE_QUERY_PARAM + "=";
export const CHOOSE_CATEGORY_LABEL = "Choose a category";
export const REVIEW_ALL_CATEGORY_LABEL = "Review All";

// SlackDailyVocab.js
export const GET_SLACK_INFO_ENDPOINT = "/getSlackInfo";
export const SEND_SLACK_MSG_ENDPOINT = "/sendSlack";
export const SLACK_INPUT_PLACEHOLDER = "# of Records to Send";
export const SLACK_SENT_CONFIRMATION = "Your vocab has been sent to Slack!";
export const SLACK_RECORD_MIN = 1;
export const SLACK_RECORD_MAX = 25;

// VocabCard.js
export const VOCAB_CARD_PREV_BUTTON_STR = "❮ Prev";
export const VOCAB_CARD_NEXT_BUTTON_STR = "Next ❯";
export const VOCAB_CARD_FLIP_BUTTON_STR = "Flip";

export const VOCAB_CARD_ANSWER_PLACEHOLDER = "Enter your answer.";
export const VOCAB_CARD_SUBMIT_BUTTON_STR = "Submit";
export const VOCAB_CARD_ORIGINAL_BUTTON_CSS = "vocab-card-controls-btn vocab-card-controls-flip-btn";
export const VOCAB_CARD_DISABLED_BUTTON_CSS = "vocab-card-controls-btn vocab-card-controls-disable-btn";
export const VOCAB_CARD_REVIEWTYPE_PRACTICE_LABEL = "Practice";
export const VOCAB_CARD_REVIEWTYPE_PRACTICE_STR = VOCAB_CARD_REVIEWTYPE_PRACTICE_LABEL.toLowerCase();
export const VOCAB_CARD_REVIEWTYPE_TEST_LABEL = "Test";
export const VOCAB_CARD_REVIEWTYPE_TEST_STR = VOCAB_CARD_REVIEWTYPE_TEST_LABEL.toLowerCase();

// ReviewLessonNotes.js
export const LESSON_NOTES_TITLE = "Lesson Notes";
export const GET_LESSON_PEOPLE_NAMES_ENDPOINT = "/getLessonPeopleNames";
export const PERSON_QUERY_PARAM = "person";
export const LESSONDATE_QUERY_PARAM = "lessondate";
export const LESSON_ENDPOINT_PERSON_PARAM = "/lessons?" + PERSON_QUERY_PARAM + "=";

// AWS
export const S3_BUCKET_URL = "https://vocab-feeder.s3.eu-west-3.amazonaws.com/vocab-images/";

// Generic
export const ERROR_STR = "Error: ";
export const GET_METHOD = "GET";
export const POST_METHOD = "POST";
export const CONTENT_TYPE_JSON_UTF8 = "application/json; charset=UTF-8";
export const LOADING_STR = "Loading...";