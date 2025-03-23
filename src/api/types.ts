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
    relationship_type?: 'sale' | 'service_order' | 'other';
    [key: string]: any;
}