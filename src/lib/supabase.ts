import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Category, StoreSettings } from '../types';

let supabaseClient: SupabaseClient | null = null;

export function getStoredSupabaseConfig(): { url: string; key: string } {
  const env = (import.meta as any).env || {};
  const envUrl = env.VITE_SUPABASE_URL || '';
  const envKey = env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = localStorage.getItem('mariane_supabase_url') || '';
  const localKey = localStorage.getItem('mariane_supabase_key') || '';

  const url = localUrl.trim() || envUrl.trim();
  const key = localKey.trim() || envKey.trim();

  return { url, key };
}

export function saveSupabaseConfig(url: string, key: string) {
  localStorage.setItem('mariane_supabase_url', url.trim());
  localStorage.setItem('mariane_supabase_key', key.trim());
  supabaseClient = null; // reset client so next call recreates it
}

export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const { url, key } = getStoredSupabaseConfig();
  if (url && key && url.startsWith('http')) {
    try {
      supabaseClient = createClient(url, key);
      return supabaseClient;
    } catch (err) {
      console.warn('Erro ao inicializar Supabase:', err);
      return null;
    }
  }
  return null;
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!url || !key) {
      return { success: false, message: 'URL e Chave Anon são obrigatórias.' };
    }
    const testClient = createClient(url, key);
    // Try to query products table or check auth
    const { error } = await testClient.from('products').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return {
          success: false,
          message: 'Conectou ao Supabase, mas a tabela "products" ainda não existe! Execute o script SQL no Supabase SQL Editor.'
        };
      }
      return { success: false, message: `Erro ao conectar: ${error.message}` };
    }
    return { success: true, message: 'Conexão com o Supabase estabelecida com sucesso!' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha na conexão';
    return { success: false, message: msg };
  }
}

export async function fetchRemoteProducts(): Promise<Product[] | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchProducts error:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      return data.map((item: any) => ({
        id: String(item.id),
        name: item.name,
        category: item.category,
        price: Number(item.price),
        original_price: item.original_price ? Number(item.original_price) : null,
        images: Array.isArray(item.images) ? item.images : [item.image || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80'],
        description: item.description || '',
        details: Array.isArray(item.details) ? item.details : [],
        sizes: Array.isArray(item.sizes) ? item.sizes : ['P', 'M', 'G'],
        colors: Array.isArray(item.colors) ? item.colors : [],
        in_stock: item.in_stock ?? true,
        is_new: item.is_new ?? false,
        is_featured: item.is_featured ?? false,
        created_at: item.created_at || new Date().toISOString()
      }));
    }
    return null;
  } catch (err) {
    console.warn('Supabase remote fetch failed, using local storage fallback:', err);
    return null;
  }
}

export async function upsertRemoteProduct(product: Product): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const { error } = await sb.from('products').upsert({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      original_price: product.original_price || null,
      images: product.images,
      description: product.description,
      details: product.details || [],
      sizes: product.sizes,
      colors: product.colors,
      in_stock: product.in_stock,
      is_new: product.is_new || false,
      is_featured: product.is_featured || false,
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.error('Supabase upsert error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase upsert failed:', err);
    return false;
  }
}

export async function deleteRemoteProduct(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const { error } = await sb.from('products').delete().eq('id', id);
    if (error) {
      console.error('Supabase delete error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase delete failed:', err);
    return false;
  }
}
