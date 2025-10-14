import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import RootNavigator from "@/navigation/RootNavigation";
import { colors } from "@/constant/theme";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: colors.neutral900 }}
          edges={["top", "bottom"]}
        >
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
