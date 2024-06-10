require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectToMongo = require('./db');
// var cors = require('cors');
connectToMongo();

const app = express();
const port = 5000; // Choose any port you want
app.use(cors({ origin: 'http://localhost:3000' }));
// app.use(cors());
app.use(express.json());
// Define a route

app.use('/api/auth',require('./routes/auth'))
app.use('/api/threads',require('./routes/threads'))

app.get('/', (req, res) => {
    res.send('Hello, world!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
