# WhatsApp Chat Analyzer
This app analyzes exported WhatsApp chat data to generate meaningful insights or summaries. Users can upload their chat files in `.zip` format, provide an optional analysis prompt, and receive detailed results in an intuitive interface. The backend processes the chats by decompressing, chunking, and leveraging AI to extract key information. It's perfect for understanding trends, conversations, or generating summaries effortlessly, making it a valuable tool for personal or business use. 

## Live Link
[Live Link](https://whatsapp-chat-analyzer-nine.vercel.app/).

## Backend Service with Chunk-based File Processing

This backend service provides functionality to:

1. Process uploaded files in compressed format.
2. Decompress and split file content into manageable chunks.
3. Analyze content by interacting with external APIs.
4. Expose additional sample endpoints for testing.

## Features

- **File Upload and Processing**: Upload gzipped files, decompress, and split them into chunks for further processing.
- **Chunk Management**: Efficiently split large files into smaller parts for processing.
- **API Integration**: Leverages an external API to analyze content.
- **Retry Logic**: Implements retry with backoff for handling API rate limits.

---

## Prerequisites

- Node.js (>=16.x)
- npm (>=7.x)
- A `.env` file with the following variables:
  ```
  PORT_BACKEND=4000
  API_KEY_GEMINI=<Your API Key Here>
  ```

---

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd <repository-name>
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and provide the required variables:
   ```bash
   PORT_BACKEND=4000
   API_KEY_GEMINI=<Your API Key Here>
   ```

---

## Usage

### Starting the Server

Run the server with:
```bash
npm start
```

The server will be available at: `http://localhost:4000`

---

## API Endpoints

### **Base URL**
`http://localhost:4000`

### **GET /**
**Description**: Health check for the server.

**Response**:
```plaintext
Server is live.

Hello from the server!
```

### **GET /api/v1/data**
**Description**: Fetches sample data from an external API.

**Response**: JSON data from [https://jsonplaceholder.typicode.com/posts](https://jsonplaceholder.typicode.com/posts).

---

### **GET /api/v1/data2**
**Description**: Returns a simple JSON response.

**Response**:
```json
{
  "hi": "server is working"
}
```

---

### **POST /api/v1/upload**
**Description**: Upload a gzipped file for processing.

**Query Parameters**:
- `prompt` (optional): A prompt to customize content analysis.

**Headers**:
- `Content-Type`: `application/gzip`

**Request Body**: Gzipped file data.

**Response**:
```json
{
  "message": "Content processed",
  "length": <number_of_parts>,
  "numberOfChunks": <total_chunks>,
  "parts": [<array_of_content_parts>],
  "modelVersion": "<model_version>"
}
```

**Error Response**:
```json
{
  "error": "Failed to process content",
  "details": "<error_message>"
}
```

---

## Helper Functions

### `splitIntoChunks`
Splits text into smaller chunks of a specified size.

### `retryWithBackoff`
Retries a function with backoff delay when encountering specific errors (e.g., API rate limits).

---

## Development

### Running the Server in Development Mode
Use `nodemon` for automatic server restarts during development:
```bash
npm install -g nodemon
nodemon server.js
```

### Logging
The server logs steps and errors in the console for easy debugging.

---

## Deployment

- Ensure `.env` file is set up on the server.
- Use a process manager like `pm2` for production:
  ```bash
  npm install -g pm2
  pm2 start server.js --name "backend-service"
  ```

---

## Dependencies

- [express](https://www.npmjs.com/package/express): Web framework for Node.js.
- [cors](https://www.npmjs.com/package/cors): Middleware for handling Cross-Origin Resource Sharing.
- [zlib](https://nodejs.org/api/zlib.html): Compression utilities.
- [axios](https://www.npmjs.com/package/axios): Promise-based HTTP client.
- [dotenv](https://www.npmjs.com/package/dotenv): Loads environment variables from `.env` file.

---

## License
This project is licensed under the MIT License. See the LICENSE file for details.

---

## Acknowledgments

Special thanks to the creators of the libraries used in this project.

## Author
Made by [Sanskar](https://sanskarjaiswal2904.github.io/Sanskar-Website/) with ❤️.