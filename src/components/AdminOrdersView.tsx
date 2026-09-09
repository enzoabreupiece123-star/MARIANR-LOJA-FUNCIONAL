import React, { useState, useMemo } from 'react';
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  MessageCircle,
  Copy,
  Check,
  Search,
  ExternalLink,
  MapPin,
  Store,
  Phone,
  Calendar,
  AlertTriangle,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Order, OrderStatus, Product } from '../types';
import { formatCurrency, cleanPhone } from '../lib/utils';

interface AdminOrdersViewProps {
  orders: Order[];
  products: Product[];
  onConfirmOrder: (orderId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, restoreStock?: boolean) => void;
  onDeleteOrder: (orderId: string) => void;
  onRefreshData?: () => void;
}

export const AdminOrdersView: React.FC<AdminOrdersViewProps> = ({
  orders,
  products,
  onConfirmOrder,
  onUpdateOrderStatus,
  onDeleteOrder,
  onRefreshData,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [copiedAddressId, setCopiedAddressId] = useState<string | null>(null);

  // Counters
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const confirmedCount = orders.filter((o) => o.status === 'confirmed').length;
  const dispatchedCount = orders.filter((o) => o.status === 'dispatched').length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;

  const totalRevenue = orders
    .filter((o) => o.status === 'confirmed' || o.status === 'dispatched')
    .reduce((acc, curr) => acc + (curr.total || 0), 0);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // Status filter
        if (filterStatus !== 'all' && order.status !== filterStatus) {
          return false;
        }

        // Search query
        if (searchQuery.trim().length > 0) {
          const q = searchQuery.toLowerCase().trim();
          const inId = order.id.toLowerCase().includes(q);
          const inName = order.customerName?.toLowerCase().includes(q);
          const inPhone = order.customerPhone?.toLowerCase().includes(q);
          const inCity = order.city?.toLowerCase().includes(q);
          const inItems = order.items?.some((it) => it.productName.toLowerCase().includes(q));
          if (!inId && !inName && !inPhone && !inCity && !inItems) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, filterStatus, searchQuery]);

  // Copy helper
  const copyText = (text: string, type: 'order' | 'address', id: string) => {
    navigator.clipboard.writeText(text);
    if (type === 'order') {
      setCopiedOrderId(id);
      setTimeout(() => setCopiedOrderId(null), 2000);
    } else {
      setCopiedAddressId(id);
      setTimeout(() => setCopiedAddressId(null), 2000);
    }
  };

  // WhatsApp chat opener
  const handleOpenCustomerWhatsApp = (order: Order, messageType: 'custom' | 'confirmation' | 'tracking') => {
    const rawPhone = cleanPhone(order.customerPhone);
    if (!rawPhone) return;

    let message = '';
    if (messageType === 'confirmation') {
      message =
        `*Olá ${order.customerName}! Aqui é a Mariane do Ateliê.*\n\n` +
        `Recebi e *confirmei com sucesso* o seu pedido *${order.id}*!\n\n` +
        `Suas peças já foram separadas no nosso estoque com todo carinho. ` +
        (order.deliveryType === 'pickup'
          ? `Você já pode retirar no nosso ateliê!`
          : `Em breve te envio o código de rastreio/comprovante de envio.`) +
        `\n\nMuito obrigada pela preferência! ✨`;
    } else if (messageType === 'tracking') {
      message =
        `*Olá ${order.customerName}! Aqui é a Mariane do Ateliê.*\n\n` +
        `Seu pedido *${order.id}* já foi despachado para entrega! 📦✨\n\n` +
        `Qualquer dúvida estou à sua total disposição por aqui.`;
    } else {
      message = `Olá ${order.customerName}, aqui é a Mariane! Referente ao seu pedido ${order.id}:`;
    }

    window.open(`https://wa.me/${rawPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Helper to get formatted date
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl font-medium text-[#1c1917] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#8e6e34]" />
            Gerenciamento de Pedidos das Clientes
          </h3>
          <p className="text-xs text-[#786e64]">
            Acompanhe pedidos recebidos via WhatsApp/Site, confirme e dê baixa automática no estoque.
          </p>
        </div>

        {onRefreshData && (
          <button
            type="button"
            onClick={onRefreshData}
            className="px-3 py-1.5 text-xs text-[#5c544c] hover:text-[#1c1917] border border-[#d5cbbe] rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar Lista
          </button>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-[#e8dfd2]">
          <div className="text-[11px] font-semibold text-[#8c8278] uppercase tracking-wider">
            Total de Pedidos
          </div>
          <div className="text-2xl font-serif font-bold text-[#1c1917] mt-0.5">
            {orders.length}
          </div>
          <div className="text-[10px] text-[#786e64] mt-0.5">registrados no sistema</div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
          <div className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-700" />
            Pendentes
          </div>
          <div className="text-2xl font-serif font-bold text-amber-800 mt-0.5">
            {pendingCount}
          </div>
          <div className="text-[10px] text-amber-700 mt-0.5">precisam de confirmação</div>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
          <div className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            Confirmados / Prontos
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-800 mt-0.5">
            {confirmedCount + dispatchedCount}
          </div>
          <div className="text-[10px] text-emerald-700 mt-0.5">estoque baixado</div>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-900 text-white border border-stone-800">
          <div className="text-[11px] font-semibold text-stone-300 uppercase tracking-wider">
            Faturamento Confirmado
          </div>
          <div className="text-2xl font-serif font-bold text-[#e6c687] mt-0.5">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">pedidos confirmados e enviados</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterStatus === 'all'
                ? 'bg-[#1c1917] text-white shadow-xs'
                : 'bg-[#faf8f5] text-[#6b6258] hover:bg-[#f0ebe1] border border-[#e8dfd2]'
            }`}
          >
            Todos ({orders.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
              filterStatus === 'pending'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            Pendentes ({pendingCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('confirmed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
              filterStatus === 'confirmed'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Confirmados ({confirmedCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('dispatched')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
              filterStatus === 'dispatched'
                ? 'bg-blue-800 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <Truck className="w-3 h-3" />
            Enviados ({dispatchedCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('cancelled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
              filterStatus === 'cancelled'
                ? 'bg-stone-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300'
            }`}
          >
            <XCircle className="w-3 h-3" />
            Cancelados ({cancelledCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative sm:w-72">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, pedido, peça..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 bg-[#faf8f5] border border-[#d5cbbe] rounded-lg focus:bg-white focus:border-[#8e6e34] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Orders Listing */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#d5cbbe] rounded-2xl bg-[#faf8f5] space-y-3">
          <Package className="w-10 h-10 text-[#8e6e34] mx-auto opacity-50" />
          <div className="space-y-1">
            <h4 className="font-serif text-base font-medium text-[#1c1917]">
              Nenhum pedido encontrado
            </h4>
            <p className="text-xs text-[#786e64] max-w-sm mx-auto">
              {searchQuery || filterStatus !== 'all'
                ? 'Nenhum pedido corresponde aos filtros de busca atuais.'
                : 'Assim que as clientes realizarem pedidos na sacola do site, eles aparecerão aqui para sua mãe conferir o endereço e dar baixa nas peças!'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isPending = order.status === 'pending';
            const isConfirmed = order.status === 'confirmed';
            const isDispatched = order.status === 'dispatched';
            const isCancelled = order.status === 'cancelled';

            const fullAddress = [
              order.street ? `${order.street}, nº ${order.number || 'S/N'}` : '',
              order.complement ? `Compl: ${order.complement}` : '',
              order.neighborhood ? `Bairro: ${order.neighborhood}` : '',
              order.city ? `${order.city}${order.state ? ` - ${order.state}` : ''}` : '',
              order.cep ? `CEP: ${order.cep}` : '',
            ]
              .filter(Boolean)
              .join(' | ');

            return (
              <div
                key={order.id}
                id={`admin-order-card-${order.id}`}
                className={`rounded-xl border transition-all duration-200 bg-white overflow-hidden shadow-xs ${
                  isPending
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : isConfirmed
                    ? 'border-emerald-200'
                    : isDispatched
                    ? 'border-blue-200'
                    : 'border-[#e8dfd2] opacity-80'
                }`}
              >
                {/* Order Card Top Bar */}
                <div className="p-3 sm:p-4 bg-[#fcfaf7] border-b border-[#f0ebe3] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => copyText(order.id, 'order', order.id)}
                      className="font-mono text-xs font-bold text-[#1c1917] hover:text-[#8e6e34] flex items-center gap-1.5 transition-colors"
                      title="Copiar código do pedido"
                    >
                      <span>{order.id}</span>
                      {copiedOrderId === order.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-stone-400" />
                      )}
                    </button>

                    <span className="text-stone-300 text-xs">•</span>

                    <span className="text-[11px] text-[#786e64] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#8e6e34]" />
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2">
                    {/* Stock Status Badge */}
                    {order.stockDeducted ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                        <Check className="w-2.5 h-2.5 text-emerald-700" />
                        Estoque Baixado
                      </span>
                    ) : isCancelled ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                        Estoque Intacto
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-2.5 h-2.5 text-amber-700" />
                        Estoque Pendente
                      </span>
                    )}

                    {/* Order Status Badge */}
                    {isPending && (
                      <span className="bg-amber-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                        Pendente
                      </span>
                    )}
                    {isConfirmed && (
                      <span className="bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                        Confirmado
                      </span>
                    )}
                    {isDispatched && (
                      <span className="bg-blue-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                        Enviado
                      </span>
                    )}
                    {isCancelled && (
                      <span className="bg-stone-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        Cancelado
                      </span>
                    )}
                  </div>
                </div>

                {/* Order Body Grid */}
                <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Column 1: Customer & Delivery Info */}
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#8c8278] mb-1">
                        Dados da Cliente
                      </div>
                      <div className="font-semibold text-sm text-[#1c1917]">
                        {order.customerName || 'Cliente não informou nome'}
                      </div>
                      <div className="text-xs text-[#5c544c] flex items-center gap-2 mt-1">
                        <Phone className="w-3.5 h-3.5 text-[#8e6e34]" />
                        <span>{order.customerPhone || 'Sem telefone'}</span>
                        {order.customerPhone && (
                          <button
                            type="button"
                            onClick={() => handleOpenCustomerWhatsApp(order, 'custom')}
                            className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
                            title="Conversar com a cliente no WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Delivery Details */}
                    <div className="pt-2 border-t border-[#f0ebe3]">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#8c8278] mb-1 flex items-center justify-between">
                        <span>Forma de Recebimento</span>
                        {order.deliveryType === 'delivery' && fullAddress && (
                          <button
                            type="button"
                            onClick={() => copyText(fullAddress, 'address', order.id)}
                            className="text-[10px] text-[#8e6e34] hover:underline font-semibold flex items-center gap-1 normal-case"
                          >
                            {copiedAddressId === order.id ? (
                              <span className="text-emerald-700 flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> Copiado!
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5">
                                <Copy className="w-2.5 h-2.5" /> Copiar Endereço
                              </span>
                            )}
                          </button>
                        )}
                      </div>

                      {order.deliveryType === 'pickup' ? (
                        <div className="p-2.5 bg-[#faf8f5] border border-[#e8dfd2] rounded-lg flex items-center gap-2">
                          <Store className="w-4 h-4 text-[#8e6e34] shrink-0" />
                          <div>
                            <div className="text-xs font-semibold text-[#1c1917]">
                              Retirada no Ateliê
                            </div>
                            <div className="text-[10px] text-[#786e64]">
                              A cliente buscará diretamente na loja física
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-[#faf8f5] border border-[#e8dfd2] rounded-lg space-y-1">
                          <div className="flex items-center gap-1 text-xs font-semibold text-[#1c1917]">
                            <MapPin className="w-3.5 h-3.5 text-[#8e6e34] shrink-0" />
                            <span>Envio / Entrega no Endereço</span>
                          </div>
                          <div className="text-xs text-[#332e29] font-medium leading-relaxed pl-4">
                            {order.street ? (
                              <>
                                <div>
                                  {order.street}, nº {order.number || 'S/N'}
                                  {order.complement ? ` (${order.complement})` : ''}
                                </div>
                                <div className="text-[11px] text-[#665e54]">
                                  {order.neighborhood} — {order.city || ''}
                                  {order.state ? `/${order.state}` : ''}
                                </div>
                                {order.cep && (
                                  <div className="text-[11px] text-[#8e6e34] font-mono">
                                    CEP: {order.cep}
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-stone-400 italic">
                                Endereço a combinar pelo WhatsApp
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Customer Notes */}
                    {order.notes && (
                      <div className="pt-2 border-t border-[#f0ebe3]">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#8c8278] mb-1">
                          Observações da Cliente:
                        </div>
                        <p className="text-xs text-[#5c544c] italic bg-[#faf8f5] p-2 rounded-lg border border-[#e8dfd2]">
                          "{order.notes}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Column 2: Items Ordered with Stock Indicator */}
                  <div className="md:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c8278]">
                        Peças Solicitadas ({order.items.reduce((acc, it) => acc + it.quantity, 0)} itens)
                      </span>
                      <span className="text-xs font-bold text-[#1c1917]">
                        Total: {formatCurrency(order.total)}
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="divide-y divide-[#f0ebe3] border border-[#f0ebe3] rounded-xl overflow-hidden bg-[#faf8f5]">
                      {order.items.map((item, idx) => {
                        // Match current product to show remaining stock
                        const currentProduct = products.find((p) => p.id === item.productId);
                        const currentStock = currentProduct?.stock_quantity ?? '—';
                        const isZeroStock = currentStock !== '—' && Number(currentStock) <= 0;

                        return (
                          <div
                            key={idx}
                            className="p-2.5 sm:p-3 flex items-center justify-between gap-3 hover:bg-white transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {item.productImage ? (
                                <img
                                  src={item.productImage}
                                  alt={item.productName}
                                  className="w-10 h-14 object-cover rounded-md bg-stone-100 shrink-0 border border-stone-200"
                                />
                              ) : (
                                <div className="w-10 h-14 bg-stone-200 rounded-md flex items-center justify-center shrink-0">
                                  <Package className="w-4 h-4 text-stone-400" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <h5 className="text-xs font-semibold text-[#1c1917] truncate">
                                  {item.productName}
                                </h5>
                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-[#786e64]">
                                  <span className="font-medium bg-white px-1.5 py-0.5 rounded border border-[#e8dfd2]">
                                    Tam: {item.size}
                                  </span>
                                  {item.color && (
                                    <span className="font-medium bg-white px-1.5 py-0.5 rounded border border-[#e8dfd2]">
                                      Cor: {item.color}
                                    </span>
                                  )}
                                  <span className="font-bold text-[#1c1917]">
                                    {item.quantity}x {formatCurrency(item.price)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Subtotal & Current Live Stock in Store */}
                            <div className="text-right shrink-0">
                              <div className="text-xs font-bold text-[#1c1917]">
                                {formatCurrency(item.price * item.quantity)}
                              </div>
                              <div className="text-[10px] text-[#8c8278] mt-0.5">
                                Estoque atual:{' '}
                                <span
                                  className={`font-semibold ${
                                    isZeroStock
                                      ? 'text-red-600'
                                      : 'text-emerald-700'
                                  }`}
                                >
                                  {currentStock} un.
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action Buttons for Mariane */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                      {/* Customer WhatsApp Quick Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenCustomerWhatsApp(order, 'confirmation')}
                          className="px-2.5 py-1.5 bg-[#25D366]/10 text-[#1a8b42] hover:bg-[#25D366]/20 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-colors border border-[#25D366]/30"
                          title="Enviar mensagem de pedido recebido e confirmado"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Avisar no WhatsApp
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Deseja realmente excluir o pedido ${order.id}?`)) {
                              onDeleteOrder(order.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-[#e8dfd2]"
                          title="Excluir pedido do histórico"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* State Transitions */}
                      <div className="flex items-center gap-2">
                        {/* If Pending: Show Confirm and Deduct Stock */}
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => onConfirmOrder(order.id)}
                            className="px-4 py-2 bg-[#1c1917] hover:bg-[#332e29] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                          >
                            <Check className="w-4 h-4 text-[#e6c687]" />
                            Confirmar Pedido & Baixar Estoque
                          </button>
                        )}

                        {/* If Confirmed: Can mark as dispatched */}
                        {isConfirmed && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateOrderStatus(order.id, 'dispatched');
                                handleOpenCustomerWhatsApp(order, 'tracking');
                              }}
                              className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              Marcar como Despachado / Enviado
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const restore = confirm(
                                  'Deseja cancelar o pedido e DEVOLVER as peças ao estoque da loja?'
                                );
                                onUpdateOrderStatus(order.id, 'cancelled', restore);
                              }}
                              className="px-2.5 py-1.5 text-stone-600 hover:text-red-700 text-xs transition-colors"
                            >
                              Cancelar
                            </button>
                          </>
                        )}

                        {/* If Dispatched */}
                        {isDispatched && (
                          <span className="text-xs text-blue-700 font-medium flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5" /> Despachado para a cliente
                          </span>
                        )}

                        {/* If Cancelled */}
                        {isCancelled && (
                          <button
                            type="button"
                            onClick={() => onUpdateOrderStatus(order.id, 'pending')}
                            className="text-xs text-[#8e6e34] hover:underline font-medium"
                          >
                            Reativar como Pendente
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
