import { initializeApp } from '@react-native-firebase/app';
import { getFirestore } from '@react-native-firebase/firestore';
import { getFunctions } from '@react-native-firebase/functions';
import { getAnalytics } from "@react-native-firebase/analytics";

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

const firebaseConfig = {
  appId:Config.FIREBASE_APPID,
  apiKey:Config.FIREBASE_APIKEY,
  databaseURL:Config.FIREBASE_REALTIMEDB,
  projectId:Config.FIREBASE_PROJECTID,
  clientId:Config.GOOGLE_LOGIN_AUTH_IOS,
  storageBucket:Config.FIREBASE_STORAGEBUCKET,
  messagingSenderId:Config.FIREBASE_MESSAGINGSENDERID,
  measurementId:Config.FIREBASE_MEASUREMENTID,
  authDomain:Config.FIREBASE_AUTHDOMAIN,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
// const auth = getAuth(app);

// Initialize Firestore and get a reference to the service
const db = getFirestore(app);
const functions = getFunctions(app);
const Analytics = getAnalytics(app);

const ALogEvent = (title, message) => {
  try{
    Analytics.logEvent(title, message).catch(err => {
      console.log({"analytics logEvent err:": err})
    });
  }catch (e){
    console.error("analytics log event err:", e);
  }
}
const ASetUserId = (uid) => {
  try{
    Analytics.setUserId(uid).catch(err => {
      console.log({"analytics setUserId err:": err})
    });
  }catch (e){
    console.error("analytics set user id err:", e);
  }
}

export { db, firebaseConfig, functions, Analytics, ALogEvent, ASetUserId };
