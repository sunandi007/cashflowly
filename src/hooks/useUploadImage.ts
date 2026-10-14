import { useState } from "react";
import { Alert } from "react-native";
import { supabase } from "@/services/supabaseClient";
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { useSnackbar } from "./useSnackbar";

export function useUploadImage() {
  const [uploading, setUploading] = useState(false);
  const snackbar = useSnackbar();

  const uploadImage = async (
    uri: string,
    userId: string,
    bucket: string = "avatars"
  ): Promise<string | null> => {
    try {
      setUploading(true);

      // 1️⃣ Baca file dari uri ke base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });

      // 2️⃣ Decode base64 ke ArrayBuffer
      const arrayBuffer = decode(base64);

      // 3️⃣ Buat nama file unik
      const fileExt = uri.split(".").pop()?.toLowerCase() || "jpg";
      const mimeType = fileExt === "png" ? "image/png" : "image/jpeg";
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      // 4️⃣ Upload langsung ArrayBuffer ke Supabase
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, arrayBuffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // 5️⃣ Ambil public URL
      //   const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      const publicUrl = publicData?.publicUrl;

      if (!publicUrl) {
        throw new Error("Public URL tidak ditemukan");
      }

      snackbar.success("Berhasil", "Foto profil berhasil diunggah!");


      return publicUrl;
    } catch (error: any) {
      console.error("Upload image error:", error.message);
      throw error; // Throw error untuk di-handle oleh component
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading };
}
