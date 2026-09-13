import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Blog } from "@/utils/get_public_blogs";
import { User } from "@/store/auth_store";
import api from "@/utils/api";
import axios from "axios";
import { getBlogById } from "@/utils/get_blog_by_id";
import { getUserByUserId } from "@/utils/get_user_by_user_id";
import { Ionicons } from "@expo/vector-icons";
import { formatDateTime } from "@/utils/format_datetime";
import HtmlTextRender from "@/components/home/HtmlTextRender";
import { FONTS, SHADOWS } from "@/constants/theme";
const { width, height } = Dimensions.get("window");

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const HERO_HEIGHT = height * 0.35;
const STATUS_HEIGHT =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0;

export default function BlogDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [post, setPost] = useState<Blog>();
  const [htmlResTxt, setHtmlResTxt] = useState<string>("");
  const [user, setUser] = useState<User>();
  const scrollY = useSharedValue(0);

  const [animKey, setAnimKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setAnimKey((k) => k + 1);
    }, []),
  );

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, HERO_HEIGHT],
          [0, -HERO_HEIGHT / 2],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  // Nav bar fade in on scroll
  const navBarStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 100], [0, 1], Extrapolation.CLAMP),
    backgroundColor: "#fff",
  }));

  // Always-visible back button bg (adapts from transparent to white)
  const backBgStyle = useAnimatedStyle(() => ({
    backgroundColor:
      interpolate(scrollY.value, [0, 80], [1, 0], Extrapolation.CLAMP) === 1
        ? "rgba(0,0,0,0.3)"
        : "transparent",
  }));
  const BASE_URL = process.env.EXPO_PUBLIC_API_URL!;
  const AVATAR_URI = "https://cdn-icons-png.flaticon.com/512/3177/3177440.png";
  const avatarUri = user?.avatar_url
    ? `${BASE_URL}${user.avatar_url}`
    : AVATAR_URI;

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const blog = await getBlogById(Number(id));
        // console.log(data);
        setPost(blog);
        const htmlRes = await api.get(`/${blog.html_path}`, {
          transformResponse: (res) => res, // keep raw text, don't JSON.parse it
        });
        setHtmlResTxt(htmlRes.data);
        // console.log(htmlRes);
        // console.log(blog.user_id);
        const user = await getUserByUserId(Number(blog.user_id));
        // console.log(user);
        setUser(user);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          console.log("Blog not found");
        } else {
          console.error("Failed to fetch blog:", error);
        }
      }
    };

    fetchBlog();
  }, [id]);
  return (
    <View style={styles.root}>
      {/* Sticky back & bookmark buttons */}
      <View
        style={[
          styles.floatingNav,
          { paddingTop: insets.top + STATUS_HEIGHT + 8 },
        ]}
      >
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={"#fff"} />
        </TouchableOpacity>
      </View>

      {/* Opaque navbar that fades in when scrolled */}
      <Animated.View
        style={[
          styles.opaqueNav,
          navBarStyle,
          { paddingTop: insets.top + STATUS_HEIGHT + 8 },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={"#1A1A1A"} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {post?.title}
        </Text>
      </Animated.View>

      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={true}
        bounces
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* Hero image with parallax */}
        <View style={styles.heroContainer}>
          <Animated.Image
            source={{ uri: post?.image }}
            style={[styles.heroImage, heroStyle]}
          />
          <View style={styles.heroGradient} />
        </View>

        {/* Content card */}
        <View style={styles.contentCard}>
          {/* Category + title */}
          <Animated.View
            key={`cat-${animKey}`}
            entering={FadeInDown.duration(400).delay(100)}
          >
            <Text style={styles.title}>{post?.title}</Text>
          </Animated.View>
          {/* Meta row */}
          <Animated.View
            key={`meta-${animKey}`}
            entering={FadeInDown.duration(400).delay(160)}
            style={styles.metaRow}
          >
            <Ionicons name="time-outline" size={13} color={"#7A7A7A"} />
            <Text style={styles.metaText}>
              {formatDateTime(post?.created_at || "")}
            </Text>
          </Animated.View>
          {/* Author */}
          <Animated.View
            key={`author-${animKey}`}
            entering={FadeInDown.duration(400).delay(200)}
            style={styles.authorRow}
          >
            <Image source={{ uri: avatarUri }} style={styles.avatar} />

            <Text style={styles.authorName}>{user?.name || user?.email}</Text>
            <Text style={styles.metaText}>Generated</Text>
          </Animated.View>
          {/* Body */}
          <HtmlTextRender htmlResTxt={htmlResTxt} />
        </View>
      </AnimatedScrollView>
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
  // Floating nav (dark icons over image)
  floatingNav: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.32)",
    alignItems: "center",
    justifyContent: "center",
  },
  // Opaque navbar fades in on scroll
  opaqueNav: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  navTitle: {
    ...FONTS.displayMD,
    fontSize: 15,
    color: "#1A1A1A",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  // Hero
  heroContainer: {
    height: HERO_HEIGHT,
    overflow: "hidden",
  },
  //!
  heroImage: {
    width: "100%",
    height: "80%",
    justifyContent: "flex-end",
    // width: width,
    // height: HERO_HEIGHT * 1.4,
    resizeMode: "cover",
    top: 0,
  },
  heroGradient: {
    ...StyleSheet.absoluteFill,
    // Bottom gradient via semi-transparent black
  },
  // Content
  contentCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    //!
    marginTop: -60,
    padding: 24,
    minHeight: height * 0.6,
    ...SHADOWS.card,
  },
  category: {
    ...FONTS.label,
    color: "#E8622A",
    marginBottom: 6,
  },
  title: {
    ...FONTS.displayXL,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  location: {
    ...FONTS.bodyMD,
    color: "#7A7A7A",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
  },

  metaText: {
    ...FONTS.bodySM,
    color: "#7A7A7A",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#C4C4C4",
    marginHorizontal: 4,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 20,
  },
  authorName: {
    ...FONTS.caption,
    color: "#1A1A1A",
    fontWeight: "600",
  },

  sectionHeading: {
    ...FONTS.displayMD,
    fontSize: 17,
    color: "#1A1A1A",
    marginBottom: 8,
  },
  body: {
    ...FONTS.bodyMD,
    color: "#4A4A4A",
    marginBottom: 16,
  },
  readMore: {
    color: "#E8622A",
    fontWeight: "600",
  },
});
