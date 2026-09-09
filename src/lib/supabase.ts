import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Category, StoreSettings, Order, OrderStatus } from '../types';

let supabaseClient: SupabaseClient | null = null;

const DEFAULT_SUPABASE_URL = 'https://fwshxvpuplngzagncikl.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_VMKBftDZPie6WRyBB4JIMA_kFxHfUP0';

export function getStoredSupabaseConfig(): { url: string; key: string } {
  const env = (import.meta as any).env || {};
  const envUrl = env.VITE_SUPABASE_URL || '';
  const envKey = env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = localStorage.getItem('mariane_supabase_url') || '';
  const localKey = localStorage.getItem('mariane_supabase_key') || '';

  const url = localUrl.trim() || envUrl.trim() || DEFAULT_SUPABASE_URL;
  const key = localKey.trim() || envKey.trim() || DEFAULT_SUPABASE_KEY;

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

    if (data) {
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
        stock_quantity: item.stock_quantity !== undefined && item.stock_quantity !== null ? Number(item.stock_quantity) : 5,
        in_stock: item.in_stock !== undefined ? Boolean(item.in_stock) : ((item.stock_quantity ?? 1) > 0),
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
      stock_quantity: product.stock_quantity !== undefined ? product.stock_quantity : 5,
      in_stock: (product.stock_quantity !== undefined ? product.stock_quantity > 0 : product.in_stock),
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

export async function fetchRemoteCategories(): Promise<Category[] | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb.from('categories').select('*').order('created_at', { ascending: true });
    if (error || !data || data.length === 0) return null;
    return data.map((c: any) => ({
      id: String(c.id),
      name: c.name,
      slug: c.slug,
      description: c.description || '',
    }));
  } catch {
    return null;
  }
}

export async function upsertRemoteCategory(category: Category): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const { error } = await sb.from('categories').upsert({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    });
    return !error;
  } catch {
    return false;
  }
}

export async function deleteRemoteCategory(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const { error } = await sb.from('categories').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchRemoteSettings(): Promise<Partial<StoreSettings> | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb.from('store_settings').select('*').eq('id', 'default').single();
    if (error || !data) return null;
    return {
      whatsapp: data.whatsapp,
      pixKey: data.pix_key,
      pixKeyType: data.pix_key_type as any,
      pixBeneficiary: data.pix_beneficiary,
      pixCity: data.pix_city,
      instagram: data.instagram,
      adminPin: data.admin_pin || '1234',
    };
  } catch {
    return null;
  }
}

export async function upsertRemoteSettings(settings: StoreSettings): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const { error } = await sb.from('store_settings').upsert({
      id: 'default',
      whatsapp: settings.whatsapp,
      pix_key: settings.pixKey,
      pix_key_type: settings.pixKeyType,
      pix_beneficiary: settings.pixBeneficiary,
      pix_city: settings.pixCity,
      instagram: settings.instagram,
      admin_pin: settings.adminPin || '1234',
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Upload an image blob directly to Supabase Storage bucket 'product-images'
 * If the bucket is not available or upload fails, returns null (caller will use local compressed base64 dataUrl)
 */
export async function uploadProductImage(blob: Blob, filename: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const cleanName = filename.toLowerCase().replace(/[^a-z0-9._-]/g, '_');
    const path = `products/${Date.now()}_${cleanName}`;

    const { data, error } = await sb.storage
      .from('product-images')
      .upload(path, blob, {
        contentType: blob.type || 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.warn('Supabase storage upload notice:', error.message);
      return null;
    }

    const { data: publicData } = sb.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return publicData?.publicUrl || null;
  } catch (err) {
    console.warn('Erro ao subir imagem no Supabase Storage:', err);
    return null;
  }
}

/**
 * =====================================================================
 * Orders Management (Supabase Remote Persistence)
 * =====================================================================
 */
export async function fetchRemoteOrders(): Promise<Order[] | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchOrders error:', error.message);
      return null;
    }

    if (data) {
      return data.map((item: any) => ({
        id: String(item.id),
        customerName: item.customer_name,
        customerPhone: item.customer_phone,
        deliveryType: item.delivery_type,
        cep: item.cep || '',
        street: item.street || '',
        number: item.number || '',
        complement: item.complement || '',
        neighborhood: item.neighborhood || '',
        city: item.city || '',
        state: item.state || '',
        notes: item.notes || '',
        items: Array.isArray(item.items) ? item.items : [],
        subtotal: Number(item.subtotal || 0),
        total: Number(item.total || 0),
        paymentMethod: item.payment_method || 'pix',
        status: (item.status as OrderStatus) || 'pending',
        stockDeducted: Boolean(item.stock_deducted),
        createdAt: item.created_at || new Date().toISOString(),
      }));
    }
    return null;
  } catch (err) {
    console.warn('Supabase fetchOrders failed:', err);
    return null;
  }
}

export async function upsertRemoteOrder(order: Order): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const { error } = await sb.from('orders').upsert({
      id: order.id,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      delivery_type: order.deliveryType,
      cep: order.cep || null,
      street: order.street || null,
      number: order.number || null,
      complement: order.complement || null,
      neighborhood: order.neighborhood || null,
      city: order.city || null,
      state: order.state || null,
      notes: order.notes || null,
      items: order.items,
      subtotal: order.subtotal,
      total: order.total,
      payment_method: order.paymentMethod,
      status: order.status,
      stock_deducted: order.stockDeducted || false,
      created_at: order.createdAt,
    });

    if (error) {
      console.error('Supabase upsertOrder error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase upsertOrder failed:', err);
    return false;
  }
}

export async function updateRemoteOrderStatus(orderId: string, status: OrderStatus, stockDeducted?: boolean): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const updatePayload: any = { status };
    if (stockDeducted !== undefined) {
      updatePayload.stock_deducted = stockDeducted;
    }

    const { error } = await sb.from('orders').update(updatePayload).eq('id', orderId);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteRemoteOrder(orderId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const { error } = await sb.from('orders').delete().eq('id', orderId);
    return !error;
  } catch {
    return false;
  }
}



