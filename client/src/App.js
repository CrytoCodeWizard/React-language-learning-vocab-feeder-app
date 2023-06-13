import React from "react";
import { BrowserRouter, Route, Routes, Link } from "react-router-dom";

import "./App.css";
import * as Constants from "./constants";

const App = (props) => {
  return (
    <div className="App">
      <BrowserRouter>
        <header className="App-header">
          <div>
            <span>{Constants.APP_HEADER_TITLE}</span>
            <nav>
              <ul>
                {Constants.ROUTES.map((link) => (
                  <li key={link.linkLabel}>
                    <Link to={link.route} className="navAnchor">
                      {link.linkLabel}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </header>
        <Routes>
          {Constants.ROUTES.map((route) => (
            <Route
              key={route.element}
              exact
              path={route.route}
              element={route.element}
            />
          ))}
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
