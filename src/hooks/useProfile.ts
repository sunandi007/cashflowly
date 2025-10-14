import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { supabase } from "@/services/supabaseClient";
import { useAuth } from "@/hooks/useAuth";

export type ProfileType = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at?: string;
};

export function useProfile() {
  const { session } = useAuth();
  const user = session?.user;
  const userId = user?.id;

  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Fetch profile data
  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, created_at")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 🔹 Update profile data
  const updateProfile = useCallback(
    async (updates: Partial<ProfileType>) => {
      if (!userId) return;
      try {
        setLoading(true);
        const { error } = await supabase.from("profiles").upsert({
          id: userId,
          full_name: updates.full_name ?? profile?.full_name ?? "",
          avatar_url: updates.avatar_url ?? profile?.avatar_url ?? "",
          updated_at: new Date(),
        });
        if (error) throw error;

        Alert.alert("✅ Sukses", "Profil berhasil diperbarui!");
        // Refresh setelah update
        fetchProfile();
      } catch (err: any) {
        Alert.alert("Error", "Gagal memperbarui profil.");
      } finally {
        setLoading(false);
      }
    },
    [userId, profile, fetchProfile]
  );

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
    userEmail: user?.email,
  };
}
