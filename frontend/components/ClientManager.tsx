'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Client } from '@/lib/types';

interface ClientManagerProps {
  onClientCreated?: () => void;
  refreshClients?: number;
}

export default function ClientManager({ onClientCreated, refreshClients }: ClientManagerProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (refreshClients !== undefined) {
      loadClients();
    }
  }, [refreshClients]);

  const loadClients = async () => {
    try {
      const response = await api.getClients();
      setClients(response.data);
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.createClient(name);
      setName('');
      loadClients();
      onClientCreated?.();
    } catch (error) {
      showMessage('error', 'Error creating client');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="bg-zinc-800 rounded p-6 border border-zinc-700">
      <h2 className="text-2xl font-bold text-orange-500 mb-4 border-b border-orange-500 pb-2">
        Create Client
      </h2>

      {message && (
        <div className="p-3 rounded mb-4 bg-red-900 text-red-200">
          {message.text}
        </div>
      )}

      <form onSubmit={handleCreate} className="mb-6">
        <label className="block mb-2 text-white font-semibold">Client Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
          className="w-full p-3 bg-zinc-900 border border-zinc-600 rounded text-white mb-4 focus:outline-none focus:border-orange-500"
        />
        <button
          type="submit"
          className="w-full p-3 bg-orange-500 text-white rounded font-semibold hover:bg-orange-600 transition"
        >
          Create Client
        </button>
      </form>

      <div className="max-h-64 overflow-y-auto">
        <h3 className="text-lg font-semibold text-white mb-3">Clients ({clients.length})</h3>
        {clients.length === 0 ? (
          <p className="text-zinc-500 text-center py-4">No clients yet</p>
        ) : (
          clients.map((client, idx) => (
            <div
              key={`${client.name}-${idx}`}
              className="bg-zinc-900 p-3 mb-2 rounded border-l-4 border-orange-500"
            >
              <p className="font-semibold text-white">{client.name}</p>
              <p className="text-xs text-zinc-400 font-mono break-all">
                {client.identity.substring(0, 40)}...
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
