import React from "react";
import logo from "./logo.svg";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import OtherPage from "./OtherPage";
import Fib from "./Fib";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Link to="/">Home</Link>
          <Link to="/other_page">Other Page</Link>
        </header>
        <>
          <Route exact path="/" component={Fib} />
          <Route exact path="/other_page" component={OtherPage} />
        </>
      </div>
    </Router>
  );
}

export default App;
