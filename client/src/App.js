import React from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';

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
				<header className="App-header">
					<h1>De Nederlandse App</h1>
				</header>
				<BrowserRouter>
					<Routes>
						<Route exact path="/slack" element={<SlackDailyVocab/>}/>
					</Routes>
				</BrowserRouter>
			</div>
		);
	}
}

export default App;