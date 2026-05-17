import React, {
  useContext,
} from "react";

import {
  View,
  StyleSheet,
  Text,
} from "react-native";

import { WebView }
from "react-native-webview";

import {
  AlertsContext,
} from "../context/AlertsContext";

export default function MapScreen() {

  const {
    alerts,
    location,
  } = useContext(AlertsContext);

  if (!location) {

    return (
      <View style={styles.center}>

        <Text style={styles.text}>
          Get Location First
        </Text>

      </View>
    );
  }

  //SOS markers

  const markersJS =
    alerts.map((item, index) => {

      return `

        const sosIcon${index} =
          L.divIcon({

            html: \`
              <div
                style="
                  width:20px;
                  height:20px;
                  background:red;
                  border-radius:50%;
                  border:3px solid white;
                  box-shadow:0 0 15px red;
                  animation:pulse 1s infinite;
                "
              ></div>
            \`,

            className: "",
            iconSize: [18,18]

          });

        const victimMarker${index} =
          L.marker(
            [
              ${Number(item.latitude)},
              ${Number(item.longitude)}
            ],
            {
              icon: sosIcon${index}
            }
          )

          .addTo(map)

          .bindPopup(\`

            <div
              style="
                min-width:180px;
                color:black;
                font-family:sans-serif;
              "
            >

              <h3>🚨 SOS ALERT</h3>

              <p>
                <b>User:</b>
                ${item.sender || "Unknown"}
              </p>

              <p>
                <b>Distance:</b>
                ${item.distance || "Nearby"} km
              </p>

              <p>
                <b>Type:</b>
                ${item.type || "Emergency"}
              </p>

            </div>

          \`);

        victimMarker${index}.on(
          "click",
          function () {

            activeVictimLat =
              ${Number(item.latitude)};

            activeVictimLng =
              ${Number(item.longitude)};

            startLiveRoute();

          }
        );

      `;

    }).join("");

  const html = `

    <!DOCTYPE html>

    <html>

    <head>

      <meta
        name="viewport"
        content="
          width=device-width,
          initial-scale=1.0
        "
      />

      <link
        rel="stylesheet"
        href="
https://unpkg.com/leaflet/dist/leaflet.css
"
      />

      <link
        rel="stylesheet"
        href="
https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.css
"
      />

      <style>

        html,
        body,
        #map {

          height:100%;
          margin:0;
          padding:0;
          background:black;
        }

        @keyframes pulse {

          0% {
            transform:scale(1);
          }

          50% {
            transform:scale(1.5);
          }

          100% {
            transform:scale(1);
          }
        }

      </style>

    </head>

    <body>

      <div id="map"></div>

      <script src="
https://unpkg.com/leaflet/dist/leaflet.js
"></script>

      <script src="
https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js
"></script>

      <script>

        const map =
          L.map("map").setView(
            [
              ${location.latitude},
              ${location.longitude}
            ],
            14
          );

        L.tileLayer(

          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",

          {
            attribution:
              "&copy; OpenStreetMap"
          }

        ).addTo(map);

        // USER ICON

        const userIcon =
          L.divIcon({

            html: \`
              <div
                style="
                  width:20px;
                  height:20px;
                  background:#00bfff;
                  border-radius:50%;
                  border:3px solid white;
                  box-shadow:0 0 15px #00bfff;
                "
              ></div>
            \`,

            className: "",
            iconSize:[20,20]

          });

        const userMarker =
          L.marker(
            [
              ${location.latitude},
              ${location.longitude}
            ],
            {
              icon:userIcon
            }
          )

          .addTo(map)

          .bindPopup(
            "📍 You are here"
          );

        // SAFE RADIUS

        L.circle(
          [
            ${location.latitude},
            ${location.longitude}
          ],
          {
            color:"#00bfff",
            fillColor:"#00bfff",
            fillOpacity:0.1,
            radius:5000
          }
        ).addTo(map);

        // ROUTING

        let routingControl = null;

        let routeInterval = null;

        let activeVictimLat = null;
        let activeVictimLng = null;

        function drawRoute() {

          if (
            activeVictimLat === null ||
            activeVictimLng === null
          ) return;

          if (routingControl) {
            map.removeControl(
              routingControl
            );
          }

          routingControl =
            L.Routing.control({

              waypoints: [

                L.latLng(
                  ${location.latitude},
                  ${location.longitude}
                ),

                L.latLng(
                  activeVictimLat,
                  activeVictimLng
                ),
              ],

              routeWhileDragging:false,
              addWaypoints:false,
              draggableWaypoints:false,
              show:false,

              lineOptions:{
                styles:[
                  {
                    color:"red",
                    weight:5,
                  },
                ],
              },

            }).addTo(map);
        }

        function startLiveRoute() {

          drawRoute();

          if (routeInterval) {
            clearInterval(
              routeInterval
            );
          }

          routeInterval =
            setInterval(() => {

              drawRoute();

            }, 5000);
        }

        // SOS MARKERS

        ${markersJS}

      </script>

    </body>

    </html>
  `;

  return (

    <View style={styles.container}>

      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.map}
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex:1,
    backgroundColor:"black",
  },

  map: {
    flex:1,
  },

  center: {
    flex:1,
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"black",
  },

  text: {
    color:"white",
    fontSize:18,
  },

});