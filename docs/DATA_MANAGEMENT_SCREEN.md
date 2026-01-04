# Data Management Screen

## Overview
The Data Management Screen provides users with tools to export and import their financial data in CSV format. This feature is essential for:
- Backing up transaction data
- Migrating data from other financial apps
- Data analysis in external tools (Excel, Google Sheets, etc.)

## Features

### 1. Export Data
**What it does:** Allows users to export their transaction data to a CSV file.

**Components:**
- **Date Range Picker**: Select start and end dates to filter which transactions to export
- **Export Button**: Large primary button with download icon to trigger the export

**Usage:**
1. Tap on the Start Date field to select the beginning of your desired date range
2. Tap on the End Date field to select the end of your desired date range
3. Tap "Export to CSV" button to download the file

### 2. Import Data
**What it does:** Allows users to import transaction data from a CSV file.

**Components:**
- **Instructions**: Helpful text guiding users to download the template
- **Download Template Button**: Secondary button to get the CSV template format
- **Upload Area**: Large dashed-border area for file selection
- **Data Preview Table**: Shows a preview of the data before importing (appears after file selection)
- **Confirm Import Button**: Finalizes the import process

**Usage:**
1. Tap "Download Template" to get the correct CSV format
2. Fill in your data following the template format (Date, Category, Amount columns)
3. Tap the upload area to select your CSV file
4. Review the data in the preview table
5. Tap "Confirm Import" to complete the import

## Navigation

Access the Data Management screen from:
- **Profile Screen** → Tap "Data Management" option

You can also navigate programmatically:
```typescript
navigation.navigate("DataManagement" as never);
```

## Design Features

### Dark Mode Styling
- Background: `colors.neutral900` (#171717)
- Cards: `colors.neutral800` (#262626) 
- Borders: `colors.neutral700` (#404040)
- Primary accent: `colors.primary` (#67C090)

### Visual Elements
- **Rounded corners**: Modern, friendly appearance using `borderRadius: radius._17`
- **Dashed border upload area**: Clear visual indicator for file upload zone
- **Icon-enhanced buttons**: Download and upload icons for better UX
- **Preview table**: Clean, organized data display before import

## Technical Implementation

### Dependencies
- `expo-document-picker`: For CSV file selection
- `@react-native-community/datetimepicker`: For date range selection
- `date-fns`: For date formatting

### File Structure
```
src/
  screens/
    DataManagementScreen.tsx  # Main screen component
  navigation/
    RootNavigation.tsx        # Screen added to navigation stack
  constant/
    data.ts                   # Menu option added to profile settings
```

## Future Enhancements

Potential improvements for production:
1. **Actual CSV Export**: Implement real CSV file generation from transaction data
2. **CSV Parser**: Parse uploaded CSV files and validate data
3. **Error Handling**: Better error messages for invalid CSV formats
4. **Progress Indicators**: Show progress during large file imports/exports
5. **Data Validation**: Validate categories, amounts, and dates before import
6. **Conflict Resolution**: Handle duplicate transactions during import
7. **File Size Limits**: Prevent importing files that are too large
8. **Export Filters**: Additional filters (category, amount range, etc.)

## Mock Data

Currently, the screen uses mock functionality:
- Export shows an alert with the selected date range
- Import shows a preview with sample data (3 rows)
- Template download shows an informational alert

Replace these with actual implementation when connecting to your backend/database.

## Styling Customization

All colors and spacing follow your app's theme system from `src/constant/theme.ts`:
- `colors.*` - Color palette
- `spacingX.*`, `spacingY.*` - Responsive spacing
- `radius.*` - Border radius values

To customize, simply update the theme file and the changes will reflect automatically.
