const axios = require('axios');

const generateContent = async (decompressedContent, customPrompt, apiKey) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

  console.log("Generating Prompt");

  let prompt = 'Summarise the chat';

  if(customPrompt === ''){
    prompt = "Write a summary of below text, its either whatsapp chat between two people or a group chat. Also specify the date (approx) you are summarising for between all sender and receiver ignore null message, encryption message and the message that does not provide complete information that is media and all. It can contain hindi language also so analyze it and send in easy to understand format.";
  } else{
    prompt = customPrompt + " based on chat. just do this much and dont summarise, dont summarise, dont summarise strictly no summarise.";
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
