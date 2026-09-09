import React, { useState } from 'react';
import { ShoppingBag, Search, ShieldCheck, Phone, X, Menu, Sparkles } from 'lucide-react';
import { Category } from '../types';

interface NavbarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  whatsappNumber: string;
  isSupabaseConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  cartCount,
  onOpenCart,
  onOpenAdmin,
  whatsappNumber,
  isSupabaseConnected,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const cleanWa = whatsappNumber.replace(/\D/g, '');

  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#e8e2d8] transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-[#1c1917] text-[#f5f1ea] text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <span className="inline-block w-2 h-2 rounded-full bg-[#c5a059] animate-pulse"></span>
            <span className="font-medium tracking-wide">
              Coleção Exclusiva | Pagamento via <strong className="text-[#e6c687] font-semibold">PIX</strong> com Envio para Todo Brasil
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[11px] text-[#cfc7be]">
            {isSupabaseConnected ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Supabase Ativo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Modo Catálogo
              </span>
            )}
            <a
              href={`https://wa.me/${cleanWa}?text=${encodeURIComponent('Olá Mariane! Gostaria de tirar uma dúvida sobre as peças da loja.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3 h-3 text-[#c5a059]" />
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              id="mobile-menu-toggle-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-[#242120] hover:text-[#c5a059] transition-colors focus:outline-none"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <button
              type="button"
              id="mobile-search-toggle-button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-[#242120] hover:text-[#c5a059] transition-colors"
              aria-label="Buscar produtos"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Brand Logo / Typography */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <button
              onClick={() => onSelectCategory('todas')}
              className="group inline-flex flex-col items-center lg:items-start text-left focus:outline-none"
            >
              <span className="font-serif text-2xl sm:text-3xl tracking-[0.2em] font-semibold text-[#1c1917] uppercase group-hover:text-[#936f33] transition-colors">
                Mariane Moreira
              </span>
              <span className="text-[10px] sm:text-xs tracking-[0.45em] text-[#8c827a] uppercase font-light -mt-1 group-hover:tracking-[0.55em] transition-all">
                C O N C E P T S
              </span>
            </button>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-xs mx-8">
            <div className="relative w-full">
              <input
                id="desktop-search-input"
                type="text"
                placeholder="Buscar vestidos, conjuntos, linho..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-[#f0ebe1] text-[#242120] text-xs placeholder-[#9c9389] pl-9 pr-4 py-2.5 rounded-full border border-transparent focus:border-[#c5a059] focus:bg-white focus:outline-none transition-all"
              />
              <Search className="w-4 h-4 text-[#9c9389] absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9c9389] hover:text-[#1c1917]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Admin Portal Button */}
            <button
              type="button"
              id="admin-access-button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6e645a] hover:text-[#1c1917] hover:bg-[#ede7dd] rounded-full transition-colors border border-[#e2dad0]"
              title="Área da Dona / Administradora"
            >
              <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
              <span className="hidden md:inline">Painel da Dona</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              type="button"
              id="navbar-cart-button"
              onClick={onOpenCart}
              className="relative inline-flex items-center gap-2 px-3.5 py-2 bg-[#1c1917] text-white hover:bg-[#322c29] rounded-full transition-all shadow-sm focus:outline-none"
              aria-label="Abrir sacola de compras"
            >
              <ShoppingBag className="w-4 h-4 text-[#e6c687]" />
              <span className="text-xs font-medium tracking-wide hidden sm:inline">Sacola</span>
              <span className="inline-flex items-center justify-center bg-[#c5a059] text-white text-[11px] font-bold h-5 min-w-[20px] px-1.5 rounded-full">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Input (Expandable) */}
        {searchOpen && (
          <div className="lg:hidden pb-4 pt-1">
            <div className="relative w-full">
              <input
                id="mobile-search-input"
                type="text"
                placeholder="Buscar roupas, categorias..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                autoFocus
                className="w-full bg-[#f0ebe1] text-[#242120] text-sm placeholder-[#9c9389] pl-9 pr-4 py-2.5 rounded-full border border-[#c5a059] focus:outline-none"
              />
              <Search className="w-4 h-4 text-[#9c9389] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        )}

        {/* Desktop Category Navigation */}
        <nav className="hidden lg:flex items-center justify-center space-x-1 py-3 border-t border-[#eee8df] overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => onSelectCategory('todas')}
            className={`px-4 py-1.5 text-xs uppercase tracking-[0.15em] font-medium rounded-full transition-all whitespace-nowrap ${
              selectedCategory === 'todas'
                ? 'bg-[#1c1917] text-white font-semibold'
                : 'text-[#5e554d] hover:text-[#1c1917] hover:bg-[#f0ebe1]'
            }`}
          >
            Todas as Peças
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.slug)}
              className={`px-4 py-1.5 text-xs uppercase tracking-[0.15em] font-medium rounded-full transition-all whitespace-nowrap ${
                selectedCategory === cat.slug
                  ? 'bg-[#1c1917] text-white font-semibold'
                  : 'text-[#5e554d] hover:text-[#1c1917] hover:bg-[#f0ebe1]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#faf8f5] border-b border-[#e0d8cc] px-4 pt-2 pb-6 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-widest text-[#8c827a] px-3 pt-2">
            Categorias
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                onSelectCategory('todas');
                setMobileMenuOpen(false);
              }}
              className={`px-3 py-2 text-xs uppercase tracking-wider rounded-lg text-left transition-colors ${
                selectedCategory === 'todas'
                  ? 'bg-[#1c1917] text-white font-semibold'
                  : 'bg-[#f0ebe1] text-[#3d3630]'
              }`}
            >
              Todas as Peças
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onSelectCategory(cat.slug);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 text-xs uppercase tracking-wider rounded-lg text-left transition-colors truncate ${
                  selectedCategory === cat.slug
                    ? 'bg-[#1c1917] text-white font-semibold'
                    : 'bg-[#f0ebe1] text-[#3d3630]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-[#e8e2d8] flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-[#242120] bg-[#ede7dd] rounded-lg"
            >
              <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
              Acessar Painel da Dona (Cadastrar Peças)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
