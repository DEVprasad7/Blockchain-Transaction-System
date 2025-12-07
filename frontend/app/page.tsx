'use client';

import { useState } from 'react';
import ClientManager from '@/components/ClientManager';
import TransactionManager from '@/components/TransactionManager';
import BlockchainVisualizer from '@/components/BlockchainVisualizer';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [clientRefreshKey, setClientRefreshKey] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  const handleTransactionCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleClientCreated = () => {
    setClientRefreshKey(prev => prev + 1);
  };

  const handleReset = () => {
    setResetKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-orange-500 mb-8">🔗 Blockchain Visualizer</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <ClientManager 
              onClientCreated={handleClientCreated} 
              refreshClients={resetKey}
            />
          </div>
          <div className="lg:col-span-2">
            <TransactionManager 
              onTransactionCreated={handleTransactionCreated} 
              refreshClients={clientRefreshKey}
              refreshTransactions={resetKey}
            />
          </div>
        </div>

        <BlockchainVisualizer 
          refreshKey={refreshKey} 
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
