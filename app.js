const express = require('express');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 15 * 1024 * 1024 }
}));
app.use(cors());

const generalRouter = require('./routes/general');
app.use('/general', generalRouter);

const gymRouter = require('./routes/gym');
app.use('/gym', gymRouter);

const usersRouter = require('./routes/users');
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const PORT = process.env.PORT || process.env.API_PORT || 3000;

app.listen(PORT, () => {
    console.log(`API listening on port ${PORT}`);
});

module.exports = app;
