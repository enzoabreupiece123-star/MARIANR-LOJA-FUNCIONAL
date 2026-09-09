import { CartItem, CustomerOrderData, StoreSettings } from '../types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function generateWhatsAppOrderUrl(
  items: CartItem[],
  customer: CustomerOrderData,
  settings: StoreSettings,
  orderId?: string
): string {
  const total = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const dateStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const orderBadge = orderId ? ` #${orderId}` : '';
  let message = `*Olá, Mariane! Gostaria de confirmar meu Pedido${orderBadge} na Mariane Moreira Concepts:*\n\n`;
  if (orderId) {
    message += `🔖 *Código do Pedido:* *#${orderId}*\n`;
  }
  message += `🗓️ *Data:* ${dateStr}\n`;
  message += `👤 *Cliente:* ${customer.name.trim()}\n`;
  message += `📱 *Telefone:* ${customer.phone.trim()}\n\n`;

  message += `🛍️ *ITENS DO PEDIDO:*\n`;
  items.forEach((item, index) => {
    const itemSubtotal = item.product.price * item.quantity;
    message += `${index + 1}. *${item.product.name}*\n`;
    message += `   • Tamanho: ${item.selectedSize}\n`;
    if (item.selectedColor) {
      message += `   • Cor: ${item.selectedColor}\n`;
    }
    message += `   • Quantidade: ${item.quantity}x (${formatCurrency(item.product.price)} un.)\n`;
    message += `   • Subtotal: *${formatCurrency(itemSubtotal)}*\n\n`;
  });

  message += `💰 *VALOR TOTAL DOS PRODUTOS:* *${formatCurrency(total)}*\n`;
  message += `💳 *Forma de Pagamento:* PIX (À vista)\n\n`;

  if (customer.deliveryType === 'pickup') {
    message += `📍 *Forma de Recebimento:* Retirada no Ateliê / Showroom\n`;
  } else {
    message += `🚚 *Forma de Recebimento:* Envio / Entrega\n`;
    message += `   • *Endereço:* ${customer.street || ''}, nº ${customer.number || 'S/N'}${customer.complement ? ' - ' + customer.complement : ''}\n`;
    message += `   • *Bairro:* ${customer.neighborhood || ''}\n`;
    message += `   • *Cidade/UF:* ${customer.city || ''} - ${customer.state || ''}\n`;
    message += `   • *CEP:* ${customer.cep || ''}\n`;
  }

  if (customer.notes && customer.notes.trim().length > 0) {
    message += `\n📝 *Observações:* ${customer.notes.trim()}\n`;
  }

  message += `\n--- \n`;
  message += `✨ *DADOS PARA PAGAMENTO PIX:*\n`;
  message += `• Chave Pix: \`${settings.pixKey}\` (${settings.pixKeyType.toUpperCase()})\n`;
  message += `• Beneficiário: ${settings.pixBeneficiary}\n`;
  message += `• Banco/Cidade: ${settings.pixCity}\n\n`;
  message += `*Estou enviando este pedido e aguardo a confirmação para transferência do Pix e envio do comprovante! Obrigado(a)!*`;

  const encodedMessage = encodeURIComponent(message);
  const targetPhone = cleanPhone(settings.whatsapp);

  return `https://wa.me/${targetPhone}?text=${encodedMessage}`;
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  } else {
    // Fallback
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      textArea.remove();
      return Promise.resolve(true);
    } catch {
      textArea.remove();
      return Promise.resolve(false);
    }
  }
}
