import { View, Text, ActivityIndicator } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { router, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import api from "@/utils/api";
import useAuthStore from "@/store/auth_store";
import { useMenuStore } from "@/store/blog_store";

export default function RootLayout() {
  const hasHydrated = useMenuStore.persist.hasHydrated();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const isMounted = useRef(false);

  const checkAuth = async () => {
    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const { data } = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsAuthenticated(true);
      useAuthStore.getState().setAuth({
        id: data.id,
        name: data.name || "",
        email: data.email,
        avatar_url: data.avatar_url || "",
        created_at: data.created_at,
      });
    } catch (error: any) {
      // Token is invalid/expired — clear it
      await SecureStore.deleteItemAsync("token");
      useAuthStore.getState().clearAuth();
      setIsAuthenticated(false);
    }
  };
  if (!hasHydrated) {
    return <ActivityIndicator />;
  }
  useEffect(() => {
    const unsub = useMenuStore.persist.onFinishHydration(() => {
      console.log("menu store rehydrated");
    });
    return unsub;
  }, []);
  useEffect(() => {
    isMounted.current = true;
    const run = async () => {
      await checkAuth(); // wait for it to finish
      // navigation is now handled by the state change re-triggering this effect
    };
    run();
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated === true) {
      router.replace("/(tabs)");
    } else if (isAuthenticated === false) {
      router.replace("/(auth)");
    }
  }, [isAuthenticated]);
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
        contentStyle: { backgroundColor: "#fff" },
        gestureEnabled: true,
        gestureDirection: "horizontal",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      {/* <Stack.Screen
        name="post/[id]"
        options={{
          animation: "slide_from_right",
          animationDuration: 350,
        }}
      /> */}
    </Stack>
  );
}
