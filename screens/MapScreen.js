import React, {
  useContext,
  useMemo,
  useRef,
  useEffect,
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

  const webViewRef =
    useRef(null);

  if (!location) {

    return (

      <View style={styles.center}>

        <Text style={styles.text}>
          Get Location First
        </Text>

      </View>
    );
  }

  // SEND ALERTS TO WEBVIEW

  useEffect(() => {

    if (
      !webViewRef.current
    ) return;

    const alertsData =
      JSON.stringify(alerts);

    webViewRef.current
      .injectJavaScript(`

        updateSOSMarkers(
          ${alertsData}
        );

        true;
      `);

  }, [alerts]);

  // SEND LIVE USER LOCATION

  useEffect(() => {

    if (
      !webViewRef.current ||
      !location
    ) return;

    webViewRef.current
      .injectJavaScript(`

        updateUserLocation(
          ${location.latitude},
          ${location.longitude}
        );

        true;
      `);

  }, [location]);

  // HTML

  const html = useMemo(() => `

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

        // MAP

        const map =

          L.map("map")
          .setView(

            [
              ${location.latitude},
              ${location.longitude}
            ],

            14
          );

        // TILE

        L.tileLayer(

          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",

          {
            attribution:
              "&copy; OpenStreetMap"
          }

        ).addTo(map);

        // STORAGE

        window.sosMarkers = {};

        let routingControl = null;

        let activeVictimId = null;

        let activeVictimLat = null;
        let activeVictimLng = null;

        let currentUserLat =
          ${location.latitude};

        let currentUserLng =
          ${location.longitude};

        // USER ICON

        const userIcon =

          L.divIcon({

            html:\`
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

            className:"",
            iconSize:[20,20],
          });

        // USER MARKER

        const userMarker =

          L.marker(

            [
              currentUserLat,
              currentUserLng
            ],

            {
              icon:userIcon
            }
          )

          .addTo(map)

          .bindPopup(
            "📍 You are here"
          );

          //SAFE RADIUS
           // SAFE RADIUS

        L.circle(
          [
            currentUserLat,
            currentUserLng
          ],
          {
            color:"#00bfff",
            fillColor:"#00bfff",
            fillOpacity:0.1,
            radius:5000
          }
        ).addTo(map);

        // USER LOCATION UPDATE

        function updateUserLocation(
          lat,
          lng
        ) {

          currentUserLat = lat;
          currentUserLng = lng;

          userMarker.setLatLng([
            lat,
            lng
          ]);

          // UPDATE ROUTE

          if (
            activeVictimId
          ) {

            drawRoute();
          }
        }

        // ROUTE

        function drawRoute() {

          if (
            activeVictimLat === null ||
            activeVictimLng === null
          ) return;

          // REMOVE OLD

          if (routingControl) {

            try {

              map.removeControl(
                routingControl
              );

            } catch(e){}
          }

          // NEW ROUTE

          routingControl =

            L.Routing.control({

              waypoints:[

                L.latLng(
                  currentUserLat,
                  currentUserLng
                ),

                L.latLng(
                  activeVictimLat,
                  activeVictimLng
                ),
              ],

              routeWhileDragging:false,

              addWaypoints:false,

              draggableWaypoints:false,

              fitSelectedRoutes:true,

              show:false,

              createMarker:
                () => null,

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

        // ALERT MARKERS

        function updateSOSMarkers(
          alerts
        ) {

          const activeIds = [];

          alerts.forEach((item) => {

            const markerId =
              item.user_id;

            activeIds.push(
              markerId
            );

            const lat =
              Number(item.latitude);

            const lng =
              Number(item.longitude);

            // EXISTING MARKER

            if (
              window.sosMarkers[
                markerId
              ]
            ) {

              window.sosMarkers[
                markerId
              ].setLatLng([
                lat,
                lng
              ]);

              // LIVE ROUTE UPDATE

              if (
                activeVictimId ===
                markerId
              ) {

                activeVictimLat =
                  lat;

                activeVictimLng =
                  lng;

                drawRoute();
              }

            } else {

              // SOS ICON

              const sosIcon =

                L.divIcon({

                  html:\`
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

                  className:"",
                  iconSize:[20,20],
                });

              // CREATE MARKER

              const marker =

                L.marker(
                  [lat, lng],
                  {
                    icon:sosIcon
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

                    <h3>
                      🚨 SOS ALERT
                    </h3>

                    <p>
                      <b>User:</b>
                      ${"${item.sender || 'Unknown'}"}
                    </p>

                    <p>
                      <b>Distance:</b>
                      ${"${item.distance || 'Nearby'}"} km
                    </p>

                  </div>

                \`);

              // CLICK ROUTE

              marker.on(
                "click",
                function () {

                  activeVictimId =
                    markerId;

                  activeVictimLat =
                    lat;

                  activeVictimLng =
                    lng;

                  drawRoute();
                }
              );

              // SAVE

              window.sosMarkers[
                markerId
              ] = marker;

              // AUTO FOCUS

              map.flyTo(
                [lat, lng],
                16,
                {
                  animate:true,
                  duration:2,
                }
              );
            }
          });

          // REMOVE OLD MARKERS

          Object.keys(
            window.sosMarkers
          ).forEach((id) => {

            if (
              !activeIds.includes(id)
            ) {

              map.removeLayer(
                window.sosMarkers[id]
              );

              delete window.sosMarkers[id];
            }
          });
        }

      </script>

    </body>

    </html>

  `, []);

  return (

    <View style={styles.container}>

      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.map}
      />

    </View>
  );
}

const styles =
  StyleSheet.create({

    container:{
      flex:1,
      backgroundColor:"black",
    },

    map:{
      flex:1,
    },

    center:{
      flex:1,
      justifyContent:"center",
      alignItems:"center",
      backgroundColor:"black",
    },

    text:{
      color:"white",
      fontSize:18,
    },

});