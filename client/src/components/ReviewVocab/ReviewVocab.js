import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams  } from 'react-router-dom';

import { shuffleArray } from './../../utils.js';
import "./../../App.css";
import CategoryList from "../CategoryList/CategoryList";
import VocabCard from "../VocabCard/VocabCard";

const ReviewVocab = (props) => {
	const SHOW_CARD_SIDE_CSS = 'vocab-card-show-side';
	const HIDE_CARD_SIDE_CSS = 'vocab-card-hide-side';
	const SHOW_NEXT_BTN_CSS = 'vocab-card-hide-next-btn';
	const SHOW_PREV_BTN_CSS = 'vocab-card-hide-prev-btn';

	const [searchParams] = useSearchParams();
    const [categories, setCategories] = useState([]);
	const [records, setRecords] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
	const [css, setCSS] = useState({
		frontCSS : SHOW_CARD_SIDE_CSS, 
		backCSS : HIDE_CARD_SIDE_CSS}
	);
    // const [frontCSS, setFrontCSS] = useState(SHOW_CARD_SIDE_CSS);
    // const [backCSS, setBackCSS] = useState(HIDE_CARD_SIDE_CSS);

	const GetRecordsForCategory = useCallback((e) => {
		setIsLoaded(false);
		fetch('/getVocabForCategory', {
			method: 'POST',
			body: JSON.stringify({
				category: e.target.innerText
			}),
			headers: {
				'Content-type': 'application/json; charset=UTF-8',
			},
		})
		.then((res) => res.json())
		.then((data) => {
			setRecords(shuffleArray(data));
			setIsLoaded(true);
		});
	}, [setRecords]);

	let [i, setI] = useState(0);
	const GetNextCard = () => {	    
        setCSS(css => ({
            ...css,
            frontCSS: SHOW_CARD_SIDE_CSS,
			backCSS: HIDE_CARD_SIDE_CSS
        }));
		// setFrontCSS(SHOW_CARD_SIDE_CSS);
		// setBackCSS(HIDE_CARD_SIDE_CSS);
		
		if(i < records.length-1) {
			setI(++i);
		}
	}

	const GetPrevCard = () => {
		// setFrontCSS(SHOW_CARD_SIDE_CSS);
		// setBackCSS(HIDE_CARD_SIDE_CSS);

        setCSS(css => ({
            ...css,
            frontCSS: SHOW_CARD_SIDE_CSS,
			backCSS: HIDE_CARD_SIDE_CSS
        }));

		if(i > 0) {
			if(i === 1) {
				// set

			}
			setI(--i);
		}
	}

	const FlipCard = () => {
		if(css.frontCSS === SHOW_CARD_SIDE_CSS) {
			setCSS(css => ({
				...css,
				frontCSS: HIDE_CARD_SIDE_CSS
			}));
		} else {
			setCSS(css => ({
				...css,
				frontCSS: SHOW_CARD_SIDE_CSS
			}));
		}

		if(css.backCSS === SHOW_CARD_SIDE_CSS) {
			setCSS(css => ({
				...css,
				backCSS: HIDE_CARD_SIDE_CSS
			}));
		} else {
			setCSS(css => ({
				...css,
				backCSS: SHOW_CARD_SIDE_CSS
			}));
		}
	}

	useEffect(() => {
		fetch("/getReviewCategories")
			.then((res) => res.json())
			.then((data) => {
				setCategories(data);
				setIsLoaded(true);
			}).catch((err) => {
				console.error('Error:', err);
			});
	},[]);

	if(isLoaded) {
		if(searchParams.get("set_name") && records.length > 0) {
			return (
				<VocabCard card={records[i]} GetPrevCard={GetPrevCard} GetNextCard={GetNextCard} FlipCard={FlipCard} css={css} />
			);
		} else {
			return (
				<CategoryList categories={categories} GetRecordsForCategory={GetRecordsForCategory} />
			);
		}
	}
}

export default ReviewVocab;