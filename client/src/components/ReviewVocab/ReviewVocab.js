import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams  } from 'react-router-dom';

import { shuffleArray } from './../../utils.js';
import "./../../App.css";
import * as Constants from "./../../constants";

import CategoryList from "../CategoryList/CategoryList";
import VocabCard from "../VocabCard/VocabCard";
import ReviewType from "../ReviewType/ReviewType";

const ReviewVocab = (props) => {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [records, setRecords] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [css, setCSS] = useState({
    frontCSS : Constants.SHOW_CARD_SIDE_CSS, 
    backCSS : Constants.HIDE_CARD_SIDE_CSS,
    prevCSS : Constants.HIDE_PREV_BTN_CSS
  });
  const [correctCount, setCorrectCount] = useState(0);

  const resetState = () => {
    setI(0);
    setCorrectCount(0);
    setCSS(css => ({
      ...css,
      frontCSS : Constants.SHOW_CARD_SIDE_CSS,
      backCSS : Constants.HIDE_CARD_SIDE_CSS,
      prevCSS : Constants.HIDE_PREV_BTN_CSS,
      nextCSS : null
    }));
  }

  const GetRecordsForCategory = useCallback((e) => {
    setIsLoaded(false);
    fetch(Constants.GET_VOCAB_FOR_CATEGORY_ENDPOINT, {
      method: Constants.POST_METHOD,
      body: JSON.stringify({
        category: e.target.innerText
      }),
      headers: {
        "Content-type": Constants.CONTENT_TYPE_JSON_UTF8,
      },
    })
    .then((res) => res.json())
    .then((data) => {
      resetState();
      setRecords(shuffleArray(data));
      setIsLoaded(true);
    });
  }, [setRecords]);

  let [i, setI] = useState(0);
  const GetNextCard = () => {
    const nextStyle = (i === records.length-2) ? Constants.HIDE_NEXT_BTN_CSS : null;

    setCSS(css => ({
      ...css,
      frontCSS : Constants.SHOW_CARD_SIDE_CSS,
      backCSS : Constants.HIDE_CARD_SIDE_CSS,
      nextCSS : nextStyle,
      prevCSS : null
    }));
      
    if(i < records.length-1) {
      setI(++i);
    }
  }

  const GetPrevCard = () => {
    const prevStyle = i === 1 ? Constants.HIDE_PREV_BTN_CSS : null;

    setCSS(css => ({
      ...css,
      frontCSS : Constants.SHOW_CARD_SIDE_CSS,
      backCSS : Constants.HIDE_CARD_SIDE_CSS,
      nextCSS : null,
      prevCSS : prevStyle
    }));

    if(i > 0) {
      setI(--i);
    }
  }

  const FlipCard = () => {
    setCSS(css => ({
      ...css,
      frontCSS : css.frontCSS === Constants.HIDE_CARD_SIDE_CSS ? Constants.SHOW_CARD_SIDE_CSS : Constants.HIDE_CARD_SIDE_CSS,
      backCSS : css.backCSS === Constants.HIDE_CARD_SIDE_CSS ? Constants.SHOW_CARD_SIDE_CSS : Constants.HIDE_CARD_SIDE_CSS
    }));
  }

  useEffect(() => {
    fetch(Constants.GET_REVIEW_CATEGORIES_ENDPOINT)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setIsLoaded(true);
      }).catch((err) => {
        console.error(Constants.ERROR_STR, err);
      });
  },[]);

  if(isLoaded) {
    if(searchParams.get(Constants.SETNAME_QUERY_PARAM) && records.length > 0) {
      if(!searchParams.get(Constants.REVIEWTYPE_QUERY_PARAM)) {
        return(
          <ReviewType />
        );
      } else {
        return (
          <div className="VocabApp">
            <h1>Category: {searchParams.get(Constants.SETNAME_QUERY_PARAM)}</h1>
            <VocabCard card={records[i]} GetPrevCard={GetPrevCard} GetNextCard={GetNextCard} FlipCard={FlipCard} css={css} setCorrectCount={setCorrectCount} correctCount={correctCount} />
          </div>
        );
      }
    } else {
      return (
        <CategoryList categories={categories} GetRecordsForCategory={GetRecordsForCategory} />
      );
    }
  }
}

export default ReviewVocab;