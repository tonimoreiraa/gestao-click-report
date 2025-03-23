// payment-loader.ts
import { fetchAllPages } from './client';
import { Payment, Sale, ServiceOrder } from './types';

/**
 * Load all payments from the API
 */
export async function getPayments(): Promise<Payment[]> {
  console.log('Loading payments...');

  try {
    const payments = await fetchAllPages<Payment>('/recebimentos');
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

  try {
    const serviceOrders = await fetchAllPages<ServiceOrder>('/ordens_servicos');
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
    const sales = await fetchAllPages<Sale>('/vendas');
    console.log(`Successfully loaded ${sales.length} sales`);
    return sales;
  } catch (error) {
    console.error('Error loading sales:', error instanceof Error ? error.message : String(error));
    // Return empty array in case of error to allow the application to continue
    return [];
  }
}