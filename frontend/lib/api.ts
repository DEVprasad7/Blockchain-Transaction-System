import type { ApiResponse, Client, Transaction, Block, ValidationResult } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_Deployment;

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Client operations
  createClient: (name: string) =>
    fetchAPI<Client>('/api/clients', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  getClients: () => fetchAPI<Client[]>('/api/clients'),

  // Transaction operations
  createTransaction: (sender: string, recipient: string, value: number) =>
    fetchAPI<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify({ sender, recipient, value }),
    }),

  getPendingTransactions: () => fetchAPI<Transaction[]>('/api/transactions/pending'),

  // Mining
  mineBlock: (difficulty: number = 2) =>
    fetchAPI<{ block_number: number; nonce: number; block_hash: string; previous_hash: string; transactions_count: number }>('/api/mine', {
      method: 'POST',
      body: JSON.stringify({ difficulty }),
    }),

  // Blockchain operations
  getBlockchain: () => fetchAPI<Block[]>('/api/blockchain'),

  validateBlockchain: () => fetchAPI<ValidationResult>('/api/validate'),

  tamperBlock: (blockNumber: number) =>
    fetchAPI<{ message: string }>(`/api/tamper/${blockNumber}`, {
      method: 'POST',
    }),

  reset: () =>
    fetchAPI<{ message: string }>('/api/reset', {
      method: 'POST',
    }),
};
