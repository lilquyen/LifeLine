const { Server } = require('socket.io');

let io;

module.exports = {
    init: (httpServer) => {
        io = new Server(httpServer, {
            cors: {
                origin: "*", 
                methods: ["GET", "POST"]
            }
        });

        io.on('connection', (socket) => {
            console.log('Một người dùng vừa kết nối:', socket.id);

            socket.on('join_app', (userId) => {
                socket.join(`user_${userId}`);
                console.log(`User ${userId} đã vào phòng riêng`);
            });

            socket.on('disconnect', () => {
                console.log(' Người dùng đã rời kết nối');
            });
        });

        return io;
    },

    getIo: () => {
        if (!io) {
            throw new Error('Socket.io chưa được khởi tạo! Hãy kiểm tra server.js');
        }
        return io;
    }
};