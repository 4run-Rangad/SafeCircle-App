import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { supabase } from "../services/supabase";

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    
    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const { data: { user }} = await supabase.auth.getUser();
        
        setUser(user);
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email}</Text>
        </View>

        <TouchableOpacity
        style={styles.logoutBtn}
        onPress={logout}>
            <Text style={styles.btnText}>logout</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
    justifyContent: "center",
  },

  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
  },

  card: {
    backgroundColor: "#161616",
    padding: 18,
    borderRadius: 16,
    marginBottom: 25,
  },

  label: {
    color: "#888",
    marginBottom: 8,
  },

  value: {
    color: "white",
    fontSize: 16,
  },

  logoutBtn: {
    backgroundColor: "#ff2e2e",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});