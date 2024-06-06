import * as path from 'path';
import * as fs from 'fs-extra';
import * as url from 'url';
import Handlebars from 'handlebars';
import { getScreenShot } from './screenShot';

const STATIC_FILE_DIR = path.resolve(process.cwd(), '..', `editor/public/`);
const STATIC_TEMPLATE_FILE_APP_B = path.resolve(
  STATIC_FILE_DIR,
  'template/app-pc/index.html',
);

export const getResourceInfo = (relativeDir, filename) => {
  const relativeFileName = path.join(relativeDir, filename);
  const host = process.env.CLIENT_HOST || 'localhost';
  const fullFileUrl = url.format({
    protocol: 'http',
    host: host,
    pathname: relativeFileName,
  });
  return {
    filename,
    relativeDir,
    relativeFileName,
    fullFileUrl,
    STATIC_FILE_DIR: STATIC_FILE_DIR,
  };
};

export const getPublishedResourceInfo = (id) => {
  const indexHtml = getResourceInfo('', `${id}.html`);
  const screenshot = getResourceInfo(`item/${id}`, `cover-${id}.png`);
  return {
    indexHtml,
    screenshot,
  };
};

export const publishResources = async (id, projectData) => {
  const { indexHtml, screenshot } = getPublishedResourceInfo(id);
  /**
   * render html
   */
  const htmlTemplate = fs.readFileSync(STATIC_TEMPLATE_FILE_APP_B, 'utf8');
  const htmlString = Handlebars.compile(htmlTemplate)({
    projectData: JSON.stringify(projectData),
  });
  // 发布到静态文件服务 比如aliyun oss
  fs.ensureDirSync(STATIC_FILE_DIR);
  fs.writeFileSync(
    path.resolve(STATIC_FILE_DIR, indexHtml.relativeFileName),
    htmlString,
    'utf8',
  );

  /**
   * 生成截图
   */
  const res: any = await getScreenShot(indexHtml.fullFileUrl);
  const source = res.data?.snapshot;
  // 发布到静态文件服务 比如aliyun oss
  const destination = path.resolve(
    STATIC_FILE_DIR,
    screenshot.relativeFileName,
  );
  fs.ensureDirSync(path.dirname(destination));
  await fs.rename(source, destination);

  return {
    indexHtml,
    screenshot,
    link: indexHtml.fullFileUrl,
  };
};
