// screens/VoicePromptScreen.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For microphone icon

export default function VoicePromptScreen({ navigation }) {
  const handleMicPress = () => {
    console.log('Microphone button pressed');
    // Add logic to start recording or navigate to the next screen
  };

  return (
    <View style={styles.container}>
      {/* Prompt Text */}
      <Text style={styles.promptText}>
        Explain chemical reactions to me like I'm 5!
      </Text>

      {/* Circular Image Placeholder */}
      <View style={styles.circle}>
        <Image
          source={require('../assets/logo.png')} // Replace with actual image path if needed
          style={styles.circleImage}
        />
      </View>

      {/* Tap to Speak Hint */}
      <Text style={styles.speakHint}>Tap to start talking...</Text>

      {/* Microphone Button */}
      <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
        <Ionicons name="mic" size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f2e3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  promptText: {
    fontSize: 22,
    color: '#123524',
    fontWeight: 'bold',
    fontFamily: 'ChalkboardSE-Bold',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3b5998', // Example blue color
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  circleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  speakHint: {
    fontSize: 16,
    color: '#a9a9a9',
    fontFamily: 'ChalkboardSE-Regular',
    marginBottom: 20,
  },
  micButton: {
    backgroundColor: '#123524',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
