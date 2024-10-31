// LandingScreen.js
import React, {useContext} from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import {getLocalCustomer, getLocalUser, UserDataContext} from "../utils/UserDataContext";
import * as Haptics from 'expo-haptics';
import {db} from '../utils/Firebase';
import Config from "react-native-config";

export default function LandingScreen({ navigation }) {
  const {userInfo, setUserInfo, setUserCustomer, offerings, setOfferings, versionInfo, setVersionInfo } = useContext(UserDataContext);
  React.useEffect(() => {
    db.collection("version").doc(Config.MODE).get().then((versionData)=>{
      //读取firebase version数据
      if (versionData.exists) {
        setVersionInfo(versionData.data());
      }
    }).catch(e=>{
      //读取firebase失败，尝试获取缓存数据
      console.log("get version info err:",e);
    })
    getLocalUser().then((userData)=>{
      if (userData != null) {
        setUserInfo(userData);
      }
    })
    getLocalCustomer().then((customerData)=>{
      if (customerData != null) {
        setUserCustomer(customerData);
      }
    })
  }, [])

  React.useEffect(() => {
    if(userInfo != null){
      if(userInfo?.uid != null){
        navigation.navigate('Intro');
      }
    }
  }, [userInfo]);

  const handlePress = () => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    backgroundColor: '#f4f2e3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'ChalkboardSE-Bold',
  },
  subtitle: {
    fontSize: 18,
    color: '#555555',
    fontFamily: 'ChalkboardSE-Regular',
    marginBottom: 40,
  },
  button: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#123524',
    paddingVertical: 20,
    paddingHorizontal: 120,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'ChalkboardSE-Regular',
  },
});
