import React, { useState, useRef } from 'react';
import './InputBox.css';


function InputBox() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const apiKey = process.env.REACT_APP_AZURE_OPENAI_API_KEY;
  const endpoint = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT_NAME;
  const apiVersion = process.env.REACT_APP_AZURE_OPENAI_API_VERSION;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOutput('');
    setParsedData(null);

    const systemPrompt = `
// Multilingual ED Assistant Prompt (UNSW Research Prototype)
// Objective: Support bilingual patients and triage nurses using the Australian Triage Scale (ATS)
//
// Input: Patient symptoms in Bengali, Hindi, Arabic, or English.
//
// AI Task:
// 1. Detect the input language.
// 2. Translate to plain English if needed.
// 3. Summarize symptoms.
// 4. Identify key clinical indicators.
// 5. Recommend ATS triage level (1–5).
//
// Output Format:
// - Detected Language: [Bengali / Hindi / Arabic / English]
// - Translated English Summary: [summary]
// - Clinical Indicators: [list]
// - Suggested Triage Level (ATS 1–5): [level]
// - Explanation: [brief clinical justification]
//
// ATS 1 = Immediate care (life-threatening)
// ATS 2 = Emergency (within 10 min)
// ATS 3 = Urgent (within 30 min)
// ATS 4 = Semi-urgent (within 60 min)
// ATS 5 = Non-urgent (within 120 min)
//
// Example Input (Arabic):  صداع شديد ودوخة بعد السقوط
// Example Output:
// - Detected Language: Arabic
// - Translated English Summary: Severe headache and dizziness after a fall
// - Clinical Indicators: Headache, Dizziness, Recent Fall
// - Suggested Triage Level (ATS): 3
// - Explanation: Neurological symptoms following trauma require assessment within 30 minutes.
//
// Context: Prototype for UNSW research to improve ED communication and triage for culturally and linguistically diverse patients.
    `;

    const fullApiUrl = `${endpoint}openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    try {
      const response = await fetch(fullApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: input
            }
          ]
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API error: ${response.status} ${errorBody}`);
      }
      const data = await response.json();

      let content = data.choices[0].message.content;
      let jsonMatch = content.match(/```(?:json)?\s*([\s\S]+?)\s*```/) || content.match(/{[\s\S]+}/);
      let jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : null;

      if (jsonStr) {
        try {
          const json = JSON.parse(jsonStr);
          setParsedData(json);
        } catch (e) {
          setOutput(content);
        }
      } else {
        setOutput(content);
      }
    } catch (err) {
      setError(`Failed to process note. Please check your setup. Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Voice recording logic
  const handleMicClick = async () => {
    if (recording) {
      // Stop recording
      mediaRecorderRef.current.stop();
      setRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new window.MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          // Send audioBlob to backend for transcription
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');
          setLoading(true);
          setError('');
          try {
            const resp = await fetch('http://localhost:5005/transcribe', {
              method: 'POST',
              body: formData
            });
            if (!resp.ok) throw new Error('Transcription failed');
            const data = await resp.json();
            setInput(data.text);
          } catch (err) {
            setError('Voice transcription failed: ' + err.message);
          } finally {
            setLoading(false);
          }
        };
        mediaRecorder.start();
        setRecording(true);
      } catch (err) {
        setError('Microphone access denied or not available.');
      }
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your input here or use the mic"
          className="input-field"
        />
        <button
          type="button"
          onClick={handleMicClick}
          className={recording ? 'mic-button recording' : 'mic-button'}
          style={{ background: recording ? '#ff5252' : '#eee', border: 'none', borderRadius: '50%', width: 40, height: 40 }}
          title={recording ? 'Stop Recording' : 'Start Recording'}
          disabled={loading}
        >
          {recording ? '■' : '🎤'}
        </button>
      </div>
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
