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
import { useSnackbar } from "@/hooks/useSnackbar";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
    const isEditing = !!initialData;
    const [name, setName] = useState(initialData?.name || "");
    const [loading, setLoading] = useState(false);
    const snackbar = useSnackbar();

    useEffect(() => {
        if (visible && initialData) setName(initialData.name || "");
        if (!visible) setName("");
    }, [visible, initialData]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            snackbar.error(t('common.error'), t('tags.modal.errors.nameRequired'));
            return;
        }

        setLoading(true);
        try {
            if (isEditing && onUpdate) {
                await onUpdate({
                    id: initialData.id,
                    name: name.trim(),
                });
                snackbar.success(t('common.success'), t('tags.modal.success.updated'));
            } else if (onSave) {
                await onSave(name.trim());
                snackbar.success(t('common.success'), t('tags.modal.success.added'));
            }
            onClose();
        } catch (err: any) {
            snackbar.error(t('common.error'), err.message || "An error occurred while saving.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        if (!onDelete || !initialData?.id) return;
        Alert.alert(
            t('tags.modal.deleteConfirmTitle'),
            t('tags.modal.deleteConfirmMessage'),
            [
                { text: t('common.cancel'), style: "cancel" },
                {
                    text: t('common.delete'),
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await onDelete(initialData.id);
                            onClose();
                        } catch (err: any) {
                            snackbar.error(t('common.error'), err.message);
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.handleBar} />
                    {/* Header */}
                    <Header
                        title={isEditing ? t('tags.modal.editTitle') : t('tags.modal.addTitle')}
                        style={styles.header}
                        rightIcon={
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color={colors.neutral400} />
                            </TouchableOpacity>
                        }
                    />

                    {/* Input */}
                    <Input
                        placeholder={t('tags.modal.placeholder')}
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
                                    {isEditing ? t('tags.modal.saveChanges') : t('tags.addTag')}
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
        borderRadius: 2, alignSelf: 'center', marginTop: -5, marginBottom: 20
    },
    saveButton: {
        flex: 1,
        borderRadius: radius._30,
    },
    deleteButton: {
        paddingHorizontal: spacingX._15,
        backgroundColor: colors.rose,
        borderRadius: radius._30,
    },
    footer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        gap: scale(12),
        paddingTop: spacingY._10,
    },
});
