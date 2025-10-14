import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabaseClient";

export function useCategories(userId?: string) {
  return useQuery({
    queryKey: ["categories", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

export function useCategoryMutations(userId?: string) {
  const queryClient = useQueryClient();

  const addCategory = useMutation({
    mutationFn: async ({
      name,
      type,
      icon,
    }: { name: string; type: string; icon?: string }) => {
      if (!userId) throw new Error("User not logged in");
      const { error } = await supabase.from("categories").insert({
        name,
        type,
        icon: icon || "💡",
        user_id: userId,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  return { addCategory, deleteCategory };
}
