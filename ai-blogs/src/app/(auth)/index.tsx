import {
  View,
  Text,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import api from "@/utils/api";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import OtpField from "@/components/auth/OtpField";
import useAuthStore from "@/store/auth_store";

export default function AuthScreen() {
  const { setAuth, clearAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleBack = () => {
    setStep(false);
    setOtp("");
    setError("");
  };
  const handleSignup = async () => {
    try {
      if (!step) {
        // Step 1: Send OTP
        await api.post("/auth/send-otp", {
          email,
        });

        setStep(true);
      } else {
        // Step 2: Verify OTP
        const res = await api.post("/auth/verify-otp", {
          email,
          otp,
        });

        const { access_token, user } = res.data;
        setAuth({
          id: user.id,
          name: user.name || "",
          email: user.email,
          avatar_url: user.avatar_url || "",
          created_at: user.created_at,
        });
        await SecureStore.setItemAsync("token", access_token);
        if (access_token) router.push("/(tabs)");
      }
    } catch (err: any) {
      console.log(err.message);
      clearAuth();
      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg).join(", "));
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={"#F5C518"} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.root}>
            {/* ── Yellow Top Section ── */}
            <View style={styles.topSection}>
              <View style={styles.orangeBlob} />
              {step && (
                <TouchableOpacity
                  style={styles.backBtn}
                  activeOpacity={0.8}
                  onPress={handleBack}
                >
                  <Ionicons name="arrow-back" size={25} color={"black"} />
                </TouchableOpacity>
              )}
              <View style={styles.logoContainer}>
                <View style={styles.smileOuter}>
                  <View style={styles.smileInner} />
                </View>
                <View style={styles.barsRow}>
                  <View style={[styles.bar, { height: 18 }]} />
                  <View style={[styles.bar, { height: 26 }]} />
                  <View style={[styles.bar, { height: 22 }]} />
                  <View style={[styles.bar, { height: 30 }]} />
                  <View style={[styles.bar, { height: 16 }]} />
                </View>
              </View>
            </View>

            {/* ── White Card ── */}
            <View style={styles.card}>
              <Text style={styles.title}>Sign up</Text>
              <Text style={styles.subtitle}>Sign up to continue</Text>

              {/* Email Input */}
              {!step && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="johndoe@example.com"
                    placeholderTextColor={"#AAAAAA"}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              )}
              {step && <OtpField onTextChange={setOtp} />}
              {/* Login Button */}
              <TouchableOpacity
                style={styles.signupBtn}
                activeOpacity={0.85}
                onPress={handleSignup}
              >
                <Text style={styles.signupBtnText}>Sign up</Text>
              </TouchableOpacity>
              {error && (
                <View style={styles.error}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              {/* Footer links */}
              <View style={styles.footer}>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.footerLink}>Privacy Policy</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.footerLink}>Terms of service</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5C518",
  },
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },

  /* ── Yellow top ── */
  topSection: {
    backgroundColor: "#F5C518",
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  orangeBlob: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#F0A500",
    top: 40,
    right: "20%",
  },
  backBtn: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#afafaf",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    zIndex: 2,
  },
  smileOuter: {
    width: 52,
    height: 28,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    backgroundColor: "#fff",
    overflow: "hidden",
    marginBottom: 6,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  smileInner: {
    width: 36,
    height: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: "#F5C518",
    marginTop: 4,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 5,
  },
  bar: {
    width: 10,
    backgroundColor: "#fff",
    borderRadius: 3,
  },

  /* ── White card ── */
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 24,
    marginTop: -28,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    color: "#AAAAAA",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 32,
  },

  /* ── Inputs ── */
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 16,

    fontWeight: "500",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#EFEFEF",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  signupBtn: {
    backgroundColor: "#F5C518",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 14,
    marginBottom: 16,
    shadowColor: "#F0A500",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  signupBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  error: {
    flex: 1,
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
  /* ── Footer ── */
  footer: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  footerLink: {
    fontSize: 12,
    color: "#AAAAAA",
  },
});
