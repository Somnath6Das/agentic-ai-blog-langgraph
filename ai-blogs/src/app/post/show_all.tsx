import {
  View,
  Text,
  Platform,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Blog, getPublicBlogs } from "@/utils/get_public_blogs";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { FONTS } from "@/constants/theme";
import BlogCard from "@/components/home/BlogCard";

const AnimatedFlatList = Animated.createAnimatedComponent(
  Animated.FlatList<Blog>,
);

const STATUS_HEIGHT =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0;

export default function ShowAll() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // Nav bar is transparent at the top, fades to solid white as the user
  // scrolls down (fully white by 60px of scroll).
  const navAnimatedStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.value,
      [0, 60],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      backgroundColor: interpolateColor(
        progress,
        [0, 1],
        ["rgba(255,255,255,0)", "#fff"],
      ),
      borderBottomColor: interpolateColor(
        progress,
        [0, 1],
        ["rgba(0,0,0,0)", "#F5F5F5"],
      ),
    };
  });
  const fetchBlogs = async () => {
    try {
      const data = await getPublicBlogs();
      setBlogs(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <View style={styles.root}>
      {/* Top bar - transparent at top, fades to white while scrolling down */}
      <Animated.View
        style={[
          styles.floatingNav,
          navAnimatedStyle,
          { paddingTop: insets.top + STATUS_HEIGHT + 8 },
        ]}
      >
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={"#1A1A1A"} />
        </TouchableOpacity>
        <Text numberOfLines={1} style={styles.navTitle}>
          All Blogs
        </Text>
        <View style={{ width: 38 }} />
      </Animated.View>

      <AnimatedFlatList
        data={blogs}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <BlogCard post={item} />}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          gap: 16,
          padding: 16,
          paddingTop: insets.top + STATUS_HEIGHT + 66,
          paddingBottom: insets.bottom + 32,
        }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  // Top bar container - background/border color are animated (see navAnimatedStyle)
  floatingNav: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    ...FONTS.displayMD,
    fontSize: 15,
    color: "#1A1A1A",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
});
