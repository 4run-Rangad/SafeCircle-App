import * as Contacts from "expo-contacts";

export const getContacts = async () => {
    const { status } = await
    Contacts.requestPermissionsAsync();

    if(status !== "granted") {
        return [];
    }

    const { data } = await
    Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
    });

    return data;

};