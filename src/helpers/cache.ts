import { getClient } from './redis';

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
