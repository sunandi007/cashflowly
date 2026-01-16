import { useState } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from "react-native";
import ScreenWrapper from "@/components/ScreenWrapper";
import Header from "@/components/Header";
import Typo from "@/components/Typo";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacingX, spacingY } from "@/constant/theme";
import { scale, verticalScale } from "@/utils/styling";
import { useNavigation } from "@react-navigation/native";
import { useTags } from "@/hooks/useTags";
import TagModal from "@/components/TagModal";
import { TagType } from "@/types/model";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TagListScreen() {
    const navigation = useNavigation();
    const { tags, isLoading, addTag, updateTag, deleteTag } = useTags();
    const { t } = useLanguage();

    const [showModal, setShowModal] = useState(false);
    const [selectedTag, setSelectedTag] = useState<TagType | null>(null);

    const handleEdit = (tag: TagType) => {
        setSelectedTag(tag);
        setShowModal(true);
    };

    const handleCreate = () => {
        setSelectedTag(null);
        setShowModal(true);
    };

    const renderTagItem = ({ item }: { item: TagType }) => {
        return (
            <View style={styles.tagItem}>
                <View style={styles.tagLeft}>
                    <View style={styles.iconWrapper}>
                        <Typo size={20} fontWeight="700" color={colors.neutral400}>#</Typo>
                    </View>
                    <View>
                        <Typo size={16} fontWeight="600" color={colors.white}>
                            {item.name}
                        </Typo>
                        <Typo size={12} color={colors.neutral500} style={{ marginTop: 2 }}>
                            {item.usage_count ? t('tags.transactionCount', { count: item.usage_count }) : t('tags.noTransactions')}
                        </Typo>
                    </View>
                </View>

                <View style={styles.tagRight}>
                    <TouchableOpacity
                        onPress={() => handleEdit(item)}
                        style={styles.actionButton}
                    >
                        <Ionicons name="pencil" size={18} color={colors.neutral400} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => deleteTag.mutate(item.id)}
                        style={styles.actionButton}
                    >
                        <Ionicons name="trash" size={18} color={colors.neutral400} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <ScreenWrapper style={styles.container}>
            {/* Header */}
            <Header
                title={t('tags.title')}
                showBack
                rightComponent={
                    <TouchableOpacity
                        onPress={() => {
                            handleCreate();
                        }}>
                        <Ionicons name="add-circle-outline" size={scale(28)} color={colors.white} />
                    </TouchableOpacity>

                }
            />

            <View style={styles.content}>
                <Typo size={13} color={colors.neutral400} style={styles.sectionLabel}>
                    {t('tags.myTags')}
                </Typo>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={tags}
                        keyExtractor={(item) => item.id}
                        renderItem={renderTagItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="pricetags-outline" size={48} color={colors.neutral700} />
                                <Typo size={14} color={colors.neutral500} style={{ marginTop: 10 }}>
                                    {t('tags.noTags')}
                                </Typo>
                            </View>
                        }
                    />
                )}
            </View>

            {/* Modal */}
            <TagModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                initialData={selectedTag}
                onSave={(name) => addTag.mutate(name)}
                onUpdate={(payload) => updateTag.mutate(payload)}
                onDelete={(id) => deleteTag.mutate(id)}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral900,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacingX._20,
    },
    sectionLabel: {
        marginVertical: verticalScale(15),
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    listContent: {
        paddingBottom: verticalScale(80),
        gap: verticalScale(12),
    },
    loadingContainer: {
        paddingTop: verticalScale(50),
        alignItems: "center",
    },
    emptyContainer: {
        paddingTop: verticalScale(50),
        alignItems: "center",
        justifyContent: "center",
    },

    // Tag Item
    tagItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.neutral800,
        paddingVertical: verticalScale(16),
        paddingHorizontal: spacingX._15,
        borderRadius: radius._20,
        borderWidth: 1,
        borderColor: colors.neutral800,
    },
    tagLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: scale(14),
        flex: 1,
    },
    iconWrapper: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: colors.neutral700,
        alignItems: "center",
        justifyContent: "center",
    },
    tagRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: scale(10),
    },
    actionButton: {
        width: scale(36),
        height: scale(36),
        alignItems: "center",
        justifyContent: "center",
    },

    // FAB
    fab: {
        position: "absolute",
        bottom: verticalScale(30),
        right: spacingX._20,
        width: scale(56),
        height: scale(56),
        borderRadius: scale(28),
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
