// main.ts - Main application file
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { getPayments, getServiceOrders, getSales } from './api/methods';
import { enrichPayments } from './utils/data-processor';
import { EnrichedPayment } from './api/types';

// Load environment variables from .env file
dotenv.config();

/**
 * Save data to JSON file
 */
function saveToJson(data: any, filename: string): void {
    try {
        // Create output directory if it doesn't exist
        const outputDir = path.resolve(__dirname, 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const filePath = path.join(outputDir, filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`Successfully saved data to ${filePath}`);
    } catch (error) {
        console.error('Error saving data to file:', error instanceof Error ? error.message : String(error));
    }
}

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

        const payments = await getPayments()
        const serviceOrders = await getServiceOrders()
        const sales = await getSales()

        // Handle empty data
        if (payments.length === 0) {
            console.warn('No payments found. Check API access and try again.');
            return;
        }

        // Enrich payments with related data
        console.log('Processing payment relationships...');
        const enrichedPayments = enrichPayments(payments, serviceOrders, sales);

        // Save results to file
        saveToJson(enrichedPayments, 'enriched_payments.json');

        // Generate report
        generateReport(enrichedPayments);

        console.log('Processing completed successfully!');
    } catch (error) {
        console.error('Error in main process:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

main();