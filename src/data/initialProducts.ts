import { Product, Category, StoreSettings } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Vestidos', slug: 'vestidos', description: 'Vestidos fluidos, midi e longos para ocasiões especiais e dia a dia.' },
  { id: '2', name: 'Conjuntos', slug: 'conjuntos', description: 'Combinações sofisticadas e práticas que elevam qualquer look.' },
  { id: '3', name: 'Alfaiataria', slug: 'alfaiataria', description: 'Blazers, coletes e calças com caimento impecável e elegância.' },
  { id: '4', name: 'Blusas & Camisas', slug: 'blusas-camisas', description: 'Peças coringa em tecidos nobres como linho, seda e algodão egípcio.' },
  { id: '5', name: 'Calças & Saias', slug: 'calcas-saias', description: 'Modelagens modernas que valorizam a silhueta com extremo conforto.' },
  { id: '6', name: 'Lançamentos', slug: 'lancamentos', description: 'As últimas novidades da coleção Mariane Moreira Concepts.' }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Vestido Midi Linho Riviera Terracota',
    category: 'Vestidos',
    price: 349.90,
    original_price: 389.90,
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Vestido midi confeccionado em puro linho com decote quadrado, fenda lateral sutil e faixa para amarração na cintura. Caimento impecável e fresco.',
    details: [
      'Composição: 70% Linho, 30% Viscose de reflorestamento',
      'Forro 100% algodão toque de seda',
      'Fechamento por zíper invisível posterior',
      'Bolsos laterais embutidos'
    ],
    sizes: ['P (38)', 'M (40)', 'G (42)'],
    colors: ['Terracota', 'Off-White', 'Verde Oliva'],
    stock_quantity: 6,
    in_stock: true,
    is_new: true,
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'Conjunto Colete & Pantalona Milano Areia',
    category: 'Conjuntos',
    price: 459.00,
    original_price: null,
    images: [
      'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Conjunto sofisticado em alfaiataria premium composto por colete assimétrico com botões forrados e calça pantalona de cós alto estruturado.',
    details: [
      'Tecido: Alfaiataria Crepe Premium com elastano',
      'Colete com botões forrados manualmente no mesmo tom',
      'Calça com bolsos faca e passantes elegantes',
      'Não amassa com facilidade, ideal para viagens e eventos'
    ],
    sizes: ['36', '38', '40', '42'],
    colors: ['Areia', 'Preto Clássico', 'Azul Marinho'],
    stock_quantity: 4,
    in_stock: true,
    is_new: true,
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-3',
    name: 'Blazer Oversized Alfaiataria Saint Germain',
    category: 'Alfaiataria',
    price: 489.90,
    original_price: 529.90,
    images: [
      'https://images.unsplash.com/photo-1548624149-f9b1859aa9d0?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'A peça statement do guarda-roupa da mulher contemporânea. Corte estruturado com ombreiras discretas e forro acetinado.',
    details: [
      'Alfaiataria encorpada com caimento impecável',
      'Lapela notched clássica e botões rajados em tartaruga',
      'Bolsos embutidos com portinhola',
      'Comprimento abaixo do quadril'
    ],
    sizes: ['P', 'M', 'G'],
    colors: ['Camel', 'Chumbo', 'Off-White'],
    stock_quantity: 5,
    in_stock: true,
    is_new: false,
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-4',
    name: 'Camisa Ampla em Seda & Liocel Aurora',
    category: 'Blusas & Camisas',
    price: 289.00,
    original_price: null,
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Camisa de modelagem fluida com toque sedoso extraordinário. Punhos alongados com abotoamento duplo e gola imponente.',
    details: [
      'Toque ultra macio e brilho discreto',
      'Botões madreperola legítimos',
      'Caimento solto e sofisticado',
      'Pode ser usada com amarração frontal ou solta'
    ],
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Pérola', 'Verde Sálvia', 'Terracota'],
    stock_quantity: 8,
    in_stock: true,
    is_new: true,
    is_featured: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-5',
    name: 'Calça Pantalona Cenoura Alfaiataria Roma',
    category: 'Calças & Saias',
    price: 319.90,
    original_price: 350.00,
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Cintura super alta com pregas frontais bem marcadas e cinto encapado incluso. Alonga a silhueta e confere porte refinado.',
    details: [
      'Acompanha cinto estruturado com fivela forrada',
      'Fechamento por colchetes embutidos',
      'Bolsos traseiros decorativos e bolsos faca funcionais'
    ],
    sizes: ['36', '38', '40', '42'],
    colors: ['Off-White', 'Caramelo', 'Verde Militar'],
    stock_quantity: 3,
    in_stock: true,
    is_new: false,
    is_featured: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-6',
    name: 'Vestido Longo Envelope Flor de Lis',
    category: 'Vestidos',
    price: 419.00,
    original_price: null,
    images: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Vestido longo transpasse com decote V alongador, mangas evasê e saia com babado fluido. Peça única para ocasiões inesquecíveis.',
    details: [
      'Tecido fluido de caimento suave (viscolinho premium)',
      'Amarração ajustável na cintura (adapta perfeitamente ao corpo)',
      'Não marca e não fica transparente'
    ],
    sizes: ['P', 'M', 'G'],
    colors: ['Preto Imperial', 'Bordô', 'Fendi'],
    stock_quantity: 5,
    in_stock: true,
    is_new: true,
    is_featured: true,
    created_at: new Date().toISOString()
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Mariane Moreira Concepts',
  tagline: 'Moda Feminina Autoral & Sofisticada',
  whatsapp: '5511999999999', // WhatsApp da Mariane
  pixKey: 'contato@marianemoreira.com.br',
  pixKeyType: 'email',
  pixBeneficiary: 'Mariane Moreira Santos',
  pixCity: 'São Paulo',
  instagram: '@marianemoreiraconcepts',
  address: 'Ateliê & Showroom - Atendimento Exclusivo com Hora Marcada',
  adminPin: '1234',
  supabaseUrl: '',
  supabaseAnonKey: '',
  freeShippingAbove: 499.00
};
