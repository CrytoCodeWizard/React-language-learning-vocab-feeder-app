import React from "react";
import "./../../App.css";
import { withRouter } from './../../utils.js';

class VocabCard extends React.Component {
	constructor(props) {
		super(props);
        const { record } = this.props;
        console.log(record);

		this.state = {record: '', flipped: false};
		// this.handleLinkClick = this.handleLinkClick.bind(this);
	}

	// handleLinkClick(event) {
	// 	this.retrieveVocabForCategory(event.target.innerText);
	// }

	// async componentDidMount() {
	// 	await this.getReviewCategories();
	// }

	render() {
        let label = this.state.flipped ? this.state.record.english : this.state.record.dutch;
        if(label) {
            return(
                <div>
                    {label}
                </div>
            );
        }
	}
}

export default withRouter(VocabCard);