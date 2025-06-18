import React from 'react';
import './App.css';
import InputBox from './InputBox'; // import the new component

function App() {
  return (
    <div className="App-header" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <h1 className="animated-gradient">AI-Powered Medical Notes Generator</h1>
        <p style={{ fontSize: '1.3rem', fontWeight: 500, marginBottom: '2rem' }}>
          Effortlessly transform clinical notes into structured, actionable summaries with AI.
        </p>
        <InputBox /> {/* add your component here */}
      </div>
      <footer style={{ color: 'white', textAlign: 'center', marginTop: '2rem', padding: '1rem 0', width: '100%' }}>
        &copy; {new Date().getFullYear()} MD ABU RAYHAN, AI and Data Consultant. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
