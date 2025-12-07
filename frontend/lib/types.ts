export interface Client {
  name: string;
  identity: string;
}

export interface Transaction {
  sender: string;
  recipient: string;
  value: number;
  time: string;
  signature?: string;
}

export interface Block {
  block_number: number;
  nonce: number;
  block_hash: string;
  previous_hash: string;
  transactions: string[];
  block_data: string;
  is_tampered: boolean;
  actual_hash?: string;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
  errors?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
