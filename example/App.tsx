import React, { useEffect } from 'react';
import { SafeAreaView, ScrollView, Text, Button } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import Emarsys from 'react-native-emarsys-wrapper';

export default function App() {
  useEffect(() => {
    Emarsys.setEventHandler(function (eventName, payload) {
      console.log(`Event: ${eventName}`, payload);
      Alert.alert(
        `Emarsys Event: ${eventName}`,
        JSON.stringify(payload, null, 2),
        [{ text: 'OK' }]
      );
    });

    if (Platform.OS === 'android') {
      console.log('Setting up Android notification channel');
      Notifications.setNotificationChannelAsync('ems_sample_messages', {
        name: 'Messages',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Expo Emarsys Plugin</Text>
        <Button title="Set Contact" onPress={() => {
          console.log('Set Contact pressed')
          const contactFieldId = 100009769
          const contactFieldValue = "B8mau1nMO8PilvTp6P" // demoapp@emarsys.com
          Emarsys.setContact(contactFieldId, contactFieldValue)
        }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  header: {
    fontSize: 30,
    margin: 20,
  },
  groupHeader: {
    fontSize: 20,
    marginBottom: 20,
  },
  group: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#eee',
  },
  view: {
    flex: 1,
    height: 200,
  },
};
