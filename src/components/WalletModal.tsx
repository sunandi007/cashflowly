import { useEffect, useState } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { colors, radius, spacingX, spacingY } from "@/constant/theme";
import Typo from "./Typo";
import Button from "./Button";
import Header from "./Header";
import Input from "./Input";
import IconComponent from "./Icons";
import { scale, verticalScale } from "@/utils/styling";
export default function WalletAddModal({
  visible,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  initialData,
}: {
  visible: boolean;
  onClose: () => void;
  onSave?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (id: string) => void;
  initialData?: any;
}) {
  const isEditing = !!initialData;
  const [name, setName] = useState(initialData?.name || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && initialData) setName(initialData.name || "");
    if (!visible) setName("");
  }, [visible, initialData]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Nama wallet wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      if (isEditing && onUpdate) {
        await onUpdate({
          id: initialData.id,
          updates: { name: name.trim() },
        });
        Alert.alert("Berhasil 🎉", "Perubahan wallet berhasil disimpan.");
      } else if (onSave) {
        await onSave({ name: name.trim() });
        Alert.alert("Sukses 🎉", "Wallet baru berhasil ditambahkan.");
      }
      onClose();
    } catch (err: any) {
      Alert.alert(
        "Gagal 😞",
        err.message || "Terjadi kesalahan saat menyimpan data."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!onDelete || !initialData?.id) return;
    Alert.alert("Hapus Wallet", "Yakin ingin menghapus wallet ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await onDelete(initialData.id);
            onClose();
          } catch (err: any) {
            Alert.alert("Error", err.message);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <Header
            title="Add New Wallet"
            style={{
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              marginBottom: spacingY._10,
            }}
            rightIcon={
              <TouchableOpacity onPress={onClose}>
                <Typo style={styles.closeText}>✕</Typo>
              </TouchableOpacity>
            }
          />

          {/* Input */}
          <Input
            placeholder="Nama Wallet"
            value={name}
            onChangeText={setName}
          />

          {/* Save / Update Button */}
          <View style={styles.footer}>
            {/* Delete Button (Only Edit Mode) */}
            {isEditing && onDelete && (
              <Button onPress={handleDelete} style={styles.deleteButton}>
                <IconComponent
                  item={{ icon: "trash" } as any}
                  size={verticalScale(20)}
                  color={colors.neutral100}
                />
              </Button>
            )}
            <Button
              onPress={handleSubmit}
              style={styles.saveButton}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Typo size={16} color="#fff" fontWeight="600">
                  {isEditing ? "Simpan Perubahan" : "Tambah Wallet"}
                </Typo>
              )}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modal: {
    backgroundColor: colors.neutral900,
    borderTopLeftRadius: radius._20,
    borderTopRightRadius: radius._20,
    padding: spacingY._25,
  },
  imageWrapper: {
    alignSelf: "center",
    position: "relative",
    marginTop: spacingY._10,
  },
  placeholder: {
    width: 90,
    height: 90,
    borderRadius: radius._20,
    backgroundColor: colors.neutral800,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.neutral700,
  },
  iconImage: {
    width: 90,
    height: 90,
    borderRadius: radius._20,
    backgroundColor: colors.neutral700,
  },
  uploadIndicator: {
    position: "absolute",
    alignSelf: "center",
    top: "40%",
  },
  closeText: { fontSize: 20, color: "#888" },
  saveButton: {
    flex: 1,
    // marginTop: spacingY._20,
    // backgroundColor: colors.primary,
  },
  deleteButton: {
    paddingHorizontal: spacingX._15,
    backgroundColor: colors.rose,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._15,
    marginBottom: spacingY._5,
  },
});
