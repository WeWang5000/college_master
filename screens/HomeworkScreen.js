import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback, Linking, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { requestTrackingPermissionsAsync, getTrackingPermissionsAsync } from 'expo-tracking-transparency';

export default function HomeworkScreen({ navigation }) {
  const [input, setInput] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const requestTrackingPermission = async () => {
      const { status } = await getTrackingPermissionsAsync();

      if (status === 'notDetermined') {
        const { granted } = await requestTrackingPermissionsAsync();
        if (granted) {
          Alert.alert('Thank you!', 'Tracking is enabled.');
        } else {
          Alert.alert('Permission Denied', 'You have opted out of tracking.');
        }
      } else {
        console.log(`Tracking permission status: ${status}`);
      }
    };

    requestTrackingPermission();
  }, []);

  const handleNextPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Haptic feedback for Next button
    navigation.navigate('Intro');
  };

  const toggleModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Haptic feedback for Settings button
    setModalVisible(!isModalVisible);
  };

  const openLink = (url) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Haptic feedback for modal options
    Linking.openURL(url).catch((err) => alert('Failed to open URL: ' + err.message));
  };

  return (
    <View style={styles.container}>
      {/* Top-right Settings Button */}
      <TouchableOpacity style={styles.settingsButton} onPress={toggleModal}>
        <Icon name="cog" size={24} color="#123524" />
      </TouchableOpacity>

      <Text style={styles.question}>What’s the {'\n'}MOST pressing issue{'\n'} you're facing?</Text>
      <Text style={styles.hint}>
        More specific is better!{'\n'}Describe when it happens, what it involves, how it affects you, your thoughts, and how it makes you feel.
      </Text>

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

      {/* Bottom Sheet Modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <TouchableWithoutFeedback onPress={toggleModal}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <TouchableOpacity onPress={() => openLink('https://iwikweb.web.app/terms')}>
                  <Text style={styles.modalOption}>📝 Terms</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openLink('https://iwikweb.web.app/privacy')}>
                  <Text style={styles.modalOption}>🔒 Privacy</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openLink('https://iwikweb.web.app/about')}>
                  <Text style={styles.modalOption}>✉️ Contact Support</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 25,
  },
  question: {
    fontSize: 32,
    color: '#123524',
    fontWeight: 'bold',
    fontFamily: 'ChalkboardSE-Bold',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 40,
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
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dim background for modal
  },
  modalContent: {
    backgroundColor: '#123524',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalOption: {
    color: '#ffffff',
    fontSize: 18,
    paddingVertical: 10,
    fontFamily: 'ChalkboardSE-Regular',
  },
});
