const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const mongoose = require('mongoose');

app.use(express.static(path.join(__dirname, '../src/index.html')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/index.html'));
});
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
mongoose.connect('mongodb://localhost:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log('Error connecting to MongoDB', err);
});
