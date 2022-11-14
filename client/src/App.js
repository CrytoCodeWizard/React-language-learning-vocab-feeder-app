import React from "react";
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';

import "./App.css";
import SlackDailyVocab from "./components/SlackDailyVocab/SlackDailyVocab";
import ReviewVocab from "./components/ReviewVocab/ReviewVocab";
import Home from "./components/Home/Home";

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {data: ''};
	}

	render() {
		return (
			<div className="App">
				<BrowserRouter>
					<header className="App-header">
						<div>
							<span>De Nederlandse App</span>
							<nav>
								<ul>
									<li><Link to="/" className="navAnchor">Home</Link></li>
									<li><Link to="/slack" className="navAnchor">Slack App</Link></li>
									<li><Link to="/review" className="navAnchor">Flash Cards</Link></li>
								</ul>
							</nav>
						</div>
					</header>
					<Routes>
						<Route exact path="/" element={<Home/>}/>
						<Route exact path="/slack" element={<SlackDailyVocab/>}/>
						<Route exact path="/review" element={<ReviewVocab/>}/>
					</Routes>
				</BrowserRouter>
			</div>
		);
	}
}

export default App;