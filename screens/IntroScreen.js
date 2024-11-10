// screens/IntroScreen.js
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import { UserDataContext } from '../utils/UserDataContext';
import Purchases from "react-native-purchases";
import RevenueCatUI, {PAYWALL_RESULT} from "react-native-purchases-ui";
import {GetCustomerInformation, InitRC} from "../utils/Revenuecat";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function IntroScreen({ navigation }) {
  const {userInfo, setUserInfo, offerings, setOfferings, userCustomer, setUserCustomer} = useContext(UserDataContext);
  const [hasNavigated, setHasNavigated] = React.useState(false);

  React.useEffect(() => {
    if(userCustomer!=null && userCustomer?.allExpirationDatesMillis!=null){
      let expire_time = 0;
      Object.keys(userCustomer.allExpirationDatesMillis).forEach(key => {
        const ts = userCustomer.allExpirationDatesMillis[key];
        if(ts > expire_time){
          expire_time = ts;
        }
      })
      console.log("userCustomer", userCustomer)
      console.log("expire", expire_time, Date.now(), Date.now()-expire_time)
      if (expire_time + 86400000  > Date.now()&& !hasNavigated){
        setHasNavigated(true);
        navigation.reset({index: 0, routes: [{ name: 'VoicePrompt' }]});
      }
    }

    const ListeningCustomInfo = async () => {
      await Purchases.addCustomerInfoUpdateListener((customerInfo) => {
        console.log("ListeningCustomInfo: ", customerInfo);
        setUserCustomer(customerInfo);
        if(customerInfo?.originalAppUserId){
          AsyncStorage.setItem("@user", JSON.stringify({uid: customerInfo.originalAppUserId,})).then(()=>{
            console.log("save user info success")}).catch((err)=>{console.log("save user info err:", err)});
        }
        AsyncStorage.setItem("@customer", JSON.stringify(customerInfo)).then(()=>{
          console.log("save customer success")}).catch((err)=>{console.log("save customer err:", err)});

        let expire_time = 0;
        Object.keys(customerInfo.allExpirationDatesMillis).forEach(key => {
          const ts = customerInfo.allExpirationDatesMillis[key];
          if(ts > expire_time){
            expire_time = ts;
          }
        })
        console.log("expire", expire_time, Date.now(), Date.now()-expire_time)
        if (expire_time + 86400000 * 3 > Date.now() && !hasNavigated){
          setHasNavigated(true);
          navigation.reset({index: 0, routes: [{ name: 'VoicePrompt' }]});
        }
      })
    }
    ListeningCustomInfo().then(()=>{console.log("ListeningCustomInfo")});
  }, [])


  const DisplayRCPaywall = async(offerings)=>{
    if (offerings == null){
      var uid = "";
      if(userInfo != null && userInfo.uid != null){
        uid = userInfo.uid;
      }
      const off = await InitRC(uid);
      if(off!=null){
        setOfferings(off);
        const custom = await GetCustomerInformation();
      }else{
        console.log(222);
      }
    }
    const paywallResult = await RevenueCatUI.presentPaywall({offering:offerings});
    console.log("paywallResult:", paywallResult);
    if (
        paywallResult === PAYWALL_RESULT.PURCHASED ||
        paywallResult === PAYWALL_RESULT.RESTORED
    ) {
      navigation.reset({index: 0, routes: [{ name: 'VoicePrompt' }]});
      console.log(paywallResult);
    }
    if (paywallResult === PAYWALL_RESULT.CANCELLED) {
      console.log('user_cancel_subscribe_process');
    }
  }

  const handleTryPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Haptic feedback for Try Button
    // navigation.navigate('VoicePrompt');
    try {
      await DisplayRCPaywall(offerings);
    } catch (error) {
      console.error('Before buy Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.introText}>
        Hi! My name is Bobby. {'\n'} I'm here to help
      </Text>

      {/* Circular Image Placeholder */}
      <View style={styles.circle}>
        <Image
          source={require('../assets/dancingracco.gif')} // Replace with your GIF path
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
    paddingVertical: 20,
    paddingHorizontal: 120,
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
