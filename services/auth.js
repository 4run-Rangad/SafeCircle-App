import { supabase } from "./supabase";

export const loginUser = async () => {
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email: "user2@test.com",
        password: "12345678",
    });

    if (error) {
        console.log("Login error:", error);
    } else console.log("User logged in:", data.user);
    
    return data.user;
};