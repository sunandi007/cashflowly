import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { TransactionType } from '@/types/model';
import { format } from 'date-fns';

export interface PdfExportOptions {
  transactions: TransactionType[];
  filters: {
    period?: string;
    startDate?: Date;
    endDate?: Date;
    category?: string | null;
    categoryName?: string | null;
    walletId?: string | null;
    walletName?: string | null;
    type?: 'income' | 'expense' | 'all';
  };
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
}

export interface PdfExportResult {
  success: boolean;
  uri?: string;
  error?: string;
}

class PdfService {
  /**
   * Format currency to IDR
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format date to Indonesian locale
   */
  private formatDate(date: string | Date): string {
    return format(new Date(date), 'dd/MM/yyyy');
  }

  /**
   * Get filter description text
   */
  private getFilterDescription(filters: PdfExportOptions['filters']): string {
    const parts: string[] = [];

    // Period
    if (filters.period) {
      if (filters.period === 'custom' && filters.startDate && filters.endDate) {
        parts.push(
          `Period: ${this.formatDate(filters.startDate)} - ${this.formatDate(filters.endDate)}`
        );
      } else if (filters.period === 'this_month') {
        parts.push('Period: This Month');
      } else if (filters.period === 'last_month') {
        parts.push('Period: Last Month');
      } else if (filters.period === 'all_time') {
        parts.push('Period: All Time');
      }
    }

    // Wallet
    if (filters.walletName) {
      parts.push(`Wallet: ${filters.walletName}`);
    }

    // Category
    if (filters.categoryName) {
      parts.push(`Category: ${filters.categoryName}`);
    }

    // Type
    if (filters.type && filters.type !== 'all') {
      parts.push(`Type: ${filters.type.charAt(0).toUpperCase() + filters.type.slice(1)}`);
    }

    return parts.length > 0 ? parts.join(' • ') : 'All Transactions';
  }

  /**
   * Generate descriptive filename based on filters
   */
  private generateFilename(filters: PdfExportOptions['filters']): string {
    const dateStr = format(new Date(), 'yyyyMMdd');
    const parts: string[] = ['cashflowly'];

    // Add period to filename
    if (filters.period === 'this_month') {
      parts.push('this_month');
    } else if (filters.period === 'last_month') {
      parts.push('last_month');
    } else if (filters.period === 'custom' && filters.startDate && filters.endDate) {
      const start = format(filters.startDate, 'yyyyMMdd');
      const end = format(filters.endDate, 'yyyyMMdd');
      parts.push(`${start}_${end}`);
    }

    // Add wallet to filename
    if (filters.walletName) {
      const walletSlug = filters.walletName.toLowerCase().replace(/\s+/g, '_');
      parts.push(walletSlug);
    }

    // Add category to filename
    if (filters.categoryName) {
      const categorySlug = filters.categoryName.toLowerCase().replace(/\s+/g, '_');
      parts.push(categorySlug);
    }

    // Add generated date
    parts.push(dateStr);

    return `${parts.join('_')}.pdf`;
  }

