import React from 'react';
import './App.css';
import InputBox from './InputBox'; // import the new component

function App() {
  return (
    <div className="App-header">
      <h1>Welcome to Clinical Co-Pilot by Cavari</h1>
      <p>Your AI MED assistant for smarter, faster clinical workflows.</p>
      <InputBox />
    </div>
  );
}

export default App;
