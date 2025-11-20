import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent  
ENV_PATH = BASE_DIR / ".env"

load_dotenv(ENV_PATH)

MONGODB_URL = os.getenv("MONGO_DB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

async_client = None
database = None

async def get_database():
    global async_client, database
    if async_client is None:
        async_client = AsyncIOMotorClient(MONGODB_URL)
        database = async_client[DATABASE_NAME]
    return database

async def close_database():
    global async_client
    if async_client:
        async_client.close()
        async_client = None

print("Connected to MongoDB at", MONGODB_URL)
print("Using database:", DATABASE_NAME)