  /**
   * Create HTML template for PDF
   */
  private createPdfHtml(options: PdfExportOptions): string {
    const { transactions, filters, summary } = options;
    const filterDesc = this.getFilterDescription(filters);
    const generatedDate = format(new Date(), 'dd/MM/yyyy HH:mm');

    // Transaction rows HTML
    const transactionRows = transactions
      .map(
        (tx) => `
        <tr>
          <td style="padding: 12px 8px; border-bottom: 1px solid #eee; color: #555; font-size: 13px;">
            ${this.formatDate(tx.date)}
          </td>
          <td style="padding: 12px 8px; border-bottom: 1px solid #eee; color: #333; font-size: 13px;">
            ${tx.note || '-'}
          </td>
          <td style="padding: 12px 8px; border-bottom: 1px solid #eee; color: #555; font-size: 13px;">
            ${tx.category?.name || tx.categories?.name || '-'}
          </td>
          <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600; font-size: 13px; color: ${tx.type === 'income' ? '#10b981' : tx.type === 'expense' ? '#ef4444' : '#6b7280'
          };">
            ${tx.type === 'expense' ? '-' : ''}${this.formatCurrency(tx.amount)}
          </td>
        </tr>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              padding: 40px 30px;
              color: #1f2937;
              background: #ffffff;
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 20px;
            }
            
            .header h1 {
              color: #1f2937;
              font-size: 28px;
              margin-bottom: 8px;
              font-weight: 700;
            }
            
            .header .subtitle {
              color: #6b7280;
              font-size: 14px;
              margin-top: 5px;
            }
            
            .filter-info {
              background: #f3f4f6;
              padding: 15px 20px;
              border-radius: 8px;
              margin-bottom: 25px;
              border-left: 4px solid #3b82f6;
            }
            
            .filter-info p {
              color: #374151;
              font-size: 14px;
              margin: 0;
            }
            
            .summary-grid {
              display: flex;
              gap: 15px;
              margin-bottom: 30px;
            }
            
            .summary-card {
              flex: 1;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
            }
            
            .summary-card.income {
              background: #d1fae5;
              border: 1px solid #10b981;
            }
            
            .summary-card.expense {
              background: #fee2e2;
              border: 1px solid #ef4444;
            }
            
            .summary-card.balance {
              background: #dbeafe;
              border: 1px solid #3b82f6;
            }
            
            .summary-card .label {
              font-size: 12px;
              text-transform: uppercase;
              font-weight: 600;
              color: #6b7280;
              margin-bottom: 8px;
              letter-spacing: 0.5px;
            }
            
            .summary-card .amount {
              font-size: 22px;
              font-weight: 700;
            }
            
            .summary-card.income .amount {
              color: #059669;
            }
            
            .summary-card.expense .amount {
              color: #dc2626;
            }
            
            .summary-card.balance .amount {
              color: #2563eb;
            }
            
            .table-container {
              margin-bottom: 30px;
            }
            
            .section-title {
              font-size: 18px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 15px;
              padding-bottom: 8px;
              border-bottom: 2px solid #e5e7eb;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            thead {
              background: #f9fafb;
            }
            
            th {
              padding: 14px 8px;
              text-align: left;
              font-size: 12px;
              font-weight: 600;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 2px solid #e5e7eb;
            }
            
            th:last-child {
              text-align: right;
            }
            
            tbody tr:last-child td {
              border-bottom: none;
            }
            
            .footer {
              margin-top: 40px;
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
            
            .footer p {
              color: #9ca3af;
              font-size: 12px;
            }
            
            .transaction-count {
              background: #f9fafb;
              padding: 10px 15px;
              border-radius: 6px;
              margin-bottom: 15px;
              text-align: center;
            }
            
            .transaction-count p {
              color: #6b7280;
              font-size: 13px;
              margin: 0;
            }
            
            .transaction-count strong {
              color: #1f2937;
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <!-- Header -->
          <div class="header">
            <h1>💰 CashFlowly</h1>
            <p class="subtitle">Transaction Report</p>
          </div>
          
          <!-- Filter Information -->
          <div class="filter-info">
            <p><strong>Filter Applied:</strong> ${filterDesc}</p>
          </div>
          
          <!-- Summary Cards -->
          <div class="summary-grid">
            <div class="summary-card income">
              <div class="label">Total Income</div>
              <div class="amount">${this.formatCurrency(summary.totalIncome)}</div>
            </div>
            <div class="summary-card expense">
              <div class="label">Total Expense</div>
              <div class="amount">${this.formatCurrency(summary.totalExpense)}</div>
            </div>
            <!--<div class="summary-card balance">
              <div class="label">Balance</div>
              <div class="amount">${this.formatCurrency(summary.balance)}</div>
            </div>-->
          </div>
          
          <!-- Transaction Count -->
          <div class="transaction-count">
            <p>Total Transactions: <strong>${transactions.length}</strong></p>
          </div>
          
          <!-- Transaction Table -->
          <div class="table-container">
            <h2 class="section-title">Transaction Details</h2>
            <table>
              <thead>
                <tr>
                  <th style="width: 15%;">Date</th>
                  <th style="width: 35%;">Description</th>
                  <th style="width: 25%;">Category</th>
                  <th style="width: 25%;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${transactionRows}
              </tbody>
            </table>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p>Generated on ${generatedDate}</p>
            <p style="margin-top: 5px;">CashFlowly - Your Personal Finance Manager</p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate and export PDF
   */
  async generateTransactionsPdf(options: PdfExportOptions): Promise<PdfExportResult> {
    try {
      // Validate transactions
      if (!options.transactions || options.transactions.length === 0) {
        return {
          success: false,
          error: 'No transactions to export. Please apply filters to select transactions.',
        };
      }

      // Create HTML content
      const html = this.createPdfHtml(options);

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      // Share PDF
      if (await Sharing.isAvailableAsync()) {
        const filename = this.generateFilename(options.filters);

        // Copy file with custom name
        const customUri = `${FileSystem.cacheDirectory}${filename}`;
        await FileSystem.copyAsync({
          from: uri,
          to: customUri,
        });

        await Sharing.shareAsync(customUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Export Transaction Report',
          UTI: 'com.adobe.pdf',
        });

        return {
          success: true,
          uri: customUri,
        };
      } else {
        return {
          success: false,
          error: 'Sharing is not available on this device',
        };
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate PDF',
      };
    }
  }
}

export default new PdfService();
