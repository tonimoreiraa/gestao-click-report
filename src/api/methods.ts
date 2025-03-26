// payment-loader.ts
import { fetchAllPages } from './client';
import { Payment, Sale, ServiceOrder } from './types';

/**
 * Load all payments from the API
 */
export async function getPayments(): Promise<Payment[]> {
  console.log('Loading payments...');
  const today = new Date().toISOString().split('T')[0]

  try {
    const payments = await fetchAllPages<Payment>('/recebimentos?data_inicio=2025-01-01&data_fim=' + today);
    console.log(`Successfully loaded ${payments.length} payments`);
    return payments;
  } catch (error) {
    console.error('Error loading payments:', error instanceof Error ? error.message : String(error));
    // Return empty array in case of error to allow the application to continue
    return [];
  }
}
/**
 * Load all service orders from the API
 */
export async function getServiceOrders(): Promise<ServiceOrder[]> {
  console.log('Loading service orders...');
  const today = new Date().toISOString().split('T')[0]

  try {
    const serviceOrders = await fetchAllPages<ServiceOrder>('/ordens_servicos?data_inicio=2025-01-01&data_fim=' + today);
    console.log(`Successfully loaded ${serviceOrders.length} service orders`);
    return serviceOrders;
  } catch (error) {
    console.error('Error loading service orders:', error instanceof Error ? error.message : String(error));
    // Return empty array in case of error to allow the application to continue
    return [];
  }
}

/**
 * Load all sales from the API
 */
export async function getSales(): Promise<Sale[]> {
  console.log('Loading sales...');

  try {
    const today = new Date().toISOString().split('T')[0]
    const normalSales = await fetchAllPages<Sale>('/vendas?data_inicio=2025-01-01&data_fim=' + today);
    const counterSales = await fetchAllPages<Sale>('/vendas?tipo=vendas_balcao?data_inicio=2025-01-01&data_fim=' + today)
    const sales = [...normalSales, ...counterSales];
    console.log(`Successfully loaded ${sales.length} sales`);
    return sales;
  } catch (error) {
    console.error('Error loading sales:', error instanceof Error ? error.message : String(error));
    // Return empty array in case of error to allow the application to continue
    return [];
  }
}