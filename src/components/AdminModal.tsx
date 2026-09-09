import React, { useState } from 'react';
import {
  X, Plus, Trash2, Edit3, ShieldCheck, Database, Key, Sparkles, Check,
  AlertCircle, Image as ImageIcon, Save, ArrowLeft, RefreshCw, HelpCircle, Eye
} from 'lucide-react';
import { Product, Category, StoreSettings } from '../types';
import { formatCurrency } from '../lib/utils';
import { testSupabaseConnection, saveSupabaseConfig, upsertRemoteProduct, deleteRemoteProduct } from '../lib/supabase';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onSaveCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onSaveSettings: (newSettings: StoreSettings) => void;
  onOpenGuide: () => void;
  isSupabaseConnected: boolean;
  onRefreshData: () => void;
}

const PRESET_FASHION_IMAGES = [
  { label: 'Vestido Linho Terracota', url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Conjunto Colete Areia', url: 'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Blazer Alfaiataria Camel', url: 'https://images.unsplash.com/photo-1548624149-f9b1859aa9d0?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Camisa Seda Off-White', url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Pantalona Alfaiataria', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Vestido Transpasse Preto', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80' },
];

const STANDARD_SIZES = ['PP', 'P', 'M', 'G', 'GG', '36', '38', '40', '42', '44', 'Único'];

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  products,
  categories,
  settings,
  onSaveProduct,
  onDeleteProduct,
  onSaveCategory,
  onDeleteCategory,
  onSaveSettings,
  onOpenGuide,
  isSupabaseConnected,
  onRefreshData,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'products' | 'form' | 'categories' | 'settings' | 'supabase'>('products');

  // Product Form State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]?.name || 'Vestidos');
  const [formPrice, setFormPrice] = useState('');
  const [formOriginalPrice, setFormOriginalPrice] = useState('');
  const [formImagesText, setFormImagesText] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDetailsText, setFormDetailsText] = useState('');
  const [formSizes, setFormSizes] = useState<string[]>(['P', 'M', 'G']);
  const [formColorsText, setFormColorsText] = useState('Terracota, Off-White, Preto');
  const [formInStock, setFormInStock] = useState(true);
  const [formIsNew, setFormIsNew] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);

  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDescription, setNewCatDescription] = useState('');

  // Settings State
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(settings);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Supabase test state
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  // Handle PIN Login
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === settings.adminPin || pinInput.trim() === '1234') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  // Open Form for New Product
  const handleStartNewProduct = () => {
    setEditingProductId(null);
    setFormName('');
    setFormCategory(categories[0]?.name || 'Vestidos');
    setFormPrice('');
    setFormOriginalPrice('');
    setFormImagesText('https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80');
    setFormDescription('Peça exclusiva com caimento fluido e acabamento sofisticado em alfaiataria autoral.');
    setFormDetailsText('Puro linho com toque suave\nForro interno 100% algodão\nFechamento com zíper invisível');
    setFormSizes(['P', 'M', 'G']);
    setFormColorsText('Areia, Terracota, Preto');
    setFormInStock(true);
    setFormIsNew(true);
    setFormIsFeatured(false);
    setActiveTab('form');
  };

  // Open Form for Editing Existing Product
  const handleStartEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormPrice(String(prod.price));
    setFormOriginalPrice(prod.original_price ? String(prod.original_price) : '');
    setFormImagesText(prod.images.join('\n'));
    setFormDescription(prod.description);
    setFormDetailsText(prod.details ? prod.details.join('\n') : '');
    setFormSizes(prod.sizes || ['P', 'M', 'G']);
    setFormColorsText(prod.colors ? prod.colors.join(', ') : '');
    setFormInStock(prod.in_stock);
    setFormIsNew(prod.is_new ?? false);
    setFormIsFeatured(prod.is_featured ?? false);
    setActiveTab('form');
  };

  // Save Product
  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(formPrice.replace(',', '.'));
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Por favor, informe um preço válido.');
      return;
    }

    const origPriceNum = formOriginalPrice.trim() ? parseFloat(formOriginalPrice.replace(',', '.')) : null;

    const images = formImagesText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const details = formDetailsText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const colors = formColorsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newProduct: Product = {
      id: editingProductId || `prod-${Date.now()}`,
      name: formName.trim(),
      category: formCategory,
      price: priceNum,
      original_price: origPriceNum,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80'],
      description: formDescription.trim(),
      details,
      sizes: formSizes.length > 0 ? formSizes : ['Único'],
      colors,
      in_stock: formInStock,
      is_new: formIsNew,
      is_featured: formIsFeatured,
      created_at: new Date().toISOString(),
    };

    onSaveProduct(newProduct);
    setActiveTab('products');
  };

  // Toggle Size in Form
  const toggleSize = (size: string) => {
    if (formSizes.includes(size)) {
      setFormSizes(formSizes.filter((s) => s !== size));
    } else {
      setFormSizes([...formSizes, size]);
    }
  };

  // Add Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const slug = newCatName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      slug,
      description: newCatDescription.trim(),
    };

    onSaveCategory(newCat);
    setNewCatName('');
    setNewCatDescription('');
  };

  // Save Settings
  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(storeSettings);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 2500);
  };

  // Test Supabase
  const handleTestSupabase = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(storeSettings.supabaseUrl, storeSettings.supabaseAnonKey);
    setTestResult(res);
    setIsTesting(false);
    if (res.success) {
      saveSupabaseConfig(storeSettings.supabaseUrl, storeSettings.supabaseAnonKey);
      onRefreshData();
    }
  };

  return (
    <div
      id="admin-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        id="admin-modal-container"
        className="relative bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#e8dfd2] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#1c1917] text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#c5a059]/20 text-[#e6c687]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-medium tracking-wide">
                Painel da Dona | Mariane Moreira Concepts
              </h2>
              <p className="text-[11px] text-stone-400">
                Gerencie catálogo de roupas, preços, categorias, chave PIX e conexão Supabase
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setIsAuthenticated(false)}
                className="text-xs text-stone-400 hover:text-white px-2.5 py-1 rounded border border-stone-700 hover:bg-stone-800 transition-colors"
              >
                Bloquear
              </button>
            )}
            <button
              type="button"
              id="close-admin-modal-button"
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              aria-label="Fechar painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PIN Screen if not authenticated */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-5 my-auto">
            <div className="w-16 h-16 rounded-full bg-[#faf5ec] flex items-center justify-center text-[#8e6e34] border border-[#e8dfd2]">
              <Key className="w-8 h-8" />
            </div>

            <div className="space-y-1 max-w-sm">
              <h3 className="font-serif text-2xl font-medium text-[#1c1917]">
                Acesso Restrito da Administradora
              </h3>
              <p className="text-xs text-[#786e64] leading-relaxed">
                Digite o seu PIN de 4 dígitos para postar novas roupas e alterar preços. (PIN padrão: <strong className="text-[#1c1917]">1234</strong>)
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="w-full max-w-xs space-y-4">
              <input
                id="admin-pin-input"
                type="password"
                maxLength={8}
                autoFocus
                placeholder="PIN de acesso..."
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 px-4 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
              />

              {pinError && (
                <div className="text-xs text-red-600 font-medium">
                  PIN incorreto. Tente '1234' ou verifique o PIN configurado.
                </div>
              )}

              <button
                type="submit"
                id="admin-login-submit-button"
                className="w-full py-3 bg-[#1c1917] hover:bg-[#322c29] text-white rounded-xl text-xs uppercase tracking-[0.15em] font-semibold transition-all shadow-sm"
              >
                Entrar no Painel
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Nav Tabs */}
            <div className="flex items-center gap-1 px-4 sm:px-6 bg-[#faf8f5] border-b border-[#e8dfd2] overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`py-3 px-3 sm:px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'products'
                    ? 'border-[#1c1917] text-[#1c1917]'
                    : 'border-transparent text-[#786e64] hover:text-[#1c1917]'
                }`}
              >
                Catálogo ({products.length} peças)
              </button>

              <button
                type="button"
                onClick={handleStartNewProduct}
                className={`py-3 px-3 sm:px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'form'
                    ? 'border-[#1c1917] text-[#1c1917]'
                    : 'border-transparent text-[#8e6e34] hover:text-[#1c1917]'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                {editingProductId ? 'Editar Peça' : 'Postar Nova Peça'}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('categories')}
                className={`py-3 px-3 sm:px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'categories'
                    ? 'border-[#1c1917] text-[#1c1917]'
                    : 'border-transparent text-[#786e64] hover:text-[#1c1917]'
                }`}
              >
                Categorias ({categories.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`py-3 px-3 sm:px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'border-[#1c1917] text-[#1c1917]'
                    : 'border-transparent text-[#786e64] hover:text-[#1c1917]'
                }`}
              >
                WhatsApp & PIX
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('supabase')}
                className={`py-3 px-3 sm:px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'supabase'
                    ? 'border-[#1c1917] text-[#1c1917]'
                    : 'border-transparent text-[#786e64] hover:text-[#1c1917]'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-[#8e6e34]" />
                Supabase & Render
              </button>
            </div>

            {/* Tab Panels */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
              {/* TAB 1: PRODUCTS LIST */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-lg font-medium text-[#1c1917]">
                        Roupas da Coleção
                      </h3>
                      <p className="text-xs text-[#786e64]">
                        Gerencie preços, fotos, tamanhos e disponibilidade imediata.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onRefreshData}
                        className="px-3 py-2 text-xs text-[#5c544c] hover:text-[#1c1917] border border-[#d5cbbe] rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Atualizar
                      </button>
                      <button
                        type="button"
                        id="admin-add-product-button"
                        onClick={handleStartNewProduct}
                        className="px-4 py-2 bg-[#1c1917] hover:bg-[#322c29] text-white text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Plus className="w-4 h-4" /> Postar Nova Peça
                      </button>
                    </div>
                  </div>

                  {/* Products Table */}
                  <div className="border border-[#e8dfd2] rounded-xl overflow-hidden shadow-sm">
                    <div className="divide-y divide-[#e8dfd2]">
                      {products.map((prod) => (
                        <div
                          key={prod.id}
                          className="p-3 sm:p-4 flex items-center justify-between gap-4 hover:bg-[#fcfaf7] transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={prod.images[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=300&q=80'}
                              alt={prod.name}
                              className="w-12 h-16 object-cover rounded-lg bg-[#f0ebe1] shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8e6e34]">
                                {prod.category}
                              </span>
                              <h4 className="text-xs sm:text-sm font-semibold text-[#1c1917] truncate">
                                {prod.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-bold text-[#1c1917]">
                                  {formatCurrency(prod.price)}
                                </span>
                                {prod.original_price && (
                                  <span className="text-[11px] text-[#9c9389] line-through">
                                    {formatCurrency(prod.original_price)}
                                  </span>
                                )}
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                    prod.in_stock
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {prod.in_stock ? 'Em Estoque' : 'Esgotado'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEditProduct(prod)}
                              className="p-2 text-[#5c544c] hover:text-[#1c1917] hover:bg-[#f0ebe1] rounded-lg transition-colors border border-[#e8dfd2]"
                              title="Editar Roupa"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Deseja realmente excluir "${prod.name}" do catálogo?`)) {
                                  onDeleteProduct(prod.id);
                                }
                              }}
                              className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-[#e8dfd2]"
                              title="Excluir Roupa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRODUCT FORM */}
              {activeTab === 'form' && (
                <form onSubmit={handleSaveProductSubmit} className="space-y-6 max-w-3xl mx-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-[#e8dfd2]">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('products')}
                        className="p-1 text-[#786e64] hover:text-[#1c1917]"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <h3 className="font-serif text-lg font-medium text-[#1c1917]">
                        {editingProductId ? 'Editar Roupa' : 'Cadastrar Nova Roupa'}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                        Nome da Peça *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Vestido Midi Linho Riviera Terracota"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                        Categoria *
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                        Preço à Vista no PIX (R$) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="349.90"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none font-semibold text-[#1c1917]"
                      />
                    </div>

                    {/* Original Price */}
                    <div>
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                        Preço Original / De (Opcional para Promoção)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 389.90"
                        value={formOriginalPrice}
                        onChange={(e) => setFormOriginalPrice(e.target.value)}
                        className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                      />
                      <span className="text-[10px] text-[#8c8278]">
                        Se preenchido, exibirá etiqueta de desconto (ex: -15% OFF).
                      </span>
                    </div>

                    {/* Colors */}
                    <div>
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                        Cores Disponíveis (separadas por vírgula)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Terracota, Off-White, Preto"
                        value={formColorsText}
                        onChange={(e) => setFormColorsText(e.target.value)}
                        className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                      />
                    </div>

                    {/* Sizes Selection */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-semibold text-[#5c544c]">
                        Tamanhos Disponíveis (Clique para ativar/desativar):
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {STANDARD_SIZES.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => toggleSize(size)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                              formSizes.includes(size)
                                ? 'bg-[#1c1917] text-white border-[#1c1917]'
                                : 'bg-white text-[#786e64] border-[#d5cbbe] hover:border-[#1c1917]'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image URLs & Preset Selection */}
                    <div className="sm:col-span-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-[#5c544c]">
                          Links das Fotos (uma URL por linha):
                        </label>
                        <span className="text-[11px] text-[#8e6e34]">
                          Ou selecione fotos prontas abaixo
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        required
                        placeholder="https://..."
                        value={formImagesText}
                        onChange={(e) => setFormImagesText(e.target.value)}
                        className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none font-mono"
                      />

                      {/* Presets */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        <span className="text-[10px] text-[#8c8278] uppercase shrink-0">Fotos Prontas:</span>
                        {PRESET_FASHION_IMAGES.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              if (!formImagesText.includes(preset.url)) {
                                setFormImagesText((prev) => (prev ? prev + '\n' + preset.url : preset.url));
                              }
                            }}
                            className="px-2 py-1 text-[10px] bg-[#f0ebe1] hover:bg-[#e4dcd0] text-[#4d443c] rounded border border-[#d5cbbe] shrink-0"
                          >
                            + {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                        Descrição da Roupa
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Descreva a elegância, caimento e proposta do look..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                      />
                    </div>

                    {/* Details / Composition */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                        Detalhes & Composição do Tecido (um por linha)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Composição: 70% Linho, 30% Viscose&#10;Forro acetinado&#10;Bolsos laterais"
                        value={formDetailsText}
                        onChange={(e) => setFormDetailsText(e.target.value)}
                        className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                      />
                    </div>

                    {/* Toggles */}
                    <div className="sm:col-span-2 grid grid-cols-3 gap-3 p-3 bg-[#faf8f5] rounded-xl border border-[#e8dfd2]">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#1c1917]">
                        <input
                          type="checkbox"
                          checked={formInStock}
                          onChange={(e) => setFormInStock(e.target.checked)}
                          className="w-4 h-4 rounded text-[#1c1917] focus:ring-[#8e6e34]"
                        />
                        <span>Em Estoque</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#1c1917]">
                        <input
                          type="checkbox"
                          checked={formIsNew}
                          onChange={(e) => setFormIsNew(e.target.checked)}
                          className="w-4 h-4 rounded text-[#1c1917] focus:ring-[#8e6e34]"
                        />
                        <span>Tag 'Novidade'</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#1c1917]">
                        <input
                          type="checkbox"
                          checked={formIsFeatured}
                          onChange={(e) => setFormIsFeatured(e.target.checked)}
                          className="w-4 h-4 rounded text-[#1c1917] focus:ring-[#8e6e34]"
                        />
                        <span>Destaque na Home</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e8dfd2]">
                    <button
                      type="button"
                      onClick={() => setActiveTab('products')}
                      className="px-5 py-2.5 text-xs text-[#5c544c] hover:text-[#1c1917] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      id="save-product-submit-button"
                      className="px-6 py-2.5 bg-[#1c1917] hover:bg-[#322c29] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                    >
                      <Save className="w-4 h-4 text-[#e6c687]" />
                      Salvar Roupa no Catálogo
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: CATEGORIES */}
              {activeTab === 'categories' && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div>
                    <h3 className="font-serif text-lg font-medium text-[#1c1917]">
                      Categorias da Loja
                    </h3>
                    <p className="text-xs text-[#786e64]">
                      Crie seções como Vestidos, Alfaiataria, Conjuntos, Lançamentos, etc.
                    </p>
                  </div>

                  {/* Add Category Form */}
                  <form onSubmit={handleAddCategory} className="p-4 bg-[#faf8f5] rounded-xl border border-[#e8dfd2] space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1c1917]">
                      Criar Nova Categoria
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Nome da categoria (ex: Moda Praia)"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-lg focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Breve descrição..."
                        value={newCatDescription}
                        onChange={(e) => setNewCatDescription(e.target.value)}
                        className="text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-lg focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#1c1917] hover:bg-[#322c29] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar Categoria
                    </button>
                  </form>

                  {/* Existing Categories List */}
                  <div className="divide-y divide-[#e8dfd2] border border-[#e8dfd2] rounded-xl overflow-hidden">
                    {categories.map((cat) => (
                      <div key={cat.id} className="p-3 sm:p-4 flex items-center justify-between hover:bg-[#faf8f5]">
                        <div>
                          <div className="text-xs font-bold text-[#1c1917]">{cat.name}</div>
                          <div className="text-[11px] text-[#786e64]">{cat.description || `Slug: ${cat.slug}`}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Deseja excluir a categoria "${cat.name}"?`)) {
                              onDeleteCategory(cat.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: SETTINGS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettingsSubmit} className="space-y-6 max-w-2xl mx-auto">
                  <div>
                    <h3 className="font-serif text-lg font-medium text-[#1c1917]">
                      Configurações da Loja, WhatsApp e PIX
                    </h3>
                    <p className="text-xs text-[#786e64]">
                      Personalize para onde os pedidos serão enviados e a chave Pix que as clientes verão.
                    </p>
                  </div>

                  {settingsSavedToast && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      Configurações salvas com sucesso!
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                        WhatsApp da Loja (Número com DDD, ex: 5511999999999) *
                      </label>
                      <input
                        type="text"
                        required
                        value={storeSettings.whatsapp}
                        onChange={(e) => setStoreSettings({ ...storeSettings, whatsapp: e.target.value })}
                        className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                          Chave PIX da Loja *
                        </label>
                        <input
                          type="text"
                          required
                          value={storeSettings.pixKey}
                          onChange={(e) => setStoreSettings({ ...storeSettings, pixKey: e.target.value })}
                          className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                          Tipo de Chave PIX
                        </label>
                        <select
                          value={storeSettings.pixKeyType}
                          onChange={(e) => setStoreSettings({ ...storeSettings, pixKeyType: e.target.value as any })}
                          className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                        >
                          <option value="email">E-mail</option>
                          <option value="cpf">CPF</option>
                          <option value="cnpj">CNPJ</option>
                          <option value="phone">Celular</option>
                          <option value="random">Chave Aleatória</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                          Nome do Titular da Conta PIX *
                        </label>
                        <input
                          type="text"
                          required
                          value={storeSettings.pixBeneficiary}
                          onChange={(e) => setStoreSettings({ ...storeSettings, pixBeneficiary: e.target.value })}
                          className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                          Cidade do Titular PIX
                        </label>
                        <input
                          type="text"
                          value={storeSettings.pixCity}
                          onChange={(e) => setStoreSettings({ ...storeSettings, pixCity: e.target.value })}
                          className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                        PIN de Acesso da Administradora (4 dígitos)
                      </label>
                      <input
                        type="text"
                        maxLength={8}
                        value={storeSettings.adminPin}
                        onChange={(e) => setStoreSettings({ ...storeSettings, adminPin: e.target.value })}
                        className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[#e8dfd2]">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#1c1917] hover:bg-[#322c29] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                    >
                      <Save className="w-4 h-4 text-[#e6c687]" />
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 5: SUPABASE & RENDER */}
              {activeTab === 'supabase' && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-medium text-[#1c1917] flex items-center gap-2">
                        <Database className="w-5 h-5 text-[#8e6e34]" />
                        Conexão com Banco de Dados Supabase
                      </h3>
                      <p className="text-xs text-[#786e64]">
                        Hospede gratuitamente seu catálogo em nuvem no Supabase e publique na Render.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={onOpenGuide}
                      className="px-3 py-1.5 bg-[#f0ebe1] hover:bg-[#e4dcd0] text-[#1c1917] text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-[#d5cbbe]"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-[#8e6e34]" /> Ver Guia Render & Supabase
                    </button>
                  </div>

                  {/* Status Banner */}
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    isSupabaseConnected ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                      <div>
                        <div className="text-xs font-bold">
                          {isSupabaseConnected ? 'Supabase Conectado e Sincronizado!' : 'Modo Catálogo Local Ativo'}
                        </div>
                        <div className="text-[11px] opacity-80">
                          {isSupabaseConnected
                            ? 'Todas as peças estão sendo salvas em nuvem no Supabase.'
                            : 'A loja funciona 100% no navegador. Para salvar em nuvem, insira sua URL e Anon Key abaixo.'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Supabase credentials inputs */}
                  <div className="space-y-3 bg-[#faf8f5] p-4 rounded-xl border border-[#e8dfd2]">
                    <div>
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                        Supabase Project URL (ex: https://xyz.supabase.co)
                      </label>
                      <input
                        type="text"
                        placeholder="https://xyz.supabase.co"
                        value={storeSettings.supabaseUrl}
                        onChange={(e) => setStoreSettings({ ...storeSettings, supabaseUrl: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-lg focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                        Supabase Anon / Public Key
                      </label>
                      <input
                        type="password"
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                        value={storeSettings.supabaseAnonKey}
                        onChange={(e) => setStoreSettings({ ...storeSettings, supabaseAnonKey: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-lg focus:outline-none font-mono"
                      />
                    </div>

                    {testResult && (
                      <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                        testResult.success ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {testResult.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                        <span>{testResult.message}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        disabled={isTesting}
                        onClick={handleTestSupabase}
                        className="px-4 py-2 bg-[#1c1917] hover:bg-[#322c29] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Testar e Conectar Supabase
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          if (!isSupabaseConnected) {
                            alert('Por favor, teste e conecte o Supabase primeiro.');
                            return;
                          }
                          for (const p of products) {
                            await upsertRemoteProduct(p);
                          }
                          alert('Todas as peças foram enviadas para o Supabase com sucesso!');
                        }}
                        className="px-4 py-2 bg-white text-[#1c1917] border border-[#d5cbbe] hover:bg-[#f0ebe1] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-[#8e6e34]" />
                        Sincronizar Todas as Peças
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
