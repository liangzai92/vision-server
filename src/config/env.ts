import * as fs from 'node:fs';
import * as path from 'node:path';
const isProd = process.env.APP_MODE == 'prod';

export default (): string[] => {
  const resolvePath = (pathStr: string) =>
    path.resolve(__dirname, '../../', pathStr);
  //
  const baseEnv = resolvePath('.env');
  const devEnv = resolvePath('.env.development');
  const prodEnv = resolvePath('.env.production');

  if (!fs.existsSync(devEnv) && !fs.existsSync(prodEnv)) {
    throw new Error('缺少环境配置文件');
  }

  const envFilePath = [baseEnv, isProd ? prodEnv : devEnv];
  return envFilePath;
};
