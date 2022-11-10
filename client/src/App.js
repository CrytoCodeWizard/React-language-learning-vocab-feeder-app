import React from "react";
import "./App.css";

class App extends React.Component {
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

		console.log(this.state);
		this.sendSlack(this.state.recordCount);
	}

	sendSlack(recordCount) {
		console.log('You clicked me!');
		console.log(recordCount);
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
			<div className="App">
				<header className="App-header">
					<form onSubmit={this.handleSubmit}>
						<label>
							<input type="number" placeholder="# of Records to Send" name="recordsToSend" onChange={this.handleRecordCountChange}/>
						</label>
						<input type="submit" value={!this.state.data ? "Loading..." : this.state.data.sendDailySlackBtnLabel} />
					</form>
				</header>
			</div>
		);
	}
}

export default App;