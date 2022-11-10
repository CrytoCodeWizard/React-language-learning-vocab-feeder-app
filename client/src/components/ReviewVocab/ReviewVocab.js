import React from "react";
import "./../../App.css";
import { withRouter, shuffleArray } from './../../utils.js';
import { Link } from 'react-router-dom';

class ReviewVocab extends React.Component {
	constructor(props) {
		super(props);
		this.state = {categories: [], records: []};
		this.handleLinkClick = this.handleLinkClick.bind(this);
	}

	getReviewCategories() {
		fetch("/getReviewCategories")
			.then((res) => res.json())
			.then((data) => {
				this.setState({categories: data});
			});
	}

	handleLinkClick(event) {
		this.retrieveVocabForCategory(event.target.innerText);
	}

	retrieveVocabForCategory(category) {
		fetch('/getVocabForCategory', {
			method: 'POST',
			body: JSON.stringify({
				category: category
			}),
			headers: {
				'Content-type': 'application/json; charset=UTF-8',
			},
		})
		.then((res) => res.json())
		.then((data) => {
			this.setState({records: shuffleArray(data)});
		});
	}

	async componentDidMount() {
		await this.getReviewCategories();
	}

	render() {
		const setName = new URLSearchParams(window.location.search).get('set_name');
		if(setName) {
			return (
				<div>
					{this.state.records.map((record) =>
						<li key={record.id}>
							{record.dutch}
						</li>
					)}
				</div>
			);
		} else {
			return (
				<div className="ReviewApp">
					<h1>Choose a category</h1>
					<ul>
						{this.state.categories.map((category) =>
							<li key={category}>
								<Link className="category-list-item" to={"/review?set_name=" + category} onClick={this.handleLinkClick}>
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

export default withRouter(ReviewVocab);