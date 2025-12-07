'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Client, Transaction } from '@/lib/types';

interface TransactionManagerProps {
  onTransactionCreated: () => void;
  refreshClients?: number;
  refreshTransactions?: number;
}

export default function TransactionManager({ onTransactionCreated, refreshClients, refreshTransactions }: TransactionManagerProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [pending, setPending] = useState<Transaction[]>([]);
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [difficulty, setDifficulty] = useState(2);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mining, setMining] = useState(false);

  useEffect(() => {
    loadClients();
    loadPending();
  }, []);

  useEffect(() => {
    if (refreshClients !== undefined) {
      loadClients();
    }
  }, [refreshClients]);

  useEffect(() => {
    if (refreshTransactions !== undefined) {
      loadClients();
      loadPending();
    }
  }, [refreshTransactions]);

  const loadClients = async () => {
    try {
      const response = await api.getClients();
      setClients(response.data);
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const loadPending = async () => {
    try {
      const response = await api.getPendingTransactions();
      setPending(response.data);
    } catch (error) {
      console.error('Failed to load pending transactions:', error);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sender || !recipient || !amount) return;

    try {
      await api.createTransaction(sender, recipient, parseFloat(amount));
      setAmount('');
      loadPending();
    } catch {
      showMessage('error', 'Error creating transaction');
    }
  };

  const handleMine = async () => {
    if (pending.length === 0) return;

    setMining(true);
    try {
      await api.mineBlock(difficulty);
      loadPending();
      onTransactionCreated();
    } catch {
      showMessage('error', 'Error mining block');
    } finally {
      setMining(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="bg-zinc-800 rounded p-6 border border-zinc-700">
      <h2 className="text-2xl font-bold text-orange-500 mb-4 border-b border-orange-500 pb-2">
        Create Transaction
      </h2>

      {message && (
        <div className="p-3 rounded mb-4 bg-red-900 text-red-200">
          {message.text}
        </div>
      )}

      <form onSubmit={handleCreateTransaction} className="mb-6">
        <label className="block mb-2 text-white font-semibold">Sender</label>
        <select
          value={sender}
          onChange={(e) => setSender(e.target.value)}
          className="w-full p-3 bg-zinc-900 border border-zinc-600 rounded text-white mb-4 focus:outline-none focus:border-orange-500"
        >
          <option value="">Select sender</option>
          {clients.map((client, idx) => (
            <option key={`sender-${client.name}-${idx}`} value={client.name}>
              {client.name}
            </option>
          ))}
        </select>

        <label className="block mb-2 text-white font-semibold">Recipient</label>
        <select
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full p-3 bg-zinc-900 border border-zinc-600 rounded text-white mb-4 focus:outline-none focus:border-orange-500"
        >
          <option value="">Select recipient</option>
          {clients.map((client, idx) => (
            <option key={`recipient-${client.name}-${idx}`} value={client.name}>
              {client.name}
            </option>
          ))}
        </select>

        <label className="block mb-2 text-white font-semibold">Amount</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full p-3 bg-zinc-900 border border-zinc-600 rounded text-white mb-4 focus:outline-none focus:border-orange-500"
        />

        <button
          type="submit"
          className="w-full p-3 bg-orange-500 text-white rounded font-semibold hover:bg-orange-600 transition"
        >
          Create Transaction
        </button>
      </form>

      <h3 className="text-xl font-bold text-orange-500 mb-3 mt-6">Pending Transactions</h3>
      <div className="max-h-48 overflow-y-auto mb-4">
        {pending.length === 0 ? (
          <p className="text-zinc-500 text-center py-4">No pending transactions</p>
        ) : (
          pending.map((tx, idx) => (
            <div key={idx} className="bg-zinc-900 p-3 mb-2 rounded border-l-4 border-orange-500">
              <div className="flex items-center gap-2 text-sm font-mono mb-1">
                <span className="text-red-400">{tx.sender.substring(0, 10)}...</span>
                <span className="text-orange-500">→</span>
                <span className="text-green-400">{tx.recipient.substring(0, 10)}...</span>
              </div>
              <p className="text-orange-500 font-bold">{tx.value} coins</p>
              <p className="text-xs text-zinc-500">{tx.time}</p>
            </div>
          ))
        )}
      </div>

      <label className="block mb-2 text-white font-semibold">Mining Difficulty</label>
      <input
        type="number"
        min="1"
        value={difficulty}
        onChange={(e) => setDifficulty(parseInt(e.target.value) || 2)}
        className="w-full p-3 bg-zinc-900 border border-zinc-600 rounded text-white mb-4 focus:outline-none focus:border-orange-500"
      />

      <button
        onClick={handleMine}
        disabled={mining || pending.length === 0}
        className="w-full p-3 bg-cyan-500 text-white rounded font-semibold hover:bg-cyan-600 transition disabled:bg-zinc-600 disabled:cursor-not-allowed"
      >
        {mining ? 'Mining...' : 'Mine Block'}
      </button>
    </div>
  );
}
