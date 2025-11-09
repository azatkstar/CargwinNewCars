#!/usr/bin/env python3
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

async def restore_lots():
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('DB_NAME', 'cargwin_production')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Restore all archived Lexus lots to published
    result = await db.lots.update_many(
        {"make": "Lexus", "status": {"$in": ["archived", "sold"]}},
        {"$set": {"status": "published", "archived_at": None}}
    )
    
    print(f"✅ Restored {result.modified_count} Lexus lots to published status")
    client.close()

asyncio.run(restore_lots())
