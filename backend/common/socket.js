const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

let io;

module.exports = {
    init: (httpServer) => {
        io = new Server(httpServer, {
            cors: {
                origin: "*"// tsau nay can sua thanh domain frontend
            }
        });

        io.use((socket, next) => {
            const token = socket.handshake.auth.token;
            if(!token) {
                return next(new Error('Authorized error'));
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.user = decoded;
                next();
            } catch (err) {
                return next(new Error('Authorized error'));
            }
        })
        ;

        io.on('connection', (socket) => {
            console.log(`User ${socket.user.id} connected`);
      
            // Join room cá nhân để nhận thông báo
            socket.join(`user_${socket.user.id}`);
      
            // Join room conversation để nhắn tin
            socket.on('join_conversation', (conversationId) => {
              socket.join(`conversation_${conversationId}`);
              console.log(`User ${socket.user.id} joined conversation_${conversationId}`);
            });

            socket.on('join_request', (requestId) => {
              socket.join(`request_${requestId}`);
              console.log(`User ${socket.user.id} joined request_${requestId}`);
            });
      
            // Rời room conversation
            socket.on('leave_conversation', (conversationId) => {
              socket.leave(`conversation_${conversationId}`);
            });

            socket.on('leave_request', (requestId) => {
              socket.leave(`request_${requestId}`);
            });
      
            socket.on('disconnect', () => {
              console.log(`User ${socket.user.id} disconnected`);
            });
        });

        return io;
    },

    getIo: () => {
        if (!io) {
            throw new Error('Socket.io not initialized. Call init() first.');
        }
        return io;
    }
};
