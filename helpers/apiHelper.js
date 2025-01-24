const axios = require('axios');

const generateContent = async (decompressedContent, customPrompt, apiKey) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

  console.log("Generating Prompt");

  let prompt = 'Summarise the chat';

  if(customPrompt === ''){
    prompt = `Write a summary of below text and give summary for each month between all sender and receiver ignore null message, encryption message and the message that does not provide complete information that is media and all. It,s for formal app, so write text formally`;
  } else{
    prompt = customPrompt;
  }




  const data = {
    contents: [
      {
        parts: [
          {text: decompressedContent},
          {text: prompt},
        ]
      }
    ]

  };
  try {
    const response = await axios.post( url, data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;  // Return the response from the external API
  } catch (error) {
    throw new Error(`Error generating content: ${error.message}`);
  }
};

module.exports = { generateContent };
