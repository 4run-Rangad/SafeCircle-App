import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from "react-native";

import React, {
  useEffect,
  useRef,
} from "react";

import * as SMS from "expo-sms";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getUserLocation,
} from "../utils/location";

import {
  supabase,
} from "../services/supabase";

import {
  getDistance,
} from "../utils/distance";

import * as Notifications
  from "expo-notifications";

export default function SOSButton({
  location,
}) {

  // TRACK ACTIVE INTERVAL

  const trackingInterval =
    useRef(null);

  //Persistent Notification
  useEffect(() => {

    const subscription =
      Notifications
        .addNotificationResponseReceivedListener(

          (response) => {

            const action =
              response.actionIdentifier;

            if (
              action === "SEND_SOS"
            ) {

              Alert.alert(
                "🚨 SOS Activated",
                "Emergency alert sent"
              );

              handleSOS();
            }
          }
        );

    return () => {

      subscription.remove();

      // CLEAR INTERVAL

      if (
        trackingInterval.current
      ) {

        clearInterval(
          trackingInterval.current
        );
      }
    };

  }, []);

  //SMS to Contacts
  const sendEmergencySMS = async () => {

    try {

      const savedContacts =
        await AsyncStorage.getItem(
          "emergency_contacts"
        );

      if (!savedContacts) {

        Alert.alert(
          "No Contacts",
          "Add emergency contacts first"
        );

        return;
      }

      const contacts =
        JSON.parse(savedContacts);

      const phoneNumbers =
        contacts.map(
          (c) => c.phone
        );

      const message = `🚨 EMERGENCY SOS ALERT

I need help immediately.

My live location:
https://maps.google.com/?q=${location.latitude},${location.longitude}

Sent from SafeCircle`;

      const available =
        await SMS.isAvailableAsync();

      if (!available) {

        Alert.alert(
          "SMS not supported"
        );

        return;
      }

      await SMS.sendSMSAsync(
        phoneNumbers,
        message
      );

    } catch (err) {

      console.log(err);

      Alert.alert(
        "SMS Error"
      );
    }
  };

  // PUSH NOTIFICATIONS

  const sendPush =
    async (users) => {

      const messages =
        users
          .filter(
            (u) => u.expo_token
          )

          .map((u) => ({

            to: u.expo_token,

            sound: "default",

            title:
              "Nearby SOS Alert",

            body:
              "Someone nearby needs help!",

            priority: "high",

            data: {
              type: "sos",
            },

          }));

      if (
        messages.length === 0
      ) return;

      try {

        const response =
          await fetch(

            "https://exp.host/--/api/v2/push/send",

            {
              method: "POST",

              headers: {
                Accept: "application/json",

                "Accept-Encoding":
                  "gzip, deflate",

                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify(
                messages
              ),
            }
          );

        const data =
          await response.json();

        console.log(
          "Push response:",
          data
        );

      } catch (err) {

        console.log(
          "Push error:",
          err
        );
      }
    };

  // HANDLE SOS

  const handleSOS =
    async () => {

      if (!location) {

        Alert.alert(
          "Error",
          "Get location first"
        );

        return;
      }

      // GET USER

      const {
        data: { user },
      }

        = await supabase
          .auth.getUser();

      if (!user) {

        Alert.alert(
          "Error",
          "User not logged in"
        );

        return;
      }

      // CHECK EXISTING SOS

      const {
        data: existingSOS,
      }

        = await supabase

          .from("sos_alerts")

          .select("*")

          .eq("user_id", user.id)

          .eq("is_active", true)

          .maybeSingle();

      // UPDATE EXISTING SOS

      if (existingSOS) {

        await supabase

          .from("sos_alerts")

          .update({

            latitude:
              location.latitude,

            longitude:
              location.longitude,

            updated_at:
              new Date()
                .toISOString(),

          })

          .eq(
            "id",
            existingSOS.id
          );

        console.log(
          "SOS updated"
        );

      } else {

        // CREATE NEW SOS

        await supabase

          .from("sos_alerts")

          .insert([{

            user_id: user.id,

            latitude:
              location.latitude,

            longitude:
              location.longitude,

            created_at:
              new Date()
                .toISOString(),

            updated_at:
              new Date()
                .toISOString(),

            is_active: true,

            type: "Emergency",

            sender: user.email,

          }]);

        console.log(
          "SOS created"
        );
      }

      // CLEAR OLD INTERVAL

      if (
        trackingInterval.current
      ) {

        clearInterval(
          trackingInterval.current
        );
      }

      // LIVE LOCATION TRACKING

      trackingInterval.current =
        setInterval(
          async () => {

            try {

              const coords =
                await getUserLocation();

              if (!coords) return;

              await supabase

                .from("sos_alerts")

                .update({

                  latitude:
                    coords.latitude,

                  longitude:
                    coords.longitude,

                  updated_at:
                    new Date()
                      .toISOString(),

                })

                .eq(
                  "user_id",
                  user.id
                )

                .eq(
                  "is_active",
                  true
                );

              console.log(
                "Live SOS updated"
              );

            } catch (err) {

              console.log(
                "Tracking error:",
                err
              );
            }

          },

          5000
        );

      // GET USERS

      const {
        data: users,
      }

        = await supabase

          .from("users")

          .select("*")

          .neq("id", user.id);

      // FILTER NEARBY USERS

      const nearbyUsers =
        users.filter((u) => {

          if (
            !u.latitude ||
            !u.longitude
          ) return false;

          const distance =
            getDistance(

              Number(
                location.latitude
              ),

              Number(
                location.longitude
              ),

              Number(
                u.latitude
              ),

              Number(
                u.longitude
              )
            );

          return distance <= 5;
        });

      // SEND PUSH

      await sendPush(
        nearbyUsers
      );

      Alert.alert(

        "SOS Sent",
        `${nearbyUsers.length} nearby users notified`
      );
      // SEND SMS

      await sendEmergencySMS();
    };

  return (

    <TouchableOpacity

      style={styles.button}

      onPress={handleSOS}
    >

      <Text style={styles.text}>
        SOS
      </Text>

    </TouchableOpacity>
  );
}

const styles =
  StyleSheet.create({

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