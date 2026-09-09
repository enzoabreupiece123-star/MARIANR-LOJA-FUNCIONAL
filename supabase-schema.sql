-- ==============================================================================
-- MARIANE MOREIRA CONCEPTS - ESQUEMA DO BANCO DE DADOS SUPABASE (GRATUITO)
-- ==============================================================================
-- Como usar:
-- 1. Acesse o seu projeto gratuito no Supabase (https://supabase.com)
-- 2. No menu lateral esquerdo, clique em "SQL Editor"
-- 3. Clique em "New query"
-- 4. Cole todo este código abaixo e clique no botão verde "Run" (Executar)
-- ==============================================================================

-- 1. Criação da tabela de produtos
CREATE TABLE IF NOT EXISTS public.products (
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
    in_stock BOOLEAN DEFAULT true,
    is_new BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Criação da tabela de categorias (opcional para sincronização remota)
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Criação da tabela de configurações da loja (WhatsApp, Pix, etc)
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    whatsapp TEXT DEFAULT '5511999999999',
    pix_key TEXT DEFAULT 'contato@marianemoreira.com.br',
    pix_key_type TEXT DEFAULT 'email',
    pix_beneficiary TEXT DEFAULT 'Mariane Moreira Concepts',
    pix_city TEXT DEFAULT 'São Paulo',
    instagram TEXT DEFAULT '@marianemoreiraconcepts',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- 5. Criar Políticas de Acesso (Permitir leitura e escrita para a chave anônima da loja)
-- Leitura pública para todos os visitantes da loja:
CREATE POLICY "Permitir leitura pública de produtos" 
    ON public.products FOR SELECT 
    USING (true);

-- Gravação permitida (para a administradora cadastrar e alterar produtos):
CREATE POLICY "Permitir inserção e atualização de produtos" 
    ON public.products FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Políticas para categorias:
CREATE POLICY "Permitir leitura pública de categorias" 
    ON public.categories FOR SELECT 
    USING (true);

CREATE POLICY "Permitir gravação de categorias" 
    ON public.categories FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Políticas para configurações:
CREATE POLICY "Permitir leitura de configurações" 
    ON public.store_settings FOR SELECT 
    USING (true);

CREATE POLICY "Permitir atualização de configurações" 
    ON public.store_settings FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- 6. Inserir produtos iniciais de exemplo da coleção Mariane Moreira Concepts
INSERT INTO public.products (id, name, category, price, original_price, images, description, details, sizes, colors, in_stock, is_new, is_featured)
VALUES 
(
  'prod-1',
  'Vestido Midi Linho Riviera Terracota',
  'Vestidos',
  349.90,
  389.90,
  ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=80'],
  'Vestido midi confeccionado em puro linho com decote quadrado, fenda lateral sutil e faixa para amarração na cintura. Caimento impecável e fresco.',
  ARRAY['Composição: 70% Linho, 30% Viscose de reflorestamento', 'Forro 100% algodão toque de seda', 'Fechamento por zíper invisível posterior', 'Bolsos laterais embutidos'],
  ARRAY['P (38)', 'M (40)', 'G (42)'],
  ARRAY['Terracota', 'Off-White', 'Verde Oliva'],
  true,
  true,
  true
),
(
  'prod-2',
  'Conjunto Colete & Pantalona Milano Areia',
  'Conjuntos',
  459.00,
  NULL,
  ARRAY['https://images.unsplash.com/photo-1550614000-4895a10e1bfd?auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80'],
  'Conjunto sofisticado em alfaiataria premium composto por colete assimétrico com botões forrados e calça pantalona de cós alto estruturado.',
  ARRAY['Tecido: Alfaiataria Crepe Premium com elastano', 'Colete com botões forrados manualmente no mesmo tom', 'Calça com bolsos faca e passantes elegantes'],
  ARRAY['36', '38', '40', '42'],
  ARRAY['Areia', 'Preto Clássico', 'Azul Marinho'],
  true,
  true,
  true
),
(
  'prod-3',
  'Blazer Oversized Alfaiataria Saint Germain',
  'Alfaiataria',
  489.90,
  529.90,
  ARRAY['https://images.unsplash.com/photo-1548624149-f9b1859aa9d0?auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=1000&q=80'],
  'A peça statement do guarda-roupa da mulher contemporânea. Corte estruturado com ombreiras discretas e forro acetinado.',
  ARRAY['Alfaiataria encorpada com caimento impecável', 'Lapela notched clássica e botões rajados em tartaruga', 'Bolsos embutidos com portinhola'],
  ARRAY['P', 'M', 'G'],
  ARRAY['Camel', 'Chumbo', 'Off-White'],
  true,
  false,
  true
)
ON CONFLICT (id) DO NOTHING;
