require('dotenv').config()
require('./config/passport')
const express = require('express');
const path = require('path');
const session = require('express-session')
const passport = require('passport')
const connectMongo = require('./config/mongodb')



connectMongo()

const authRoute = require('./routes/authRoute')
const userRoute = require('./routes/userRoute')
const messageRoute = require('./routes/messageRoute')

const app = express();


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

// 404 handler
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port localhost://${PORT}`);
});
