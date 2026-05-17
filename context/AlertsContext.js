import React, {
  createContext,
  useEffect,
  useState,
} from "react";

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
          event: "INSERT",
          schema: "public",
          table: "sos_alerts",
        },

        (payload) => {

          const alertData =
            payload?.new;

          if (!alertData)
            return;

          // Ignore own SOS

          if (
            alertData.user_id ===
            currentUser.id
          ) {
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
                    item.id ===
                    alertData.id
                );

              if (exists) {
                return prev;
              }

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

            Alert.alert(
              "Nearby SOS Alert",
              `${distance.toFixed(2)} km away`
            );
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