const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

let messages = []; // 存储留言的数组

app.get('/api/messages', (req, res) => {
    res.json(messages);
});

app.post('/api/messages', (req, res) => {
    const { content } = req.body;
    messages.push({ content });
    res.status(201).send();
});

app.listen(PORT, () => {
    console.log(`服务器正在运行在 http://localhost:${PORT}`);
}); 