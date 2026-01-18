import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import RootNavigator from "@/navigation/RootNavigation";
import { AlertProvider } from "@/contexts/AlertContext";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import * as Linking from 'expo-linking';
import '@/i18n'; // Initialize i18n
import { View } from "react-native";

const queryClient = new QueryClient();

const linking = {
  prefixes: [Linking.createURL('/'), 'cashflowly://'],
  config: {
    screens: {
      // Mapping nama screen (sesuai RootNavigation Anda) ke path URL
      Welcome: 'welcome',
      Auth: {
        path: 'auth', // Jika URLnya 'cashflowly://auth', buka screen ini
        parse: {
          mode: (mode: string) => mode, // Tangkap parameter ?mode=login
        },
      },
      // ... screen lainnya
    },
  },
};

// Separate component to use theme context
function AppContent() {
  const { colors } = useTheme();

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={["top", "bottom"]}
      >
        <NavigationContainer linking={linking}>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <AlertProvider>
              <SnackbarProvider>
                <NotificationProvider>
                  <AppContent />
                </NotificationProvider>
              </SnackbarProvider>
            </AlertProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
