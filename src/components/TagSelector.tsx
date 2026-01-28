// src/components/TagSelector.tsx

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import Typo from './Typo';
import { colors, radius, spacingX, spacingY } from '@/constant/theme';
import { useTags } from '@/hooks/useTags';
import { Ionicons } from '@expo/vector-icons';

interface TagSelectorProps {
    selectedTagIds: string[];
    onToggleTag: (id: string) => void;
}

export default function TagSelector({ selectedTagIds, onToggleTag }: TagSelectorProps) {
    const { tags, addTag } = useTags();
    const [newTagName, setNewTagName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddTag = async () => {
        if (!newTagName.trim()) return;
        try {
            const newTag = await addTag.mutateAsync(newTagName.trim());
            onToggleTag(newTag.id); // Otomatis pilih tag baru
            setNewTagName('');
            setIsAdding(false);
        } catch (e) {
            console.error(e);
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
                {isAdding ? (
                    <View style={[styles.tagChip, styles.inputChip]}>
                        <TextInput
                            value={newTagName}
                            onChangeText={setNewTagName}
                            placeholder="Nama Tag..."
                            placeholderTextColor={colors.neutral500}
                            style={styles.input}
                            autoFocus
                            onSubmitEditing={handleAddTag}
                            onBlur={() => setIsAdding(false)} // Batal jika lepas fokus
                        />
                    </View>
                ) : (
                    <TouchableOpacity style={[styles.tagChip, styles.addBtn]} onPress={() => setIsAdding(true)}>
                        <Ionicons name="add" size={14} color={colors.neutral300} />
                        <Typo size={12} color={colors.neutral300}>New</Typo>
                    </TouchableOpacity>
                )}
            </View>
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
    inputChip: {
        minWidth: 80,
        paddingVertical: 2, // Sesuaikan padding input
    },
    input: {
        color: colors.white,
        fontSize: 12,
        padding: 0,
    }
});