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
): {
    enrichedPayments: EnrichedPayment[];
    headers: string[]
} {
    // Create indices for efficient lookup
    var headers: string[] = Object.keys(payments[0])
    const serviceOrdersByCode = new Map<string, ServiceOrder>();
    for (const so of serviceOrders) {
        console.log(so.os_codigo)
        serviceOrdersByCode.set(so.os_codigo, so);
    }

    const salesByCode = new Map<string, Sale>();
    for (const sale of sales) {
        salesByCode.set(sale.venda_codigo, sale);
    }

    let firstSale = true;
    let firstServiceOrder = true;

    // Process each payment
    const enrichedPayments = payments.map(payment => {
        let result: EnrichedPayment = { ...payment };

        // Extract reference number from description
        const { type, number } = extractReferenceNumber(payment.descricao);

        // If found a reference number
        if (number !== null) {
            result.relationship_type = type;

            if (type === 'sale') {
                const relatedSale = salesByCode.get(String(number));
                if (relatedSale) {
                    result = { ...result, ...relatedSale };
                    if (firstSale && relatedSale) {
                        headers.push(...Object.keys(result))
                        firstSale = false;
                    }
                }
            } else if (type === 'service_order') {
                const relatedServiceOrder = serviceOrdersByCode.get(String(number));
                if (relatedServiceOrder) {
                    result = { ...result, ...relatedServiceOrder };
                    if (firstServiceOrder && relatedServiceOrder) {
                        headers.push(...Object.keys(result))
                        firstServiceOrder = false;
                    }
                }
            }

        } else {
            result.relationship_type = 'other';
        }

        return result;
    });

    // Remove duplicates from headers
    headers = headers.filter((value, index, self) => self.indexOf(value) === index);

    return { enrichedPayments, headers }
}