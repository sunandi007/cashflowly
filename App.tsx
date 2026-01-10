import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Linking } from "react-native";
import RootNavigator from "@/navigation/RootNavigation";
import { colors } from "@/constant/theme";

const queryClient = new QueryClient();

const linking = {
  prefixes: ['cashflowly://', 'https://ehlascpnadaraaltoopa.supabase.co'],
  config: {
    screens: {
      ResetPassword: 'reset-password',
      Auth: 'auth',
      Welcome: 'welcome',
      Main: 'main',
    },
  },
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: colors.neutral900 }}
          edges={["top", "bottom"]}
        >
          <NavigationContainer linking={linking}>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
