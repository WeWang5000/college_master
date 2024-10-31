// screens/VoicePromptScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { sendAudioToProxy } from '../services/openaiService';
import {UserDataContext } from '../utils/UserDataContext';
import AsyncStorage from "@react-native-async-storage/async-storage";
import io from 'socket.io-client';

export default function VoicePromptScreen({ navigation }) {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const {userInfo, setUserInfo, setUserCustomer, versionInfo, setVersionInfo} = React.useContext(UserDataContext);
  const socket = io('http://127.0.0.1:5001/my--auth-f3201/us-central1/http_connect'); // 替换为你的 Firebase Functions URL

  React.useEffect(() => {
    let uid = Date.now().toString();
    if(userInfo != null && userInfo.uid !== null) {
      uid = userInfo.uid;
    }
    // 连接到服务器并传递 uid
    socket.emit('connect', { uid: uid });

    socket.on('response', (data) => {
      if (data.message) {
        console.log(data.message);
        // setResponses((prevResponses) => [...prevResponses, data.message]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [])

  const signOut = async() => {
    setUserInfo(null);
    setUserCustomer(null);
    await AsyncStorage.removeItem("@user");
    await AsyncStorage.removeItem("@customer");
    await AsyncStorage.clear();
    navigation.reset({index: 0, routes: [{ name: 'Landing' }]});
  }

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
      <Text style={styles.promptText}>Explain chemical reactions to me like I'm 5!</Text>
      <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
        <Ionicons name="mic" size={24} color="#ffffff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.tryButton} onPress={signOut}>
        <Text style={styles.tryButtonText}>SignOut</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  promptText: { fontSize: 22, textAlign: 'center', marginBottom: 20 },
  micButton: { backgroundColor: '#123524', padding: 15, borderRadius: 30 },
  tryButton: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#123524',
    paddingVertical: 20,
    paddingHorizontal: 120,
    borderRadius: 25,
    alignItems: 'center',
  },
  tryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'ChalkboardSE-Regular',
  },
});
