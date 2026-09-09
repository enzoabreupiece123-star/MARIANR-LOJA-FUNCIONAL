import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminModal } from './components/AdminModal';
import { RenderSupabaseGuideModal } from './components/RenderSupabaseGuideModal';
import { Footer } from './components/Footer';

import { Product, Category, CartItem, StoreSettings } from './types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SETTINGS } from './data/initialProducts';
import {
  getSupabase,
  fetchRemoteProducts,
  upsertRemoteProduct,
  deleteRemoteProduct,
  getStoredSupabaseConfig,
} from './lib/supabase';
import { Sparkles, SlidersHorizontal, ShoppingBag, Check, Phone } from 'lucide-react';
import { cleanPhone } from './lib/utils';

export default function App() {
  // 1. Initial State from localStorage or Seeds
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('mariane_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('mariane_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_CATEGORIES;
      }
    }
    return INITIAL_CATEGORIES;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('mariane_settings');
    if (saved) {
      try {
        return { ...INITIAL_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return INITIAL_SETTINGS;
      }
    }
    return INITIAL_SETTINGS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('mariane_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // UI States
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 2. Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('mariane_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('mariane_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('mariane_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('mariane_cart', JSON.stringify(cart));
  }, [cart]);

  // 3. Attempt Supabase Sync on Mount
  const refreshFromSupabase = async () => {
    const { url, key } = getStoredSupabaseConfig();
    if (url && key) {
      const sb = getSupabase();
      if (sb) {
        setIsSupabaseConnected(true);
        const remoteProds = await fetchRemoteProducts();
        if (remoteProds && remoteProds.length > 0) {
          setProducts(remoteProds);
        }
        return;
      }
    }
    setIsSupabaseConnected(false);
  };

  useEffect(() => {
    refreshFromSupabase();
  }, []);

  // Quick Toast Trigger
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  // Cart Operations
  const handleAddToCart = (product: Product, selectedSize: string, selectedColor: string, quantity: number = 1) => {
    const cartItemId = `${product.id}_${selectedSize}_${selectedColor || 'default'}`;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === cartItemId);
      if (existing) {
        return prevCart.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prevCart,
        {
          id: cartItemId,
          product,
          selectedSize,
          selectedColor,
          quantity,
        },
      ];
    });

    triggerToast(`"${product.name}" foi adicionado à sua sacola!`);
  };

  const handleQuickAdd = (product: Product) => {
    const size = product.sizes?.[0] || 'Único';
    const color = product.colors?.[0] || '';
    handleAddToCart(product, size, color, 1);
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Admin Product Operations
  const handleSaveProduct = async (savedProduct: Product) => {
    setProducts((prev) => {
      const index = prev.findIndex((p) => p.id === savedProduct.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = savedProduct;
        return next;
      }
      return [savedProduct, ...prev];
    });

    if (isSupabaseConnected) {
      await upsertRemoteProduct(savedProduct);
    }

    triggerToast('Peça salva com sucesso no catálogo!');
  };

  const handleDeleteProduct = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (isSupabaseConnected) {
      await deleteRemoteProduct(productId);
    }
    triggerToast('Peça removida do catálogo.');
  };

  // Admin Category Operations
  const handleSaveCategory = (newCategory: Category) => {
    setCategories((prev) => [...prev, newCategory]);
    triggerToast(`Categoria "${newCategory.name}" criada com sucesso!`);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    triggerToast('Categoria removida.');
  };

  // Admin Settings Operations
  const handleSaveSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    triggerToast('Configurações atualizadas!');
  };

  // Filter and Sort Products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Category Filter
      if (selectedCategory !== 'todas') {
        const catMatch =
          item.category.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') === selectedCategory ||
          item.category.toLowerCase() === selectedCategory.toLowerCase();

        // If category is "lancamentos", also match items with is_new
        if (selectedCategory === 'lancamentos') {
          if (!catMatch && !item.is_new) return false;
        } else if (!catMatch) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const inName = item.name.toLowerCase().includes(q);
        const inCat = item.category.toLowerCase().includes(q);
        const inDesc = item.description?.toLowerCase().includes(q);
        const inColors = item.colors?.some((c) => c.toLowerCase().includes(q));
        if (!inName && !inCat && !inDesc && !inColors) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      // Default: featured first, then new, then order
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      if (a.is_new && !b.is_new) return -1;
      if (!a.is_new && b.is_new) return 1;
      return 0;
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const cleanWa = cleanPhone(settings.whatsapp);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-[#242120]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 bg-[#1c1917] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs border border-stone-700 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        whatsappNumber={settings.whatsapp}
        isSupabaseConnected={isSupabaseConnected}
      />

      {/* Hero Banner with Editorial Aesthetic */}
      <HeroBanner
        onExploreClick={() => {
          const el = document.getElementById('catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        whatsappNumber={settings.whatsapp}
      />

      {/* Catalog Main Section */}
      <main id="catalog-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Controls Bar: Category Title, Counter, and Sort */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-[#e8dfd2] gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8e6e34]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Coleção Mariane Moreira</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#1c1917] mt-1 capitalize">
              {selectedCategory === 'todas'
                ? 'Todas as Peças'
                : categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
            </h2>
            <p className="text-xs sm:text-sm text-[#786e64] mt-1">
              Exibindo <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'peça exclusiva' : 'peças exclusivas'} com pagamento via PIX.
            </p>
          </div>

          {/* Sort Dropdown & Quick Filters */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="flex items-center gap-1.5 text-xs text-[#5c544c]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#8e6e34]" />
              <span className="hidden sm:inline">Ordenar:</span>
            </div>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-white text-[#1c1917] border border-[#d5cbbe] rounded-lg px-3 py-2 focus:border-[#8e6e34] focus:outline-none"
            >
              <option value="featured">Destaques da Coleção</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
              <option value="name">Nome (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Quick Category Pills on Mobile */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto py-4 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('todas')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all ${
              selectedCategory === 'todas'
                ? 'bg-[#1c1917] text-white'
                : 'bg-[#f0ebe1] text-[#5c544c]'
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-[#1c1917] text-white'
                  : 'bg-[#f0ebe1] text-[#5c544c]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#f0ebe1] flex items-center justify-center text-[#8e6e34] mx-auto">
              <ShoppingBag className="w-8 h-8 opacity-60" />
            </div>
            <h3 className="font-serif text-xl font-medium text-[#1c1917]">
              Nenhuma peça encontrada
            </h3>
            <p className="text-xs text-[#786e64] leading-relaxed">
              Não encontramos nenhum item para os filtros selecionados. Tente buscar por outros termos ou limpe a busca.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('todas');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 bg-[#1c1917] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#322c29] transition-all"
            >
              Ver Todas as Peças
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:gap-8 pt-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenProduct={(prod) => setActiveProduct(prod)}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>
        )}

        {/* Custom Order Callout */}
        <section className="mt-16 sm:mt-24 p-6 sm:p-10 rounded-2xl bg-[#f2ebd9] border border-[#ded1be] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[11px] font-bold tracking-widest text-[#735a2e] uppercase">
              Sob Medida & Consultoria de Estilo
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#1c1917]">
              Não encontrou o seu tamanho ou cor favorita?
            </h3>
            <p className="text-xs sm:text-sm text-[#5c544c] max-w-xl">
              A estilista Mariane Moreira realiza confecções sob encomenda com medidas personalizadas e tecidos exclusivos para eventos, casamentos ou ocasiões especiais.
            </p>
          </div>

          <a
            href={`https://wa.me/${cleanWa}?text=${encodeURIComponent('Olá Mariane! Gostaria de encomendar uma peça sob medida ou consultar cores especiais.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-[#1c1917] hover:bg-[#322c29] text-white text-xs font-semibold uppercase tracking-[0.15em] rounded-full transition-all shrink-0 flex items-center gap-2 shadow-sm"
          >
            <Phone className="w-4 h-4 text-[#25D366]" />
            Encomendar no WhatsApp
          </a>
        </section>
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Floating WhatsApp Quick Action Button */}
      <a
        href={`https://wa.me/${cleanWa}?text=${encodeURIComponent('Olá Mariane! Estou no site da Mariane Moreira Concepts e gostaria de atendimento.')}`}
        target="_blank"
        rel="noopener noreferrer"
        id="floating-whatsapp-button"
        className="fixed bottom-6 right-6 z-40 p-3.5 bg-[#25D366] text-white rounded-full shadow-xl hover:scale-105 hover:bg-[#20bd5a] transition-all flex items-center justify-center group"
        aria-label="Falar com Mariane no WhatsApp"
      >
        <Phone className="w-6 h-6 fill-current" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-semibold pl-0 group-hover:pl-2">
          Falar no WhatsApp
        </span>
      </a>

      {/* MODAL 1: Product Detail View */}
      <ProductModal
        product={activeProduct}
        onClose={() => setActiveProduct(null)}
        onAddToCart={handleAddToCart}
        settings={settings}
      />

      {/* MODAL 2: Cart & WhatsApp Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        settings={settings}
      />

      {/* MODAL 3: Admin Panel for Mariane */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        categories={categories}
        settings={settings}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={handleDeleteProduct}
        onSaveCategory={handleSaveCategory}
        onDeleteCategory={handleDeleteCategory}
        onSaveSettings={handleSaveSettings}
        onOpenGuide={() => setIsGuideOpen(true)}
        isSupabaseConnected={isSupabaseConnected}
        onRefreshData={refreshFromSupabase}
      />

      {/* MODAL 4: Free Render & Supabase Step-by-Step Guide */}
      <RenderSupabaseGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
