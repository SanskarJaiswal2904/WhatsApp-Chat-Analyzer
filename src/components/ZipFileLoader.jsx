import React, { useState } from "react";
import { Button, Typography, TextField, Box, List, ListItem } from "@mui/material";
import JSZip from "jszip";
import pako from "pako";
import axios from 'axios';
import IndiaGlobal from './IndiaGlobal';
import DeleteIcon from '@mui/icons-material/Delete';




const ZipFileLoader = () => {
  const [fileContent, setFileContent] = useState("");
  const [fileSize, setFileSize] = useState(""); // For memory size
  const [compressedSize, setCompressedSize] = useState(""); // For compressed size
  const [compressedContent, setCompressedContent] = useState(null);
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState([]);
  const [modelVersionF, setModelVersionF] = useState("");
  const [chunkSize, setChunkSize] = useState("");
  const [numberOfChunks, setNumberOfChunks] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analyzingState, setAnalyzingState] = useState("Analyze");


  const API_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000/api/v1";
  let totalSize = 0;

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]; // Get the uploaded file
    setError(""); // Reset error message
    setFileContent("");
    setFileSize("");
    setCompressedContent(null);
    setResult([]);
    setModelVersionF("");
    setCompressedSize("");
    setChunkSize("");
    setNumberOfChunks("");
    totalSize = 0;
    setIsLoading(false);
    setAnalyzingState("Analyze");



    if (file && file.name.endsWith(".zip")) {
      try {
        const zip = new JSZip();

        // Read the file as ArrayBuffer
        const zipContent = await file.arrayBuffer();

        // Load the zip content
        const loadedZip = await zip.loadAsync(zipContent);

        // Find the .txt file in the zip
        const txtFiles = Object.keys(loadedZip.files).filter((fileName) =>
          fileName.endsWith(".txt")
        );

        if (txtFiles.length === 1) {
          // Read the content of the .txt file
          const txtContent = await loadedZip.files[txtFiles[0]].async("string");

          // Set file content and memory size
          setFileContent(txtContent);

          // Calculate the memory size of the string in bytes
          const sizeInBytes = new TextEncoder().encode(txtContent).length;
          setFileSize(formatBytes(sizeInBytes));

          // Compress the content using pako
          const compressed = pako.gzip(txtContent);
          const compressedSizeInBytes = compressed.length;
          setCompressedSize(formatBytes(compressedSizeInBytes));
          setCompressedContent(compressed); 
        } else if (txtFiles.length === 0) {
          setError("No .txt file found in the zip file.");
        } else {
          setError("Multiple .txt files found in the zip file. Expected only one.");
        }
      } catch (err) {
        console.error("Error reading zip file:", err);
        setError("Failed to read the zip file.");
      }
    } else {
      setError("Please upload a valid .zip file.");
    }
  };

  const sendToServer = async (compressedContent, prompt) => {
    try {
      setIsLoading(true);
      if(prompt !== ""){
        console.log("Sending prompt:", prompt);
      }
      setAnalyzingState("Compressing the file..");

        const response = await axios.post(`${API_URL}/upload?prompt=${encodeURIComponent(prompt)}`, compressedContent, {
            headers: {
                "Content-Type": "application/gzip",
            },
        });

        if (response.status === 200) {
            setAnalyzingState("File uploaded successfully!");
            // Extract data from the server response
            const { parts, modelVersion, chunkSize, numberOfChunks } = response.data;
            setResult(parts);
            setModelVersionF(modelVersion);
            setChunkSize(chunkSize);
            setNumberOfChunks(numberOfChunks);

            totalSize = numberOfChunks * chunkSize;
            setIsLoading(false);

            console.log("Processed Content:", parts);
            console.log("Model Version:", modelVersion);
            setAnalyzingState("Analyze");

        } else {
            console.error("Failed to upload file.");
            setIsLoading(false);
        }
    } catch (error) {
        console.error("Error sending data to the server:", error);
        setIsLoading(false);
    }
};

  return (
    <Box sx={{backgroundColor: (theme) =>
          theme.palette.mode === "dark"
            ? "#03132fe8"
            : theme.palette.grey[100],
        color: (theme) => theme.palette.text.primary, padding: "20px", textAlign: "start"}}>
          <Box>
            <Box>
              <IndiaGlobal/>
            </Box>
            <Typography variant='h5' fontWeight={'bold'}>  
              Dive into your WhatsApp chat and unlock meaningful insights effortlessly.  
            </Typography>
            <Typography variant="body4" sx={{ my: 2 }} gutterBottom>
                <List>
                  <ListItem sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    • Export your WhatsApp chat using the
                    ⋮ icon.
                  </ListItem>
                  <ListItem> • Upload the exported .zip file here.</ListItem>
                  <ListItem> • Enter the type of analysis you'd like to perform, or leave it blank to generate a summary.</ListItem>
                </List>
              </Typography>
          </Box>


      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
      <Typography variant="body1" sx={{ mb: 1, mt: 3, fontWeight: 'bold' }}>
        Upload your WhatsApp Exported .zip File
      </Typography>
        <TextField
          type="file"
          inputProps={{ accept: ".zip" }}
          onChange={handleFileUpload}
          variant="outlined"
          style={{ marginBottom: "20px" }}
        />
        <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => { setFileContent(""); setFileSize(""); setCompressedSize(""); setError(""); window.location.reload() }}>
          Remove File
        </Button>
      

      <TextField
          label="Prompt (Optional) (Leave it blank to write summary of the chat)"
          multiline
          rows={8}
          placeholder='Write a prompt of what you want to do with chat data (If left blank it will write summary of the chat)'
          variant="standard"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          sx={{
            width: { xs: "90%", sm: "90%", md: "90%" },
            minWidth: "300px",
            marginBottom: 2,
            mt: 5
          }}
        />
      </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            loading={isLoading}
            loadingPosition="start"
            startIcon={<i class="fa-solid fa-brain"></i>}
            onClick={async () => {
              if (!compressedContent) {
                setError("No file available to analyze.");
                return;
              }
              await sendToServer(compressedContent, prompt);
            }}
          >
            {analyzingState}
          </Button>
          <Button variant="text" color="success" sx={{marginRight: {xs : '5px',sm : '25px', md:'50px', lg :'150px', xl : '170px',}}} onClick={() => {setPrompt('')}}>
            Clear
          </Button>
        </Box>

    <Box sx={{mt: 3}}>
      {error && (
        <Typography color="error" variant="body1" gutterBottom>
          {error}
        </Typography>
      )}
      {fileContent && (
        <>
          <Typography variant="body1" gutterBottom>
            <strong>Contents of the .txt file:</strong>
            <Typography variant="body2" gutterBottom>
            <strong>Original Size:</strong> {fileSize}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Compressed Size:</strong> {compressedSize}
            </Typography>
            {/* Render Model Version */}
            <Typography variant="body2" gutterBottom>
              <strong>Model Version:</strong> {modelVersionF}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Chunk Characters:</strong> {chunkSize}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Number of Chunks:</strong> {numberOfChunks}
            </Typography>

            <Typography variant="body2" gutterBottom>
              <strong>Chunk Size:</strong> {totalSize}
            </Typography>

            {/* Render Results */}
            {Array.isArray(result) && result.map((part, index) => (
              <Typography key={index} variant="body2" gutterBottom>
                <strong>Result {index + 1}:</strong> {part.text}
              </Typography>
            ))}
                  <pre>{fileContent}</pre>
                </Typography>
        </>
      )}
    </Box>
  </Box>
  );
};

export default ZipFileLoader;
