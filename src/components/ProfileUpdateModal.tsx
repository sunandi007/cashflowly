// src/components/ProfileUpdateModal.tsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "@/hooks/useAuth";
import Typo from "./Typo";
import { colors, radius, spacingX, spacingY } from "@/constant/theme";
import { verticalScale, scale } from "@/utils/styling";
import Button from "./Button";
import BackButton from "./BackButton";
import Input from "./Input";
import Header from "./Header";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useUploadImage } from "@/hooks/useUploadImage";
import { Ionicons } from "@expo/vector-icons";
import { useSnackbar } from "@/hooks/useSnackbar";

export default function ProfileUpdateModal({ visible = false, onClose, profile, userEmail, updateProfile, loading }: any) {
  const { session } = useAuth();
  const user = session?.user;
  const userId = user?.id;

  const snackbar = useSnackbar();
  const { uploadImage, uploading } = useUploadImage();

  const [avatarUrl, setAvatarUrl] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  // Pick Image
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      snackbar.error("Izin diperlukan", "Akses galeri diperlukan untuk mengunggah foto.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const image = result.assets[0];
      const uploadedUrl = await uploadImage(image.uri, userId as any);

      if (uploadedUrl) setAvatarUrl(uploadedUrl);
    }
  };

  const handleSubmit = async () => {
    try {
      await updateProfile({
        full_name: fullName,
        avatar_url: avatarUrl,
      });
      snackbar.success("Sukses", "Profil berhasil diperbarui!");
      setTimeout(() => onClose(), 400);
    } catch (error) {
      snackbar.error("Error", "Gagal memperbarui profil.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>

            {/* Header */}
            <Header
              title="Update Profile"
              leftIcon={
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>
              }
            />
            <View style={styles.contentContainer}>
              {/* Avatar Section */}
              <TouchableOpacity onPress={pickImage} style={styles.avatarContainer} activeOpacity={0.8}>
                <Image
                  source={
                    avatarUrl
                      ? { uri: `${avatarUrl}?t=${Date.now()}` }
                      : require("../../assets/images/defaultAvatar.png")
                  }
                  style={[styles.avatar, uploading && { opacity: 0.5 }]}
                  contentFit="cover"
                  transition={100}
                />

                {uploading && (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                    style={styles.uploadIndicator}
                  />
                )}

                <View style={styles.editIconContainer}>
                  <Ionicons name="camera" size={16} color={colors.white} />
                </View>
              </TouchableOpacity>

              {/* Form Section */}
              <View style={styles.form}>

                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <Typo size={14} color={colors.neutral400} style={styles.label}>Full Name</Typo>
                  <Input
                    placeholder="Enter your full name"
                    value={fullName}
                    onChangeText={setFullName}
                    icon={<Ionicons name="person-outline" size={20} color={colors.neutral400} />}
                  />
                </View>

                {/* Email Address */}
                <View style={styles.inputGroup}>
                  <Typo size={14} color={colors.neutral400} style={styles.label}>Email Address</Typo>

                  {/* Custom Input for Email to support Right Icon */}
                  <View style={styles.customInputContainer}>
                    <View style={{ marginRight: 8 }}>
                      <Ionicons name="mail-outline" size={20} color={colors.neutral400} />
                    </View>
                    <TextInput
                      style={styles.customInput}
                      value={userEmail}
                      editable={false}
                      placeholderTextColor={colors.neutral400}
                    />
                    <View style={{ marginLeft: 8 }}>
                      <Ionicons name="lock-closed" size={18} color={colors.neutral500} />
                    </View>
                  </View>

                  <Typo size={12} color={colors.neutral500} style={{ marginTop: 6, lineHeight: 18 }}>
                    Contact support to update your email address.
                  </Typo>
                </View>

              </View>

              <View style={{ flex: 1 }} />

              {/* Save Button */}
              <Button
                onPress={handleSubmit}
                style={styles.saveButton}
                disabled={uploading}
              >
                <Typo size={16} color={colors.background} fontWeight="700">
                  {uploading ? "Uploading..." : "Simpan Perubahan"}
                </Typo>
                {!uploading && (
                  <Ionicons name="checkmark" size={20} color={colors.background} style={{ marginLeft: 8 }} />
                )}
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Deep Navy Base
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._10,
    paddingBottom: spacingY._30,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: spacingY._30,
    marginTop: spacingY._10,
  },
  backButtonWrapper: {
    padding: 8,
    marginLeft: -8
  },
  contentContainer: {
    flex: 1,
  },
  avatarContainer: {
    alignSelf: "center",
    position: "relative",
    marginBottom: spacingY._40,
  },
  avatar: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    backgroundColor: colors.neutral800,
    borderWidth: 4,
    borderColor: colors.neutral800, // Optional ring effect
  },
  uploadIndicator: {
    position: "absolute",
    alignSelf: "center",
    top: "45%",
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.neutral700,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background, // Match bg to cut out
  },
  form: {
    gap: spacingY._25,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    marginLeft: 4,
  },
  // Custom Input Styles mimicking the original Input but with right icon support
  customInputContainer: {
    flexDirection: "row",
    height: verticalScale(54),
    alignItems: "center",
    backgroundColor: colors.neutral800,
    borderWidth: 1,
    borderColor: colors.neutral700,
    borderRadius: radius._17,
    paddingHorizontal: spacingX._15,
  },
  customInput: {
    flex: 1,
    color: colors.white, // Text color for editable=false might fade, check usage
    fontSize: verticalScale(14),
    opacity: 0.7, // Visual cue for disabled
  },
  saveButton: {
    marginTop: spacingY._20,
    backgroundColor: colors.accentGreen,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: verticalScale(56),
    borderRadius: radius._30,
  }
});
