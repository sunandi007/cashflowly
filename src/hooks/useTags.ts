import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { Alert } from "react-native";
import { TagType } from "@/types/model";

export function useTags() {
    const { session } = useAuth();
    const userId = session?.user?.id;
    const queryClient = useQueryClient();

    /* ----------------------------- 🔹 FETCH TAGS ----------------------------- */
    const fetchTags = async (): Promise<TagType[]> => {
        if (!userId) return [];

        // Attempt to fetch tags
        const { data, error } = await supabase
            .from("tags")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error fetching tags:", error);
            throw new Error(error.message);
        }
        return data || [];
    };

    const {
        data: tags = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["tags", userId],
        queryFn: fetchTags,
        enabled: !!userId,
    });

    /* ----------------------------- 🔹 ADD TAG ----------------------------- */
    const addTag = useMutation({
        mutationFn: async (name: string) => {
            if (!userId) throw new Error("User not authenticated");

            const { data, error } = await supabase
                .from("tags")
                .insert([
                    {
                        user_id: userId,
                        name: name,
                    },
                ])
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tags", userId] });
        },
        onError: (err: any) => {
            Alert.alert("Error adding tag", err.message);
        },
    });

    /* ----------------------------- 🔹 UPDATE TAG ----------------------------- */
    const updateTag = useMutation({
        mutationFn: async ({ id, name }: { id: string; name: string }) => {
            const { error } = await supabase
                .from("tags")
                .update({
                    name: name,
                    // updated_at: new Date().toISOString(), // Column likely doesn't exist
                })
                .eq("id", id)
                .eq("user_id", userId);

            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tags", userId] });
        },
        onError: (err: any) => {
            Alert.alert("Error updating tag", err.message);
        },
    });

    /* ----------------------------- 🔹 DELETE TAG ----------------------------- */
    const deleteTag = useMutation({
        mutationFn: async (tagId: string) => {
            const { error } = await supabase
                .from("tags")
                .delete()
                .eq("id", tagId);

            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tags", userId] });
        },
        onError: (err: any) => {
            Alert.alert("Error deleting tag", err.message);
        },
    });

    return {
        tags,
        isLoading,
        refetch,
        addTag,
        updateTag,
        deleteTag,
    };
}
