import React, { useState } from 'react';
import './InputBox.css';

function InputBox() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiKey = process.env.REACT_APP_GROQ_API;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOutput('');
    setParsedData(null);

    const prompt = `
    You are a clinical note formatter.
    Given the following doctor note, extract the relevant information in this format:

    {
      "patientId": "string",
      "timestamp": "YYYY-MM-DDTHH:MM:SSZ",
      "summary": {
        "chiefComplaint": "Short one‑line summary",
        "history": "Concise history of present problem",
        "keyFindings": ["finding1", "finding2"],
        "differentialDiagnoses": [
          {"diagnosis": "Diagnosis A", "confidence": "High"},
          {"diagnosis": "Diagnosis B", "confidence": "Medium"}
        ],
        "recommendedActions": ["Action1", "Action2"],
        "redFlags": ["Flag1", "Flag2"]
      },
      "noteFormatted": "Cleaned-up clinical note text.",
      "metadata": {
        "model": "grok‑v1",
        "responseTimeMs": 123,
        "confidenceScore": 0.87
      }
    }

    Here is the doctor note:
    ${input}
    `;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) throw new Error('API error');
      const data = await response.json();

      // Step 1: Extract the JSON block from the output
      let content = data.choices[0].message.content;

      // Find the first {...} JSON block (even if inside ``` or with extra text)
      let jsonMatch = content.match(/```(?:json)?\s*([\s\S]+?)\s*```/) || content.match(/{[\s\S]+}/);
      let jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : null;

      if (jsonStr) {
        try {
          const json = JSON.parse(jsonStr);
          setParsedData(json);
        } catch (e) {
          setOutput(content); // If parsing fails, fallback to plain output
        }
      } else {
        setOutput(content); // If no JSON found, fallback to plain output
      }
    } catch (err) {
      setError('Failed to process note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper: display in a nice format
  function renderParsedData(data) {
    if (!data) return null;
    return (
      <div className="output-container" style={{ background: 'white', color: 'black', textAlign: 'left', padding: '1em', borderRadius: '8px' }}>
        <div><strong>Patient ID:</strong> {data.patientId}</div>
        <div><strong>Timestamp:</strong> {data.timestamp}</div>
        <div><strong>Chief Complaint:</strong> {data.summary.chiefComplaint}</div>
        <div><strong>History:</strong> {data.summary.history}</div>
        <div><strong>Key Findings:</strong> {data.summary.keyFindings.join(', ')}</div>
        <div><strong>Differential Diagnoses:</strong>
          <ul>
            {data.summary.differentialDiagnoses.map((d, i) => (
              <li key={i}>{d.diagnosis} ({d.confidence})</li>
            ))}
          </ul>
        </div>
        <div><strong>Recommended Actions:</strong> {data.summary.recommendedActions.join(', ')}</div>
        <div><strong>Red Flags:</strong> {data.summary.redFlags.join(', ')}</div>
        <div style={{ marginTop: '1em' }}><strong>Formatted Note:</strong> {data.noteFormatted}</div>
        <div style={{ marginTop: '1em', fontSize: '0.9em', color: '#444' }}>
          <strong>Metadata:</strong> Model: {data.metadata.model}, Time: {data.metadata.responseTimeMs}ms, Confidence: {data.metadata.confidenceScore}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="input-form">
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type your input here"
        className="input-field"
      />
      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
            <span className="ai-spinner"></span> Generating...
          </span>
        ) : (
          'Generate Medical Prescription'
        )}
      </button>
      {error && <div className="output-container">{error}</div>}
      {parsedData
        ? renderParsedData(parsedData)
        : output && (
            <div className="output-container" style={{ whiteSpace: 'pre-wrap', color: 'black', background: 'white' }}>
              {output}
            </div>
          )}
    </form>
  );
}

export default InputBox;
