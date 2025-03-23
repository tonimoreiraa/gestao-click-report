import { Payment, ServiceOrder, Sale, EnrichedPayment } from '../api/types';

/**
 * Extract reference number from payment description
 */
export function extractReferenceNumber(description: string): { type: 'sale' | 'service_order' | 'other', number: number | null } {
    // Pattern for Sale
    const saleRegex = /Venda de n[ºo°] (\d+)/i;
    const saleMatch = description.match(saleRegex);

    if (saleMatch && saleMatch[1]) {
        return { type: 'sale', number: parseInt(saleMatch[1], 10) };
    }

    // Pattern for Service Order
    const serviceOrderRegex = /Ordem de servi[çc]o de n[ºo°] (\d+)/i;
    const serviceOrderMatch = description.match(serviceOrderRegex);

    if (serviceOrderMatch && serviceOrderMatch[1]) {
        return { type: 'service_order', number: parseInt(serviceOrderMatch[1], 10) };
    }

    // Doesn't match any known pattern
    return { type: 'other', number: null };
}

/**
 * Enrich payments with sales and service orders data
 */
export function enrichPayments(
    payments: Payment[],
    serviceOrders: ServiceOrder[],
    sales: Sale[]
): EnrichedPayment[] {
    // Create indices for efficient lookup
    const serviceOrdersByCode = new Map<string, ServiceOrder>();
    for (const so of serviceOrders) {
        serviceOrdersByCode.set(so.codigo, so);
    }

    const salesByCode = new Map<string, Sale>();
    for (const sale of sales) {
        salesByCode.set(sale.codigo, sale);
    }

    // Process each payment
    return payments.map(payment => {
        const result: EnrichedPayment = { ...payment };

        // Extract reference number from description
        const { type, number } = extractReferenceNumber(payment.descricao);

        // If found a reference number
        if (number !== null) {
            result.relationship_type = type;

            if (type === 'sale') {
                const relatedSale = salesByCode.get(String(number));
                console.log(relatedSale)
                if (relatedSale) {
                    result.related_sale = relatedSale;
                }
            } else if (type === 'service_order') {
                const relatedServiceOrder = serviceOrdersByCode.get(String(number));
                console.log(relatedServiceOrder)
                if (relatedServiceOrder) {
                    result.related_service_order = relatedServiceOrder;
                }
            }

        } else {
            result.relationship_type = 'other';
        }

        return result;
    });
}