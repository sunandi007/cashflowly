// src/components/TagSelector.tsx

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Typo from './Typo';
import { colors, radius, spacingX, spacingY } from '@/constant/theme';
import { useTags } from '@/hooks/useTags';
import { Ionicons } from '@expo/vector-icons';
import TagModal from './TagModal';

interface TagSelectorProps {
    selectedTagIds: string[];
    onToggleTag: (id: string) => void;
}

export default function TagSelector({ selectedTagIds, onToggleTag }: TagSelectorProps) {
    const { tags, addTag } = useTags();
    const [showModal, setShowModal] = useState(false);

    const handleAddTag = async (name: string) => {
        try {
            const newTag = await addTag.mutateAsync(name);
            onToggleTag(newTag.id); // Otomatis pilih tag baru
            setShowModal(false);
        } catch (error) {
            // Error akan ditangani oleh TagModal (via snackbar)
            // Modal tidak akan close jika ada error
            throw error;
        }
    };

    return (
        <View style={styles.container}>
            <Typo size={14} color={colors.neutral400} style={{ marginBottom: 10 }}>
                Tags (Opsional):
            </Typo>

            <View style={styles.tagsWrapper}>
                {/* List Tag yang Ada */}
                {tags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                        <TouchableOpacity
                            key={tag.id}
                            style={[styles.tagChip, isSelected && styles.tagChipSelected]}
                            onPress={() => onToggleTag(tag.id)}
                        >
                            <Typo size={12} color={isSelected ? colors.black : colors.neutral300}>
                                #{tag.name}
                            </Typo>
                        </TouchableOpacity>
                    );
                })}

                {/* Tombol Tambah Tag */}
                <TouchableOpacity
                    style={[styles.tagChip, styles.addBtn]}
                    onPress={() => setShowModal(true)}
                >
                    <Ionicons name="add" size={14} color={colors.neutral300} />
                    <Typo size={12} color={colors.neutral300}>New</Typo>
                </TouchableOpacity>
            </View>

            {/* Tag Modal */}
            <TagModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleAddTag}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: spacingY._10 },
    tagsWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tagChip: {
        borderWidth: 1,
        borderColor: colors.neutral700,
        borderRadius: radius._20,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: colors.neutral800,
    },
    tagChipSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    addBtn: {
        borderStyle: 'dashed',
        borderColor: colors.neutral500,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
});