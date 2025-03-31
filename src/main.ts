import dotenv from 'dotenv';
import { getPayments, getServiceOrders, getSales, getStores, getProducts, getUsers, getProductGroups } from './api/methods';
import { enrichPayments } from './utils/data-processor';
import { EnrichedPayment } from './api/types';
import { GoogleSheetsExport } from './utils/google-sheets';

// Load environment variables from .env file
dotenv.config();

/**
 * Generate simple report from the enriched payments
 */
function generateReport(enrichedPayments: EnrichedPayment[]): void {
    const totalPayments = enrichedPayments.length;
    const paymentsBySale = enrichedPayments.filter(p => p.relationship_type === 'sale').length;
    const paymentsByServiceOrder = enrichedPayments.filter(p => p.relationship_type === 'service_order').length;
    const otherPayments = enrichedPayments.filter(p => p.relationship_type === 'other').length;

    console.log(`
===== Processing Report =====
Total payments processed: ${totalPayments}
Payments related to sales: ${paymentsBySale} (${(paymentsBySale / totalPayments * 100).toFixed(2)}%)
Payments related to service orders: ${paymentsByServiceOrder} (${(paymentsByServiceOrder / totalPayments * 100).toFixed(2)}%)
Payments with custom description: ${otherPayments} (${(otherPayments / totalPayments * 100).toFixed(2)}%)
============================
  `);
}

/**
 * Main function
 */
async function main() {
    try {
        console.log('Starting data processing from Gestão Click API...');

        const stores = await getStores()

        const payments = await getPayments(stores)
        const serviceOrders = await getServiceOrders(stores)
        const sales = await getSales(stores)
        const products = await getProducts()
        const productGroups = await getProductGroups()
        const users = await getUsers()


        // Handle empty data
        if (payments.length === 0) {
            console.warn('No payments found. Check API access and try again.');
            return;
        }

        // Enrich payments with related data
        console.log('Processing payment relationships...');
        const {
            enrichedPayments,
            headers
        } = enrichPayments(payments, serviceOrders, sales, users, productGroups, products);

        const exporter = new GoogleSheetsExport();
        await exporter.exportJson(
            enrichedPayments,
            process.env.SPREADSHEET_ID as string,
            'VENDAS COM FINANCEIRO',
            headers,
        );

        // Generate report
        generateReport(enrichedPayments);

        console.log('Processing completed successfully!');
    } catch (error) {
        console.error('Error in main process:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

main();