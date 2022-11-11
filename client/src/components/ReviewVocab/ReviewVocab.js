import React, { useState, useEffect, useCallback } from "react";
import "./../../App.css";
import { shuffleArray } from './../../utils.js';
import VocabCard from './../../components/VocabCard/VocabCard';
import { Link, useSearchParams  } from 'react-router-dom';

const ReviewVocab = (props) => {
	const [searchParams] = useSearchParams();
	const setName = searchParams.get("set_name");
    let [categories, setCategories] = useState([]);
	let [records, setRecords] = useState([]);
    const [canRender, setCanRender] = useState(false);

	const GetRecordsForCategory = useCallback((e) => {
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
		});
	}, [setRecords]);

	useEffect(() => {
		fetch("/getReviewCategories")
			.then((res) => res.json())
			.then((data) => {
				setCategories(data);
				setCanRender(true);
			}).catch((err) => {
				console.error('Error:', err);
			});
	},[]);

	if(canRender) {
		if(setName) {
			return (
				<div>
					<ul>
						{records.map((record) => 
							<li key={record.id}>{record.dutch}</li>
						)}
					</ul>
				</div>
			);
		} else {
			return (
				<div className="ReviewApp">
					<h1>Choose a category</h1>
					<ul>
						{categories.map((category) =>
							<li key={category}>
								<Link className="category-list-item" to={"/review?set_name=" + category} onClick={GetRecordsForCategory}>
									{category}
								</Link>
							</li>
						)}
					</ul>
				</div>
			);
		}
	}
}

export default ReviewVocab;