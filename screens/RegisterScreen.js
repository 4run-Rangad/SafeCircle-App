import { supabase } from "../services/supabase";

import { View, Text,TextInput, Alert, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'


export default function RegisterScreen({ navigation }) {
    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const handleRegister = async () => {
        supabase.auth.signUp({
            email,
            password,
        });

        Alert.alert("Success","Account Created");
        navigation.goBack();
    };

    return(
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>

            <TextInput placeholder="Email" placeholderTextColor="#999" style={styles.input} onChangeText={setEmail}/>
            <TextInput placeholder="Password" placeholderTextColor="#999" secureTextEntry style={styles.input} onChangeText={setPassword}/>

            <TouchableOpacity style={styles.btn} onPress={handleRegister}>
                <Text style={styles.btnText}>Register</Text>
            </TouchableOpacity>
        </View>
    );
 
  
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        padding: 20,
    },
    title: {
        coloe: "white",
        fontSize: 28,
        marginBottom: 30,
        textAlign: "center",
    },
    input: {
        backgroundColor: "#1c1c1c",
        color: "white",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
    btn: {
        backgroundColor: "red",
        padding: 15,
        borderRadius: 10,
    },
    btnText: {
        color: "white",
        textAlign: "center",
        fontWeight: "bold",
    },
});