'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Block } from '@/lib/types';
import BlockModal from './BlockModal';

interface BlockchainVisualizerProps {
  refreshKey: number;
  onReset?: () => void;
}

export default function BlockchainVisualizer({ refreshKey, onReset }: BlockchainVisualizerProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadBlockchain();
  }, [refreshKey]);

  const loadBlockchain = async () => {
    try {
      const response = await api.getBlockchain();
      setBlocks(response.data);
    } catch (error) {
      console.error('Failed to load blockchain:', error);
    }
  };

  const handleValidate = async () => {
    try {
      const response = await api.validateBlockchain();
      if (!response.data.valid) {
        showMessage('error', response.data.errors?.join(', ') || 'Validation failed');
      }
    } catch{
      showMessage('error', 'Error validating blockchain');
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset entire blockchain? This cannot be undone.')) return;

    try {
      await api.reset();
      loadBlockchain();
      onReset?.();
    } catch {
      showMessage('error', 'Error resetting blockchain');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <>
      <div className="bg-zinc-800 rounded p-6 border border-zinc-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-orange-500">Blockchain</h2>
          <div className="flex gap-3">
            <button
              onClick={handleValidate}
              className="px-4 py-2 bg-cyan-500 text-white rounded font-semibold hover:bg-cyan-600 transition"
            >
              Validate Chain
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-500 text-white rounded font-semibold hover:bg-red-600 transition"
            >
              Reset
            </button>
          </div>
        </div>

        {message && (
          <div className="p-3 rounded mb-4 bg-red-900 text-red-200">
            {message.text}
          </div>
        )}

        {blocks.length === 0 ? (
          <p className="text-zinc-500 text-center py-8">
            No blocks yet. Create clients, transactions, and mine your first block!
          </p>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6 min-w-max">
              {blocks.map((block) => (
                <div
                  key={block.block_number}
                  onClick={() => setSelectedBlock(block)}
                  className={`relative bg-purple-900 p-5 rounded cursor-pointer hover:scale-105 transition-transform ${
                    block.is_tampered ? 'border border-red-500 bg-red-950' : 'border border-purple-700'
                  }`}
                  style={{ minWidth: '320px', maxWidth: '320px' }}
                >
                  {block.is_tampered && (
                    <div className="text-red-500 font-bold mb-2">⚠️ TAMPERED</div>
                  )}
                  
                  <div className="text-xl font-bold mb-3 border-b border-white/30 pb-2">
                    Block #{block.block_number}
                  </div>

                  <div className="text-sm space-y-2">
                    <div>
                      <span className="font-semibold">Nonce:</span> {block.nonce}
                    </div>
                    <div>
                      <span className="font-semibold">Transactions:</span> {block.transactions.length}
                    </div>
                    <div>
                      <span className="font-semibold">Block Hash:</span>
                      <div className="bg-black/30 p-2 rounded mt-1 font-mono text-xs break-all">
                        {block.block_hash}
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold">Previous Hash:</span>
                      <div className="bg-black/30 p-2 rounded mt-1 font-mono text-xs break-all">
                        {block.previous_hash}
                      </div>
                    </div>
                  </div>

                  {blocks.length > 1 && block.block_number < blocks.length - 1 && (
                    <div className="absolute -right-5 top-1/2 -translate-y-1/2 text-orange-500 text-3xl pointer-events-none">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedBlock && (
        <BlockModal
          block={selectedBlock}
          onClose={() => setSelectedBlock(null)}
          onTamper={loadBlockchain}
        />
      )}
    </>
  );
}
