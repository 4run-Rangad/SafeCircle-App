import React, {
  useState,
  useEffect,
} from "react";

import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";

import { SafeAreaView }
from "react-native-safe-area-context";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { getContacts }
from "../utils/contacts";

export default function ContactsPage() {

  const [contacts, setContacts] =
    useState([]);

  const [selectedNumbers,
    setSelectedNumbers] =
    useState([]);

  // LOAD SAVED CONTACTS

  useEffect(() => {

    loadSavedContacts();

  }, []);

  const loadSavedContacts =
    async () => {

      try {

        const saved =
          await AsyncStorage.getItem(
            "emergency_contacts"
          );

        if (saved) {

          const parsed =
            JSON.parse(saved);

          setSelectedNumbers(
            parsed.map(
              (c) => c.phone
            )
          );
        }

      } catch (err) {

        console.log(err);
      }
    };

  // LOAD DEVICE CONTACTS

  const loadContacts =
    async () => {

      const data =
        await getContacts();

      setContacts(data);
    };

  // SELECT CONTACT

  const selectContact =
    async (contact) => {

      const rawNumber =
        contact.phoneNumbers?.[0]?.number;

      if (!rawNumber)
        return;

      // CLEAN NUMBER

      const cleanNumber =
        rawNumber.replace(
          /[^0-9+]/g,
          ""
        );

      let updated = [];

      if (
        selectedNumbers.includes(
          cleanNumber
        )
      ) {

        updated =
          selectedNumbers.filter(
            (n) =>
              n !== cleanNumber
          );

      } else {

        updated = [
          ...selectedNumbers,
          cleanNumber,
        ];
      }

      setSelectedNumbers(updated);

      // SAVE TO STORAGE

      try {

        const formattedContacts =
          updated.map((num) => ({
            phone:num,
          }));

        await AsyncStorage.setItem(
          "emergency_contacts",
          JSON.stringify(
            formattedContacts
          )
        );

      } catch (err) {

        console.log(err);

        Alert.alert(
          "Error saving contacts"
        );
      }
    };

  return (

    <SafeAreaView
      style={styles.container}
    >

      <Text style={styles.title}>
        Emergency Contacts
      </Text>

      <TouchableOpacity
        style={styles.loadBtn}
        onPress={loadContacts}
      >

        <Text style={styles.btnText}>
          Load Contacts
        </Text>

      </TouchableOpacity>

      <FlatList
        data={contacts}

        keyExtractor={(item) =>
          item.id.toString()
        }

        renderItem={({ item }) => {

          const number =
            item.phoneNumbers?.[0]?.number;

          if (!number)
            return null;

          const cleanNumber =
            number.replace(
              /[^0-9+]/g,
              ""
            );

          const selected =
            selectedNumbers.includes(
              cleanNumber
            );

          return (

            <TouchableOpacity
              style={[

                styles.card,

                selected &&
                styles.selectedCard,

              ]}

              onPress={() =>
                selectContact(item)
              }
            >

              <Text style={styles.name}>
                {item.name}
              </Text>

              <Text style={styles.number}>
                {number}
              </Text>

              {selected && (

                <Text style={styles.tick}>
                  ✓ Selected
                </Text>

              )}

            </TouchableOpacity>
          );
        }}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#000",
    padding:16,
  },

  title:{
    color:"white",
    fontSize:28,
    fontWeight:"bold",
    marginBottom:20,
  },

  loadBtn:{
    backgroundColor:"#ff2e2e",
    padding:15,
    borderRadius:14,
    alignItems:"center",
    marginBottom:18,
  },

  btnText:{
    color:"white",
    fontWeight:"bold",
  },

  card:{
    backgroundColor:"#161616",
    padding:16,
    borderRadius:14,
    marginBottom:10,
  },

  selectedCard:{
    borderWidth:1,
    borderColor:"#00e676",
  },

  name:{
    color:"white",
    fontSize:16,
    fontWeight:"bold",
  },

  number:{
    color:"#aaa",
    marginTop:6,
  },

  tick:{
    color:"#00e676",
    marginTop:8,
    fontWeight:"bold",
  },

});