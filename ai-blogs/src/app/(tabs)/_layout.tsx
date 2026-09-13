import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Tabs } from "expo-router";
import { FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
const Layout = () => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#ffffff",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            headerTitle: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={30}
                color={focused ? "#ff5a00" : "#ff5a00"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="create_blog"
          options={{
            headerTitle: "Create Blog",
            tabBarIcon: ({ color, focused }) => (
              <FontAwesome
                name={focused ? "plus-square" : "plus-square-o"}
                size={30}
                color={focused ? "#ff5a00" : "#ff5a00"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            headerTitle: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <FontAwesome5
                name={focused ? "user-alt" : "user"}
                size={25}
                color={focused ? "#ff5a00" : "#ff5a00"}
              />
            ),
          }}
        />
      </Tabs>
      <StatusBar style={"dark"} />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default Layout;
