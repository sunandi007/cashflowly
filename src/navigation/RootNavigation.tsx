import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect } from "react";
import { useNotification } from "@/hooks/useNotification";
import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { CustomTabBarBackground } from "@/components/CustomTabBar";

import AuthScreen from "@/screens/AuthScreen";
import WelcomeScreen from "@/screens/WelcomeScreen";
import DashboardScreen from "@/screens/Dashboard";
import ProfileScreen from "@/screens/ProfileScreen";
import CategoryListScreen from "@/screens/CategoryListScreen";
import WalletScreen from "@/screens/WalletListScreen";
import { useAuth } from "@/hooks/useAuth";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import DashboardAnalyticsScreen from "@/screens/AnalyticsScreen";
import BillsScreen from "@/screens/BillsScreen";
import TransactionScreen from "@/screens/TransactionScreen";
import SearchScreen from "@/screens/SearchScreen";
import WalletDetailScreen from "@/screens/WalletDetailScreen";
import TagListScreen from "@/screens/TagListScreen";
import DataManagementScreen from "@/screens/DataManagementScreen";
import ForgotPasswordScreen from "@/screens/ForgotPasswordScreen";
import ResetPasswordScreen from "@/screens/ResetPasswordScreen";
import ChangePasswordScreen from "@/screens/ChangePasswordScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import NotificationSettingsScreen from "@/screens/NotificationSettingsScreen";
import HelpSupportScreen from "@/screens/HelpSupportScreen";

import EmailSupportScreen from "@/screens/EmailSupportScreen";
import PrivacyPolicyScreen from "@/screens/PrivacyPolicyScreen";

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
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Category" component={CategoryListScreen} />
          <Stack.Screen name="BillsScreen" component={BillsScreen} />
          <Stack.Screen name="TransactionScreen" component={TransactionScreen} />
          <Stack.Screen
            name="SearchScreen"
            component={SearchScreen}
            options={{ animation: 'fade_from_bottom' }} // Opsional: animasi muncul
          />
          <Stack.Screen name="TagList" component={TagListScreen} />
          <Stack.Screen name="DataManagement" component={DataManagementScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="WalletDetail" component={WalletDetailScreen} />
          <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          <Stack.Screen name="EmailSupport" component={EmailSupportScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { colors } = useTheme();

  // Handle notification tap → navigate to bill reminder screen
  const { pendingRoute, clearPendingRoute } = useNotification();
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!pendingRoute) return;
    navigation.navigate(pendingRoute);
    clearPendingRoute();
  }, [pendingRoute]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 15,
          borderRadius: 35,
          paddingHorizontal: 20,
          // Shadow
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 8,
        },
        tabBarBackground: () => <CustomTabBarBackground colors={colors} />,
        sceneContainerStyle: {
          backgroundColor: colors.background,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home-outline";

          switch (route.name) {
            case "Dashboard":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Analitics":
              iconName = focused ? "stats-chart" : "stats-chart-outline";
              break;
            case "AddTransaction":
              iconName = "add";
              break;
            case "Wallet":
              iconName = focused ? "wallet" : "wallet-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
          }

          // Special styling for center add button
          if (route.name === "AddTransaction") {
            return (
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 32,

                  // Shadow & glow effect
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.5,
                  shadowRadius: 12,
                  elevation: 10,

                  // Border putih bersih
                  borderWidth: 5,
                  borderColor: 'rgba(255, 255, 255, 0.02)',
                }}
              >
                <Ionicons name={iconName} size={40} color={colors.white} />
              </View>
            );
          }

          return (
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: focused ? colors.primary : 'transparent', // Solid green when focused, subtle background when not
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons
                name={iconName}
                size={26}
                color={focused ? colors.white : colors.neutral900} // Dark color on green bg, lighter when not focused
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Analitics" component={DashboardAnalyticsScreen} />
      <Tab.Screen
        name="AddTransaction"
        component={TransactionScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('TransactionScreen');
          },
        })}
      />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

