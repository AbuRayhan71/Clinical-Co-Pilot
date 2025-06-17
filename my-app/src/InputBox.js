import React, { useState } from 'react';

import './App.css';
function InputBox() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setOutput(input); // For now, just echo input
    // Later: Call API or process input here
  };

  return (
    <form onSubmit={handleSubmit} className="input-form">
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type your input here"
        className="input-field"
      />
      <button
        type="submit"
        className="submit-button"
      >
        Submit
      </button>
      {output && (
        <div className="output-container">
          <strong>Output:</strong> {output}
        </div>
      )}
    </form>
  );
}

export default InputBox;
