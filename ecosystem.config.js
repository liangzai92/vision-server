const path = require('path');
const { join } = path;
const script = join(__dirname, 'dist/main.js');

module.exports = {
  apps: [
    {
      name: 'liangzai',
      script,
      instances: 3,
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS Z',
      log_type: 'json',
      merge_logs: true,
    },
  ],
};
