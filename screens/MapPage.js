import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapScreen from "./MapScreen";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserLocation } from "../utils/location";
import { supabase } from "../services/supabase";

export default function MapPage() {
  const [location, setLocation] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadLocation();
    loadAlerts();
    listenForAlerts();
  }, []);

  const loadLocation = async () => {
    const coords = await getUserLocation();
    setLocation(coords);
  };

  const loadAlerts = async () => {
    const { data, error } = await supabase
      .from("sos_alerts")
      .select("*")
      .order("created_at", {
        ascending: false,
      });
      
    if(!error) setAlerts(data);
  };


  const listenForAlerts = () => {
    supabase
      .channel("live_map")
      .on(
        "postgres_changes",{
          event: "INSERT",
          schema: "public",
          table: "sos_alerts",
        },
        (payload) => {
          setAlerts((prev) => [
            payload.new,
            ...prev,
          ]);
        }
      )
      .subscribe();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        Live SOS Map
      </Text>

      <Text style={styles.subtitle}>
        Active Alerts: {alerts.length}
      </Text>

      <View style={styles.mapBox}>
        <MapScreen 
          currentLocation={location}
          alerts={alerts}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 14,
  },

  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },

  subtitle: {
    color: "#888",
    marginBottom: 14,
  },

  mapBox: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 18,
  },
});