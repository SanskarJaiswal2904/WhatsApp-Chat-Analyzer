const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const { generateContent } = require('./helpers/apiHelper');


const app = express();
const PORT = process.env.PORT_BACKEND || 4000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is live.\n\nHello from the server!');
});

app.get('/api/v1/data', async (req, res) => {
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
    res.json(response.data);
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

app.get('/api/v1/data2', async (req, res) => {
    try {
      res.json({'hi' : 'server is working'});
    } catch (error) {
      res.status(500).send('Error fetching data');
    }
});


app.post('/api/v1/upload', async (req, res) => {
    const { compressedContent } = req.body;
    const apiKey = process.env.API_KEY_GEMINI;
    
    try {
      const result = await generateContent(compressedContent, apiKey);
      res.status(200).json({ message: 'Content processed', result });
    } catch (error) {
      res.status(500).json({ error: 'Failed to process content', details: error.message });
    }
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
