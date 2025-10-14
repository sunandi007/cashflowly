// src/components/TransactionModal.tsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useTransactionMutations } from "@/hooks/useTransactionMutations";
import { useAuth } from "@/hooks/useAuth";
import { Dropdown } from "react-native-element-dropdown";
import { useCategories } from "@/hooks/useCategories";
import Typo from "./Typo";
import { colors, radius, spacingX, spacingY } from "@/constant/theme";
import { scale, verticalScale } from "@/utils/styling";
import BaseDropdown from "./Dropdown";
import { toTitleCase } from "@/utils/text";
import Button from "./Button";
import IconComponent from "./Icons";
import BackButton from "./BackButton";
import Input from "./Input";
import TransactionList from "./TransactionList";
import { useTransactions } from "@/hooks/useTransactions";
import Header from "./Header";
import { useFilteredTransactions } from "@/hooks/useFilteredTransactions";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useProfile } from "@/hooks/useProfile";
import { useUploadImage } from "@/hooks/useUploadImage";

const screenHeight = Dimensions.get("window").height;

export default function ProfileUpdateModal({ visible = false, onClose, profile, userEmail, updateProfile, loading }: any) {
  const { session } = useAuth();
  const user = session?.user;
  const userId = user?.id;

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
      Alert.alert(
        "Izin diperlukan",
        "Akses galeri diperlukan untuk mengunggah foto."
      );
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
      Alert.alert("Sukses", "Profil berhasil diperbarui!");
      setTimeout(() => onClose(), 400);
    } catch (error) {
      Alert.alert("Error", "Gagal memperbarui profil.");
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
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <Header
          style={{
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: spacingY._10,
          }}
          title="Update Profile"
          leftIcon={
            <TouchableOpacity onPress={onClose}>
              <BackButton />
            </TouchableOpacity>
          }
        />

        {/* Avatar */}
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          <Image
            source={
              avatarUrl
                ? { uri: `${avatarUrl}?t=${Date.now()}` } // cache busting
                : require("../../assets/images/defaultAvatar.png")
            }
            style={[styles.avatar, uploading && { opacity: 0.5 }]}
            contentFit="cover"
            transition={100}
          />

          {/* Loading spinner saat upload */}
          {uploading && (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={styles.uploadIndicator}
            />
          )}

          {/* Icon edit di pojok kiri bawah */}
          <View style={styles.editIconContainer}>
            <IconComponent
              item={{ icon: "camera-outline" } as any} // bisa diganti "pencil-outline"
              size={verticalScale(18)}
              color={colors.neutral100}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.form}>
          <Input
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />
          <Input placeholder="Email" editable={false} value={userEmail} />
        </View>

        {/* Save Button */}
        <Button
          onPress={handleSubmit}
          style={{ marginTop: spacingY._20 }}
          disabled={uploading}
        >
          <Typo size={16} color="#fff" fontWeight="600">
            {uploading ? "Uploading..." : "Simpan Perubahan"}
          </Typo>
        </Button>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingY._20,
    paddingTop: spacingY._20,
    backgroundColor: colors.neutral900,
  },
  form: {
    gap: spacingY._20,
  },
  // avatar: {
  //   width: 100,
  //   height: 100,
  //   borderRadius: 50,
  //   alignSelf: "center",
  //   marginBottom: 20,
  // },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // uploadIndicator: {
  //   position: "absolute",
  //   alignSelf: "center",
  //   top: "45%",
  // },
  avatarContainer: {
  alignSelf: "center",
  position: "relative",
  marginBottom: 20,
},
avatar: {
  width: 100,
  height: 100,
  borderRadius: 50,
  backgroundColor: colors.neutral800,
},
uploadIndicator: {
  position: "absolute",
  alignSelf: "center",
  top: "40%",
},
editIconContainer: {
  position: "absolute",
  bottom: 0,
  left: 0,
  backgroundColor: colors.neutral700,
  borderRadius: 20,
  padding: 6,
  borderWidth: 2,
  borderColor: colors.neutral900,
  shadowColor: colors.black,
  shadowOpacity: 0.3,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 2,
  elevation: 5,
},

});
