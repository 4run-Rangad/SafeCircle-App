import * as Location from "expo-location";

export const getUserLocation = async() => {

    try{
        //ask for permission
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted"){
            console.log("Permission denied");
            return null;
        }

        //Get current position
        const location = await 
        Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });

        return location.coords;
    } catch(error){
        console.log("Location error: ",error);
        return null;
    }
};