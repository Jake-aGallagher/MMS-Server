require('dotenv').config();
console.log("read env variables", process.env.DATABASE)
const express = require('express');

const app = express();

app.listen(3001, () => {
    console.log('server is running');
});
