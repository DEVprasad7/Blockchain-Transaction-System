from blockchain import Client, Transaction, Block, mine
from typing import Dict, List


class BlockchainManager:
    def __init__(self):
        self.clients: Dict[str, Client] = {}
        self.transactions: List[Transaction] = []
        self.blockchain: List[Block] = []
        self.pending_transactions: List[Transaction] = []
        
    def create_client(self, name: str) -> dict:
        client = Client()
        self.clients[name] = client
        return {
            "name": name,
            "identity": client.identity
        }
    
    def get_client(self, name: str) -> Client:
        return self.clients.get(name)
    
    def create_transaction(self, sender_name: str, recipient_name: str, value: float) -> dict:
        sender = self.clients.get(sender_name)
        recipient = self.clients.get(recipient_name)
        
        if not sender or not recipient:
            raise ValueError("Sender or recipient not found")
        
        transaction = Transaction(sender, recipient, value)
        self.pending_transactions.append(transaction)
        
        return {
            "sender": sender_name,
            "recipient": recipient_name,
            "value": value,
            "time": transaction.time,
            "signature": transaction.sign_transaction()
        }
    
    def mine_block(self, difficulty: int = 2) -> dict:
        if not self.pending_transactions:
            raise ValueError("No pending transactions to mine")
        
        signatures = [t.sign_transaction() for t in self.pending_transactions]
        previous_hash = self.blockchain[-1].block_hash if self.blockchain else "0" * 16
        
        block = mine(signatures, previous_hash, difficulty)
        
        if block:
            self.blockchain.append(block)
            self.transactions.extend(self.pending_transactions)
            self.pending_transactions = []
            
            return {
                "block_number": len(self.blockchain) - 1,
                "nonce": block.nonce,
                "block_hash": block.block_hash,
                "previous_hash": block.previous_block_hash,
                "transactions_count": len(signatures)
            }
        
        raise ValueError("Mining failed")
    
    def get_blockchain(self) -> List[dict]:
        from blockchain import sha256
        return [{
            "block_number": i,
            "nonce": block.nonce,
            "block_hash": block.block_hash,
            "previous_hash": block.previous_block_hash,
            "transactions": block.verified_transactions,
            "block_data": block.block_data,
            "is_tampered": "[TAMPERED]" in block.block_data,
            "actual_hash": sha256(block.block_data) if "[TAMPERED]" in block.block_data else block.block_hash
        } for i, block in enumerate(self.blockchain)]
    
    def validate_blockchain(self) -> dict:
        if not self.blockchain:
            return {"valid": True, "message": "Blockchain is empty"}
        
        errors = []
        
        for i, block in enumerate(self.blockchain):
            # Check if hash starts with required zeros (difficulty 2)
            if not block.block_hash.startswith('00'):
                errors.append(f"Block {i}: Invalid hash (doesn't meet difficulty)")
            
            # Check hash integrity
            from blockchain import sha256
            expected_hash = sha256(block.block_data)
            if block.block_hash != expected_hash:
                errors.append(f"Block {i}: Hash mismatch (block was tampered)")
            
            # Check chain linkage
            if i > 0:
                if block.previous_block_hash != self.blockchain[i-1].block_hash:
                    errors.append(f"Block {i}: Chain broken (previous hash doesn't match)")
        
        if errors:
            return {"valid": False, "errors": errors}
        
        return {"valid": True, "message": f"✅ Blockchain is valid ({len(self.blockchain)} blocks)"}
    
    def tamper_block(self, block_number: int) -> dict:
        if block_number >= len(self.blockchain):
            raise ValueError("Block not found")
        
        block = self.blockchain[block_number]
        old_hash = block.block_hash
        block.block_data = block.block_data + " [TAMPERED]"
        
        from blockchain import sha256
        block.block_hash = sha256(block.block_data)
        
        return {
            "message": f"Block {block_number} tampered! Hash changed from {old_hash[:20]}... to {block.block_hash[:20]}..."
        }
    
    def get_all_clients(self) -> List[dict]:
        return [{"name": name, "identity": client.identity[:20] + "..."} 
                for name, client in self.clients.items()]
    
    def get_pending_transactions(self) -> List[dict]:
        return [{
            "sender": t.sender.identity[:20] + "..." if t.sender != "Genesis" else "Genesis",
            "recipient": t.recipient.identity[:20] + "...",
            "value": t.value,
            "time": t.time
        } for t in self.pending_transactions]
    
    def reset(self) -> dict:
        self.clients.clear()
        self.transactions.clear()
        self.blockchain.clear()
        self.pending_transactions.clear()
        return {"message": "Blockchain reset successfully"}
