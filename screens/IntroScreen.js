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
      console.log("111 userCustomer", userCustomer)
      console.log("111 expire", expire_time, Date.now(), Date.now()-expire_time)
      if (expire_time > Date.now()&& !hasNavigated){ //43200000
        setHasNavigated(true);
        console.log("VoicePrompt111");
        navigation.reset({index: 0, routes: [{ name: 'VoicePrompt' }]});
        return;
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
      })
    }
    ListeningCustomInfo().then(()=>{console.log("ListeningCustomInfo")}).catch(err => console.log("ListeningCustomInfo error", err));
  }, [])


  const DisplayRCPaywall = async(offerings)=>{
    if (offerings == null){
      var uid = "";
      if(userInfo != null && userInfo.uid != null){
        uid = userInfo.uid;
      }
      try {
        const [off, custom] = await Promise.all([InitRC(uid), GetCustomerInformation()]);
        if (off != null) {
          setOfferings(off);
        } else {
          console.log('Failed to initialize RevenueCat');
        }
      } catch (error) {
        console.error('Error initializing RevenueCat:', error);
      }
    }
    try {
      const paywallResult = await RevenueCatUI.presentPaywall({ offering: offerings });
      if (paywallResult === PAYWALL_RESULT.PURCHASED || paywallResult === PAYWALL_RESULT.RESTORED) {
        console.log("VoicePrompt222");
        navigation.reset({ index: 0, routes: [{ name: 'VoicePrompt' }] });
      }
      if (paywallResult === PAYWALL_RESULT.CANCELLED) {
        console.log('User canceled subscribe process');
      }
    } catch (error) {
      console.error('Error displaying paywall:', error);
    }
  }

  const handleTryPress = async () => {
    // Trigger medium-intensity haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); // Heavier haptic feedback for a premium feel
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
      <TouchableOpacity
          style={styles.tryButton}
          onPress={handleTryPress}
          activeOpacity={0.8} // Slight fade-in effect on press
      >
        <Text style={styles.tryButtonText}>Try WishIKnew Pro</Text>
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
    paddingHorizontal: 40, // Reduced padding to fit text within one line
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
