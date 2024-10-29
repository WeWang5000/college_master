// screens/VoicePromptScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { sendAudioToProxy } from '../services/openaiService';

export default function VoicePromptScreen() {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {
      console.log('Requesting permissions..');
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access microphone is required!');
        return;
      }

      console.log('Starting recording..');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording..');
    setIsRecording(false);
    await recording.stopAndUnloadAsync();

    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);

    // Convert audio to base64 and send to server
    const audioData = await fetchAudioAsBase64(uri);
    await sendAudioToProxy(audioData);
    
    setRecording(null);
  };

  const fetchAudioAsBase64 = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleMicPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>👋 Tell me more about the issue you're facing</Text>
      <View style={styles.mainCircleContainer}>
        <Image source={require('../assets/bobby.png')} style={styles.bobbyImage} />
      </View>
      <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
        <Ionicons name="mic" size={32} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 80, backgroundColor: '#f4f2e3' },
  headerText: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, color: '#333', textAlign: 'center' },
  mainCircleContainer: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginTop: 0 },
  bobbyImage: { width: 350, height: 350, resizeMode: 'contain', marginTop: 100 },
  micButton: { backgroundColor: '#32CD32', padding: 25, borderRadius: 50, position: 'absolute', bottom: 40 },
});
