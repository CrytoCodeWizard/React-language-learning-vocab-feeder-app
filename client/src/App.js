import React from "react";
import "./App.css";
import SlackDailyVocab from "./components/SlackDailyVocab";

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {data: ''};
	}

	render() {
		return (
			<div className="App">
				<SlackDailyVocab/>
			</div>
		);
	}
}

export default App;