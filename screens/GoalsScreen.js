// GoalsScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function GoalsScreen({ navigation }) {
  const [selectedGoals, setSelectedGoals] = useState([]);

  const goals = [
    { id: 1, text: 'Academic Pressure', icon: '📚' },
    { id: 2, text: 'Building Friendships', icon: '🤝' },
    { id: 3, text: 'Roommate Struggles', icon: '🏠' },
    { id: 4, text: 'Professor Stress', icon: '👩‍🏫' },
    { id: 5, text: 'Mental Health Support', icon: '🧠' },
    { id: 6, text: 'Financial Worries', icon: '💵' },
    { id: 7, text: 'Earning Extra Cash', icon: '💰' },
    { id: 8, text: 'Internship Anxiety', icon: '💼' },
    { id: 9, text: 'Greek Life Doubts', icon: '🏛️' },
    { id: 10, text: 'Time Management', icon: '⏰' },
    { id: 11, text: 'Other', icon: '❓' },
  ];

  const toggleGoalSelection = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Trigger haptic feedback
    setSelectedGoals((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((goalId) => goalId !== id)
        : [...prevSelected, id]
    );
  };

  const handleNextPress = () => {
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Trigger haptic feedback
    navigation.navigate('Homework');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.question}>What problem are you facing?</Text>
        
        {/* Render Goals as Buttons */}
        <View style={styles.goalsContainer}>
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalButton,
                selectedGoals.includes(goal.id) && styles.goalButtonSelected,
              ]}
              onPress={() => toggleGoalSelection(goal.id)}
            >
              <Text style={styles.goalText}>
                {goal.icon} {goal.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNextPress}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f2e3',
  },
  scrollContainer: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  question: {
    fontSize: 28,
    color: '#123524',
    fontWeight: 'bold',
    fontFamily: 'ChalkboardSE-Bold',
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
    width: '80%',
    lineHeight: 34,
  },
  goalsContainer: {
    width: '85%',
    alignItems: 'center',
    paddingBottom: 20,
  },
  goalButton: {
    backgroundColor: '#e8f0e3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  goalButtonSelected: {
    backgroundColor: '#cde6d0',
    borderColor: '#123524',
    borderWidth: 2,
  },
  goalText: {
    fontSize: 20,
    color: '#123524',
    fontWeight: 'bold',
    fontFamily: 'ChalkboardSE-Regular',
  },
  nextButton: {
    backgroundColor: '#123524',
    paddingVertical: 20,
    paddingHorizontal: 170,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'ChalkboardSE-Regular',
  },
});
