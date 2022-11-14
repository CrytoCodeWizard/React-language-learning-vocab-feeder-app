import React from "react";
import { Link } from 'react-router-dom';

import "./../../App.css";

const CategoryList = (props) => {
  return (
    <div className="ReviewApp">
      <h1>Choose a category</h1>
      <ul>
        {props.categories.map((category) =>
          <li key={category}>
            <Link className="category-list-item" to={"/review?set_name=" + category} onClick={props.GetRecordsForCategory}>
              {category}
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}

export default CategoryList;