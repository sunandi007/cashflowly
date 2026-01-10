import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import RootNavigator from "@/navigation/RootNavigation";
import { colors } from "@/constant/theme";
import { AlertProvider } from "@/contexts/AlertContext";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import * as Linking from 'expo-linking';

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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AlertProvider>
        <SnackbarProvider>
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
        </SnackbarProvider>
      </AlertProvider>
    </QueryClientProvider>
  );
}
