// payment-loader.ts
import { fetchAllPages } from './client';
import { Payment, Product, ProductGroup, Sale, ServiceOrder, Store, User } from './types';
import fs from 'fs/promises'
import { existsSync } from 'fs'

const NODE_ENV = process.env.NODE_ENV || 'development';
const loadFromCache = NODE_ENV == 'development'

async function isFileNewerThanOneDay(filePath: string): Promise<boolean> {
  if (!existsSync(filePath)) return false;
  const stats = await fs.stat(filePath);
  const oneDay = 24 * 60 * 60 * 1000; // one day in milliseconds
  return (Date.now() - stats.mtimeMs) < oneDay;
}

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
    let payments;
    const filePath = 'payments.json';
    if (existsSync(filePath) && await isFileNewerThanOneDay(filePath)) {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      payments = JSON.parse(fileContent);
    } else {
      payments = await fetchAllPages<Payment>('/recebimentos?data_inicio=2023-01-01&data_fim=' + today);
      await fs.writeFile(filePath, JSON.stringify(payments, null, 2));
    }
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
    let groups;
    const filePath = 'product-groups.json';
    if (existsSync(filePath) && await isFileNewerThanOneDay(filePath)) {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      groups = JSON.parse(fileContent);
    } else {
      groups = await fetchAllPages<ProductGroup>('/grupos_produtos');
      await fs.writeFile(filePath, JSON.stringify(groups, null, 2));
    }
    console.log(`Successfully loaded ${groups.length} product groups`);
    return groups;
  } catch (error) {
    console.error('Error loading product groups:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Load all products from the API
 */
export async function getProducts(): Promise<Product[]> {
  console.log('Loading products...');
  try {
    let products;
    const filePath = 'products.json';
    if (existsSync(filePath) && await isFileNewerThanOneDay(filePath)) {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      products = JSON.parse(fileContent);
    } else {
      products = await fetchAllPages<Product>('/produtos');
      await fs.writeFile(filePath, JSON.stringify(products, null, 2));
    }
    console.log(`Successfully loaded ${products.length} products`);
    return products;
  } catch (error) {
    console.error('Error loading products:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Load all users from the API
 */
export async function getUsers(): Promise<User[]> {
  console.log('Loading users...');
  try {
    let users;
    const filePath = 'users.json';
    if (existsSync(filePath) && await isFileNewerThanOneDay(filePath)) {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      users = JSON.parse(fileContent);
    } else {
      users = await fetchAllPages<User>('/usuarios');
      await fs.writeFile(filePath, JSON.stringify(users, null, 2));
    }
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

  try {
    const filePath = 'service-orders.json';
    if (loadFromCache && existsSync(filePath) && await isFileNewerThanOneDay(filePath)) {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(fileContent);
    }

    let serviceOrders: ServiceOrder[] = []
    for (const store of stores) {
      let currentStoreOS = await fetchAllPages<ServiceOrder>(`/ordens_servicos?data_inicio=2023-01-01&data_fim=${today}&loja_id=${store.id}`);
      serviceOrders = [...serviceOrders, ...currentStoreOS]
    }

    await fs.writeFile(filePath, JSON.stringify(serviceOrders, null, 2));
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
export async function getSales(stores: Store[]): Promise<Sale[]> {
  console.log('Loading sales...');

  try {
    const filePath = 'sales.json';
    if (loadFromCache && existsSync(filePath) && await isFileNewerThanOneDay(filePath)) {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(fileContent);
    }

    let sales: Sale[] = []
    const today = new Date().toISOString().split('T')[0]

    for (const store of stores) {
      const normalSales = await fetchAllPages<Sale>(`/vendas?data_inicio=2023-01-01&data_fim=${today}&loja_id=${store.id}`);
      const counterSales = await fetchAllPages<Sale>(`/vendas?tipo=vendas_balcao&data_inicio=2023-01-01&data_fim=${today}&loja_id=${store.id}`)
      sales = [...sales, ...normalSales, ...counterSales];
    }

    await fs.writeFile(filePath, JSON.stringify(sales, null, 2));
    console.log(`Successfully loaded ${sales.length} sales`);
    return sales;
  } catch (error) {
    console.error('Error loading sales:', error instanceof Error ? error.message : String(error));
    // Return empty array in case of error to allow the application to continue
    return [];
  }
}