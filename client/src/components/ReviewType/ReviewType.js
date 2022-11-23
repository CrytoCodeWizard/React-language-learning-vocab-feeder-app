import { Link  } from 'react-router-dom';
import * as Constants from "./../../constants";

const ReviewVocab = (props) => {
  return (
    <div>
      <Link className="category-list-item" to={"/review?set_name=" + props.setName + "&review_type=" + Constants.VOCAB_CARD_REVIEWTYPE_PRACTICE_STR}>
        {Constants.VOCAB_CARD_REVIEWTYPE_PRACTICE_LABEL}
      </Link>
      <Link className="category-list-item" to={"/review?set_name=" + props.setName + "&review_type=" + Constants.VOCAB_CARD_REVIEWTYPE_TEST_STR}>
        {Constants.VOCAB_CARD_REVIEWTYPE_TEST_LABEL}
      </Link>
    </div>
  );
}

export default ReviewVocab;