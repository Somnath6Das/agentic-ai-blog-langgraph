import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import useAuthStore from "@/store/auth_store";
import api from "@/utils/api";

const ProfileName = () => {
  const user = useAuthStore.getState().user;
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState<string>(user?.name ?? "");
  const [savedName, setSavedName] = useState("");

  const handleDone = async () => {
    try {
      const response = await api.patch("/profile/name", {
        id: user?.id,
        name: inputValue, // ← use inputValue directly
      });
      const updatedName = response.data.name;
      setSavedName(updatedName); // ← update state after success
      useAuthStore.getState().updateName(updatedName);
      setModalVisible(false);
    } catch (error) {
      console.log(error);
    }
  };
  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleOpen = () => {
    setModalVisible(true);
  };
  return (
    <View>
      {/* Trigger Button — shows name after user submits */}
      <TouchableOpacity style={styles.triggerButton} onPress={handleOpen}>
        <Text style={styles.triggerButtonText}>
          {user?.name || savedName || "What is your name?"}
        </Text>
      </TouchableOpacity>

      {/* Dialog Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={handleCancel}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            {/* Dialog Box */}
            <View style={styles.dialog}>
              <Text style={styles.dialogTitle}>Enter your name</Text>

              {/* Input Field */}
              <TextInput
                style={styles.input}
                placeholder="Type your name..."
                placeholderTextColor="#aaa"
                value={inputValue}
                onChangeText={setInputValue}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleDone}
              />

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.doneButton]}
                  onPress={handleDone}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  greeting: {
    fontSize: 20,
    fontWeight: "600",

    marginBottom: 18,
  },

  // Trigger button
  triggerButton: {
    paddingVertical: 4,
    paddingHorizontal: 24,
  },
  triggerButtonText: {
    fontSize: 25,
    fontWeight: "600",
    color: "#056af8",
  },

  // Modal backdrop
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardView: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  // Dialog box
  dialog: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#056af8",
    marginBottom: 16,
  },

  // Input field
  input: {
    borderWidth: 1.5,
    borderColor: "#056af8",
    borderRadius: 8,
    paddingHorizontal: 14,

    paddingVertical: 10,
    fontSize: 15,
    color: "#333",
    marginBottom: 20,
    backgroundColor: "#fafafa",
  },

  // Action buttons row
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  doneButton: {
    backgroundColor: "#056af8",
  },
  doneButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cancelButtonText: {
    color: "#555",
    fontWeight: "600",
    fontSize: 15,
  },
});

export default ProfileName;
