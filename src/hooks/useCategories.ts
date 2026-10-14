import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabaseClient";

interface Category {
  id?: string;
  name: string;
  icon: string;
  type: "income" | "expense" | "transfer";
  bgColor: string;
  user_id?: string;
}

export function useCategories(userId?: string) {
  return useQuery<Category[]>({
    queryKey: ["categories", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("categories")
        .select('id, name, icon, type, bgColor, user_id, created_at')
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
    enabled: !!userId,
  });
}

export function useCategoryMutations(userId?: string) {
  const queryClient = useQueryClient();

  // 🟢 MUTASI: CREATE CATEGORY
  const addCategory = useMutation({
    mutationFn: async ({
      name,
      type,
      icon,
      bgColor
    }: {
      name: string;
      type: string;
      icon?: string;
      bgColor?: string
    }) => {
      if (!userId) throw new Error("User not logged in");
      const { error } = await supabase.from("categories").insert({
        name,
        type,
        icon: icon || "💡",
        "bgColor": bgColor,
        user_id: userId,
      });
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  // 🟡 MUTASI: UPDATE CATEGORY
  const updateCategory = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Category>;
    }) => {
      const { error } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", userId] });
    },
  });

  // 🔴 MUTASI: DELETE CATEGORY
  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["categories", userId] }),
  });

  return {
    addCategory: addCategory.mutateAsync,
    updateCategory: updateCategory.mutateAsync,
    deleteCategory: deleteCategory.mutateAsync,
    isCreating: addCategory.isPending,
    isUpdating: updateCategory.isPending,
    isDeleting: deleteCategory.isPending,
  };
}
