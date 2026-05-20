import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./screens/HomeScreen";
import MapPage from "./screens/MapPage";
import ContactsPage from "./screens/ContactsPage";
import ProfilePage from "./screens/ProfilePage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function MainTabs(){
    return(
        <Tab.Navigator
        screenOptions={({ route, }) => ({
            headerShown: false,
            tabBarStyle: {
                backgroundColor: "#111",
                borderTopColor: "#222",
                height: 65,
            },
            tabBarActiveTintColor: "#ff2e2e",
            tabBarInactiveTintColor: "#888",

            tabBarLabelStyle: {
                fontSize: 12,
                marginBottom: 5,
            },
            tabBarIcon: ({
                color,
                size,
            }) => {
                let iconName;
                if (route.name === "Home") {
                    iconName = "home";
                    return (
                        <Ionicons
                            name={iconName}
                            size={24}
                            color={color}
                        />
                    );
                }

                if (route.name === "Map") {
                    iconName = "map";
                    return (
                        <Ionicons
                            name={iconName}
                            size={24}
                            color={color}
                        />
                    );
                }

                if (route.name === "Contacts") {
                    iconName = "people";
                    return (
                        <Ionicons
                            name={iconName}
                            size={24}
                            color={color}
                        />
                    );
                }

                if (route.name === "Profile") {
                    iconName = "person";
                    return (
                        <Ionicons
                            name={iconName}
                            size={24}
                            color={color}
                        />
                    );
                }

            },
        })}>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Map" component={MapPage} />
            <Tab.Screen name="Contacts" component={ContactsPage} />
            <Tab.Screen name="Profile" component={ProfilePage} />
        </Tab.Navigator>
    );
}