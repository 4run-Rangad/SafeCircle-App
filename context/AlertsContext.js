import React, {
  createContext,
  useEffect,
  useState,
} from "react";

import * as Location from "expo-location";

import { Alert } from "react-native";

import { supabase } from "../services/supabase";

import { getDistance } from "../utils/distance";

export const AlertsContext =
  createContext();

export const AlertsProvider = ({
  children,
}) => {

  const [alerts, setAlerts] =
    useState([]);

  const [location, setLocation] =
    useState(null);

  const [currentUser,
    setCurrentUser] =
    useState(null);

  //Live Location Tracking
  useEffect(() => {

    let subscription;

    const startTracking =
      async () => {

        const { status } =

          await Location
            .requestForegroundPermissionsAsync();

        if (
          status !== "granted"
        ) {
          return;
        }

        subscription =

          await Location
            .watchPositionAsync(

              {
                accuracy:
                  Location
                    .Accuracy.High,

                timeInterval: 3000,

                distanceInterval: 5,
              },

              (loc) => {

                const coords =
                  loc.coords;

                setLocation({

                  latitude:
                    coords.latitude,

                  longitude:
                    coords.longitude,
                });
              }
            );
      };

    startTracking();

    return () => {

      if (subscription) {
        subscription.remove();
      }
    };

  }, []);

  // Realtime listener

  useEffect(() => {

    if (
      !location ||
      !currentUser
    ) return;

    const channel =
      supabase

        .channel("nearby_sos")

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "sos_alerts",
          },

          (payload) => {

            const alertData =
              payload?.new;

            if (!alertData)
              return;

            //Only active alerts
            if (!alertData) return;

            // Ignore own SOS

            if (
              alertData.user_id ===
              currentUser.id
            ) {
              return;
            }

            if (!alertData.is_active) {

              setAlerts((prev) =>

                prev.filter(

                  (item) =>

                    item.user_id !==
                    alertData.user_id
                )
              );

              return;
            }

            // Distance filter

            const distance =
              getDistance(
                location.latitude,
                location.longitude,

                alertData.latitude,
                alertData.longitude
              );

            console.log(
              "SOS Distance:",
              distance
            );

            // Only nearby alerts

            if (distance <= 5) {

              setAlerts((prev) => {

                const exists =
                  prev.find(
                    (item) =>
                      item.user_id ===
                      alertData.user_id
                  );



                if (exists) {
                  return prev.map((item) => {
                    if (item.user_id ===
                      alertData.user_id) {
                      return {
                        ...item,
                        ...alertData,
                        distance:
                          distance.toFixed(2),
                        receivedAt: Date.now(),
                      };
                    }
                    return item;
                  });
                }

                Alert.alert(
                  "New Nearby SOS Alert",
                  `${distance.toFixed(2)} km away`
                );

                return [
                  {
                    ...alertData,

                    distance:
                      distance.toFixed(2),

                    receivedAt: Date.now(),
                  },

                  ...prev,
                ];
              });


            }
          }
        )

        .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };

  }, [location, currentUser]);

  // Remove expired alerts

  useEffect(() => {

    const interval =
      setInterval(() => {

        setAlerts((prev) =>
          prev.filter((alert) => {

            if (
              !alert.receivedAt
            ) return true;

            const age =
              Date.now() - alert.receivedAt;

            return (
              age <
              10 * 60 * 1000
            );
          })
        );

      }, 30000);

    return () =>
      clearInterval(interval);

  }, []);

  return (

    <AlertsContext.Provider
      value={{

        alerts,
        setAlerts,

        location,
        setLocation,

        currentUser,
        setCurrentUser,

      }}
    >
      {children}
    </AlertsContext.Provider>

  );
};