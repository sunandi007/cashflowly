import React, { useState } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Platform,
    ActivityIndicator,
    Modal,
} from "react-native";
import ScreenWrapper from "@/components/ScreenWrapper";
import Header from "@/components/Header";
import Typo from "@/components/Typo";
import Button from "@/components/Button";
import { colors, radius, spacingX, spacingY } from "@/constant/theme";
import { scale, verticalScale } from "@/utils/styling";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import CsvService from "@/services/CsvService";
import { useAuth } from "@/hooks/useAuth";
import { useSnackbar } from "@/hooks/useSnackbar";

const DataManagementScreen = () => {
    const { session } = useAuth();
    const snackbar = useSnackbar();
    const [isLoading, setIsLoading] = useState(false);

    // Export Data State
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // Import Data State
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
    const [importPreview, setImportPreview] = useState<any[]>([]);
    const [showPreview, setShowPreview] = useState(false);

    // --- LOGIC: EXPORT ---
    const handleExportCSV = async () => {
        setIsLoading(true);
        // Set jam ke akhir hari untuk endDate agar mencakup transaksi hari itu
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);

        const result = await CsvService.exportData(startDate, endOfDay);
        setIsLoading(false);

        if (result.success) {
            snackbar.success("Success", "Data exported successfully!");
        } else {
            snackbar.error("Export Failed", result.message);
        }
    };

    // --- LOGIC: DOWNLOAD TEMPLATE ---
    const handleDownloadTemplate = async () => {
        setIsLoading(true);
        await CsvService.downloadTemplate();
        setIsLoading(false);
    };

    // --- LOGIC: PICK FILE ---
    const handleFileSelect = async () => {
        try {
            const data = await CsvService.pickAndParseCsv();
            if (data && data.rows) {
                setImportPreview(data.rows);
                setSelectedFileName(data.fileName || null);
                setShowPreview(true);
                Alert.alert("File Loaded", `${data.rows.length} rows found.`);
            }
        } catch (error) {
            snackbar.error("Error", "Failed to parse CSV file.");
        }
    };

    // --- LOGIC: CONFIRM IMPORT ---
    const handleConfirmImport = async () => {
        if (!session?.user?.id) return;
        setIsLoading(true);

        const { successCount, errors } = await CsvService.processImport(
            importPreview,
            session.user.id
        );

        setIsLoading(false);

        let message = `Successfully imported ${successCount} transactions.`;
        if (errors.length > 0) {
            message += `\n\n${errors.length} Errors occurred:\n` + errors.slice(0, 3).join('\n');
            if (errors.length > 3) message += '\n...and more.';
        }

        Alert.alert(
            errors.length === 0 ? "Import Complete" : "Import Completed with Errors",
            message,
            [
                {
                    text: "OK",
                    onPress: () => {
                        // Reset state on success
                        if (successCount > 0) {
                            setImportPreview([]);
                            setSelectedFileName(null);
                            setShowPreview(false);
                        }
                    },
                },
            ]
        );
    };

    // Date Picker Handlers
    const onStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartPicker(Platform.OS === "ios");
        if (selectedDate) setStartDate(selectedDate);
    };

    const onEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndPicker(Platform.OS === "ios");
        if (selectedDate) setEndDate(selectedDate);
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <Header
                    title="Data Management"
                    showBack
                    style={{ paddingHorizontal: 0, marginBottom: spacingY._20 }}
                />

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* SECTION 1: EXPORT DATA */}
                    <View style={styles.section}>
                        <Typo
                            size={18}
                            fontWeight="600"
                            color={colors.neutral100}
                            style={styles.sectionTitle}
                        >
                            Export Data
                        </Typo>

                        <View style={styles.card}>
                            <View style={styles.dateRangeContainer}>
                                {/* Start Date */}
                                <View style={styles.datePickerWrapper}>
                                    <Typo
                                        size={12}
                                        color={colors.neutral400}
                                        style={styles.label}
                                    >
                                        Start Date
                                    </Typo>
                                    <TouchableOpacity
                                        style={styles.dateInput}
                                        onPress={() => setShowStartPicker(true)}
                                    >
                                        <Ionicons
                                            name="calendar-outline"
                                            size={20}
                                            color={colors.primary}
                                        />
                                        <Typo size={14} color={colors.neutral100}>
                                            {format(startDate, "MMM dd, yyyy")}
                                        </Typo>
                                    </TouchableOpacity>
                                </View>

                                {/* End Date */}
                                <View style={styles.datePickerWrapper}>
                                    <Typo
                                        size={12}
                                        color={colors.neutral400}
                                        style={styles.label}
                                    >
                                        End Date
                                    </Typo>
                                    <TouchableOpacity
                                        style={styles.dateInput}
                                        onPress={() => setShowEndPicker(true)}
                                    >
                                        <Ionicons
                                            name="calendar-outline"
                                            size={20}
                                            color={colors.primary}
                                        />
                                        <Typo size={14} color={colors.neutral100}>
                                            {format(endDate, "MMM dd, yyyy")}
                                        </Typo>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Button onPress={handleExportCSV} style={styles.exportButton}>
                                <View style={styles.buttonContent}>
                                    <Ionicons
                                        name="download-outline"
                                        size={20}
                                        color={colors.black}
                                    />
                                    <Typo size={16} fontWeight="600" color={colors.black}>
                                        Export to CSV
                                    </Typo>
                                </View>
                            </Button>

                            {showStartPicker && (
                                <DateTimePicker
                                    value={startDate}
                                    mode="date"
                                    display={Platform.OS === "ios" ? "spinner" : "default"}
                                    onChange={onStartDateChange}
                                    maximumDate={endDate}
                                    // @ts-ignore
                                    themeVariant="dark"
                                />
                            )}

                            {showEndPicker && (
                                <DateTimePicker
                                    value={endDate}
                                    mode="date"
                                    display={Platform.OS === "ios" ? "spinner" : "default"}
                                    onChange={onEndDateChange}
                                    minimumDate={startDate}
                                    // @ts-ignore
                                    themeVariant="dark"
                                />
                            )}
                        </View>
                    </View>

                    {/* SECTION 2: IMPORT DATA */}
                    <View style={styles.section}>
                        <Typo
                            size={18}
                            fontWeight="600"
                            color={colors.neutral100}
                            style={styles.sectionTitle}
                        >
                            Import Data
                        </Typo>

                        <View style={styles.card}>
                            <Typo
                                size={14}
                                color={colors.neutral400}
                                style={styles.instructions}
                            >
                                Use our template to import data from other apps
                            </Typo>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={handleDownloadTemplate}
                            >
                                <Ionicons
                                    name="document-text-outline"
                                    size={20}
                                    color={colors.primary}
                                />
                                <Typo size={15} fontWeight="500" color={colors.primary}>
                                    Download Template
                                </Typo>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.uploadArea}
                                onPress={handleFileSelect}
                            >
                                <View style={styles.uploadIconContainer}>
                                    <Ionicons
                                        name="cloud-upload-outline"
                                        size={40}
                                        color={colors.primary}
                                    />
                                </View>
                                <Typo
                                    size={16}
                                    fontWeight="500"
                                    color={colors.neutral100}
                                    style={{ marginTop: spacingY._10 }}
                                >
                                    {selectedFileName ? selectedFileName : "Tap to Upload CSV"}
                                </Typo>
                                {selectedFileName && (
                                    <Typo size={12} color={colors.neutral500}>
                                        Ready to preview
                                    </Typo>
                                )}
                            </TouchableOpacity>

                            {/* Data Preview Section */}
                            {showPreview && importPreview.length > 0 && (
                                <View style={styles.previewSection}>
                                    <Typo
                                        size={16}
                                        fontWeight="600"
                                        color={colors.neutral100}
                                        style={styles.previewTitle}
                                    >
                                        Data Preview (First 5 Rows)
                                    </Typo>

                                    {/* Table Header */}
                                    <View style={styles.tableHeader}>
                                        <View style={styles.tableCellDate}>
                                            <Typo
                                                size={13}
                                                fontWeight="600"
                                                color={colors.neutral400}
                                            >
                                                Date
                                            </Typo>
                                        </View>
                                        <View style={styles.tableCellCategory}>
                                            <Typo
                                                size={13}
                                                fontWeight="600"
                                                color={colors.neutral400}
                                            >
                                                Category
                                            </Typo>
                                        </View>
                                        <View style={styles.tableCellAmount}>
                                            <Typo
                                                size={13}
                                                fontWeight="600"
                                                color={colors.neutral400}
                                                style={{ textAlign: "right" }}
                                            >
                                                Amount
                                            </Typo>
                                        </View>
                                    </View>

                                    {/* Table Rows - Limit to 5 for UI */}
                                    {importPreview.slice(0, 5).map((row, index) => (
                                        <View key={index} style={styles.tableRow}>
                                            <View style={styles.tableCellDate}>
                                                <Typo size={13} color={colors.neutral100}>
                                                    {/* Handle string date from CSV */}
                                                    {row.Date}
                                                </Typo>
                                            </View>
                                            <View style={styles.tableCellCategory}>
                                                <Typo size={13} color={colors.neutral100}>
                                                    {row.Category}
                                                </Typo>
                                            </View>
                                            <View style={styles.tableCellAmount}>
                                                <Typo
                                                    size={13}
                                                    fontWeight="600"
                                                    color={colors.primary}
                                                    style={{ textAlign: "right" }}
                                                >
                                                    {row.Amount}
                                                </Typo>
                                            </View>
                                        </View>
                                    ))}

                                    <Button
                                        onPress={handleConfirmImport}
                                        style={styles.confirmButton}
                                    >
                                        <Typo size={16} fontWeight="600" color={colors.black}>
                                            Confirm Import
                                        </Typo>
                                    </Button>
                                </View>
                            )}
                        </View>
                    </View>
                </ScrollView>

                {/* Loading Overlay */}
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                )}
            </View>
        </ScreenWrapper>
    );
};

