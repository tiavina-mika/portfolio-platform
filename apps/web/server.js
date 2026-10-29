const next = require('next');
const express = require('express');
const cors = require('cors');
const Parse = require('parse/node');
const axios = require('axios');
const cron = require('node-cron');

const dev = process.env.APP_ENV === 'development';

/**
 * NOTE: change this to your local IP address if you want to test on other devices
 * should be the same as the server URL
 * change also the hostname in .env file (e.g: SERVER_URL and NEXT_PUBLIC_SERVER_URL)
 */
const PORT = process.env.PORT || 9002;

// when using middleware `hostname` and `port` must be provided below
const nextApp = next({ dev, port: PORT });
const handle = nextApp.getRequestHandler();

nextApp
  .prepare()
  .then(() => {
    const serverUrl = process.env.SERVER_URL;

    /**
     * Initialize Parse Server
     * We use the parse client SDK as a server
     * because we only use it for NextJs server-side
     * e.g: in Server components, Server actions, API routes, ...
     * NOTE: for build time, we initialize Parse in `next.config.js`
     */
    Parse.initialize(process.env.PARSE_APP_ID, 'xxx');
    Parse.serverURL = serverUrl + '/parse';

    // global.Parse = Parse;
    const app = express();

    app.use(cors());

    app.get('/api/ping', (req, res) => {
      res.json({ message: 'pong' });
    });

    if (!dev) {
      // Schedule a cron job to ping the app every 14 minutes
      // to keep the app awake (onrender free plan has 15 minutes inactivity limit)
      cron.schedule('*/14 * * * *', async () => {
        console.log('Cron job running every 14 minutes');

        // Make a request to your own endpoint to keep the app awake
        try {
          const response = await axios.get(process.env.APP_URL + '/api/ping');
          console.log('Ping response:', response.data);
        } catch (error) {
          console.error('Error pinging the app:', error.message);
        }
      });
    }

    app.all('*splat', (req, res) => {
      return handle(req, res);
    });

    app.listen(PORT, () => {
      console.log(
        `
        =====================================
        NextJs server
        ${process.env.APP_URL}
        =====================================
        `,
      );
    });
  })
  .catch((error) => {
    console.error(error.stack);
    process.exit(1);
  });
