import { View, Text, ScrollView } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import api from "@/utils/api";
import BlogMain from "@/components/blog_create/BlogMain";
import { useMenuStore } from "@/store/blog_store";

type UserMessage = { type: "user"; topic: string };

type AssistantMessage = {
  type: "assistant";
  html: string;
  images: string[];
  path?: string;
};

export type Message = UserMessage | AssistantMessage;

export default function CreateBlogScreen() {
  const resetKey = useMenuStore((s) => s.resetKey);
  const addMenuItem = useMenuStore((s) => s.addMenuItem);
  const [topic, setTopic] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const listRef = useRef<ScrollView | null>(null);
  const [postId, setPostId] = useState<number | undefined>(undefined);
  const [title, setTitle] = useState<string>("");

  useFocusEffect(
    useCallback(() => {
      setTopic("");
      setMessages([]);
      setConfirmed(false);
      setLoading(false);
    }, []),
  );
  useEffect(() => {
    setTopic("");
    setMessages([]);
    setConfirmed(false);
    setLoading(false);
  }, [resetKey]);

  const handleSend = async () => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic || loading) return;

    setMessages((prev) => [...prev, { type: "user", topic: trimmedTopic }]);
    setTopic("");
    setConfirmed(true);
    setLoading(true);

    try {
      const { data } = await api.post(
        "/blogs/create",
        { topic: trimmedTopic },
        { timeout: 90000 },
      );
      const htmlRes = await api.get(`/${data.path}`, {
        transformResponse: (res) => res,
      });
      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          html: htmlRes.data,
          images: data.images || [],
          path: data.path,
        },
      ]);
      const newId = addMenuItem({
        user_topic: trimmedTopic,
        title: data.title,
        file_path: data.path,
        images: data.images || [],
      });
      setTitle(data.title);
      setPostId(newId);
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail || err.message || "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        { type: "assistant", html: `⚠️ ${detail}`, images: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <BlogMain
      messages={messages}
      handleSend={handleSend}
      postId={postId}
      title={title}
      topic={topic}
      setTopic={setTopic}
      loading={loading}
      confirmed={confirmed}
      listRef={listRef}
    />
  );
}
