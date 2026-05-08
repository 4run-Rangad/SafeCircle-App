import { TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import React, {useEffect} from "react";
import * as SMS from "expo-sms";
import { getUserLocation } from "../utils/location";
import { supabase } from "../services/supabase";
import { getDistance } from "../utils/distance";
import * as Notifications from "expo-notifications";

export default function SOSButton({ location }){
    useEffect(() => {
          const subscription = Notifications.addNotificationResponseReceivedListener(
            (response) => {
              const action = response.actionIdentifier;
              if (action === "SEND_SOS") {
                Alert.alert(
                  "🚨 SOS Activated",
                  "Emergency alert sent"
                );
    
                handleSOS();
              }
            }
          );
    
          return () => subscription.remove();
    }, []);

    //Push Notification
    const sendPush = async (users) => {
        const messages = users.filter((u) => u.expo_token)
        .map((u) => ({
            to: u.expo_token,
            sound: "default",
            title: "Nearby SOS alert",
            body: "Someone nearby needs Help!",
            priority: "high",
            data: {
                type: "sos",
            },
        }));

        console.log("Sending:", messages);
        

        //if(messages.length === 0) return;

        const response = await fetch(
            "https://exp.host/--/api/v2/push/send",
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Accept-Encoding": "gzip, deflate",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(messages),
            }
        );
        const data = await response.json();
        console.log("Expo response:", JSON.stringify(data));
        //JSON.stringify(data, null, 2);
        
    };

    const handleSOS = async () =>{

        if (!location) {
            Alert.alert("Error", "Get loc first");
            return;
        }

        //Get user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            Alert.alert("Error", "User not logged in");
            return;
        }
        //Save SOS To DB
        const { error } = await supabase.from("sos_alerts").insert([
            {
                user_id: user.id,
                latitude: location.latitude,
                longitude: location.longitude,
            },
        ]);

        if (error) {
            console.log("SOS error:",error);
            Alert.alert("Error snding SOS");
            return;
        }

        //Alert.alert("SOS sent to network!");
        console.log("sos inserted");

        //Get all other users
        const { data: users, err } = await supabase.from("users").select("*").neq("id", user.id);
        console.log("Fetched users:", JSON.stringify(users, null, 2));
        console.log("Error:", err);
        
        

        //Nearby Only
        const nearbyUsers = users.filter((u) => {
            console.log("Checking user:", u.id);
            console.log("Lat:", u.latitude, "Lon:", u.longitude);
            
            if(!u.latitude || !u.longitude) return false;

            const distance = getDistance(
                Number(location.latitude),
                Number(location.longitude),
                Number(u.latitude),
                Number(u.longitude)
            );

            console.log("Distance:", distance);
            
            console.log("no. of users nearby" , nearbyUsers);
            
            return distance <= 5;
        });

        await sendPush(nearbyUsers);
        Alert.alert("SOS sent", `${nearbyUsers.length} nearby users notified`);

    

        // if(!selectedNumbers || selectedNumbers.length === 0){
        //     Alert.alert("No contacts", "Please select atleast one contact");
        //     return;
        // }

//         const coords = await getUserLocation();
        
//         if (!coords){
//             Alert.alert("Error", "Unable to fetch Location");
//             return;
//         }

//         const message = `SOS! Help needed.
// My Location: 
// https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;


//         const isAvailabe = await SMS.isAvailableAsync();

//         if(!isAvailabe){
//             Alert.alert("Error","SMS not supported on this device");
//             return;
//         }

//         await SMS.sendSMSAsync(selectedNumbers, message);
//         Alert.alert(
//             "Success", "SOS sent successfully");
    };

    return (
        <TouchableOpacity 
        style={styles.button}
        onPress={handleSOS}>
            <Text style={styles.text}>SOS</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: "#ff3b30",
        justifyContent: "center",
        alignItems: "center",
        elevation: 20,
        alignSelf: "center",
    },
    text: {
        color: "white",
        fontSize: 40,
        fontWeight: "bold",
    },
});