import * as path from 'node:path';
import * as jsonfile from 'jsonfile';
import axios from 'axios';

/**
 * https://doc-openapi.saash.vdyoo.com/doc#/sso/ticket
 */
export const getTicket = async ({ vdyooAppId, vdyooAppKey }: any) => {
  const ticketStoreJsonFilePath = path.resolve(
    __dirname,
    '../../public/ticket.json',
  );
  const ticketInfo = jsonfile.readFileSync(ticketStoreJsonFilePath);
  const ticketKey = `ticket_${vdyooAppId}`;
  const ticket = ticketInfo[ticketKey];
  const isExpired = Date.now() - ticketInfo.timestamp > 1000 * 60 * 60 * 1.5;
  if (!ticket || isExpired) {
    try {
      const endpoint = 'https://api-service.saash.vdyoo.com/basic/get_ticket';
      const res = await axios.get(endpoint, {
        params: {
          appid: vdyooAppId,
          appkey: vdyooAppKey,
        },
      });
      const { ticket } = res.data;
      jsonfile.writeFileSync(ticketStoreJsonFilePath, {
        [ticketKey]: ticket,
        timestamp: Date.now(),
      });
      return ticket;
    } catch (err) {}
  }
  return ticket;
};

/**
 * https://doc-openapi.saash.vdyoo.com/doc#/sso/verify
 */
export const verify = async ({ ticket, token }) => {
  const endpoint = 'https://sso.saash.vdyoo.com/api/v1/sso/verify';
  try {
    const res = await axios.get(endpoint, {
      params: {
        ticket,
        token,
      },
    });
    if (res?.data?.errcode !== 0) {
      return [res?.data, res];
    }
    return [undefined, res.data];
  } catch (error) {
    return [error, undefined];
  }
};

export const proxyZhiYinLouApi = async (method, path, params) => {
  const baseURL = 'https://api-service.saash.vdyoo.com';
  const endpoint = path || '/cmpts/data/account/v2/users';
  const url = `${baseURL}${endpoint}`;

  const ticket = await getTicket({
    vdyooAppId: process.env.NEST_VDYOO_APP_ID,
    vdyooAppKey: process.env.NEST_VDYOO_APP_KEY,
  });

  const payload = {
    ticket,
    ...params,
  };
  const res = await axios[method](url, {
    params: {
      ...payload,
    },
  });
  return res?.data?.data;
};
