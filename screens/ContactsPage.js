import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getContacts } from "../utils/contacts";

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [selectedNumbers, setSelectedNumbers] =
    useState([]);

  const loadContacts = async () => {
    const data = await getContacts();
    setContacts(data);
  };

  const selectContact = (number) => {
    setSelectedNumbers((prev) =>
      prev.includes(number)
        ? prev.filter((n) => n !== number)
        : [...prev, number]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const number =
            item.phoneNumbers?.[0]?.number;

          if (!number) return null;

          const selected =
            selectedNumbers.includes(number);

          return (
            <TouchableOpacity
              style={[
                styles.card,
                selected && styles.selectedCard,
              ]}
              onPress={() =>
                selectContact(number)
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
                   Selected
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
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
  },

  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    
  },

  loadBtn: {
    backgroundColor: "#ff2e2e",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 18,
  },

  btnText: {
    color: "white",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#161616",
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
  },

  selectedCard: {
    borderWidth: 1,
    borderColor: "#00e676",
  },

  name: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  number: {
    color: "#aaa",
    marginTop: 6,
  },

  tick: {
    color: "#00e676",
    marginTop: 8,
    fontWeight: "bold",
  },
});