export default DataManagementScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacingX._20,
    },
    scrollContent: {
        paddingBottom: spacingY._30,
    },
    section: {
        marginBottom: spacingY._25,
    },
    sectionTitle: {
        marginBottom: spacingY._15,
    },
    card: {
        backgroundColor: colors.neutral800,
        borderRadius: radius._17,
        borderCurve: "continuous",
        padding: spacingX._20,
        borderWidth: 1,
        borderColor: colors.neutral700,
    },

    // Date Range Styles
    dateRangeContainer: {
        flexDirection: "row",
        gap: spacingX._12,
        marginBottom: spacingY._20,
    },
    datePickerWrapper: {
        flex: 1,
    },
    label: {
        marginBottom: spacingY._7,
    },
    dateInput: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacingX._10,
        backgroundColor: colors.neutral900,
        paddingHorizontal: spacingX._15,
        paddingVertical: spacingY._12,
        borderRadius: radius._12,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: colors.neutral700,
    },

    // Button Styles
    exportButton: {
        marginTop: spacingY._10,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacingX._10,
    },
    secondaryButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacingX._10,
        backgroundColor: colors.neutral900,
        paddingVertical: spacingY._12,
        borderRadius: radius._12,
        borderCurve: "continuous",
        borderWidth: 1.5,
        borderColor: colors.primary,
        marginBottom: spacingY._20,
    },

    // Import Section Styles
    instructions: {
        marginBottom: spacingY._15,
        lineHeight: 20,
    },
    uploadArea: {
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: colors.neutral600,
        borderRadius: radius._17,
        borderCurve: "continuous",
        paddingVertical: spacingY._40,
        paddingHorizontal: spacingX._20,
        alignItems: "center",
        backgroundColor: colors.neutral900 + "40",
    },
    uploadIconContainer: {
        width: verticalScale(70),
        height: verticalScale(70),
        borderRadius: radius._30,
        backgroundColor: colors.primary + "20",
        justifyContent: "center",
        alignItems: "center",
    },

    // Preview Section Styles
    previewSection: {
        marginTop: spacingY._25,
        paddingTop: spacingY._25,
        borderTopWidth: 1,
        borderTopColor: colors.neutral700,
    },
    previewTitle: {
        marginBottom: spacingY._15,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: colors.neutral900,
        paddingVertical: spacingY._12,
        paddingHorizontal: spacingX._15,
        borderRadius: radius._10,
        borderCurve: "continuous",
        marginBottom: spacingY._10,
    },
    tableRow: {
        flexDirection: "row",
        paddingVertical: spacingY._15,
        paddingHorizontal: spacingX._15,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral700,
    },
    tableCellDate: {
        flex: 1.2,
    },
    tableCellCategory: {
        flex: 1,
    },
    tableCellAmount: {
        flex: 0.8,
        alignItems: "flex-end",
    },
    confirmButton: {
        marginTop: spacingY._20,
    },
    // Loading Overlay
    loadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
    },
});