import { useEffect, useState } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { colors, radius, spacingX, spacingY } from "@/constant/theme";
import { useAlert } from "@/hooks/useAlert";
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
  const alert = useAlert();

  useEffect(() => {
    if (visible && initialData) setName(initialData.name || "");
    if (!visible) setName("");
  }, [visible, initialData]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Error", "Nama wallet wajib diisi.", undefined, { type: 'error' });
      return;
    }

    setLoading(true);
    try {
      if (isEditing && onUpdate) {
        await onUpdate({
          id: initialData.id,
          updates: { name: name.trim() },
        });
        alert("Berhasil 🎉", "Perubahan wallet berhasil disimpan.", undefined, { type: 'success' });
      } else if (onSave) {
        await onSave({ name: name.trim() });
        alert("Sukses 🎉", "Wallet baru berhasil ditambahkan.", undefined, { type: 'success' });
      }
      onClose();
    } catch (err: any) {
      alert(
        "Gagal 😞",
        err.message || "Terjadi kesalahan saat menyimpan data.",
        undefined,
        { type: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!onDelete || !initialData?.id) return;
    alert("Hapus Wallet", "Yakin ingin menghapus wallet ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        onPress: async () => {
          setLoading(true);
          try {
            await onDelete(initialData.id);
            onClose();
          } catch (err: any) {
            alert("Error", err.message, undefined, { type: 'error' });
          } finally {
            setLoading(false);
          }
        },
      },
    ], { type: 'warning' });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Handle Bar */}
          <View style={styles.handleBar} />
          {/* Header */}
          <Header
            title={isEditing ? "Edit Wallet" : "Add New Wallet"}
            showClose
            onClose={onClose}
            style={styles.header}
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
    padding: spacingY._20,
  },
  header: {
    marginBottom: verticalScale(20),
    paddingHorizontal: 0,
    paddingVertical: 0,
    minHeight: 0,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral800,
  },
  handleBar: {
    width: 40, height: 4, backgroundColor: colors.neutral700,
    borderRadius: 2, alignSelf: 'center', marginTop: -4, marginBottom: 10
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
  saveButton: {
    flex: 1,
    backgroundColor: colors.accentGreen,
    borderRadius: 30,
    height: 47,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  deleteButton: {
    paddingHorizontal: spacingX._15,
    backgroundColor: colors.rose,
    borderRadius: 30,
    height: 47,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: spacingX._7,
    gap: scale(12),
    paddingTop: spacingY._15,
    marginBottom: spacingY._5,
  },
});
