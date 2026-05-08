import React,{ useState } from "react";
import { supabase } from "../services/supabase";
import { View,Text,TextInput,TouchableOpacity,StyleSheet,Alert } from "react-native";

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if(error) {
            Alert.alert("Login Failed", error.message);
            return;
        }

        //navigation.replace("Home");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                SafeCircle Login
            </Text>

            <TextInput placeholder="Email" placeholderTextColor="#999" style={styles.input} onChangeText={setEmail}/>
            <TextInput placeholder="Password" placeholderTextColor="#999" secureTextEntry style={styles.input} onChangeText={setPassword}/>

            <TouchableOpacity style={styles.btn} onPress={handleLogin}>
                <Text style={styles.btnText}>Login</Text>
            </TouchableOpacity>

            <Text style={styles.link} onPress={() => navigation.navigate("Register")}>Create Account</Text>
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
    link: {
        color: "#4da6ff",
        textAlign: "center",
        marginTop: 20,
    },
});