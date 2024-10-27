// screens/HomeworkScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeworkScreen({ navigation }) {
  const [input, setInput] = useState('');

  const handleNextPress = () => {
    navigation.navigate('Intro');
    // Proceed to the next screen or submit input
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>What’s the {'\n'}MOST pressing issue{'\n'} you're facing?</Text>
      <Text style={styles.hint}>More specific is better!{'\n'}Describe when it happens, what it involves, how it affects you, your thoughts, and how it makes you feel.</Text>

      {/* Text Input Field */}
      <TextInput
        style={styles.input}
        placeholder="Type your question here"
        placeholderTextColor="#a9a9a9"
        value={input}
        onChangeText={setInput}
      />

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNextPress}>
        <Text style={styles.nextButtonText}>Next</Text>
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
    question: {
      fontSize: 32, // Increase font size for larger title
      color: '#123524',
      fontWeight: 'bold',
      fontFamily: 'ChalkboardSE-Bold',
      textAlign: 'center',
      marginBottom: 15, // Increase spacing below the title
      lineHeight: 40, // Add line height for better readability
    },
    hint: {
      fontSize: 14,
      color: '#888888',
      fontFamily: 'ChalkboardSE-Regular',
      textAlign: 'center',
      marginBottom: 20,
    },
    input: {
      backgroundColor: '#e8f0e3',
      width: '80%',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      fontSize: 18,
      color: '#123524',
      fontFamily: 'ChalkboardSE-Regular',
      marginBottom: 40,
      textAlign: 'left',
    },
    nextButton: {
      position: 'absolute',
      bottom: 40,
      backgroundColor: '#123524',
      paddingVertical: 20,
      paddingHorizontal: 170,
      borderRadius: 25,
      alignItems: 'center',
    },
    nextButtonText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: 'bold',
      fontFamily: 'ChalkboardSE-Regular',
    },
  });
  