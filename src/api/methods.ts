// payment-loader.ts
import { fetchAllPages } from './client';
import { Payment, Product, ProductGroup, Sale, ServiceOrder, Store, User } from './types';

/**
 * Load all stores from the API
 */
export async function getStores(): Promise<Store[]> {
  console.log('Loading stores...');
  try {
    const stores = await fetchAllPages<Store>('/lojas');
    console.log(`Successfully loaded ${stores.length} stores`);
    return stores;
  } catch (error) {
    console.error('Error loading stores:', error instanceof Error ? error.message : String(error));
    // Return empty array in case of error to allow the application to continue
    return [];
  }
}

/**
 * Load all payments from the API
 */
export async function getPayments(stores: Store[]): Promise<Payment[]> {
  console.log('Loading payments...');
  const today = new Date().toISOString().split('T')[0]

  try {
    const payments = await fetchAllPages<Payment>('/recebimentos?data_inicio=2023-01-01&data_fim=' + today);
    console.log(`Successfully loaded ${payments.length} payments`);
    return payments;
  } catch (error) {
    console.error('Error loading payments:', error instanceof Error ? error.message : String(error));
    // Return empty array in case of error to allow the application to continue
    return [];
  }
}
/**
 * Load all product groups from the API
 */
export async function getProductGroups(): Promise<ProductGroup[]> {
  console.log('Loading product groups...');
  try {
    const groups = await fetchAllPages<ProductGroup>('/grupos_produtos');
    console.log(`Successfully loaded ${groups.length} product groups`);
    return groups;
  } catch (error) {
    console.error('Error loading product groups:', error instanceof Error ? error.message : String(error));
    // Return empty array in case of error to allow the application to continue
    return [];
  }
}

/**
 * Load all products from the API
 */
export async function getProducts(): Promise<Product[]> {
  console.log('Loading products...');
  try {
    const products = await fetchAllPages<Product>('/produtos');
    console.log(`Successfully loaded ${products.length} products`);
    return products;
  } catch (error) {
    console.error('Error loading products:', error instanceof Error ? error.message : String(error));
    // Return empty array in case of error to allow the application to continue
    return [];
  }
}

/**
 * Load all users from the API
 */
export async function getUsers(): Promise<User[]> {
  console.log('Loading users...');
  try {
    const users = await fetchAllPages<User>('/usuarios');
    console.log(`Successfully loaded ${users.length} users`);
    return users;
  } catch (error) {
    console.error('Error loading users:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Load all service orders from the API
 */
export async function getServiceOrders(stores: Store[]): Promise<ServiceOrder[]> {
  console.log('Loading service orders...');
  const today = new Date().toISOString().split('T')[0]

  let serviceOrders: ServiceOrder[] = []
  try {
    for (const store of stores) {
      let currentStoreOS = await fetchAllPages<ServiceOrder>(`/ordens_servicos?data_inicio=2023-01-01&data_fim=${today}&loja_id=${store.id}`);
      serviceOrders = [...serviceOrders, ...currentStoreOS]
    }
    const prefixedServiceOrders = serviceOrders.map(order => {
      return Object.fromEntries(
        Object.entries(order).map(([key, value]) => [`os_${key}`, value])
      );
    }) as ServiceOrder[];
    console.log(`Successfully loaded ${serviceOrders.length} service orders`);
    return prefixedServiceOrders;
  } catch (error) {
    console.error('Error loading service orders:', error instanceof Error ? error.message : String(error));
    // Return empty array in case of error to allow the application to continue
    return [];
  }
}

/**
 * Load all sales from the API
 */
export async function getSales(stores: Store[]): Promise<Sale[]> {
  console.log('Loading sales...');

  let sales: Sale[] = []
  try {
    const today = new Date().toISOString().split('T')[0]
    for (const store of stores) {
      const normalSales = await fetchAllPages<Sale>(`/vendas?data_inicio=2023-01-01&data_fim=${today}&loja_id=${store.id}`);
      const counterSales = await fetchAllPages<Sale>(`/vendas?tipo=vendas_balcao&data_inicio=2023-01-01&data_fim=${today}&loja_id=${store.id}`)
      sales = [...sales, ...normalSales, ...counterSales];
    }

    const prefixedSales = sales.map(order => {
      return Object.fromEntries(
        Object.entries(order).map(([key, value]) => [`venda_${key}`, value])
      );
    }) as Sale[]

    console.log(`Successfully loaded ${sales.length} sales`);
    return prefixedSales;
  } catch (error) {
    console.error('Error loading sales:', error instanceof Error ? error.message : String(error));
    // Return empty array in case of error to allow the application to continue
    return [];
  }
}