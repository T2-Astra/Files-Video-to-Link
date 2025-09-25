import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://krish:krish1234@algox.6nclqwu.mongodb.net/mediacraft?retryWrites=true&w=majority';

let client;
let db;

export async function connectToDatabase() {
  if (db) {
    return { db, client };
  }

  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('mediacraft');
    
    console.log('Connected to MongoDB');
    return { db, client };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}