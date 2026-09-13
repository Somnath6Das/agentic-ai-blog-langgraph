import { View, Text, Dimensions, Linking, StyleSheet } from "react-native";
import React, { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RenderHTML } from "react-native-render-html";

const { width, height } = Dimensions.get("window");

const HTML_CONTENT_WIDTH = width - 74;

const HtmlTextRender = ({ htmlResTxt }: any) => {
  const [animKey, setAnimKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setAnimKey((k) => k + 1);
    }, []),
  );
  return (
    <Animated.View
      style={{ flex: 1 }}
      key={`body-${animKey}`}
      entering={FadeInDown.duration(500).delay(250)}
    >
      <View style={styles.assistantBubble}>
        <RenderHTML
          contentWidth={HTML_CONTENT_WIDTH}
          source={{ html: htmlResTxt }}
          tagsStyles={htmlStyles}
          renderersProps={{
            a: {
              onPress: (_event, href) => {
                if (href) Linking.openURL(href);
              },
            },
          }}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  assistantBubble: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 14,
  },
});

const htmlStyles = {
  body: { fontSize: 15, color: "#111827", lineHeight: 22 },
  p: { fontSize: 18, marginTop: 0, marginBottom: 10 },
  h1: { fontSize: 21, fontWeight: "700" as const, marginBottom: 8 },
  h2: {
    fontSize: 20,
    fontWeight: "700" as const,

    marginTop: 10,
    marginBottom: 6,
  },
  h3: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginTop: 8,
    marginBottom: 4,
  },
  a: {
    fontSize: 18,
    color: "#2563eb",
    textDecorationLine: "underline" as const,
  },
  code: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 4,
    borderRadius: 4,
    color: "#111827",
  },
  pre: {
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 8,
    color: "#111827",
  },
  li: { marginBottom: 4 },
};

export default HtmlTextRender;
