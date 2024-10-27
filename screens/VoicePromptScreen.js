// screens/VoicePromptScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sendAudioToProxy } from '../services/openaiService';

export default function VoicePromptScreen() {
  const handleMicPress = async () => {
    console.log('Microphone button pressed');
    const dummyAudioData = new Uint8Array([/* example audio bytes */]); // Replace with actual audio data
    try {
      const response = await sendAudioToProxy(dummyAudioData);
      console.log('Received response:', response);
    } catch (error) {
      console.error('Failed to receive response:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.promptText}>Explain chemical reactions to me like I'm 5!</Text>
      <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
        <Ionicons name="mic" size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  promptText: { fontSize: 22, textAlign: 'center', marginBottom: 20 },
  micButton: { backgroundColor: '#123524', padding: 15, borderRadius: 30 },
});
