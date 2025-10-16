import { useState } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { colors, radius, spacingY } from "@/constant/theme";
import Typo from "./Typo";
import Button from "./Button";
import Header from "./Header";
import Input from "./Input";
export default function WalletAddModal({ visible, onClose, onSave }: any) {
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Nama wallet wajib diisi.");
      return;
    }
    onSave({ name: name.trim() });
    setName("");
    onClose();
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

          {/* Save Button */}
          <Button
            onPress={handleSubmit}
            style={{
              marginTop: spacingY._20,
              backgroundColor: colors.primary,
            }}
          >
            <Typo size={16} color="#fff" fontWeight="600">
              Simpan
            </Typo>
          </Button>
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
});
