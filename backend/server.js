const http = require('http');
const dotenv = require('dotenv');
const app = require('./app');
const seedAdmin = require('./utils/seedAdmin');

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, async () => {
  console.log(`Campus FixIt API server running on port ${PORT}`);
  await seedAdmin();
});


