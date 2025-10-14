import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constant/theme";

import AuthScreen from "@/screens/AuthScreen";
import WelcomeScreen from "@/screens/WelcomeScreen";
import DashboardScreen from "@/screens/Dashboard";
import ProfileScreen from "@/screens/ProfileScreen";
import WalletScreen from "@/screens/WalletScreen";
import ReportScreen from "@/screens/ReportScreen";
import { useAuth } from "@/hooks/useAuth";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function RootNavigation() {
  const { session, isReady } = useAuth();

  if (!isReady) {
    // jangan render apapun sampai auth stabil
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.neutral900,
          borderTopColor: colors.neutral700,
          alignItems: "center",
          borderTopWidth: 1,
          height: 55,
          paddingTop: 7,
          elevation: 10,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home-outline";

          switch (route.name) {
            case "Dashboard":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Report":
              iconName = focused ? "bar-chart" : "bar-chart-outline";
              break;
            case "Wallet":
              iconName = focused ? "wallet" : "wallet-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
          }

          return (
            <Ionicons
              name={iconName}
              size={28}
              color={focused ? colors.primary : colors.neutral400}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
