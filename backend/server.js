const app = require('./app');
const http = require('http');
const socketLib = require('./common/socket');
const server = http.createServer(app);

socketLib.init(server);

const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server is running at port: http://localhost:${PORT}`);
});