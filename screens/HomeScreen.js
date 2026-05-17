import React, { useContext, useEffect, useState } from "react";
import { View,Text,StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SOSButton from "../components/SOSButton";
import { getContacts } from "../utils/contacts";
import { registerForPushNotifications } from "../utils/notifications";
import { getUserLocation } from "../utils/location";
import { supabase } from "../services/supabase";
import { getDistance } from "../utils/distance";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";

import { AlertsContext } from "../context/AlertsContext";

export default function HomeScreen(){
    const [contacts, setContacts] = useState([]);
    const [selectedNumbers, setSelectedNumbers] = useState([]);

    const { 
      alerts,
      
      location,
      setLocation,

      currentUser,
      setCurrentUser,
     } = useContext(AlertsContext);
    //Get Logged user
    useEffect(() => {
        loadUser();
    }, []);
    
    //get token
    useEffect(() => {
        if(currentUser){
            console.log("User loaded:", currentUser);
            setupNotifications();
            createSOSNotification();
        }
    }, [currentUser]);

    

    const loadUser = async () => {
        const { data: { user }} = await supabase.auth.getUser();

        setCurrentUser(user);
    };

    const createSOSNotification = async () => {

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🛡 SafeCircle Active",
          body: "Emergency protection enabled",
          sticky: true,
          categoryIdentifier: "sos-actions",
        },

        trigger: null,
      });

    };

    const setupNotifications = async () => {
        console.log("setupNotifications called");
        
        const token = await registerForPushNotifications();
        console.log("Token:", token);
        if (!token) {
            console.log("No token");
            return;
        }
        
        await supabase
        .from("users").update({expo_token: token})
        .eq("id", currentUser.id);

        console.log("Token Saved");
        
    };

    //Save user to DB
    const saveUser = async (location) => {
        
        const { data: { user }} = await supabase.auth.getUser();

        if (!user) {
            console.log("No user found");
            return;
        }

        const { data, error } = await supabase.from("users").upsert([
            {
                id: user.id,
                latitude: location.latitude,
                longitude: location.longitude,
            }
        ]).select();

        if (error) console.log("USer save error", error);
        else console.log("User saved:", data);

        return user.id;
    }

  const startLiveTracking = async () => {

    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {

      Alert.alert(
        "Location permission denied"
      );

      return;
    }

    await Location.watchPositionAsync(
      {
        accuracy:
          Location.Accuracy.High,

        timeInterval: 5000,

        distanceInterval: 10,
      },

      async (position) => {

        const coords = {
          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,
        };

        setLocation(coords);

        await saveUser(coords);

        console.log(
          "Live Location:",
          coords
        );
      }
  );
};





    // //Get Location
    // const handleGetLocation = async () => {
    //     const coords = await getUserLocation();
    //     if (coords) setLocation(coords);

    //     const userId = await saveUser(coords);
    //     console.log("User ID:", userId);
    // };

    // const listenForSOS = () => {
    //     supabase.channel("nearby_sos").on(
    //         "postgres_changes",
    //         {
    //             event: "INSERT",
    //             schema: "public",
    //             table: "sos_alerts",
    //         },
    //         (payload) => {
    //             if(!location || !currentUser) return;

    //             const alertData = payload?.new;
    //             if(!alertData) {
    //               console.log("Invalid payload:");
    //               return;
    //             }

    //             if(alertData.user_id === currentUser.id) return;

    //             const distance = getDistance(
    //                 location.latitude,
    //                 location.longitude,
    //                 alertData.latitude,
    //                 alertData.longitude
    //             );

    //             console.log("Distance: ", distance);
              
    //             if(distance <= 5){
    //                 setAlerts((prev) => [
    //                     {
    //                         ...alertData,
    //                         distance: distance.toFixed(2),
    //                     }, ...prev,
    //                 ]);

    //                 Alert.alert("Nearby SOS alert", `${distance.toFixed(2)} km away`);
    //             }
                

    //         }
    //     )
    //     .subscribe();
    // };

    //load Contacts
    const loadContacts = async () => {
        const data = await getContacts();
        setContacts(data);
    };

    //Select Contact
    const selectContact = (number) => {
        setSelectedNumbers([...new Set([...selectedNumbers, number])]);
    };

    return (
       <SafeAreaView style={styles.container}>
    
    <Text style={styles.title}>SafeCircle</Text>

    {/* Status Card */}
    <View style={styles.statusCard}>
      <Text style={styles.statusText}>
        {alerts.length > 0
          ? "⚠️ Alerts Nearby"
          : "✅ You are Safe"}
      </Text>

      <Text style={styles.subText}>
        Active Alerts: {alerts.length}
      </Text>
    </View>

    {/* Location Button */}
    <TouchableOpacity
      style={styles.locationBtn}
      onPress={startLiveTracking}
    >
      <Text style={styles.btnText}>
        Get Current Location
      </Text>
    </TouchableOpacity>

    {location && (
      <Text style={styles.coords}>
        {location.latitude.toFixed(4)},{" "}
        {location.longitude.toFixed(4)}
      </Text>
    )}

    {/* SOS Button */}
    <View style={{ marginTop: 30 }}>
      <SOSButton
        location={location}
        selectedNumbers={selectedNumbers}
      />
    </View>

  </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
  },

  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  statusCard: {
    backgroundColor: "#161616",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },

  statusText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  subText: {
    color: "#888",
    marginTop: 6,
  },

  locationBtn: {
    backgroundColor: "#1f1f1f",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  btnText: {
    color: "white",
    fontWeight: "bold",
  },

  coords: {
    color: "#888",
    marginTop: 10,
    textAlign: "center",
  },
});