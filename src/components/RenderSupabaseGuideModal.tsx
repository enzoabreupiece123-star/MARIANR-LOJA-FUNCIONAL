import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Database, Globe, Key, ShieldCheck, Terminal } from 'lucide-react';
import { copyToClipboard } from '../lib/utils';

interface RenderSupabaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RenderSupabaseGuideModal: React.FC<RenderSupabaseGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- 0. EXCLUIR TABELAS ANTIGAS PARA REINICIAR 100% LIMPO
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.store_settings CASCADE;

-- 1. TABELA DE CONFIGURAÇÕES (SENHA ADMIN, PIX, WHATSAPP)
CREATE TABLE public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    whatsapp TEXT DEFAULT '5511999999999',
    pix_key TEXT DEFAULT 'contato@marianemoreira.com.br',
    pix_key_type TEXT DEFAULT 'email',
    pix_beneficiary TEXT DEFAULT 'Mariane Moreira Concepts',
    pix_city TEXT DEFAULT 'São Paulo',
    instagram TEXT DEFAULT '@marianemoreiraconcepts',
    admin_pin TEXT DEFAULT '1234',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.store_settings (id, admin_pin) VALUES ('default', '1234') ON CONFLICT (id) DO NOTHING;

-- 2. TABELA DE PRODUTOS / ROUPAS
CREATE TABLE public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    images TEXT[] NOT NULL DEFAULT '{}',
    description TEXT,
    details TEXT[] DEFAULT '{}',
    sizes TEXT[] DEFAULT '{"P", "M", "G"}',
    colors TEXT[] DEFAULT '{}',
    stock_quantity INTEGER DEFAULT 5,
    in_stock BOOLEAN DEFAULT true,
    is_new BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE CATEGORIAS
CREATE TABLE public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.categories (id, name, slug, description)
VALUES 
  ('cat-1', 'Vestidos', 'vestidos', 'Modelos sofisticados'),
  ('cat-2', 'Conjuntos', 'conjuntos', 'Combinações elegantes'),
  ('cat-3', 'Alfaiataria', 'alfaiataria', 'Cortes precisos'),
  ('cat-4', 'Blusas', 'blusas', 'Camisas de seda e regatas'),
  ('cat-5', 'Calças', 'calcas', 'Alfaiataria clássica'),
  ('cat-6', 'Saias', 'saias', 'Saias mídi e evasê'),
  ('cat-7', 'Acessórios', 'acessorios', 'Complementos de estilo')
ON CONFLICT (id) DO NOTHING;

-- 4. TABELA DE PEDIDOS
CREATE TABLE public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_type TEXT NOT NULL,
    cep TEXT,
    street TEXT,
    number TEXT,
    complement TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    notes TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    payment_method TEXT DEFAULT 'pix',
    status TEXT DEFAULT 'pending',
    stock_deducted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. HABILITAR RLS E PERMISSÕES PÚBLICAS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.store_settings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.products TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.categories TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.orders TO anon, authenticated, service_role;

