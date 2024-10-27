// screens/IntroScreen.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function IntroScreen({ navigation }) {
  const handleTryPress = () => {
    navigation.navigate('VoicePrompt');
    // Navigate to the next screen or start the trial process if needed
  };

  return (
    <View style={styles.container}>
      <Text style={styles.introText}>
        Hi! My name is Feynman. I’m here to help you ace your exam.
      </Text>

      {/* Circular Image Placeholder */}
      <View style={styles.circle}>
        <Image
          source={require('../assets/logo.png')} // Replace with your actual image path
          style={styles.circleImage}
        />
      </View>

      {/* Try for 7 Days Button */}
      <TouchableOpacity style={styles.tryButton} onPress={handleTryPress}>
        <Text style={styles.tryButtonText}>Try for 7 Days</Text>
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
  introText: {
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
    backgroundColor: '#3b5998', // Background color for the circle (example blue shade)
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  circleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  tryButton: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#123524',
    paddingVertical: 15,
    paddingHorizontal: 40,
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
