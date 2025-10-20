import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MessageBoard = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        const response = await axios.get('/api/messages');
        setMessages(response.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage) return;

        await axios.post('/api/messages', { content: newMessage });
        setNewMessage('');
        fetchMessages();
    };

    return (
        <div>
            <h1>留言板</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="输入你的留言"
                />
                <button type="submit">提交</button>
            </form>
            <ul>
                {messages.map((msg, index) => (
                    <li key={index}>{msg.content}</li>
                ))}
            </ul>
        </div>
    );
};

export default MessageBoard; 