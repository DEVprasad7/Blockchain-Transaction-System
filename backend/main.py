from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import uvicorn
from blockchain_manager import BlockchainManager
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Blockchain Visualizer",
    description="Interactive Blockchain Implementation",
    version="1.0.0",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize blockchain manager
blockchain_manager = BlockchainManager()
HOST = os.getenv("HOST_URL", "localhost")
PORT = int(os.getenv("PORT", 5001))


class ClientCreate(BaseModel):
    name: str


class TransactionCreate(BaseModel):
    sender: str
    recipient: str
    value: float


class MineRequest(BaseModel):
    difficulty: int = 2


@app.get("/")
def home():
    """API Info."""
    return {
        "name": "Blockchain Visualizer API",
        "version": "1.0.0",
        "status": "running"
    }


@app.post("/api/clients")
def create_client(client: ClientCreate):
    try:
        result = blockchain_manager.create_client(client.name)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/clients")
def get_clients():
    return {"success": True, "data": blockchain_manager.get_all_clients()}


@app.post("/api/transactions")
def create_transaction(transaction: TransactionCreate):
    try:
        result = blockchain_manager.create_transaction(
            transaction.sender,
            transaction.recipient,
            transaction.value
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/transactions/pending")
def get_pending_transactions():
    return {"success": True, "data": blockchain_manager.get_pending_transactions()}


@app.post("/api/mine")
def mine_block(mine_request: MineRequest):
    try:
        result = blockchain_manager.mine_block(mine_request.difficulty)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/blockchain")
def get_blockchain():
    return {"success": True, "data": blockchain_manager.get_blockchain()}


@app.get("/api/validate")
def validate_blockchain():
    result = blockchain_manager.validate_blockchain()
    return {"success": True, "data": result}


@app.post("/api/tamper/{block_number}")
def tamper_block(block_number: int):
    try:
        result = blockchain_manager.tamper_block(block_number)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/reset")
def reset_blockchain():
    result = blockchain_manager.reset()
    return {"success": True, "data": result}


if __name__ == "__main__":
    uvicorn.run(app, host=HOST, port=PORT)
