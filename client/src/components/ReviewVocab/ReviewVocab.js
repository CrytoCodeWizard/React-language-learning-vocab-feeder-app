import React from "react";
import "./../../App.css";
import { withRouter } from './../../utils.js';

class ReviewVocab extends React.Component {
	constructor(props) {
		super(props);
		this.state = {data: ''};

		this.handleRecordCountChange = this.handleRecordCountChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	render() {
		return (
			<div className="ReviewApp">
			</div>
		);
	}
}

export default withRouter(ReviewVocab);