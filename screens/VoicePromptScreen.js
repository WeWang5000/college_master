// screens/VoicePromptScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { sendAudioToProxy } from '../services/openaiService';

export default function VoicePromptScreen() {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const bounceValue = useState(new Animated.Value(0))[0];

  useEffect(() => {
    startBouncing();
  }, []);

  const startBouncing = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: -10, // Move up by 10 units
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 0, // Move back down
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access microphone is required!');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    await recording.stopAndUnloadAsync();

    const uri = recording.getURI();

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
      
      {/* Animated Bobby */}
      <Animated.View style={[styles.mainCircleContainer, { transform: [{ translateY: bounceValue }] }]}>
        <Image source={require('../assets/smilebobby.jpg')} style={styles.bobbyImage} />
      </Animated.View>

      {/* Microphone Button */}
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

