import * as md5 from 'md5';
import * as qs from 'qs';
import axios from 'axios';
import * as dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { tryCatchWrapper } from '@/utils/tryCatchWrapper';

const getXDFStaffSSOConfig = () => {
  return {
    APP_KEY: 'test_x3k_1d87798a44b144d6bb6cb4bbe5cfd24d',
    APP_ID: 'test_x3mofang',
  };
};
const XDF_STAFF_SSO_CONFIG = getXDFStaffSSOConfig();

export const getLoginUrl = () => {
  const baseUrl = 'https://teste2api.test.xdf.cn/e2/qr';
  const returnUrl =
    'https://xone-txgw1.test.xdf.cn/daxue-node-mofang-server-5435/auth/xdf/staff/login';
  const mergedSearchParams = {
    x3id: XDF_STAFF_SSO_CONFIG.APP_ID,
    state: uuidv4(),
    returnUrl: returnUrl, // 只有域名是固定的，修改需要联系集团的人。
  };
  const queryString = qs.stringify(mergedSearchParams);
  const url = `${baseUrl}?${queryString}`;
  console.log('getLoginUrl', url);
  return url;
};

export const getLogoutUrl = (searchParams) => {
  const baseUrl = 'https://teste2api.test.xdf.cn/e2/logout';
  const mergedSearchParams = {
    returnUrl: getLoginUrl(),
    ...searchParams,
  };
  const queryString = qs.stringify(mergedSearchParams);
  const url = `${baseUrl}?${queryString}`;
  console.log('getLogoutUrl', url);
  return url;
};

const getSign = ({ e2e, code, ip, x3id, time }) => {
  const x3key = XDF_STAFF_SSO_CONFIG.APP_KEY;
  const signText = 'X3OAuthVerifyCode' + e2e + code + ip + x3id + time + x3key;
  return md5(signText.toLowerCase()).toUpperCase();
};

export const verifyAuthCode = async ({ code, e2e, userAgent, ip }) => {
  const url = 'https://teste2api.test.xdf.cn/x3mf/X3OAuthVerifyCode';
  const payload: any = {
    ip: ip,
    userAgent: userAgent,
    e2e: e2e,
    code: code,
    x3id: XDF_STAFF_SSO_CONFIG.APP_ID,
    time: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
  };
  payload.sign = getSign(payload);
  const [err, res] = await tryCatchWrapper(axios.post)(
    url,
    qs.stringify(payload),
    {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    },
  );
  console.log('verifyAuthCode request', [err, res]);

  // 1：成功 其它值：失败，msg 为报错提示
  if (res?.data?.status !== 1) {
    return [res, res];
  }

  const data = res.data?.data;
  return [undefined, data];
};
