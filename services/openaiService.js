// services/openaiService.js
import axios from 'axios';

export async function sendAudioToProxy(audioData) {
  try {
    const response = await axios.post('http://localhost:3000/connect', audioData, {
      headers: { 'Content-Type': 'application/octet-stream' },
    });
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending audio to proxy:', error);
    throw error;
  }
}
