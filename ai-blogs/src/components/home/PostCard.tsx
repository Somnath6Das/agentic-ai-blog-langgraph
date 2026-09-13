import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import React, { useCallback } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Blog } from "@/utils/get_public_blogs";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { formatDateTime } from "@/utils/format_datetime";
import { FONTS, SHADOWS } from "@/constants/theme";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface Props {
  post: Blog;
}

const PostCard = ({ post }: Props) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const goToPost = useCallback(() => {
    router.push(`/post/${post.id}`);
  }, [post.id]);

  return (
    <AnimatedTouchable
      style={[styles.card, animatedStyle]}
      onPress={goToPost}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      activeOpacity={1}
    >
      <Image source={{ uri: post.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {post.title}
        </Text>
        <View style={styles.meta}>
          <Ionicons name="time-outline" size={12} color={"#7A7A7A"} />
          <Text style={styles.metaText}>{formatDateTime(post.created_at)}</Text>
        </View>
      </View>
    </AnimatedTouchable>
  );
};
const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 8,
    ...SHADOWS.card,
  },
  image: {
    width: 100,
    height: 60,
    borderRadius: 8,
    resizeMode: "cover",
  },
  info: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: "center",
  },
  category: {
    ...FONTS.label,
    color: "#E8622A",
    marginBottom: 4,
  },
  title: {
    ...FONTS.displayMD,
    fontSize: 15,
    color: "#1A1A1A",
    marginBottom: 6,
    lineHeight: 21,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
});
export default PostCard;
