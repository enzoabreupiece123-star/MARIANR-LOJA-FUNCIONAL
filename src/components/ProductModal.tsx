import React, { useState, useEffect } from 'react';
import { X, Check, ShoppingBag, MessageCircle, ShieldCheck, Truck, Sparkles, ChevronRight } from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { formatCurrency, cleanPhone } from '../lib/utils';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, selectedSize: string, selectedColor: string, quantity: number) => void;
  settings: StoreSettings;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  settings,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setSelectedSize(product.sizes?.[0] || 'Único');
      setSelectedColor(product.colors?.[0] || '');
      setQuantity(1);
      setAddedAnimation(false);
    }
  }, [product]);

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80'];

  const isOutOfStock = !product.in_stock || (product.stock_quantity !== undefined && product.stock_quantity <= 0);
  const stockQty = product.stock_quantity !== undefined ? product.stock_quantity : 5;
  const maxAvailableQty = Math.max(1, stockQty);

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart(product, selectedSize || 'Único', selectedColor, quantity);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
    }, 1800);
  };

  const handleDirectWhatsApp = () => {
    const cleanWa = cleanPhone(settings.whatsapp);
    const text = isOutOfStock
      ? `*Olá Mariane! Gostaria de saber quando a peça volta ao estoque ou se faz sob encomenda:*\n\n` +
        `👗 *${product.name}*\n` +
        `📏 Tamanho: *${selectedSize}*\n` +
        (selectedColor ? `🎨 Cor: *${selectedColor}*\n` : '') +
        `Obrigada!`
      : `*Olá Mariane! Tenho interesse na peça da sua loja:*\n\n` +
        `👗 *${product.name}*\n` +
        `📏 Tamanho: *${selectedSize}*\n` +
        (selectedColor ? `🎨 Cor: *${selectedColor}*\n` : '') +
        `🔢 Quantidade: *${quantity}*\n` +
        `💰 Valor: *${formatCurrency(product.price * quantity)}*\n` +
        `💳 Forma de pagamento: *PIX*\n\n` +
        `Ainda está disponível para envio ou retirada?`;

    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const discountPercent =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null;

  return (
    <div
      id="product-detail-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="product-detail-modal-content"
        className="relative bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-[#e8dfd2] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          id="close-product-modal-button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-[#1c1917] hover:text-white text-[#5c544c] shadow-sm transition-all focus:outline-none"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto">
          {/* Gallery View */}
          <div className="bg-[#f5efe6] p-4 sm:p-6 flex flex-col justify-between">
            {/* Primary Displayed Image */}
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-md bg-white">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.is_new && (
                  <span className="bg-[#c5a059] text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow">
                    Novidade
                  </span>
                )}
                {discountPercent && (
                  <span className="bg-[#9c3030] text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails row */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImageIndex === idx ? 'border-[#1c1917] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info & Action Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs text-[#8c8278] uppercase tracking-wider">
                <span>Mariane Moreira</span>
                <ChevronRight className="w-3 h-3 text-[#c5a059]" />
                <span className="text-[#1c1917] font-semibold">{product.category}</span>
              </div>

              {/* Name */}
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1917] leading-tight">
                {product.name}
              </h2>

              {/* Price Box */}
              <div className="p-3.5 bg-[#fbf9f6] rounded-xl border border-[#e8e2d8]">
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1c1917]">
                    {formatCurrency(product.price)}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-sm text-[#9c9389] line-through">
                      {formatCurrency(product.original_price)}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Pagamento exclusivo via <strong>PIX</strong> à vista</span>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-sm text-[#5c544c] leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold uppercase tracking-wider text-[#1c1917]">
                      Selecione o Tamanho:
                    </span>
                    <span className="text-[#8c8278]">{selectedSize || 'Nenhum'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[44px] h-10 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center ${
                          selectedSize === size
                            ? 'bg-[#1c1917] text-white border-[#1c1917] shadow-sm'
                            : 'bg-white text-[#3d3630] border-[#d5cbbe] hover:border-[#1c1917]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#1c1917] block">
                    Cores Disponíveis:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                          selectedColor === color
                            ? 'bg-[#f0ebe1] text-[#1c1917] border-[#8e6e34] font-semibold'
                            : 'bg-white text-[#6b6258] border-[#e2dad0] hover:border-[#8e6e34]'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper & Stock Availability */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#1c1917]">
                      Quantidade:
                    </span>
                    {!isOutOfStock ? (
                      <div className="inline-flex items-center rounded-lg border border-[#d5cbbe] bg-white">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-9 h-9 flex items-center justify-center text-sm font-bold text-[#5c544c] hover:bg-[#f5efe6] rounded-l-lg disabled:opacity-30"
                          disabled={quantity <= 1}
                        >
                          -
                        </button>
                        <span className="w-9 text-center text-xs font-bold text-[#1c1917]">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.min(maxAvailableQty, quantity + 1))}
                          className="w-9 h-9 flex items-center justify-center text-sm font-bold text-[#5c544c] hover:bg-[#f5efe6] rounded-r-lg disabled:opacity-30"
                          disabled={quantity >= maxAvailableQty}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-stone-500 italic">0 un.</span>
                    )}
                  </div>

                  {/* Stock notice badge */}
                  <div>
                    {isOutOfStock ? (
                      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-1 rounded">
                        Esgotado
                      </span>
                    ) : stockQty <= 3 ? (
                      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-1 rounded">
                        Últimas {stockQty} peças!
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                        Disponível em estoque ({stockQty} un.)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Fabric / Details */}
              {product.details && product.details.length > 0 && (
                <div className="pt-2 border-t border-[#f0ebe3] space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c8278]">
                    Detalhes & Composição:
                  </span>
                  <ul className="text-xs text-[#5c544c] space-y-1">
                    {product.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] mt-1.5 shrink-0"></span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions Section */}
            <div className="space-y-2.5 pt-4 border-t border-[#f0ebe3]">
              {!isOutOfStock ? (
                <>
                  <button
                    type="button"
                    id="add-to-cart-modal-button"
                    onClick={handleAdd}
                    className={`w-full py-4 px-6 rounded-xl text-xs uppercase tracking-[0.15em] font-semibold transition-all flex items-center justify-center gap-2 shadow-md ${
                      addedAnimation
                        ? 'bg-emerald-700 text-white'
                        : 'bg-[#1c1917] text-white hover:bg-[#322c29]'
                    }`}
                  >
                    {addedAnimation ? (
                      <>
                        <Check className="w-4 h-4 text-[#e6c687]" />
                        Adicionado à Sacola com Sucesso!
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 text-[#e6c687]" />
                        Adicionar à Sacola de Compras
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-center text-xs text-rose-800 font-medium">
                    Peça temporariamente indisponível no estoque. Você pode consultar previsão de reposição ou pedir encomenda com a Mariane no WhatsApp abaixo:
                  </div>

                  <button
                    type="button"
                    id="direct-whatsapp-modal-button"
                    onClick={handleDirectWhatsApp}
                    className="w-full py-3 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs uppercase tracking-[0.15em] font-semibold transition-all flex items-center justify-center gap-2 shadow"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Consultar Reposição / Encomenda no WhatsApp
                  </button>
                </div>
              )}

              {/* Guarantees */}
              <div className="flex items-center justify-center gap-4 text-[11px] text-[#8c8278] pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#c5a059]" /> Pagamento 100% Pix
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#c5a059]" /> Envio para Todo o Brasil
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
