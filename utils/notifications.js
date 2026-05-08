import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,  
    }),
});

export const registerForPushNotifications = async () => {
    console.log("Requesting permission...");
    

    if(!Device.isDevice){
        alert("Use physical device for push notifications");
        return null;
    }
    const { status } = await Notifications.requestPermissionsAsync();
    console.log("Permission status:", status);
    
    if(status !== "granted"){
        alert("Permission denied");
        return;
    }
    
    const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra.eas.projectId,
    });
    console.log("Expo token :", token);
    
    return token.data;

    // const { status: existingStatus } = Notifications.getPermissionsAsync();
    // let finalStatus = existingStatus;

    // if(finalStatus !== "granted"){
    //     finalStatus = status;
    // }


    // if( finalStatus !== "granted") {
    //     alert("Permission Not Granted!");
    //     return null;
    // };


};