// UserDataContext.js
import React, {createContext, useState} from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserDataContext = createContext(); 

const UserDataProvider = ({ children }) => {
  //用户输入的邀请码
  const [versionInfo, setVersionInfo] = useState(null);
  //用户信息
  const [userInfo, setUserInfo] = useState(null);
  //RC订单组
  const [offerings, setOfferings] = useState(null);
  //RC支付记录
  const [userCustomer, setUserCustomer] = useState(null);

  return (
    <UserDataContext.Provider value={{ userInfo, setUserInfo, offerings, setOfferings, versionInfo, setVersionInfo, userCustomer, setUserCustomer, }}>
      {children}
    </UserDataContext.Provider>
  );
};

//本地读取用户信息
const getLocalUser = async () => {
  try {
    const userJSON = await AsyncStorage.getItem("@user");
    return userJSON ? JSON.parse(userJSON) : null;
  } catch (e) {
    console.log(e, "Error getting local user");
    return null;
  }
};

//本地读取用户信息
const getLocalCustomer = async () => {
  try {
    const userJSON = await AsyncStorage.getItem("@customer");
    return userJSON ? JSON.parse(userJSON) : null;
  } catch (e) {
    console.log(e, "Error getting local user");
    return null;
  }
};

export { UserDataContext, UserDataProvider, getLocalUser, getLocalCustomer };
