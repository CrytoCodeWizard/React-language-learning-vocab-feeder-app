import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

import { shuffleArray } from "./../../utils.js";
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
    frontCSS: Constants.SHOW_CARD_SIDE_CSS,
    backCSS: Constants.HIDE_CARD_SIDE_CSS,
    prevCSS: Constants.HIDE_PREV_BTN_CSS,
    buttonCSS: Constants.VOCAB_CARD_ORIGINAL_BUTTON_CSS,
  });
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [categoryTotal, setCategoryTotal] = useState(0);

  const resetState = () => {
    setI(0);
    setCorrectCount(0);
    setTotalAttempted(0);
    setIsDisabled(false);
    setCSS((css) => ({
      ...css,
      frontCSS: Constants.SHOW_CARD_SIDE_CSS,
      backCSS: Constants.HIDE_CARD_SIDE_CSS,
      prevCSS: Constants.HIDE_PREV_BTN_CSS,
      nextCSS: null,
      buttonCSS: Constants.VOCAB_CARD_ORIGINAL_BUTTON_CSS,
    }));
  };

  const GetRecordsForCategory = useCallback(
    (e) => {
      let category = e;
      if (e.target) {
        category = e.target.innerText;
      }

      setIsLoaded(false);
      fetch(Constants.GET_VOCAB_FOR_CATEGORY_ENDPOINT, {
        method: Constants.POST_METHOD,
        body: JSON.stringify({
          category: category,
        }),
        headers: {
          "Content-type": Constants.CONTENT_TYPE_JSON_UTF8,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          resetState();
          setCategoryTotal(data.length);
          setRecords(shuffleArray(data));
          setIsLoaded(true);
        });
    },
    [setRecords]
  );

  let [i, setI] = useState(0);
  const GetNextCard = (e) => {
    e.preventDefault();

    if (
      searchParams.get(Constants.REVIEWTYPE_QUERY_PARAM) ===
      Constants.VOCAB_CARD_REVIEWTYPE_TEST_STR
    ) {
      // don't reset prevCSS button styles for testing use case (because we never want the button)
      setCSS((css) => ({
        ...css,
        frontCSS: Constants.SHOW_CARD_SIDE_CSS,
        backCSS: Constants.HIDE_CARD_SIDE_CSS,
        nextCSS: Constants.HIDE_NEXT_BTN_CSS,
        buttonCSS: Constants.VOCAB_CARD_ORIGINAL_BUTTON_CSS,
      }));

      ResetSnackbar();

      setAnswer(null);
      setIsDisabled(false);
    } else {
      const nextStyle =
        i === records.length - 2 ? Constants.HIDE_NEXT_BTN_CSS : null;

      setCSS((css) => ({
        ...css,
        frontCSS: Constants.SHOW_CARD_SIDE_CSS,
        backCSS: Constants.HIDE_CARD_SIDE_CSS,
        nextCSS: nextStyle,
        prevCSS: null,
      }));
    }

    if (i < records.length - 1) {
      setI(++i);
    }
  };

  const GetPrevCard = () => {
    const prevStyle = i === 1 ? Constants.HIDE_PREV_BTN_CSS : null;

    setCSS((css) => ({
      ...css,
      frontCSS: Constants.SHOW_CARD_SIDE_CSS,
      backCSS: Constants.HIDE_CARD_SIDE_CSS,
      nextCSS: null,
      prevCSS: prevStyle,
    }));

    if (i > 0) {
      setI(--i);
    }
  };

  const FlipCard = () => {
    setCSS((css) => ({
      ...css,
      frontCSS:
        css.frontCSS === Constants.HIDE_CARD_SIDE_CSS
          ? Constants.SHOW_CARD_SIDE_CSS
          : Constants.HIDE_CARD_SIDE_CSS,
      backCSS:
        css.backCSS === Constants.HIDE_CARD_SIDE_CSS
          ? Constants.SHOW_CARD_SIDE_CSS
          : Constants.HIDE_CARD_SIDE_CSS,
    }));
  };

  const ShowSnackbar = (isCorrect) => {
    let snackBar = document.getElementById("snackbar");
    snackBar.className = isCorrect ? "showCorrect" : "showIncorrect";
    snackBar.innerText = isCorrect ? "That's right!" : "Incorrect.";

    setTimeout(function () {
      ResetSnackbar();
    }, 5000);
  };

  const ResetSnackbar = () => {
    let snackBar = document.getElementById("snackbar");

    snackBar.className = snackBar.className.replace("showIncorrect", "");
    snackBar.className = snackBar.className.replace("showCorrect", "");
  };

  useEffect(() => {
    fetch(Constants.GET_REVIEW_CATEGORIES_ENDPOINT)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error(Constants.ERROR_STR, err);
      });
  }, []);

  if (isLoaded) {
    if (searchParams.get(Constants.SETNAME_QUERY_PARAM)) {
      if (!records.length) {
        GetRecordsForCategory(searchParams.get(Constants.SETNAME_QUERY_PARAM));
      }

      if (!searchParams.get(Constants.REVIEWTYPE_QUERY_PARAM)) {
        return (
          <ReviewType
            setName={searchParams.get(Constants.SETNAME_QUERY_PARAM)}
          />
        );
      } else {
        return (
          <div className="VocabApp">
            <h1>Category: {searchParams.get(Constants.SETNAME_QUERY_PARAM)}</h1>
            <h3 className="category-card-total">{categoryTotal} cards</h3>
            <VocabCard
              card={records[i]}
              css={css}
              correctCount={correctCount}
              isDisabled={isDisabled}
              totalAttempted={totalAttempted}
              answer={answer}
              GetPrevCard={GetPrevCard}
              GetNextCard={GetNextCard}
              FlipCard={FlipCard}
              setCSS={setCSS}
              setCorrectCount={setCorrectCount}
              setIsDisabled={setIsDisabled}
              showSnackbar={ShowSnackbar}
              setTotalAttempted={setTotalAttempted}
              setAnswer={setAnswer}
            />
          </div>
        );
      }
    } else {
      return (
        <CategoryList
          categories={categories}
          GetRecordsForCategory={GetRecordsForCategory}
        />
      );
    }
  }
};

export default ReviewVocab;
