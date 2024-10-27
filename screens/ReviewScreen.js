import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';

export default function ReviewScreen({ navigation }) {
  const handleReviewPress = () => {
    navigation.navigate('Goals');
  };

  return (
    <View style={styles.container}>
      {/* Displaying the full image */}
      <Image source={require('../assets/#1College.png')} style={styles.fullImage} />

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
  fullImage: {
    width: '110%', // or any specific width like 300
    height: undefined, // let the image resize proportionally
    aspectRatio: 1, // or adjust as needed to fit the screen
    marginBottom: 20,
    marginLeft: 18,
  },
  button: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#123524',
    paddingVertical: 20,
    paddingHorizontal: 120,
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
