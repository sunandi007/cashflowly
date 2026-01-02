// src/hooks/useTags.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabaseClient";
import { useAuth } from "./useAuth";

export interface Tag {
    id: string;
    name: string;
}

export function useTags() {
    const { session } = useAuth();
    const userId = session?.user?.id;
    const queryClient = useQueryClient();

    // 1. Fetch Tags
    const { data: tags = [], isLoading } = useQuery<Tag[]>({
        queryKey: ["tags", userId],
        queryFn: async () => {
            if (!userId) return [];
            const { data, error } = await supabase
                .from("tags")
                .select("*")
                .eq("user_id", userId)
                .order("name", { ascending: true });
            if (error) throw error;
            return data;
        },
        enabled: !!userId,
    });

    // 2. Create Tag Baru
    const createTag = useMutation({
        mutationFn: async (tagName: string) => {
            if (!userId) throw new Error("User not logged in");
            const { data, error } = await supabase
                .from("tags")
                .insert({ name: tagName, user_id: userId })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tags", userId] });
        },
    });

    return { tags, isLoading, createTag };
}