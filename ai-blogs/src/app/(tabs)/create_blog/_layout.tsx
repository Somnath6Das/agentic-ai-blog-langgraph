import { View, Text } from "react-native";
import React from "react";
import {
  Drawer,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from "expo-router/drawer";
import { useMenuStore } from "@/store/blog_store";
import { router, usePathname } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const CustomDrawerComponent = (props: DrawerContentComponentProps) => {
  const triggerCreateBlogReset = useMenuStore((s) => s.triggerCreateBlogReset);
  const menuItems = useMenuStore((s) => s.menuItems);
  const reversedItems = [...menuItems].reverse();
  const pathName = usePathname();

  const navigateFromDrawer = (
    path: string,
    params?: Record<string, string>,
  ) => {
    triggerCreateBlogReset();
    if (params) {
      router.push({ pathname: path as any, params });
    } else {
      router.push(path as any);
    }
  };
  return (
    <DrawerContentScrollView {...props}>
      <View
        style={{
          alignItems: "flex-start",
          paddingVertical: 20,
          marginLeft: 15,
        }}
      >
        <Text style={{ fontSize: 26 }}>Blog Writing Agent</Text>
      </View>

      <DrawerItem
        label="Create Blog"
        icon={({ color, size }) => (
          <AntDesign name="plus-circle" size={size} color={color} />
        )}
        focused={pathName === "/create_blog"}
        activeTintColor="blue"
        inactiveTintColor="black"
        labelStyle={{ fontSize: 15, fontWeight: "600" }}
        style={{
          marginHorizontal: 12,
          alignSelf: "flex-start",
          width: 200,
          borderRadius: 24,
          paddingHorizontal: 4,
        }}
        onPress={() => navigateFromDrawer("/create_blog")}
      />

      <View style={{ padding: 16, paddingTop: 25 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Your Previous Blogs
        </Text>
      </View>

      {reversedItems.map((item) => {
        const isActive = pathName === `/create_blog/${item.id}`;
        return (
          <DrawerItem
            key={item.id}
            focused={isActive}
            activeTintColor="blue"
            inactiveTintColor="black"
            label={item.title}
            labelStyle={{ fontSize: 18 }}
            onPress={() =>
              navigateFromDrawer("/create_blog/[id]", {
                id: String(item.id),
              })
            }
          />
        );
      })}
    </DrawerContentScrollView>
  );
};

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={CustomDrawerComponent}
        screenOptions={{
          drawerActiveTintColor: "blue",
          drawerHideStatusBarOnOpen: true,
          headerShadowVisible: false,
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: "Create Blog",
            title: "Create Blog",
            drawerItemStyle: {
              marginHorizontal: 12,
              alignSelf: "flex-start",
              width: 200,
              borderRadius: 24,
              paddingHorizontal: 4,
            },
            drawerLabelStyle: {
              fontSize: 15,
              alignSelf: "center",
              fontWeight: "600",
              marginLeft: -8,
            },
            drawerIcon: ({ color, size }) => (
              <AntDesign name="plus-circle" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="[id]"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
