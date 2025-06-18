import React from 'react';
import './App.css';
import InputBox from './InputBox'; // import the new component

function App() {
  return (
    <div className="App-header" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <h1>Welcome to Clinical Co-Pilot by Cavari</h1>
        <p>Your AI MED assistant for smarter, faster clinical Workflows !</p>
        <InputBox /> {/* add your component here */}
      </div>
      <footer style={{ color: 'white', textAlign: 'center', marginTop: '2rem', padding: '1rem 0', width: '100%' }}>
        &copy; {new Date().getFullYear()} MD ABU RAYHAN, AI and Data Consultant. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
