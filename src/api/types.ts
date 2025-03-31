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

export interface EnrichedPayment {
    'Data': any;
    'Loja': any;
    'Ano': any;
    'Mês': any;
    'Usuário': any;
    'Valor total': any;
    'Quantidade': any;
    'Item': any;
    'Tipo de item': any;
    'Fonte': any;
    'ID da Fonte': any;
    'Produto': any;
    'Técnico': any;
    'Data de entrada': any;
    'Forma de pagametno': any;
}

export interface Store {
    nome: string
    id: string
}

export type ProductGroup = {
    grupo_pai_id: string
    id: string
    meta_descricao: string
    meta_palavras_chaves: string
    nome: string
    url: string
}

export type Product = {
    altura: string
    ativo: string
    cadastrado_em: string
    codigo_barra: string
    codigo_interno: string
    comprimento: string
    descricao: string
    estoque: number
    fiscal: {
        cest: string
        ncm: string
        peso_bruto: string
        peso_liquido: string
        valor_aproximado_tributos: string
    }
    fotos: Array<any>
    grupo_id: string
    id: string
    largura: string
    modificado_em: string
    movimenta_estoque: string
    nome: string
    nome_grupo: string
    peso: string
    possui_composicao: string
    possui_variacao: string
    valor_custo: string
    valor_venda: string
    valores: Array<{
        lucro_utilizado: string
        nome_tipo: string
        tipo_id: string
        valor_custo: string
        valor_venda: string
    }>
    variacoes: Array<{
        variacao: {
            codigo: string
            estoque: string
            id: string
            nome: string
            valores: Array<{
                lucro_utilizado: string
                nome_tipo: string
                tipo_id: string
                valor_custo: string
                valor_venda: string
            }>
        }
    }>
}


export type User = {
    ativo: string
    celular1: string
    celular2: string
    cpf: string
    data_nascimento: string
    email: string
    grupo_id: string
    hora_almoco_entrada: string
    hora_almoco_saida: string
    hora_entrada: string
    hora_saida: string
    id: string
    nome: string
    observacoes: string
    rg: string
    sexo: string
    telefone: string
}
