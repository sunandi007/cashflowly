import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, SectionList, StatusBar } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import Header from '@/components/Header';
import { colors, spacingX, radius } from '@/constant/theme';
import { scale, verticalScale } from '@/utils/styling';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import Typo from '@/components/Typo';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/hooks/useAuth';
import TransactionItem from '@/components/TransactionItem';
import WalletAddModal from '@/components/WalletModal';
import { useWallets } from '@/hooks/useWallets';

export default function WalletDetailScreen() {
    const route = useRoute();
    const navigation = useNavigation<any>();
    const { wallet } = route.params as { wallet: any } || {};
    const { session } = useAuth();
    const userId = session?.user?.id;

    const [showAdd, setShowAdd] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState<any>(null);

    const { wallets, totalBalance, addWallet, updateWallet, deleteWallet } =
        useWallets();


    // Use specific hook for transactions
    const { data: allTransactions = [] } = useTransactions(userId, 'all');

    // Filter transactions for this wallet
    const walletTransactions = useMemo(() => {
        if (!wallet) return [];
        return allTransactions.filter((t: any) => {
            if (t.is_transfer) {
                // Match by wallet name (as useTransactions currently returns names for transfers)
                // Filter where this wallet is either source or destination
                return t.from_wallet === wallet.name || t.to_wallet === wallet.name;
            }
            // Normal transaction: match by wallet_id
            return t.wallet_id === wallet.id;
        });
    }, [allTransactions, wallet]);

    // Calculate Statistics (Income vs Expense)
    const stats = useMemo(() => {
        let income = 0;
        let expense = 0;

        walletTransactions.forEach((t: any) => {
            const amount = Number(t.amount) || 0;
            if (t.is_transfer) {
                if (t.to_wallet === wallet?.name) {
                    income += amount; // Receiving money
                } else if (t.from_wallet === wallet?.name) {
                    expense += amount; // Sending money
                }
            } else {
                if (t.type === 'income') income += amount;
                if (t.type === 'expense') expense += amount;
            }
        });
        return { income, expense };
    }, [walletTransactions, wallet]);

    // Group Transactions by Date (Today, Yesterday, etc.)
    const sections = useMemo(() => {
        const groups: Record<string, any[]> = {};

        walletTransactions.forEach((t: any) => {
            const date = new Date(t.date || t.created_at);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);

            let title = date.toLocaleDateString("id-ID", { month: 'long', day: 'numeric', year: 'numeric' });

            if (date.toDateString() === today.toDateString()) title = "Today";
            else if (date.toDateString() === yesterday.toDateString()) title = "Yesterday";

            if (!groups[title]) {
                groups[title] = [];
            }
            groups[title].push(t);
        });

        return Object.keys(groups).map(date => ({
            title: date,
            data: groups[date]
        }));
    }, [walletTransactions]);

    // Format Currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const handleEditWallet = () => {
        setSelectedWallet(wallet as any);
        setShowAdd(true);
    };

    return (
        <ScreenWrapper style={styles.container}>
            <Header
                title="Wallet Details"
                leftIcon={
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.white} />
                    </TouchableOpacity>
                }
                rightIcon={
                    <TouchableOpacity>
                        <Ionicons name="ellipsis-vertical" size={24} color={colors.white} />
                    </TouchableOpacity>
                }
            />

            {/* Wallet Info Header */}
            <View style={styles.walletHeader}>
                <View style={styles.iconContainer}>
                    <Ionicons name="business" size={40} color={colors.primary} />
                </View>
                <Typo size={12} color={colors.neutral400} style={{ letterSpacing: 1, marginTop: 10 }}>
                    {wallet?.name?.toUpperCase() || "WALLET"}
                </Typo>
                <Typo size={36} fontWeight="700" color={colors.white} style={{ marginVertical: 5 }}>
                    {formatCurrency(wallet?.balance || 0)}
                </Typo>

                <TouchableOpacity style={styles.editButton} onPress={handleEditWallet}>
                    <Ionicons name="pencil" size={14} color={colors.white} />
                    <Typo size={14} fontWeight="600" color={colors.white}>Edit Wallet</Typo>
                </TouchableOpacity>
            </View>

            {/* Stats Overview */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Typo size={12} color={colors.neutral400} style={{ marginBottom: 5 }}>INCOME</Typo>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typo size={20} fontWeight="700" color={colors.white}>{formatCurrency(stats.income)}</Typo>
                        <Ionicons name="arrow-down-outline" size={16} color={colors.primary} />
                    </View>
                    <Typo size={12} color={colors.primary} style={{ marginTop: 5 }}>+12%</Typo>
                </View>
                <View style={styles.statCard}>
                    <Typo size={12} color={colors.neutral400} style={{ marginBottom: 5 }}>EXPENSE</Typo>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typo size={20} fontWeight="700" color={colors.white}>{formatCurrency(stats.expense)}</Typo>
                        <Ionicons name="arrow-up-outline" size={16} color={colors.rose} />
                    </View>
                    <Typo size={12} color={colors.rose} style={{ marginTop: 5 }}>-5%</Typo>
                </View>
            </View>

            {/* Transactions List */}
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <TransactionItem item={item} index={index} onEditPress={(item) => navigation.navigate('TransactionScreen', { initialData: item } as any)} />
                )}
                renderSectionHeader={({ section: { title } }) => (
                    <View style={styles.sectionHeader}>
                        <Typo size={16} fontWeight="600" color={colors.white}>{title}</Typo>
                        <Typo size={12} color={colors.neutral400}>{sections.find(s => s.title === title)?.data.length} transactions</Typo>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 50, paddingHorizontal: spacingX._20 }}
                stickySectionHeadersEnabled={false}
                style={{ flex: 1 }}
            />

            <WalletAddModal
                visible={showAdd}
                onClose={() => setShowAdd(false)}
                onSave={(payload) => addWallet.mutate(payload)}
                onUpdate={(payload) => updateWallet.mutate(payload)}
                onDelete={(id) => deleteWallet.mutate(id)}
                initialData={selectedWallet}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral900,
    },
    walletHeader: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: colors.neutral800,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.neutral700,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral800,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        gap: 8,
        marginTop: 15,
        borderWidth: 1,
        borderColor: colors.neutral700
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: spacingX._20,
        gap: 15,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.neutral800,
        borderRadius: 20,
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    }
});


