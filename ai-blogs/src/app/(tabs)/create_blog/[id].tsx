import { View, Text, ScrollView } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { useMenuStore } from "@/store/blog_store";
import api from "@/utils/api";
import BlogMain from "@/components/blog_create/BlogMain";

type UserMessage = { type: "user"; topic: string };
type AssistantMessage = {
  type: "assistant";
  html: string;
  images: string[];
  path?: string;
};
type Message = UserMessage | AssistantMessage;

export default function LocalBlogPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const item = useMenuStore((s) =>
    s.menuItems.find((i) => i.id === Number(id)),
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    if (!item) return;

    let cancelled = false;
    setLoading(true);

    const loadBlog = async () => {
      try {
        const htmlRes = await api.get(`/${item.file_path}`, {
          transformResponse: (res) => res, // keep raw text, don't JSON.parse it
        });

        if (cancelled) return;

        setMessages([
          { type: "user", topic: item.user_topic },
          {
            type: "assistant",
            html: htmlRes.data,
            images: item.images || [],
            path: item.file_path,
          },
        ]);
      } catch (err: any) {
        if (cancelled) return;
        const detail =
          err?.response?.data?.detail ||
          err.message ||
          "Failed to load this blog.";
        setMessages([
          { type: "user", topic: item.user_topic },
          { type: "assistant", html: `⚠️ ${detail}`, images: [] },
        ]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadBlog();
    return () => {
      cancelled = true;
    };
  }, [item?.file_path]);

  if (!item) return <Text>Not found</Text>;
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: item.title }} />
      <BlogMain
        messages={messages}
        title={item.title}
        loading={loading}
        confirmed={true}
        listRef={listRef}
        postId={Number(id)}
      />
    </View>
  );
}
