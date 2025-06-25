import os
from flask import Flask, request, jsonify
import requests
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Set these with your actual values
WHISPER_API_KEY = os.environ.get('WHISPER_API_KEY', 'YOUR_WHISPER_KEY')
WHISPER_API_ENDPOINT = os.environ.get('WHISPER_API_ENDPOINT', 'YOUR_WHISPER_ENDPOINT')

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    print('Received /transcribe POST request')
    if 'audio' not in request.files:
        print('No audio file provided in request.files:', request.files)
        return jsonify({'error': 'No audio file provided'}), 400
    audio_file = request.files['audio']
    print('Audio file received:', audio_file.filename, audio_file.mimetype)

    try:
        files = {'file': (audio_file.filename, audio_file, audio_file.mimetype)}
        headers = {
            'Authorization': f'Bearer {WHISPER_API_KEY}'
        }
        data = {
            'model': 'whisper-1',  # Change if using Azure deployment name
            'language': 'auto'     # Let Whisper auto-detect
        }
        print('Sending request to Whisper API...')
        response = requests.post(
            WHISPER_API_ENDPOINT,
            headers=headers,
            files=files,
            data=data
        )
        print('Whisper API response status:', response.status_code)
        if response.status_code != 200:
            print('Whisper API error:', response.text)
            return jsonify({'error': 'Transcription failed', 'details': response.text}), 500
        result = response.json()
        print('Transcription result:', result)
        return jsonify({'text': result.get('text', '')})
    except Exception as e:
        print('Exception during transcription:', str(e))
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005, debug=True)
