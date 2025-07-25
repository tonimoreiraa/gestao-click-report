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

}

/**
 * Main function
 */
async function main() {
    try {
        console.log('Starting data processing from Gestão Click API...');

        const stores = await getStores()

        const products = await getProducts()
        const productGroups = await getProductGroups()
        const payments = await getPayments(stores)
        const serviceOrders = await getServiceOrders(stores)
        const sales = await getSales(stores)
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
            'Vendas API',
            headers,
        );

        await exporter.exportJson(
            serviceOrders,
            process.env.SPREADSHEET_ID as string,
            'OS',
            Object.keys(serviceOrders[0]),
        );

        await exporter.exportJson(
            payments,
            process.env.SPREADSHEET_ID as string,
            'Financeiro API',
            Object.keys(payments[0]),
        );

        await exporter.exportJson(
            stores,
            process.env.SPREADSHEET_ID as string,
            'Lojas',
            Object.keys(stores[0]),
        );

        await exporter.exportJson(
            products,
            process.env.SPREADSHEET_ID as string,
            'Produtos',
            Object.keys(products[0]),
        );

        await exporter.exportJson(
            productGroups,
            process.env.SPREADSHEET_ID as string,
            'GruposProdutos',
            Object.keys(productGroups[0]),
        );

        await exporter.exportJson(
            users,
            process.env.SPREADSHEET_ID as string,
            'Usuarios',
            Object.keys(users[0]),
        );

        console.log('Processing completed successfully!');
    } catch (error) {
        console.error('Error in main process:', error instanceof Error ? error.message : String(error));
        console.error(error)
        process.exit(1);
    }
}

main();