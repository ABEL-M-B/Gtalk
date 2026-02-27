require('dotenv').config()
require('./config/passport')
const express = require('express');
const http = require('http')
const socketIo = require('socket.io')
const path = require('path');
const session = require('express-session')
const passport = require('passport')
const connectMongoMessages = require('./config/mongodb_messages')
const connectMongoUsers = require('./config/mongodb_users')



connectMongoMessages()
connectMongoUsers()



const authRoute = require('./routes/authRoute')
const userRoute = require('./routes/userRoute')
const messageRoute = require('./routes/messageRoute')
const imageRoute = require('./routes/imageRoute');
const proxyRoute = require('./routes/proxyRoute');
const { timeStamp } = require('console');

const app = express();
const server = http.createServer(app); // create http server 
const io = socketIo(server,{
    cors:{
        origin:'*',
        methods: ['GET','POST']
    }
});    //bind socket 


// socket logic
const userSocketMap = new Map();

io.on('connection',(socket) => 
    {   
        console.log('User connected:',socket.id);
        //when a user connect get the googleId
        socket.on('register',(userId) => 
            {
                userSocketMap.set(userId,socket.id);
                socket.userId = userId
            });

        socket.on('sendMessage',(data) =>
            {
                const {to,text,from} = data;
                const messageData = {
                    from,
                    to,
                    text,
                    timestamp: new Date()
                };
                
                // Emit to recipient
                const recipientSocketId = userSocketMap.get(to)
                if (recipientSocketId){
                    io.to(recipientSocketId).emit('receiveMessage', messageData);
                }
                
                // Emit back to sender
                socket.emit('receiveMessage', messageData);
            });
        
        //images
        socket.on('sendImage',(data) =>
            {
                const{to,url,public_id,from} = data;
                const imageData = {
                    from,
                    to,
                    url,
                    public_id,
                    timestamp: new Date()
                };

                // Emit to recipient
                const recipientSocketId = userSocketMap.get(to)
                if (recipientSocketId)
                    {
                        io.to(recipientSocketId).emit('receiveImage', imageData);
                    }
                
                // Emit back to sender
                socket.emit('receiveImage', imageData);
            });
        
        //calluser
        socket.on('callUser', ({to, signalData,from}) =>
            {
                const recipientSocketId = userSocketMap.get(to);
                if (recipientSocketId)
                    {
                        io.to(recipientSocketId).emit('incomingCall', {from, signalData});
                    }
            }
        )

        //acceptuser
        socket.on('acceptCall',({to,signalData}) => 
            {
                const recipientSocketId = userSocketMap.get(to);
                if (recipientSocketId)
                    {
                        io.to(recipientSocketId).emit('callAccepted',{signalData});
                    }
            })

        
        //endcall
        socket.on('endCall',({to}) =>
            {
                const recipientSocketId = userSocketMap.get(to);
                if (recipientSocketId)
                    {
                        io.to(recipientSocketId).emit('callEnded')
                    }
            }
        )




        // File transfer signaling (relay events between peers)
        socket.on('fileOffer', (data) => {
            const rid = userSocketMap.get(data.to);
            if (rid) io.to(rid).emit('fileOffer', data);
        });
        socket.on('fileAccept', (data) => {
            const rid = userSocketMap.get(data.to);
            if (rid) { data.from = socket.userId; io.to(rid).emit('fileAccepted', data); }
        });
        socket.on('fileReject', (data) => {
            const rid = userSocketMap.get(data.to);
            if (rid) io.to(rid).emit('fileRejected', data);
        });
        socket.on('fileSignal', (data) => {
            const rid = userSocketMap.get(data.to);
            if (rid) { data.from = socket.userId; io.to(rid).emit('fileSignal', data); }
        });
        socket.on('fileCancel', (data) => {
            const rid = userSocketMap.get(data.to);
            if (rid) io.to(rid).emit('fileCancelled', data);
        });

        // Handle read receipts - lightweight WebSocket-based read status
        socket.on('readReceipt', async (data) => {
            const { from, to } = data;
            if (!from || !to) return;

            try {
                const Message = require('./models/messageModel');
                const ImageMessage = require('./models/ImageMessageModel');

                // Update messages in DB (from = sender, to = recipient reading them)
                await Message.updateMany(
                    { from, to, isRead: false },
                    { isRead: true }
                );
                await ImageMessage.updateMany(
                    { from, to, isRead: false },
                    { isRead: true }
                );

                // Send confirmation back to sender so their ticks turn blue
                const senderSocketId = userSocketMap.get(from);
                if (senderSocketId) {
                    io.to(senderSocketId).emit('readReceipt', { from: to, to: from });
                }
            } catch (err) {
                console.error('Error processing read receipt:', err);
            }
        });

        socket.on('disconnect',() =>
            {
                if (socket.userId)
                    {
                        userSocketMap.delete(socket.userId);
                        console.log(`User ${socket.userId} disconnected`);
                    }
            });
        }
);


app.use(express.json());

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/src', express.static(path.join(__dirname, '../frontend/src')));

// Route to index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

app.use(session (
    {
        secret: 'random',
        resave: false,
        saveUninitialized:false,
        cookie: {secure:false}
    }
)
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth",authRoute);
app.use("/api/users",userRoute);
app.use("/api/messages",messageRoute);
app.use("/api/images",imageRoute)
app.use("/api/proxy",proxyRoute)

// 404 handler
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port localhost://${PORT}`);
});
