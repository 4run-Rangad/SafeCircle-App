import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./screens/HomeScreen";
import MapPage from "./screens/MapPage";
import ContactsPage from "./screens/ContactsPage";
import ProfilePage from "./screens/ProfilePage";

const Tab = createBottomTabNavigator();

export default function MainTabs(){
    return(
        <Tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarStyle: {
                backgroundColor: "#111",
                borderTopColor: "#222",
                height: 60,
            },
            tabBarActiveTintColor: "#ff2e2e",
            tabBarInactiveTintColor: "#888",
        }}>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Map" component={MapPage} />
            <Tab.Screen name="Contacts" component={ContactsPage} />
            <Tab.Screen name="Profile" component={ProfilePage} />
        </Tab.Navigator>
    );
}