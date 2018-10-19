import React, { Component } from 'react'
import logo from './logo.png'
import './App.css'
import  FormExample from "./components/FormExample"

class App extends Component {

	render() {
		return (
			<div className="App">
			<header className="App-header">
			<img src={logo} className="App-logo" alt="logo" />
			<h1 className="App-title">SG10K Beacon Server</h1>
			</header>
	
			<FormExample />

			</div>
		);
	}
}

export default App;
