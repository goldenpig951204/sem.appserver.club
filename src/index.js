const app = require('./app');
const port = process.env.PORT || 4000;
const connect = require('./models');
const Setting = require('./models/setting');
const config = require('./services/config');
const start = async () => {
  await connect();
  let setting = await Setting.findOne();
  if (!setting) {
    await connect();
    setting = await Setting.create({
      membershipLids: [2, 3],
      membershipApiKey: 'acnHdSvZkL7t45GZgEf9muzE6Q',
      domainOverviewLimit: 5,
      keywordOverviewLimit: 5,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
      cookie: ""
    });
  }
  config.setConfig(setting);
  
  app.listen(port, async () => {
    console.log(`Server listening ==========>: http://localhost:${port}`);
  });
};

start();
