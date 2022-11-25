import { Link  } from 'react-router-dom';
import * as Constants from "./../../constants";

const ReviewVocab = (props) => {
  return (
    <div className="review-type-options">
      <Link className="review-type-item" to={Constants.REVIEW_ENDPOINT + "?" + Constants.SETNAME_QUERY_PARAM + "=" + props.setName + "&" + Constants.REVIEWTYPE_QUERY_PARAM + "=" + Constants.VOCAB_CARD_REVIEWTYPE_PRACTICE_STR}>
        {Constants.VOCAB_CARD_REVIEWTYPE_PRACTICE_LABEL}
      </Link>
      <Link className="review-type-item" to={Constants.REVIEW_ENDPOINT + "?" + Constants.SETNAME_QUERY_PARAM + "=" + props.setName + "&" + Constants.REVIEWTYPE_QUERY_PARAM + "=" + Constants.VOCAB_CARD_REVIEWTYPE_TEST_STR}>
        {Constants.VOCAB_CARD_REVIEWTYPE_TEST_LABEL}
      </Link>
    </div>
  );
}

export default ReviewVocab;