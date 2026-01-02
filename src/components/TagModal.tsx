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
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale } from "@/utils/styling";

export default function TagModal({
    visible,
    onClose,
    onSave,
    onUpdate,
    onDelete,
    initialData,
}: {
    visible: boolean;
    onClose: () => void;
    onSave?: (name: string) => void;
    onUpdate?: (payload: { id: string; name: string }) => void;
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
            Alert.alert("Error", "Tag name is required.");
            return;
        }

        setLoading(true);
        try {
            if (isEditing && onUpdate) {
                await onUpdate({
                    id: initialData.id,
                    name: name.trim(),
                });
                // Alert.alert("Success", "Tag updated successfully.");
            } else if (onSave) {
                await onSave(name.trim());
                // Alert.alert("Success", "New tag added successfully.");
            }
            onClose();
        } catch (err: any) {
            Alert.alert(
                "Error",
                err.message || "An error occurred while saving."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        if (!onDelete || !initialData?.id) return;
        Alert.alert("Delete Tag", "Are you sure you want to delete this tag?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
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
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Header */}
                    <Header
                        title={isEditing ? "Edit Tag" : "Add New Tag"}
                        style={{
                            alignItems: "center",
                            flexDirection: "row",
                            justifyContent: "center",
                            marginBottom: spacingY._10,
                        }}
                        rightIcon={
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color={colors.neutral400} />
                            </TouchableOpacity>
                        }
                    />

                    {/* Input */}
                    <Input
                        placeholder="Tag Name (e.g. Groceries)"
                        value={name}
                        onChangeText={setName}
                        containerStyle={{ marginBottom: spacingY._20 }}
                    />

                    {/* Save / Update Button */}
                    <View style={styles.footer}>
                        {/* Delete Button (Only Edit Mode) */}
                        {isEditing && onDelete && (
                            <Button onPress={handleDelete} style={styles.deleteButton}>
                                <Ionicons name="trash-outline" size={20} color={colors.white} />
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
                                    {isEditing ? "Save Changes" : "Add Tag"}
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
        backgroundColor: "rgba(0,0,0,0.6)",
    },
    modal: {
        backgroundColor: colors.neutral900,
        borderTopLeftRadius: radius._20,
        borderTopRightRadius: radius._20,
        padding: spacingY._25,
        borderTopWidth: 1,
        borderTopColor: colors.neutral800,
    },
    saveButton: {
        flex: 1,
    },
    deleteButton: {
        paddingHorizontal: spacingX._15,
        backgroundColor: colors.rose,
    },
    footer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        gap: scale(12),
        paddingTop: spacingY._10,
    },
});
