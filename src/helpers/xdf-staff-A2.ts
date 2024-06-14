import * as md5 from 'md5';
import * as qs from 'qs';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { tryCatchWrapper } from '@/utils/tryCatchWrapper';

const getXDFStaffA2Config = () => {
  // const env = process.env.NODE_ENV;
  const env = 'production';
  if (env === 'production') {
    return {
      BASE_URL: 'https://a2.xdf.cn',
      APP_ID: '9212',
      APP_KEY: 'f791dce2c2b04ba8a8149fbcb9a04dc0',
    };
  }
  return {
    BASE_URL: 'https://a2linux.test.xdf.cn',
    APP_ID: '1033',
    APP_KEY: 'test_a3e87984b778afe1784bb3f333a',
  };
};
const XDF_STAFF_A2_CONFIG = getXDFStaffA2Config();

const getSignV2 = ({ appid, time, requestid, method }) => {
  const appkey = XDF_STAFF_A2_CONFIG.APP_KEY;
  const signText = method + appid + requestid + time + appkey;
  return md5(signText.toLowerCase()).toUpperCase();
};

/**
 * https://alidocs.dingtalk.com/i/nodes/14lgGw3P8vvlkYYof1b0bBwg85daZ90D?utm_scene=team_space
 */
export const getUserPhotoUrl = async ({ accountid }) => {
  const url = XDF_STAFF_A2_CONFIG.BASE_URL + '/a2apis/getuserphotov2';
  const method = 'getuserphotov2';
  const payload: any = {
    accountid: accountid,
    method: method,
    appid: XDF_STAFF_A2_CONFIG.APP_ID,
    time: new Date().getTime(),
    requestid: uuidv4(),
  };
  payload.sign = getSignV2(payload);
  return url + '?' + qs.stringify(payload);
};

export const getUserBaseInfoByEmail = async ({
  accountid,
  E2Userid,
  U2Userid,
}: {
  accountid?: string;
  E2Userid?: string;
  U2Userid?: string;
}) => {
  const url = XDF_STAFF_A2_CONFIG.BASE_URL + '/a2apis/getuserbaseinfobyemail';
  const method = 'getuserbaseinfobyemail';
  const payload: any = {
    E2Userid: E2Userid,
    U2Userid: U2Userid,
    accountid: accountid,
    method: method,
    appid: XDF_STAFF_A2_CONFIG.APP_ID,
    time: new Date().getTime(),
    requestid: uuidv4(),
  };
  payload.sign = getSignV2(payload);
  const [err, res] = await tryCatchWrapper(axios.post)(url, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 1：成功 其它值：失败，msg 为报错提示
  if (res?.data?.status !== 1) {
    return [res, res];
  }

  const data = res.data?.data;
  return [undefined, data];
};

const getSignV8 = ({ method, a2appid, ts, ip, ac }) => {
  const appkey = XDF_STAFF_A2_CONFIG.APP_KEY;
  const signText = method + ac + a2appid + ts + ip + appkey;
  return md5(signText.toLowerCase()).toUpperCase();
};

/**
 * https://alidocs.dingtalk.com/i/nodes/kDnRL6jAJM3A1XXkco0BQQLAWyMoPYe1?utm_scene=team_space
 */
export const getUserByAccount = async (
  {
    accountid,
  }: {
    accountid: string;
  },
  {
    ip,
    ua,
  }: {
    ip: string;
    ua: string;
  },
) => {
  const url = XDF_STAFF_A2_CONFIG.BASE_URL + '/A2ApiV8/V8GetUserByAc';
  const payload: any = {
    ac: accountid,
    a2appid: XDF_STAFF_A2_CONFIG.APP_ID,
    ts: new Date().getTime(),
    ip: ip,
    ua: ua,
  };
  payload.sign = getSignV8({
    ...payload,
    method: 'V8GetUserByAc',
  });
  const [err, res] = await tryCatchWrapper(axios.post)(url, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (err) {
    return [err, res];
  }

  // 1：成功 其它值：失败，msg 为报错提示
  if (res?.data?.status !== 1) {
    return [new Error(res.data.msg), res];
  }

  const data = res.data?.data;
  return [undefined, data];
};
