import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constant/theme";
import { supabase } from "@/services/supabaseClient";
import { AccountOptionType } from "@/types/model";
import { scale, verticalScale } from "@/utils/styling";
import React, { useState } from "react";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { accountOptionsGroup1, accountOptionsGroup2 } from "@/constant/data";
import ProfileUpdateModal from "@/components/ProfileUpdateModal";
import { useProfile } from "@/hooks/useProfile";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Application from 'expo-application';
import { useAlert } from "@/hooks/useAlert";

const APP_VERSION = Application.nativeApplicationVersion;
const BUILD_NUMBER = Application.nativeBuildVersion;

const ProfileScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [showModal, setShowModal] = useState(false);

  const { profile, loading, refetch, updateProfile, userEmail } = useProfile();
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const alert = useAlert();

  const handleLogOut = async () => {
    await supabase.auth.signOut();
  };

  const showLogoutAlert = () => {
    alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => console.log("Cancel logout"),
        },
        {
          text: "Logout",
          onPress: () => handleLogOut(),
        },
      ],
      { type: "warning" }
    );
  };

  const handlePress = async (item: AccountOptionType) => {
    if (item.title === "Logout") {
      showLogoutAlert();
    } else if (item.title === "Settings" || item.title === "Security & Password") {
      navigation.navigate("Settings" as never);
    } else if (item.title === "Manage Categories" || item.title === "Kustomisasi Kategori") {
      navigation.navigate("Category" as never);
    } else if (item.title === "Manage Tags") {
      navigation.navigate("TagList" as never);
    } else if (item.title === "Edit Profile" || item.title === "Account Info") {
      setShowModal(true);
    } else if (item.title === "Tagihan Berulang") {
      navigation.navigate("BillsScreen" as never);
    } else if (item.title === "Data Management") {
      navigation.navigate("DataManagement" as never);
    }
  };

  const renderMenuItem = (item: AccountOptionType, index: number) => (
    <Animated.View
      key={item.title}
      entering={FadeInDown.delay(index * 80).springify().damping(40)}
    >
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.menuIconWrapper, { backgroundColor: item.bgColor }]}>
          <Ionicons
            name={item.icon as any}
            size={scale(20)}
            color={colors.white}
          />
        </View>
        <Typo size={16} fontWeight="500" color={colors.white} style={styles.menuTitle}>
          {item.title}
        </Typo>
        <View style={styles.menuRight}>
          {item.badge && item.badge > 0 && (
            <View style={styles.badge}>
              <Typo size={12} fontWeight="700" color={colors.white}>
                {item.badge}
              </Typo>
            </View>
          )}
          <Ionicons
            name="chevron-forward"
            size={scale(20)}
            color={colors.neutral500}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <ScreenWrapper>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <View style={styles.container}>
          {/* Custom Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={scale(24)} color={colors.white} />
            </TouchableOpacity>

            <Typo size={18} fontWeight="700" color={colors.white}>
              Profile & Settings
            </Typo>

            <TouchableOpacity
              onPress={() => setShowModal(true)}
              activeOpacity={0.7}
            >
              <Typo size={16} fontWeight="600" color={colors.primary}>
                Edit
              </Typo>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Profile Section */}
            <View style={styles.profileSection}>
              {/* Avatar with Camera Badge */}
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={() => setShowModal(true)}
                activeOpacity={0.8}
              >
                <Image
                  source={
                    profile?.avatar_url
                      ? { uri: profile.avatar_url }
                      : require("../../assets/images/defaultAvatar.png")
                  }
                  style={styles.avatar}
                  contentFit="cover"
                  transition={100}
                />
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera" size={scale(14)} color={colors.white} />
                </View>
              </TouchableOpacity>

              {/* Name & Email */}
              <View style={styles.nameContainer}>
                <Typo size={24} fontWeight="700" color={colors.white}>
                  {profile?.full_name || "User"}
                </Typo>
                <Typo size={14} color={colors.neutral400} style={styles.emailText}>
                  {userEmail}
                </Typo>
              </View>

              {/* Pro Member Badge */}
              <View style={styles.proBadge}>
                <Ionicons name="shield-checkmark" size={scale(16)} color={colors.primary} />
                <Typo size={13} fontWeight="700" color={colors.primary}>
                  PRO MEMBER
                </Typo>
              </View>
            </View>

            {/* Menu Group 1 - Account & Management */}
            <View style={styles.menuGroup}>
              {accountOptionsGroup1.map((item, index) => renderMenuItem(item, index))}
            </View>

            {/* Menu Group 2 - Settings & Support */}
            <View style={styles.menuGroup}>
              {accountOptionsGroup2.map((item, index) => renderMenuItem(item, index + 3))}
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={showLogoutAlert}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={scale(22)} color={colors.neutral900} />
              <Typo size={16} fontWeight="700" color={colors.neutral900}>
                Log Out
              </Typo>
            </TouchableOpacity>

            {/* Version Info */}
            <Typo size={13} color={colors.neutral500} style={styles.versionText}>
              Version {APP_VERSION} (Build {BUILD_NUMBER})
            </Typo>
          </ScrollView>
        </View>
      )}

      <ProfileUpdateModal
        visible={showModal}
        profile={profile}
        userEmail={userEmail}
        updateProfile={updateProfile}
        loading={loading}
        onClose={() => {
          setShowModal(false);
          setTimeout(() => refetch(), 400);
        }}
      />
    </ScreenWrapper>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacingX._20,
    paddingVertical: verticalScale(16),
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    alignItems: "flex-start",
    justifyContent: "center",
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: spacingX._20,
    paddingBottom: verticalScale(40),
  },

  // Profile Section
  profileSection: {
    alignItems: "center",
    marginTop: verticalScale(10),
    marginBottom: verticalScale(30),
  },
  avatarContainer: {
    position: "relative",
    marginBottom: verticalScale(16),
  },
  avatar: {
    width: scale(110),
    height: scale(110),
    borderRadius: scale(55),
    backgroundColor: colors.neutral700,
  },
  cameraBadge: {
    position: "absolute",
    bottom: scale(2),
    right: scale(2),
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.neutral900,
  },
  nameContainer: {
    alignItems: "center",
    gap: verticalScale(4),
  },
  emailText: {
    marginTop: verticalScale(2),
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    marginTop: verticalScale(14),
    paddingHorizontal: spacingX._15,
    paddingVertical: verticalScale(8),
    backgroundColor: `${colors.primary}15`,
    borderRadius: radius._20,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },

  // Menu Group
  menuGroup: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._20,
    marginBottom: verticalScale(16),
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(16),
    paddingHorizontal: spacingX._15,
  },
  menuIconWrapper: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    alignItems: "center",
    justifyContent: "center",
  },
  menuTitle: {
    flex: 1,
    marginLeft: spacingX._15,
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  badge: {
    minWidth: scale(22),
    height: scale(22),
    borderRadius: scale(11),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(6),
  },

  // Logout Button
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(10),
    backgroundColor: colors.primary,
    paddingVertical: verticalScale(18),
    borderRadius: radius._30,
    marginTop: verticalScale(20),
    marginBottom: verticalScale(20),
  },

  // Version
  versionText: {
    textAlign: "center",
  },
});
