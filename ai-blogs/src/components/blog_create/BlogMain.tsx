import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TextInput,
} from "react-native";
import React, {
  Dispatch,
  memo,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Ionicons } from "@expo/vector-icons";
import HtmlTextRender from "../home/HtmlTextRender";
import Animated, { FadeInDown } from "react-native-reanimated";
import userAuthStore from "@/store/auth_store";
import api from "@/utils/api";
import { useMenuStore } from "@/store/blog_store";
import useAuthStore from "@/store/auth_store";

const SCREEN_WIDTH = Dimensions.get("window").width;

const IMAGE_COLS = 2;
const IMAGE_GAP = 8;
const GRID_WIDTH = SCREEN_WIDTH - 32 - 36;
const IMAGE_SIZE = (GRID_WIDTH - IMAGE_GAP * (IMAGE_COLS - 1)) / IMAGE_COLS;

type UserMessage = { type: "user"; topic: string };
type AssistantMessage = {
  type: "assistant";
  html: string;
  images: string[];
  path?: string;
};
type Message = UserMessage | AssistantMessage;

const ImageGrid = memo(function ImageGrid({
  images,
  selectedIndex,
  onSelect,
}: {
  images: string[] | undefined;
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const rows = useMemo(() => {
    if (!images || images.length === 0) return [];
    const chunks: string[][] = [];
    for (let i = 0; i < images.length; i += IMAGE_COLS) {
      chunks.push(images.slice(i, i + IMAGE_COLS));
    }
    return chunks;
  }, [images]);

  if (rows.length === 0) return null;

  return (
    <View style={styles.imageGrid}>
      <Text style={styles.imagesLabel}>Related Images</Text>
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.imageRow}>
          {row.map((url, colIdx) => {
            const flatIndex = rowIdx * IMAGE_COLS + colIdx;
            const isSelected = flatIndex === selectedIndex;

            return (
              <TouchableOpacity
                key={colIdx}
                activeOpacity={0.8}
                onPress={() => onSelect(flatIndex)}
                style={{
                  marginLeft: colIdx > 0 ? IMAGE_GAP : 0,
                  position: "relative",
                }}
              >
                <Image
                  source={{ uri: url }}
                  style={styles.imageBox}
                  resizeMode="cover"
                  onError={() => {}}
                />
                {isSelected && (
                  <View style={styles.checkOverlay}>
                    <Ionicons
                      name="checkmark-circle"
                      size={35}
                      color="#47aa49"
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
});

const MessageRow = memo(function MessageRow({
  item,
  avatarUri,
  selectedImageIndex,
  setSelectedImageIndex,
  publishBlog,
  showSuccess,
}: {
  item: Message;
  avatarUri: string;
  selectedImageIndex: number | null;
  setSelectedImageIndex: (index: number | null) => void;
  publishBlog: () => void;
  showSuccess: boolean;
}) {
  if (item.type === "user") {
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{item.topic}</Text>
        </View>
        <View style={styles.userAvatar}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        </View>
      </View>
    );
  }
  return (
    <View>
      <View style={styles.assistant}>
        {item.images.length > 1 && (
          <View style={styles.published}>
            <TouchableOpacity
              style={styles.publishButton}
              onPress={publishBlog}
            >
              <Text style={styles.publishButtonText}>Publish Blog</Text>
            </TouchableOpacity>
            {showSuccess && (
              <Ionicons name="checkmark-circle" size={24} color="green" />
            )}
          </View>
        )}
      </View>
      <View style={styles.assistantRow}>
        <View style={styles.assistantAvatar}>
          <Ionicons name="sparkles" size={14} color="#ffffff" />
        </View>
        <View style={styles.assistantContent}>
          <HtmlTextRender htmlResTxt={item.html} />

          <View style={styles.assistant}>
            {item.images.length > 1 && (
              <View style={styles.published}>
                <TouchableOpacity
                  style={styles.publishButton}
                  onPress={publishBlog}
                >
                  <Text style={styles.publishButtonText}>Publish Blog</Text>
                </TouchableOpacity>
                {showSuccess && (
                  <Ionicons name="checkmark-circle" size={24} color="green" />
                )}
              </View>
            )}

            <ImageGrid
              images={item.images}
              selectedIndex={selectedImageIndex ?? 0}
              onSelect={setSelectedImageIndex}
            />
          </View>
        </View>
      </View>
    </View>
  );
});

interface Props {
  messages: Message[];
  handleSend?: () => Promise<void>;
  title: string;
  topic?: string;
  postId?: number;
  setTopic?: Dispatch<SetStateAction<string>>;
  loading?: boolean;
  confirmed?: boolean;
  listRef: React.RefObject<ScrollView | null>;
}

let hasPlayedCreateBlogIntro = false;

export default function BlogMain({
  messages,
  handleSend = async () => {},
  title,
  topic,
  postId,
  setTopic = () => {},
  loading = false,
  confirmed = false,
  listRef,
}: Props) {
  const { user } = useAuthStore();
  const resetKey = useMenuStore((state) => state.resetKey);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
  const imagesMessage = messages.find(
    (m): m is AssistantMessage => m.type === "assistant" && !!m.images?.length,
  );
  const htmlFile = messages.find(
    (m): m is AssistantMessage => m.type === "assistant",
  );
  const htmlPath = htmlFile?.path;
  const selectedImageUri =
    imagesMessage?.images?.[selectedImageIndex ?? 0] ??
    imagesMessage?.images?.[0] ??
    null;
  const keyExtractor = (item: Message, idx: number) =>
    item.type === "user" ? `u-${idx}` : `a-${item.path ?? idx}`;
  const AVATAR_URL = "https://cdn-icons-png.flaticon.com/512/3177/3177440.png";

  const BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

  const avatarUri = user?.avatar_url
    ? `${BASE_URL}${user.avatar_url}`
    : AVATAR_URL;

  const [showSuccess, setShowSuccess] = useState(false);

  const [shouldAnimate] = useState(() => {
    if (hasPlayedCreateBlogIntro) return false;
    hasPlayedCreateBlogIntro = true;
    return true;
  });

  const publishBlog = async () => {
    try {
      await api.post("/public/create", {
        userId: user?.id,
        postId,
        title,
        htmlPath,
        image: selectedImageUri,
      });
      setShowSuccess(true);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    setShowSuccess(false);
  }, [resetKey]);
  return (
    <View style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {confirmed ? (
          <>
            <ScrollView
              ref={listRef}
              contentContainerStyle={styles.listContent}
            >
              {messages.map((item, idx) => (
                <MessageRow
                  key={keyExtractor(item, idx)}
                  item={item}
                  avatarUri={avatarUri}
                  selectedImageIndex={selectedImageIndex}
                  setSelectedImageIndex={setSelectedImageIndex}
                  publishBlog={publishBlog}
                  showSuccess={showSuccess}
                />
              ))}
            </ScrollView>

            {loading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#0d622c" />
                <Text style={styles.loadingText}>Generating your blog…</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyStateWrapper}>
            {/* ✅ CHANGED — wrapped in Animated.View, entering gated by shouldAnimate */}
            <Animated.View
              style={styles.imageContainer}
              entering={
                shouldAnimate ? FadeInDown.duration(500).delay(80) : undefined
              }
            >
              <Image
                source={require("@/assets/agent-img.png")}
                style={styles.image}
              />
            </Animated.View>

            {/* ✅ CHANGED — wrapped in Animated.View, entering gated by shouldAnimate */}
            <Animated.View
              style={styles.inputBar}
              entering={
                shouldAnimate ? FadeInDown.duration(400).delay(200) : undefined
              }
            >
              <TextInput
                style={styles.input}
                placeholder="I'd love to know more"
                placeholderTextColor="#9ca3af"
                value={topic}
                onChangeText={setTopic}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSend}
                disabled={!topic?.trim()}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}
const styles = StyleSheet.create({
  imageGrid: {
    marginTop: 12,
  },
  imagesLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
  },
  imageRow: {
    flexDirection: "row",
    marginBottom: IMAGE_GAP,
  },

  imageBox: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE * 0.75,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },
  checkOverlay: {
    ...StyleSheet.absoluteFill, // fills the whole image
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 11,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    marginBottom: 16,
  },
  userBubble: {
    backgroundColor: "#f1f3f5",
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: "75%",
    marginRight: 8,
  },
  userText: { fontSize: 18, color: "#111827" },
  userAvatar: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  assistant: { alignItems: "center", marginTop: 4, marginBottom: 4 },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginTop: 2,
  },
  assistantRow: { flexDirection: "row", marginBottom: 16 },
  assistantContent: { flex: 1 },
  published: {
    flexDirection: "row",
    gap: 4,
  },
  publishButton: {
    width: 120,
    height: 30,
    backgroundColor: "#2f5fef",
    borderRadius: 8,
    justifyContent: "center",
  },
  publishButtonText: {
    color: "#fff",
    alignSelf: "center",
    fontSize: 16,
    fontWeight: 600,
  },
  safeArea: { flex: 1, backgroundColor: "#fff", padding: 5 },
  listContent: { paddingBottom: 24 },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  loadingText: { color: "#6b7280", fontSize: 13 },
  emptyStateWrapper: {
    flex: 1,
    position: "relative",
  },
  imageContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
  },
  inputBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 18,
    color: "#111827",
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
});
