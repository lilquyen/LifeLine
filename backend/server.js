const app = require('./app');
const http = require('http');
const socketLib = require('./common/socket');
const server = http.createServer(app);

socketLib.init(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});