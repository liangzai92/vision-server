import * as os from 'os';
import puppeteer from 'puppeteer';

export const getScreenShot = async function (url, options: any = {}) {
  const { width, height } = options;
  let result;
  return new Promise(async (resolve, reject) => {
    try {
      const ts = new Date().getTime();
      const snapshot = os.tmpdir() + '/' + ts + '.png';
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: +width || 375, height: +height || 603 });
      await page.goto(url, {
        waitUntil: 'networkidle0',
      });
      await page.evaluateOnNewDocument(() => {});
      const raw = await page.screenshot({
        path: snapshot,
      });
      await browser.close();
      result = {
        data: {
          raw: raw,
          snapshot: snapshot,
        },
      };
    } catch (e) {
      console.log('e', e);
      result = {
        errno: -1,
        msg: 'fail',
      };
      reject(result);
    }
    resolve(result);
  });
};
