import React from "react";
import "./../../App.css";
import { withRouter } from './../../utils.js';

class ReviewVocab extends React.Component {
	constructor(props) {
		super(props);
		this.state = {data: ''};
	}

	componentDidMount() {
		fetch("/getReviewCategories")
			.then((res) => res.json())
			.then((data) => {
				this.setState({data: data})
			});
	}

	render() {
		return (
			<div className="ReviewApp">
			</div>
		);
	}
}

export default withRouter(ReviewVocab);