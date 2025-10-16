import IconComponent from "@/components/Icons";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constant/theme";
import { supabase } from "@/services/supabaseClient";
import { AccountOptionType } from "@/types/model";
import { verticalScale } from "@/utils/styling";
import React, { useState } from "react";
import { Image } from "expo-image";
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Header from "@/components/Header";
import { accountOptions } from "@/constant/data";
import ProfileUpdateModal from "@/components/ProfileUpdateModal";
import { useProfile } from "@/hooks/useProfile";

const ProfileScreen = () => {
  const [showModal, setShowModal] = useState(false);

  const { profile, loading, refetch, updateProfile, userEmail } = useProfile();

  const handleLogOut = async () => {
    await supabase.auth.signOut();
  };

  const showLogoutAlert = () => {
    Alert.alert("Confirm", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => console.log("Cancel logout"),
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => handleLogOut(),
      },
    ]);
  };

  const handlePress = async (item: AccountOptionType) => {
    if (item.title === "Logout") {
      showLogoutAlert();
    } else if (item.title === "Edit Profile") {
      setShowModal(true);
    }
  };

  return (
    <ScreenWrapper>
      {loading ? (
      <ActivityIndicator color={colors.primary} />
    ) : (
      <View style={styles.container}>
        <Header
          title="Profile"
          style={{ marginVertical: spacingY._10 }}
        ></Header>

        {/* user info */}
        <View style={styles.userInfo}>
          {/* avatar */}
          <View>
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
          </View>
          {/* name & email */}
          <View style={styles.nameContainer}>
            <Typo size={24} fontWeight="600" color={colors.neutral100}>
              {profile?.full_name}
            </Typo>
            <Typo size={15} color={colors.neutral400}>
              {userEmail}
            </Typo>
          </View>
        </View>

        {/* account options */}
        <View style={styles.accountOptions}>
          {accountOptions.map((item, index) => (
            <Animated.View
              key={index.toString()}
              entering={FadeInDown.delay(index * 90)
                .springify()
                .damping(40)}
              style={styles.listItem}
            >
              <TouchableOpacity
                style={styles.flexRow}
                onPress={() => handlePress(item)}
              >
                <View
                  style={[styles.listIcon, { backgroundColor: item.bgColor }]}
                >
                  <IconComponent
                    item={{ icon: item.icon } as any}
                    size={verticalScale(28)}
                    color={colors.neutral100}
                  />
                </View>
                <Typo
                  size={16}
                  fontWeight="500"
                  style={{ flex: 1 }}
                  color={colors.neutral100}
                >
                  {item.title}
                </Typo>
                {/* <Icons.CaretRight size={verticalScale(20)} color={colors.white} weight="bold" /> */}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
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
    paddingHorizontal: spacingY._20,
  },
  userInfo: {
    marginTop: verticalScale(20),
    alignItems: "center",
    gap: spacingY._15,
  },
  avatar: {
    width: verticalScale(135),
    height: verticalScale(135),
    borderRadius: 200,
    backgroundColor: colors.neutral300,
    alignSelf: "center",
  },
  editIcon: {
    position: "absolute",
    bottom: 5,
    right: 8,
    backgroundColor: colors.neutral100,
    borderRadius: 50,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 4,
    padding: 5,
  },
  nameContainer: {
    alignItems: "center",
    gap: verticalScale(4),
  },
  listIcon: {
    width: verticalScale(44),
    height: verticalScale(44),
    borderRadius: radius._15,
    backgroundColor: colors.neutral500,
    justifyContent: "center",
    alignItems: "center",
    borderCurve: "continuous",
  },
  listItem: {
    marginBottom: verticalScale(17),
  },
  accountOptions: {
    marginTop: spacingY._35,
  },
  flexRow: {
    flexDirection: "row",
    gap: spacingX._10,
    alignItems: "center",
  },
});
