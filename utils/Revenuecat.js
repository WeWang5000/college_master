import Purchases from 'react-native-purchases';
import {Platform} from 'react-native';
import Config from 'react-native-config';

export const GetCustomerInformation = async()=>{
    return await Purchases.getCustomerInfo();
}

export const InitRC = async (userID) => {
    await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    if (Platform.OS === 'ios') {
        await Purchases.configure({
            apiKey: Config.RC_PUBLIC_KEY_IOS,
            appUserID: userID,
        });
    }
    console.log("get currentOfferings.");
    const currentOfferings = await Purchases.getOfferings();
    console.log("currentOfferings:", currentOfferings);
    return currentOfferings;
}