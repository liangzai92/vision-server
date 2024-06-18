import { createClient } from 'redis';

const getRedisConfig = () => {
  return {
    connectionString: `redis://xdf_daxue_fe_2024@r-2ze06e47ecd5ac84.redis.rds.aliyuncs.com:6379`,
  };
};

const redisConfig = getRedisConfig();

let client = null;

export const getClient = async () => {
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
