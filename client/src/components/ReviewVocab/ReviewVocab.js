import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams  } from 'react-router-dom';

import { shuffleArray } from './../../utils.js';
import "./../../App.css";
import CategoryList from "../CategoryList/CategoryList";
import VocabCard from "../VocabCard/VocabCard";

const ReviewVocab = (props) => {
	const SHOW_CARD_SIDE_CSS = 'vocab-card-show-side';
	const HIDE_CARD_SIDE_CSS = 'vocab-card-hide-side';
	const HIDE_NEXT_BTN_CSS = 'vocab-card-hide-next-btn';
	const HIDE_PREV_BTN_CSS = 'vocab-card-hide-prev-btn';

	const [searchParams] = useSearchParams();
    const [categories, setCategories] = useState([]);
	const [records, setRecords] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
	const [css, setCSS] = useState({
		frontCSS : SHOW_CARD_SIDE_CSS, 
		backCSS : HIDE_CARD_SIDE_CSS,
		prevCSS : HIDE_PREV_BTN_CSS
	});

	const resetState = () => {
		setI(0);
        setCSS(css => ({
            ...css,
            frontCSS : SHOW_CARD_SIDE_CSS,
			backCSS : HIDE_CARD_SIDE_CSS,
			prevCSS : HIDE_PREV_BTN_CSS,
			nextCSS : null
        }));
	}

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
			resetState();
			setRecords(shuffleArray(data));
			setIsLoaded(true);
		});
	}, [setRecords]);

	let [i, setI] = useState(0);
	const GetNextCard = () => {
		const nextStyle = (i === records.length-2) ? HIDE_NEXT_BTN_CSS : null;

        setCSS(css => ({
            ...css,
            frontCSS : SHOW_CARD_SIDE_CSS,
			backCSS : HIDE_CARD_SIDE_CSS,
			nextCSS : nextStyle,
			prevCSS : null
        }));
		
		if(i < records.length-1) {
			setI(++i);
		}
	}

	const GetPrevCard = () => {
		const prevStyle = i === 1 ? HIDE_PREV_BTN_CSS : null;

        setCSS(css => ({
            ...css,
            frontCSS : SHOW_CARD_SIDE_CSS,
			backCSS : HIDE_CARD_SIDE_CSS,
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
			frontCSS : css.frontCSS === HIDE_CARD_SIDE_CSS ? SHOW_CARD_SIDE_CSS : HIDE_CARD_SIDE_CSS,
			backCSS : css.backCSS === HIDE_CARD_SIDE_CSS ? SHOW_CARD_SIDE_CSS : HIDE_CARD_SIDE_CSS
		}));
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