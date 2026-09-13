import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
} from "react-native";
import React from "react";
import { router } from "expo-router";
import { Blog } from "@/utils/get_public_blogs";
import { BlurView } from "expo-blur";

const NUM_COLUMNS = 1;
const OUTER_PADDING = 16; // matches the FlatList's contentContainerStyle padding
const COLUMN_GAP = 16; // matches columnWrapperStyle gap in the parent list

const CARD_WIDTH =
  (Dimensions.get("window").width -
    OUTER_PADDING * 2 -
    COLUMN_GAP * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS;
const CARD_HEIGHT = 200;

const BlogCard = ({ post }: { post: Blog }) => {
  const handlePress = () => {
    router.push(`/post/${post.id}`);
  };
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={styles.cardWrapper}
    >
      <ImageBackground
        source={{ uri: post.image }}
        style={styles.image}
        imageStyle={styles.imageRadius}
        resizeMode="cover"
      >
        <BlurView intensity={35} tint="dark" style={styles.blurContainer}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {post.title}
          </Text>
        </BlurView>
      </ImageBackground>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
    // subtle elevation to lift the card off the screen
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  imageRadius: {
    borderRadius: 16,
  },
  blurContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "flex-end",
    overflow: "hidden",
    // if BlurView's own background isn't tinted enough on Android,
    // this rgba layer gives a consistent look across platforms
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  title: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 19,
  },
});
export default BlogCard;
