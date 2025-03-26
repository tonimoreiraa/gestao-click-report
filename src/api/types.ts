export interface ServiceOrder {
    os_codigo: string;
    [key: string]: any; // Other service order fields
}

export interface Sale {
    venda_codigo: string;
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

export interface Store {
    nome: string
    id: string
}