// LandingScreen.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function LandingScreen({ navigation }) {
  const handlePress = () => {
    navigation.navigate('Review');
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/college_master2.png')} style={styles.logo} />
      <Text style={styles.title}>WishIknewAI</Text>
      <Text style={styles.subtitle}>Ultimate College Problem Therapy</Text>

      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f4f2e3', // Light beige background color
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 50, // Space for the button at the bottom
    },
    logo: {
      width: 150, // Adjust size to match your desired layout
      height: 150, // Adjust size to match your desired layout
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#000000',
      fontFamily: 'ChalkboardSE-Bold', // Optional font customization
    },
    subtitle: {
      fontSize: 18,
      color: '#555555',
      fontFamily: 'ChalkboardSE-Regular', // Optional font customization
      marginBottom: 40, // Space between text and button
    },
    button: {
      position: 'absolute',
      bottom: 40,
      backgroundColor: '#123524', // Dark green background color
      paddingVertical: 20, // Increased padding for height
      paddingHorizontal: 120, // Increased padding for width
      borderRadius: 30, // Larger radius for a more rounded button
      alignItems: 'center',
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 20, // Slightly larger font size
      fontWeight: 'bold',
      fontFamily: 'ChalkboardSE-Regular', // Optional font customization
    },
  });
  