CREATE POLICY "Acesso total configuracoes" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total produtos" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total categorias" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total pedidos" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- 6. BUCKET DE FOTOS DO DISPOSITIVO (SUPABASE STORAGE)
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO UPDATE SET public = true;
DROP POLICY IF EXISTS "Fotos públicas" ON storage.objects;
DROP POLICY IF EXISTS "Upload de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Atualizar fotos" ON storage.objects;
DROP POLICY IF EXISTS "Excluir fotos" ON storage.objects;
CREATE POLICY "Fotos públicas" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Upload de fotos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Atualizar fotos" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
CREATE POLICY "Excluir fotos" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');`;


  const envSample = `VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
VITE_STORE_WHATSAPP=5511999999999
VITE_STORE_PIX_KEY=contato@marianemoreira.com.br
VITE_STORE_PIX_NAME=Mariane Moreira Concepts`;

  const handleCopySql = async () => {
    const success = await copyToClipboard(sqlCode);
    if (success) {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    }
  };

  const handleCopyEnv = async () => {
    const success = await copyToClipboard(envSample);
    if (success) {
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2000);
    }
  };

  return (
    <div
      id="render-supabase-guide-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        id="render-supabase-guide-content"
        className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#e8dfd2] p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            100% Gratuito: Supabase + Render
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1c1917]">
            Como Publicar Gratuitamente no Render com Supabase
          </h2>
          <p className="text-xs sm:text-sm text-[#5c544c]">
            Siga este roteiro simples para ter sua loja no ar com banco de dados em nuvem sem pagar mensalidades.
          </p>
        </div>

        {/* Step 1: Supabase */}
        <div className="space-y-6">
          <div className="p-4 sm:p-5 rounded-xl bg-[#faf8f5] border border-[#e8dfd2] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1c1917] text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="font-semibold text-sm text-[#1c1917] flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#8e6e34]" />
                  Criar Banco no Supabase (Grátis)
                </h3>
              </div>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#8e6e34] hover:underline flex items-center gap-1 font-medium"
              >
                Abrir Supabase <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <ol className="text-xs text-[#5c544c] space-y-1.5 list-decimal pl-5">
              <li>Crie uma conta gratuita no <strong>supabase.com</strong>.</li>
              <li>Clique em <strong>New project</strong> (escolha região <em>South America / São Paulo</em>).</li>
              <li>No menu lateral esquerdo, clique em <strong>SQL Editor</strong> (ícone &gt;_).</li>
              <li>Clique em <strong>New query</strong>, cole o código abaixo e clique em <strong>Run</strong>:</li>
            </ol>

            {/* SQL Snippet Box */}
            <div className="relative bg-[#1c1917] text-stone-200 p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto max-h-48 border border-stone-800">
              <button
                type="button"
                onClick={handleCopySql}
                className="absolute top-2 right-2 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-sans font-medium flex items-center gap-1 backdrop-blur-sm"
              >
                {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedSql ? 'Copiado!' : 'Copiar SQL'}
              </button>
              <pre>{sqlCode}</pre>
            </div>

            <div className="text-[11px] text-[#786e64] space-y-1 bg-[#f0ebe1] p-3 rounded-lg border border-[#e4dcd0]">
              <div className="font-semibold text-[#1c1917]">Qual chave usar no site?</div>
              <p>
                ✅ <strong>Publishable key</strong> (ou <code>anon/public</code>): <strong>É esta que você deve usar!</strong> Ela é a chave pública segura projetada para sites e navegadores.<br />
                ⛔ <strong>Secret key</strong> (ou <code>service_role</code>): <strong>NUNCA use no site!</strong> Ela é uma chave secreta com superpoderes de administração e não deve ser exposta.
              </p>
            </div>
          </div>

          {/* Step 2: Render */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#faf8f5] border border-[#e8dfd2] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1c1917] text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="font-semibold text-sm text-[#1c1917] flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#8e6e34]" />
                  Hospedar Gratuitamente na Render
                </h3>
              </div>
              <a
                href="https://render.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#8e6e34] hover:underline flex items-center gap-1 font-medium"
              >
                Abrir Render <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <ol className="text-xs text-[#5c544c] space-y-1.5 list-decimal pl-5">
              <li>Envie o código deste projeto para o seu <strong>GitHub</strong>.</li>
              <li>No painel da <strong>render.com</strong>, clique em <strong>New + &gt; Static Site</strong>.</li>
              <li>Conecte o seu repositório do GitHub.</li>
              <li>Preencha as configurações de Build:
                <ul className="list-disc pl-5 mt-1 space-y-0.5 font-mono text-[11px] text-[#1c1917]">
                  <li>Build Command: <strong className="text-emerald-700">npm run build</strong></li>
                  <li>Publish Directory: <strong className="text-emerald-700">dist</strong></li>
                </ul>
              </li>
              <li>Adicione as seguintes <strong>Environment Variables</strong>:</li>
            </ol>

            {/* Env Box */}
            <div className="relative bg-[#1c1917] text-stone-200 p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto border border-stone-800">
              <button
                type="button"
                onClick={handleCopyEnv}
                className="absolute top-2 right-2 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-sans font-medium flex items-center gap-1 backdrop-blur-sm"
              >
                {copiedEnv ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedEnv ? 'Copiado!' : 'Copiar Variáveis'}
              </button>
              <pre>{envSample}</pre>
            </div>
          </div>

          {/* Step 3: Success */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <h4 className="font-bold">✨ Tudo Pronto!</h4>
            <p>
              Ao clicar em <strong>Create Static Site</strong> na Render, seu site estará online em minutos com link próprio (ex: <code>marianemoreira.onrender.com</code>) e você poderá cadastrar, editar roupas e receber todos os pedidos com comprovante Pix direto no WhatsApp!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
