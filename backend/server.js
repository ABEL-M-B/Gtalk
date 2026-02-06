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
