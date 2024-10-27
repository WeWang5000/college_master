// screens/ReviewScreen.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function ReviewScreen({ navigation }) {
  const handleReviewPress = () => {
    navigation.navigate('Goals');
  };

  return (
    <View style={styles.container}>
      {/* Top text with laurels */}
      <View style={styles.header}>
        <Image source={require('../assets/laurel.png')} style={styles.laurel} />
        <Text style={styles.title}>#1 Memorization App</Text>
        <Image source={require('../assets/laurel.png')} style={styles.laurel} />
      </View>

      {/* Star rating */}
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, index) => (
          <Image
            key={index}
            source={require('../assets/star.png')} // Replace with actual star image
            style={styles.star}
          />
        ))}
      </View>

      {/* Subtitle text */}
      <Text style={styles.subtitle}>Trusted by over 1 Million People</Text>

      {/* Bottom button */}
      <TouchableOpacity style={styles.button} onPress={handleReviewPress}>
        <Text style={styles.buttonText}>Leave a Review</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  laurel: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#123524',
    marginHorizontal: 10,
    fontFamily: 'ChalkboardSE-Bold', // Optional font customization
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: 20,
  },
  star: {
    width: 40,
    height: 40,
    marginHorizontal: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#555555',
    fontFamily: 'ChalkboardSE-Regular', // Optional font customization
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#123524',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'ChalkboardSE-Regular',
  },
});
