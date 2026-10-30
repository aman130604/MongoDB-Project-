import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "expense_analytics")

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
db = client[DATABASE_NAME]
expenses = db["expenses"]
