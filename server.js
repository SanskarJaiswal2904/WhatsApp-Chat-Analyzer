const express = require('express');
const cors = require('cors');
const zlib = require('zlib');
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

app.use(express.raw({ limit: '10mb', type: 'application/gzip' }));



app.post('/api/v1/upload', async (req, res) => {
  const prompt = req.query.prompt.trim(); // Extract prompt from query
  console.log("In backend");
  console.log("Prompt:", prompt);

  try {
    console.log("Decompressing the file...");
    const decompressedContent = zlib.gunzipSync(req.body).toString('utf-8');

    // Split the content into chunks
    const chunkSize = 800000; // Adjust chunk size as needed
    const chunks = splitIntoChunks(decompressedContent, chunkSize);
    const numberOfChunks = chunks.length;

    console.log(`Split data into ${numberOfChunks} chunks.`);

    const apiKey = process.env.API_KEY_GEMINI;
    console.log("Analyzing File...");

    let allParts = []; // To collect all the parts from the API responses
    let modelVersion = 'Unknown';

    // Process each chunk sequentially
    for (const chunk of chunks) {
      console.log("Processing chunk...");
      console.log("Prompt:", prompt);
      const result = await retryWithBackoff(() => generateContent(chunk, prompt, apiKey));

      // Append results
      const parts = result?.candidates?.[0]?.content?.parts || [];
      allParts = [...allParts, ...parts];

      // Capture model version (if available)
      modelVersion = result?.modelVersion || modelVersion;
    }

    console.log("Success");

    res.status(200).json({
      message: 'Content processed',
      chunkSize,
      numberOfChunks,
      parts: allParts,
      modelVersion,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process content', details: error.message });
  }
});

// Helper function to split into chunks
const splitIntoChunks = (text, chunkSize) => {
  const paragraphs = text.split(/\n+/); // Split the content into paragraphs using newline(s)
  const chunks = [];
  let currentChunk = "";

  paragraphs.forEach((paragraph) => {
    if ((currentChunk + paragraph).length <= chunkSize) {
      currentChunk += paragraph + "\n"; // Add paragraph and a newline
    } else {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph + "\n";
    }
  });

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};




async function retryWithBackoff(fn, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries - 1 || error.response?.status !== 429) throw error;
        const retryAfter = parseInt(error.response.headers['retry-after'], 10) || delay;
        console.log(`Retrying in ${retryAfter} ms...`);
        await new Promise((resolve) => setTimeout(resolve, retryAfter));
      }
    }
}
  


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
