-- ==============================================================================
-- MARIANE MOREIRA CONCEPTS - ESQUEMA 100% LIMPO E DEFINITIVO DO SUPABASE
-- ==============================================================================
-- Instruções:
-- 1. Acesse o painel do Supabase: https://supabase.com
-- 2. No menu lateral esquerdo, clique no ícone "SQL Editor" (>_)
-- 3. Clique no botão "New query"
-- 4. Cole TODO este script abaixo e clique no botão verde "Run" (ou Ctrl + Enter)
-- ==============================================================================

-- 0. EXCLUIR TABELAS ANTIGAS PARA RECOMEÇAR 100% LIMPO (SEM ERROS OU DADOS RESIDUAIS)
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.store_settings CASCADE;

-- 1. TABELA DE CONFIGURAÇÕES DA LOJA (Senha Admin, WhatsApp, PIX, etc)
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

-- Inserir linha padrão de configurações imediatamente
INSERT INTO public.store_settings (id, admin_pin, whatsapp, pix_key, pix_key_type, pix_beneficiary, pix_city, instagram)
VALUES ('default', '1234', '5511999999999', 'contato@marianemoreira.com.br', 'email', 'Mariane Moreira Concepts', 'São Paulo', '@marianemoreiraconcepts')
ON CONFLICT (id) DO NOTHING;

-- 2. TABELA DE PRODUTOS / ROUPAS (Começa vazia para você cadastrar as peças reais!)
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

-- Inserir categorias oficiais da loja
INSERT INTO public.categories (id, name, slug, description)
VALUES 
  ('cat-1', 'Vestidos', 'vestidos', 'Modelos sofisticados para todas as ocasiões'),
  ('cat-2', 'Conjuntos', 'conjuntos', 'Combinações elegantes e práticas'),
  ('cat-3', 'Alfaiataria', 'alfaiataria', 'Cortes precisos e caimento estruturado'),
  ('cat-4', 'Blusas', 'blusas', 'Camisas de seda, tricots finos e regatas clássicas'),
  ('cat-5', 'Calças', 'calcas', 'Modelagens impecáveis em alfaiataria e tecidos nobres'),
  ('cat-6', 'Saias', 'saias', 'Saias mídi, lápis e evasê'),
  ('cat-7', 'Acessórios', 'acessorios', 'Complementos para elevar qualquer look')
ON CONFLICT (id) DO NOTHING;

-- 4. TABELA DE PEDIDOS DE CLIENTES
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
    receipt_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Garantir coluna receipt_image em instalações existentes
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS receipt_image TEXT;

-- 5. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Conceder permissões totais para o perfil público (anon) e autenticado:
GRANT ALL ON TABLE public.store_settings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.products TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.categories TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.orders TO anon, authenticated, service_role;

-- 6. POLÍTICAS DE ACESSO LIVRE PARA O SITE E O PAINEL
CREATE POLICY "Acesso irrestrito configuracoes" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso irrestrito produtos" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso irrestrito categorias" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso irrestrito pedidos" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- 7. BUCKET DE ARMAZENAMENTO DE FOTOS (SUPABASE STORAGE)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas para upload e visualização das fotos das roupas
DROP POLICY IF EXISTS "Fotos publicas leitura" ON storage.objects;
DROP POLICY IF EXISTS "Fotos publicas upload" ON storage.objects;
DROP POLICY IF EXISTS "Fotos publicas update" ON storage.objects;
DROP POLICY IF EXISTS "Fotos publicas delete" ON storage.objects;

CREATE POLICY "Fotos publicas leitura" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Fotos publicas upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Fotos publicas update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
CREATE POLICY "Fotos publicas delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');
