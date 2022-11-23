import { Link  } from 'react-router-dom';
const ReviewVocab = (props) => {
  return (
    <div>
      <Link className="category-list-item" to="/review?set_name=introductory&review_type=practice">
        Practice
      </Link>
      <Link className="category-list-item" to="/review?set_name=introductory&review_type=test">
        Test
      </Link>
    </div>
  );
}

export default ReviewVocab;