import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

export default function MapScreen({ currentLocation, alerts }) {
  if (!currentLocation) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Get Location First</Text>
      </View>
    );
  }

  const markers = alerts
    .map(
      (item) => `
      L.marker([${item.latitude}, ${item.longitude}])
        .addTo(map)
        .bindPopup("SOS Alert - ${item.distance} km away");
    `
    )
    .join("");

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet"
      href="https://unpkg.com/leaflet/dist/leaflet.css"/>
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <style>
      html, body, #map {
        margin:0;
        padding:0;
        height:100%;
        width:100%;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>

    <script>
      var map = L.map('map').setView(
        [${currentLocation.latitude}, ${currentLocation.longitude}],
        14
      );

      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19 }
      ).addTo(map);

      L.marker([${currentLocation.latitude}, ${currentLocation.longitude}])
        .addTo(map)
        .bindPopup("You are here");

      ${markers}
    </script>
  </body>
  </html>
  `;

  return <WebView source={{ html }} style={{ flex: 1 }} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
  },
});
