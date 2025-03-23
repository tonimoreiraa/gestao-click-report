export interface ServiceOrder {
    codigo: string;
    [key: string]: any; // Other service order fields
}

export interface Sale {
    codigo: string;
    [key: string]: any; // Other sale fields
}

export interface Payment {
    id: number;
    descricao: string;
    [key: string]: any; // Other payment fields
}

export interface EnrichedPayment extends Payment {
    related_sale?: Sale;
    related_service_order?: ServiceOrder;
    relationship_type?: 'sale' | 'service_order' | 'other';
}