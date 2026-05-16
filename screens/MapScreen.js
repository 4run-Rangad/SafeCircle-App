import React, {
  useContext,
} from "react";

import {
  View,
  StyleSheet,
  Text,
} from "react-native";

import { MapView, Camera, PointAnnotation } from "@maplibre/maplibre-react-native";

import { AlertsContext } from "../context/AlertsContext";

export default function MapScreen({
  currentLocation,
}) {

  const {
    alerts,
  } = useContext(AlertsContext);

  if (!currentLocation) {

    return (
      <View style={styles.center}>

        <Text style={styles.text}>
          Get Location First
        </Text>

      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        mapStyle="https://demotiles.maplibre.org/style.json"
        >
          <Camera
            zoomLevel={14}
            centerCoordinate={[
              currentLocation.longitude,
              currentLocation.latitude,
            ]}
          />

          <PointAnnotation
            id="user-location"
            coordinate={[
              currentLocation.longitude,
              currentLocation.latitude,
            ]}
          />

          {alerts.map((alert) => (
            <PointAnnotation
              key={index}
              id={`alert-${index}`}
              coordinate={[
                Number(item.longitude),
                Number(item.latitude),
              ]}
            />
          ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  map: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },

  text: {
    color: "white",
    fontSize: 18,
  },
});