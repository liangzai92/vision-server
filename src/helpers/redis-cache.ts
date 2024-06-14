import { createClient } from 'redis';

const getRedisConfig = () => {
  return {
    connectionString: `redis://xdf_daxue_fe_2024@r-2ze06e47ecd5ac84.redis.rds.aliyuncs.com:6379`,
  };
};

const redisConfig = getRedisConfig();

let client = null;
const getClient = async () => {
  if (client) {
    return client;
  }
  client = await createClient({
    url: redisConfig.connectionString,
  })
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect();
  return client;
};

export default {
  set: async (key, value, options) => {
    const client = await getClient();
    let val = value;
    if (typeof value === 'object') {
      val = JSON.stringify(value);
    }
    return client.set(key, val, options);
  },
  get: async (key) => {
    const client = await getClient();
    const val = await client.get(key);
    try {
      return JSON.parse(val);
    } catch (e) {
      return val;
    }
  },
  del: async (key) => {
    const client = await getClient();
    return client.del(key);
  },
};
