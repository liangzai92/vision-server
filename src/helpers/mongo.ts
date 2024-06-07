import { MongoClient } from 'mongodb';

const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;

export const getMongoConfig = () => {
  return {
    connectionString: MONGO_CONNECTION_STRING,
  };
};
const mongoConfig = getMongoConfig();

let client = null;
let db = null;

export const getClient = () => {
  if (client) {
    return client;
  }
  client = new MongoClient(mongoConfig.connectionString);
  return client;
};

export const connect = () => {
  return getClient().connect().catch(console.error);
};

export const close = () => {
  if (client) {
    return client.close();
  }
};

export const getDB = (dbName?) => {
  if (db) {
    return db;
  }
  if (!client) {
    db = getClient().db(dbName || 'vision');
  }
  return db;
};
