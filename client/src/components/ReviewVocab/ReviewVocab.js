import React from "react";
import "./../../App.css";
import { withRouter } from './../../utils.js';
import { Link } from 'react-router-dom';

class ReviewVocab extends React.Component {
	constructor(props) {
		super(props);
		this.state = {data: []};
	}

	getReviewCategories() {
		fetch("/getReviewCategories")
			.then((res) => res.json())
			.then((data) => {
				this.setState({data: data});
			});
	}

	async componentDidMount() {
		await this.getReviewCategories();
	}

	render() {
		return (
			<div className="ReviewApp">
				<h1>Choose a category</h1>
				<ul>
					{this.state.data.map((category) =>
						<li key={category}><Link className="category-list-item">{category}</Link></li>
					)}
				</ul>
			</div>
		);
	}
}

export default withRouter(ReviewVocab);