// screens/GoalsScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function GoalsScreen({ navigation }) {
  const [selectedGoals, setSelectedGoals] = useState([]);
  

  const goals = [
    { id: 1, text: 'Prep for exam', icon: '✏️' },
    { id: 2, text: 'Complete hw', icon: '📄' },
    { id: 3, text: 'Keep up in class', icon: '📚' },
    { id: 4, text: 'Understand concepts', icon: '🔍' },
    { id: 5, text: 'Get ahead', icon: '🏃‍♂️' },
  ];

  const toggleGoalSelection = (id) => {
    setSelectedGoals((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((goalId) => goalId !== id)
        : [...prevSelected, id]
    );
  };

  const handleNextPress = () => {
    navigation.navigate('Homework');
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.question}>What are your study goals?</Text>

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
    fontSize: 24,
    color: '#123524',
    fontWeight: 'bold',
    fontFamily: 'ChalkboardSE-Bold',
    marginBottom: 20,
  },
  goalsContainer: {
    width: '80%',
    alignItems: 'center',
  },
  goalButton: {
    backgroundColor: '#e8f0e3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  goalButtonSelected: {
    borderColor: '#123524', // Dark green border for selected state
  },
  goalText: {
    fontSize: 18,
    color: '#123524',
    fontFamily: 'ChalkboardSE-Regular',
  },
  nextButton: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#123524',
    paddingVertical: 15,
    paddingHorizontal: 40,
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
