import { Payment, ServiceOrder, Sale, EnrichedPayment, User, ProductGroup, Product } from '../api/types';

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
    sales: Sale[],
    users: User[],
    productGroups: ProductGroup[],
    products: Product[]
): {
    enrichedPayments: EnrichedPayment[];
    headers: string[]
} {
    const allowedIDs = payments.reduce((acc: string[], payment: Payment) => {
        const reference = extractReferenceNumber(payment.descricao);
        if (reference.number !== null) {
            acc.push(`${reference.type}-${reference.number}`);
        }
        return acc;
    }, []);

    // Filter only payed sales
    sales = sales.filter(sale => {
        return sale.situacao_financeiro == 1
            && !(sale.pagamentos && sale.pagamentos[0] && sale.pagamentos[0].pagamento.nome_forma_pagamento == 'A Combinar')
            && allowedIDs.includes(`sale-${sale.codigo}`)
    })

    serviceOrders = serviceOrders.filter(os => {
        return os.situacao_financeiro != 1
            && !(os.pagamentos && os.pagamentos[0] && os.pagamentos[0].pagamento.nome_forma_pagamento == 'A Combinar')
            && allowedIDs.includes(`service_order-${os.codigo}`)
    })

    const headers = [
        'Data', 'Loja', 'Ano', 'Mês', 'Usuário', 'Valor total', 'Quantidade', 'Item', 'Tipo de item', 'Fonte', 'ID da Fonte', 'Produto', 'Técnico', 'Data de entrada', 'Forma de pagametno'
    ]

    const data: EnrichedPayment[] = []
    for (const sale of sales) {

        let saleTotalPrice = 0;
        if (sale.situacao_financeiro == 1 && sale.pagamentos) {
            saleTotalPrice = sale.pagamentos.reduce((total: number, p: any) => total + Number(p.pagamento.valor), 0)
        }

        const seller = users.find(user => user.id == sale.vendedor_id) as User

        // Produtos de uma venda
        for (const row of sale.produtos ?? []) {
            const product = row.produto
            var productTotal = Number(product.valor_total)
            if (productTotal > saleTotalPrice) {
                productTotal = saleTotalPrice
            }
            const group = product.produto_id && productGroups.find(g => g.id == products.find(p => p.id == product.produto_id)?.grupo_id)
            data.push({
                'Data': sale.data,
                'Loja': sale.nome_loja,
                'Ano': sale.data.split('-')[0],
                'Mês': sale.data.split('-')[1],
                'Usuário': seller ? seller.nome : sale.vendedor_id,
                'Valor total': productTotal,
                'Quantidade': product.quantidade,
                'Item': group ? group.nome : 'Sem grupo',
                'Tipo de item': 'Grupo de produto ' + (group && group.grupo_pai_id.length ? '(SG)' : '(PAI)'),
                'Fonte': 'Venda de produto',
                'ID da Fonte': sale.codigo,
                'Produto': product.nome_produto,
                'Técnico': sale.tecnico_id,
                'Data de entrada': '', // data entrada nao tem pq nao é OS
                'Forma de pagametno': sale.pagamentos.map((p: any) => p.pagamento.nome_forma_pagamento).join(', ')
            })
        }

        // Serviços de uma venda
        for (const row of sale.servicos ?? []) {
            const service = row.servico
            var serviceTotal = Number(service.valor_total)
            if (serviceTotal > saleTotalPrice) {
                serviceTotal = saleTotalPrice
            }
            const sellers = [`${seller?.nome} (${seller?.id})`]

            users.forEach(user => {
                if (sale.observacoes_interna.includes(user.id)) {
                    sellers.push(`${user?.nome} (${user?.id})`)
                }
            })
            for (const seller of sellers) {
                data.push({
                    'Data': sale.data,
                    'Loja': sale.nome_loja,
                    'Ano': sale.data.split('-')[0],
                    'Mês': sale.data.split('-')[1],
                    'Usuário': seller,
                    'Valor total': serviceTotal / sellers.length,
                    'Quantidade': 1,
                    'Item': service.nome_servico,
                    'Tipo de item': 'Serviço',
                    'Fonte': 'Venda de produto',
                    'ID da Fonte': sale.codigo,
                    'Produto': '',
                    'Técnico': sale.tecnico_id,
                    'Data de entrada': '', // data entrada nao tem pq nao é OS
                    'Forma de pagametno': sale.pagamentos.map((p: any) => p.pagamento.nome_forma_pagamento).join(', ')
                })
            }
        }
    }

    for (const sale of serviceOrders) {

        let saleTotalPrice = 0;
        if (sale.situacao_financeiro == 1 && sale.pagamentos) {
            saleTotalPrice = sale.pagamentos.reduce((total: number, p: any) => total + Number(p.pagamento.valor), 0)
        }

        const seller = users.find(user => user.id == sale.vendedor_id) as User

        // Produtos de uma venda
        for (const row of sale.produtos ?? []) {
            const product = row.produto
            var productTotal = Number(product.valor_total)
            if (productTotal > saleTotalPrice) {
                productTotal = saleTotalPrice
            }
            const group = product.produto_id && productGroups.find(g => g.id == products.find(p => p.id == product.produto_id)?.grupo_id)
            data.push({
                'Data': sale.data,
                'Loja': sale.nome_loja,
                'Ano': sale.data.split('-')[0],
                'Mês': sale.data.split('-')[1],
                'Usuário': seller.nome,
                'Valor total': productTotal,
                'Quantidade': product.quantidade,
                'Item': group ? group.nome : 'Sem grupo',
                'Tipo de item': 'Grupo de produto ' + (group && group.grupo_pai_id.length ? '(SG)' : '(PAI)'),
                'Fonte': 'Serviço',
                'ID da Fonte': sale.codigo,
                'Produto': product.nome_produto,
                'Técnico': sale.tecnico_id,
                'Data de entrada': '',
                'Forma de pagametno': sale.pagamentos.map((p: any) => p.pagamento.nome_forma_pagamento).join(', ')
            })
        }

        // Serviços de uma venda
        for (const row of sale.servicos ?? []) {
            const service = row.servico
            var serviceTotal = Number(service.valor_total)
            if (serviceTotal > saleTotalPrice) {
                serviceTotal = saleTotalPrice
            }
            const sellers = [`${seller?.nome} (${seller?.id})`]

            users.forEach(user => {
                if (sale.observacoes_interna.includes(user.id)) {
                    sellers.push(`${user?.nome} (${user?.id})`)
                }
            })
            for (const seller of sellers) {
                data.push({
                    'Data': sale.data,
                    'Loja': sale.nome_loja,
                    'Ano': sale.data.split('-')[0],
                    'Mês': sale.data.split('-')[1],
                    'Usuário': seller,
                    'Valor total': serviceTotal / sellers.length,
                    'Quantidade': 1,
                    'Item': service.nome_servico,
                    'Tipo de item': 'Serviço',
                    'Fonte': 'Serviço',
                    'ID da Fonte': sale.codigo,
                    'Produto': '',
                    'Técnico': sale.tecnico_id,
                    'Data de entrada': sale.data_entrada,
                    'Forma de pagametno': sale.pagamentos.map((p: any) => p.pagamento.nome_forma_pagamento).join(', ')
                })
            }
        }
    }

    return { enrichedPayments: data, headers }
}