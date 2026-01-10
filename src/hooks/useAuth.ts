import { supabase } from "@/services/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { Alert } from "react-native";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fungsi async untuk mengambil sesi dan menyiapkan listener
    const setupAuthListener = async () => {
      // Coba ambil sesi awal
      const { data: initialSessionData } = await supabase.auth.getSession();
      setSession(initialSessionData.session);
      setIsReady(true); // Setelah sesi awal dicek, aplikasi siap

      // Set up listener untuk perubahan state autentikasi
      const { data: listener } = supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          setSession(newSession);
        }
      );

      // Bersihkan listener saat komponen unmount
      return () => {
        listener.subscription.unsubscribe();
      };
    };

    setupAuthListener();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // Memulai proses OAuth dengan Google provider
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {}
      });

      if (error) throw error;
      return data;

    } catch (error: any) {
      console.error("Google Sign-In Error:", error.message);
      Alert.alert("Login Gagal", error.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error("Logout Error:", error.message);
      Alert.alert("Logout Gagal", error.message);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'cashflowly://reset-password',
      });
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Forgot Password Error:", error.message);
      Alert.alert("Gagal Mengirim Email", error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (newPassword: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Reset Password Error:", error.message);
      Alert.alert("Gagal Mereset Password", error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    session,
    isReady,
    loading, // <-- Sekarang sudah diekspor
    signOut,
    signInWithGoogle,
    forgotPassword,
    resetPassword
  };
}