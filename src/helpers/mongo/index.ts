import { MongoClient, ObjectId } from 'mongodb';
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

export function convertToObjectId(input: any) {
  if (input instanceof ObjectId) {
    return input;
  }
  return new ObjectId(input);
}

export const findWithPagination = async (
  collection,
  condition,
  payload: any = {
    page: 1,
    pageSize: 10,
  },
) => {
  const page = payload.page || 1;
  const pageSize = payload.pageSize || 10;
  const skip = (page - 1) * pageSize;
  const take = pageSize;
  const totalCount = await collection.countDocuments(condition);
  const totalPage = Math.ceil(totalCount / pageSize);
  const data = await collection
    .find(condition)
    .sort({
      createdAt: -1,
    })
    .skip(skip)
    .limit(take)
    .toArray();

  const hasMore = page < totalPage;
  return {
    hasMore,
    list: data,
    pageSize,
    page,
    nextPage: page + 1,
    totalCount,
    totalPage,
  };
};
