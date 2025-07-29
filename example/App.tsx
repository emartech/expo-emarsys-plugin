import React, { useEffect } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export default function App() {
  useEffect(() => {
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
      </ScrollView>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
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
