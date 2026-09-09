import React from 'react';
import { Eye, ShoppingBag, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../lib/utils';

interface ProductCardProps {
  product: Product;
  onOpenProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenProduct,
  onQuickAdd,
}) => {
  const discountPercent =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null;

  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80';
  const secondaryImage = product.images?.[1] || primaryImage;

  return (
    <article
      id={`product-card-${product.id}`}
      className="group flex flex-col bg-white rounded-xl overflow-hidden border border-[#eae3d9] hover:border-[#cfc2b0] hover:shadow-md transition-all duration-300"
    >
      {/* Product Image Frame */}
      <div
        className="relative aspect-[3/4] bg-[#f2ede6] overflow-hidden cursor-pointer"
        onClick={() => onOpenProduct(product)}
      >
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={(e) => {
            // fallback if broken url
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Badges Container */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {!product.in_stock && (
            <span className="bg-[#1c1917]/90 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-sm">
              Esgotado
            </span>
          )}
          {product.in_stock && product.is_new && (
            <span className="bg-[#c5a059] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
              Novidade
            </span>
          )}
          {product.in_stock && discountPercent && (
            <span className="bg-[#9c3030] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
              -{discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3 gap-2">
          <button
            type="button"
            id={`btn-view-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenProduct(product);
            }}
            className="flex-1 py-2.5 px-3 bg-white/95 hover:bg-white text-[#1c1917] text-xs font-semibold uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 backdrop-blur-sm"
          >
            <Eye className="w-3.5 h-3.5 text-[#8e6e34]" />
            Ver Peça
          </button>
          
          {product.in_stock && (
            <button
              type="button"
              id={`btn-quick-add-${product.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(product);
              }}
              title="Adicionar à sacola"
              className="p-2.5 bg-[#1c1917] hover:bg-[#322c29] text-white rounded-lg shadow-md transition-all flex items-center justify-center"
            >
              <ShoppingBag className="w-4 h-4 text-[#e6c687]" />
            </button>
          )}
        </div>
      </div>

      {/* Product Details Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Tag */}
          <div className="flex items-center justify-between text-[11px] text-[#8c8278] uppercase tracking-wider mb-1">
            <span>{product.category}</span>
            {product.is_featured && (
              <span className="text-[#8e6e34] flex items-center gap-0.5 font-medium">
                <Sparkles className="w-3 h-3" /> Destaque
              </span>
            )}
          </div>

          {/* Product Title */}
          <h2
            onClick={() => onOpenProduct(product)}
            className="font-serif text-base sm:text-lg font-medium text-[#1c1917] leading-snug cursor-pointer hover:text-[#8e6e34] transition-colors line-clamp-2"
          >
            {product.name}
          </h2>
        </div>

        {/* Sizes Pill row */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center">
            <span className="text-[10px] text-[#9c9389] uppercase mr-1">Tam:</span>
            {product.sizes.map((s, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium bg-[#f5efe6] text-[#4d443c] px-1.5 py-0.5 rounded border border-[#e4dcd0]"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Price & Pix Callout */}
        <div className="pt-2 border-t border-[#f0ebe3]">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-lg sm:text-xl font-bold text-[#1c1917]">
              {formatCurrency(product.price)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-xs text-[#9c9389] line-through">
                {formatCurrency(product.original_price)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-1 text-[11px] text-[#6b6258]">
            <span className="text-emerald-700 font-medium">Pagamento via PIX</span>
            <button
              onClick={() => onOpenProduct(product)}
              className="text-[#8e6e34] hover:underline font-medium"
            >
              Detalhes &rarr;
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
