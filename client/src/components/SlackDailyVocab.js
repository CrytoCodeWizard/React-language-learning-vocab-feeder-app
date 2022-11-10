import React from "react";
import "../App.css";
import {
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";

class SlackDailyVocab extends React.Component {
	constructor(props) {
		super(props);
		this.state = {data: ''};

		this.handleRecordCountChange = this.handleRecordCountChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidMount() {
		fetch("/api")
			.then((res) => res.json())
			.then((data) => {
				this.setState({data: data})
			});
	}

	handleRecordCountChange(event) {
		this.setState({recordCount: event.target.value});
	}

	handleSubmit(event) {
		event.preventDefault();
		this.sendSlack(this.state.recordCount);
	}

	sendSlack(recordCount) {
		fetch('/sendSlack', {
			method: 'POST',
			body: JSON.stringify({
				recordCount: recordCount
			}),
			headers: {
				'Content-type': 'application/json; charset=UTF-8',
			},
		}).then((res) => {
			console.log(res);
		});
	}

	render() {
		return (
			<div className="SlackApp">
                <form onSubmit={this.handleSubmit}>
                    <label>
                        <input type="number" min="1" max="25" placeholder="# of Records to Send" name="recordsToSend" onChange={this.handleRecordCountChange} required/>
                    </label>
                    <input type="submit" value={!this.state.data ? "Loading..." : this.state.data.sendDailySlackBtnLabel} />
                </form>
			</div>
		);
	}
}

function withRouter(Component) {
    function ComponentWithRouterProp(props) {
        let location = useLocation();
        let navigate = useNavigate();
        let params = useParams();
        return (
            <Component
                {...props}
                router={{ location, navigate, params }}
            />
        );
    }
  
    return ComponentWithRouterProp;
}

export default withRouter(SlackDailyVocab);