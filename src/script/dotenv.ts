import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';

const NODE_ENV = process.env.NODE_ENV || 'development';
if (!NODE_ENV) {
  throw new Error(
    'The NODE_ENV environment variable is required but was not specified.',
  );
}

const paths = {
  dotenv: '.env',
};

export const dotenvFiles = [
  `${paths.dotenv}.${NODE_ENV}.local`,
  `${paths.dotenv}.${NODE_ENV}`,
  // Don't include `.env.local` for `test` environment
  // since normally you expect tests to produce the same
  // results for everyone
  NODE_ENV !== 'test' && `${paths.dotenv}.local`,
  paths.dotenv,
].filter(Boolean);

const envDir = '../../env';
dotenvFiles.forEach((dotenvFile) => {
  const dotenvFilePath = path.resolve(__dirname, envDir, dotenvFile as string);
  if (fs.existsSync(dotenvFilePath as string)) {
    dotenvExpand.expand(
      dotenv.config({
        path: dotenvFilePath,
      }),
    );
  }
});
