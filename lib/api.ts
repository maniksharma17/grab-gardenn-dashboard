'use client';

import { getAuthHeader } from './auth';

const API_BASE_URL = 'http://localhost:3001/api';

// Generic fetch wrapper with authentication
async function fetchWithAuth(endpoint: string, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

// Products
export async function fetchProducts() {
  return fetchWithAuth('/products');
}

export async function fetchProduct(id: string) {
  return fetchWithAuth(`/products/${id}`);
}

export async function createProduct(productData: any) {
  return fetchWithAuth('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
}

export async function updateProduct(id: string, productData: any) {
  return fetchWithAuth(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
}

export async function deleteProduct(id: string) {
  return fetchWithAuth(`/products/${id}`, {
    method: 'DELETE',
  });
}

// Categories
export async function fetchCategories() {
  return fetchWithAuth('/categories');
}

export async function fetchCategory(id: string) {
  return fetchWithAuth(`/categories/${id}`);
}

export async function createCategory(categoryData: any) {
  return fetchWithAuth('/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
}

export async function updateCategory(id: string, categoryData: any) {
  return fetchWithAuth(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  });
}

export async function deleteCategory(id: string) {
  return fetchWithAuth(`/categories/${id}`, {
    method: 'DELETE',
  });
}

// Orders
export async function fetchOrders() {
  return fetchWithAuth('/orders');
}

export async function fetchOrder(id: string) {
  return fetchWithAuth(`/orders/${id}`);
}

export async function updateOrderStatus(id: string, status: string) {
  return fetchWithAuth(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// Promo Codes
export async function fetchPromoCodes() {
  return fetchWithAuth('/promo-codes');
}

export async function fetchPromoCode(id: string) {
  return fetchWithAuth(`/promo-codes/${id}`);
}

export async function createPromoCode(codeData: any) {
  return fetchWithAuth('/promo-codes', {
    method: 'POST',
    body: JSON.stringify(codeData),
  });
}

export async function updatePromoCode(id: string, codeData: any) {
  return fetchWithAuth(`/promo-codes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(codeData),
  });
}

export async function togglePromoCodeStatus(id: string, active: boolean) {
  return fetchWithAuth(`/promo-codes/${id}/toggle`, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
  });
}

export async function deletePromoCode(id: string) {
  return fetchWithAuth(`/promo-codes/${id}`, {
    method: 'DELETE',
  });
}

// Carts
export async function fetchCarts() {
  return fetchWithAuth('/carts');
}

export async function fetchCart(id: string) {
  return fetchWithAuth(`/carts/${id}`);
}

// Returns
export async function fetchReturns() {
  return fetchWithAuth('/returns');
}

export async function fetchReturn(id: string) {
  return fetchWithAuth(`/returns/${id}`);
}

export async function updateReturnStatus(id: string, status: string) {
  return fetchWithAuth(`/returns/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// Blogs
export async function fetchBlogs() {
  return fetchWithAuth('/blogs');
}

export async function fetchBlog(id: string) {
  return fetchWithAuth(`/blogs/${id}`);
}

export async function createBlog(blogData: any) {
  return fetchWithAuth('/blogs', {
    method: 'POST',
    body: JSON.stringify(blogData),
  });
}

export async function updateBlog(id: string, blogData: any) {
  return fetchWithAuth(`/blogs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(blogData),
  });
}

export async function deleteBlog(id: string) {
  return fetchWithAuth(`/blogs/${id}`, {
    method: 'DELETE',
  });
}