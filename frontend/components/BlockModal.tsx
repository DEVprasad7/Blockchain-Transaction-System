'use client';

import { api } from '@/lib/api';
import type { Block } from '@/lib/types';

interface BlockModalProps {
  block: Block;
  onClose: () => void;
  onTamper: () => void;
}

export default function BlockModal({ block, onClose, onTamper }: BlockModalProps) {
  const handleTamper = async () => {
    try {
      await api.tamperBlock(block.block_number);
      alert(`Block ${block.block_number} has been tampered!`);
      onTamper();
      onClose();
    } catch {
      alert('Error tampering block');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-800 border-2 border-orange-500 rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-3xl font-bold text-orange-500">
            Block #{block.block_number} Details
          </h2>
          <button
            onClick={onClose}
            className="text-orange-500 text-4xl hover:text-orange-400 leading-none"
          >
            ×
          </button>
        </div>

        {block.is_tampered && (
          <div className="bg-red-900 text-red-200 p-4 rounded mb-6 font-bold">
            ⚠️ THIS BLOCK HAS BEEN TAMPERED WITH!
          </div>
        )}

        <div className="space-y-6">
          {/* Block Information */}
          <div>
            <h3 className="text-xl font-bold text-orange-500 mb-3">Block Information</h3>
            <div className="space-y-2 text-white">
              <p><span className="font-semibold">Block Number:</span> {block.block_number}</p>
              <p><span className="font-semibold">Nonce:</span> {block.nonce}</p>
              <p><span className="font-semibold">Transactions Count:</span> {block.transactions.length}</p>
              <p>
                <span className="font-semibold">Status:</span>{' '}
                {block.is_tampered ? (
                  <span className="text-red-400">Tampered</span>
                ) : (
                  <span className="text-green-400">Valid</span>
                )}
              </p>
              {!block.is_tampered && (
                <button
                  onClick={handleTamper}
                  className="mt-3 px-4 py-2 bg-red-500 text-white rounded font-semibold hover:bg-red-600 transition"
                >
                  ⚠️ Tamper This Block (Demo)
                </button>
              )}
            </div>
          </div>

          {/* Block Data */}
          <div>
            <h3 className="text-xl font-bold text-orange-500 mb-3">Block Data (What gets hashed)</h3>
            <div className="bg-zinc-900 p-4 rounded font-mono text-sm text-white break-all max-h-40 overflow-y-auto">
              {block.block_data}
            </div>
            <p className="text-zinc-400 text-sm mt-2">
              This is the raw data that gets hashed. Any change here breaks the hash.
            </p>
          </div>

          {/* Block Hash */}
          <div>
            <h3 className="text-xl font-bold text-orange-500 mb-3">
              Block Hash {block.is_tampered && '(Stored - Original)'}
            </h3>
            <div className="bg-zinc-900 p-4 rounded font-mono text-sm text-white break-all">
              {block.block_hash}
            </div>
            {block.is_tampered && (
              <>
                <p className="text-red-400 font-bold mt-2">⚠️ This hash is now INVALID!</p>
                <h3 className="text-xl font-bold text-red-500 mb-3 mt-4">
                  Actual Hash (After Tampering)
                </h3>
                <div className="bg-zinc-900 p-4 rounded font-mono text-sm text-white break-all border-2 border-red-500">
                  {block.actual_hash}
                </div>
                <p className="text-zinc-400 text-sm mt-2">
                  ⚠️ The stored hash doesn`t match the actual hash of the current data.<br />
                  This proves the block was tampered with!<br />
                  Notice: The new hash doesn`t start with required zeros (doesn`t meet difficulty).
                </p>
              </>
            )}
          </div>

          {/* Previous Hash */}
          <div>
            <h3 className="text-xl font-bold text-orange-500 mb-3">Previous Block Hash</h3>
            <div className="bg-zinc-900 p-4 rounded font-mono text-sm text-white break-all">
              {block.previous_hash}
            </div>
          </div>

          {/* Transactions */}
          <div>
            <h3 className="text-xl font-bold text-orange-500 mb-3">
              Transactions ({block.transactions.length})
            </h3>
            <div className="space-y-3">
              {block.transactions.map((tx, idx) => (
                <div key={idx} className="bg-zinc-900 p-4 rounded border-l-4 border-purple-500">
                  <p className="font-semibold text-orange-500 mb-2">Transaction #{idx + 1}</p>
                  <p className="font-semibold text-white">Signature:</p>
                  <div className="bg-black p-3 rounded font-mono text-xs text-white break-all mt-2">
                    {tx}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
