import React, { useState } from "react";
import { Button, Typography, TextField, Box, List, ListItem, Paper, Divider, Accordion, AccordionSummary, AccordionDetails, Tooltip, } from "@mui/material";
import JSZip from "jszip";
import pako from "pako";
import axios from 'axios';
import IndiaGlobal from './IndiaGlobal';
import DeleteIcon from '@mui/icons-material/Delete';
import ReactMarkdown from "react-markdown";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { jsPDF } from "jspdf";
import { v4 as uuidv4 } from 'uuid';








const ZipFileLoader = () => {
  const [fileContent, setFileContent] = useState("");
  const [fileSize, setFileSize] = useState(""); // For memory size
  const [compressedSize, setCompressedSize] = useState(""); // For compressed size
  const [compressedContent, setCompressedContent] = useState(null);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState([]);
  const [modelVersionF, setModelVersionF] = useState("");
  const [chunkSize, setChunkSize] = useState("");
  const [numberOfChunks, setNumberOfChunks] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analyzingState, setAnalyzingState] = useState("Analyze");


  const API_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000/api/v1";

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]; // Get the uploaded file
    setError(null); // Reset error message
    setFileContent("");
    setFileSize("");
    setCompressedContent(null);
    setResult([]);
    setModelVersionF("");
    setCompressedSize("");
    setChunkSize("");
    setNumberOfChunks("");
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

  let shouldUpdateAnalyzingState = true; // Flag to track state updates
  const sendToServer = async (compressedContent, prompt) => {
      try {
          setIsLoading(true);
          setError(null); // Clear previous errors, if any
  
          if (prompt !== "") {
              console.log("Sending prompt:", prompt);
          }
  
          shouldUpdateAnalyzingState = true;
  
          // Update analyzing state periodically
          setAnalyzingState("Compressing the file..");
  
          setTimeout(() => {
              if (shouldUpdateAnalyzingState) setAnalyzingState("Decompressing the file..");
          }, 2000);
  
          setTimeout(() => {
              if (shouldUpdateAnalyzingState) setAnalyzingState("Analyzing File");
          }, 4000);
  
          setTimeout(() => {
              if (shouldUpdateAnalyzingState) setAnalyzingState("Processing..");
          }, 6000);
  
          setTimeout(() => {
              if (shouldUpdateAnalyzingState)
                  setAnalyzingState("Processing... Larger chat sizes may take more time to process.");
          }, 12000);
  
          // Make the API call
          const response = await axios.post(`${API_URL}/upload?prompt=${encodeURIComponent(prompt)}`, compressedContent, {
              headers: {
                  "Content-Type": "application/gzip",
              },
          });
  
          if (response.status === 200) {
              // Success: Stop updating analyzing state and set final state
              shouldUpdateAnalyzingState = false;
              setAnalyzingState("Analyze");
  
              // Extract and set data from the server response
              const { parts, modelVersion, length, numberOfChunks } = response.data;
              setResult(parts);
              setModelVersionF(modelVersion);
              setChunkSize(length);
              setNumberOfChunks(numberOfChunks);
  
              setIsLoading(false);
  
              console.log("Model Version:", modelVersion);
          } else {
              // Failure: Stop updating state and show error
              shouldUpdateAnalyzingState = false;
              setAnalyzingState("Failed");
              setError("Failed to upload file.");
              setIsLoading(false);
          }
      } catch (error) {
          // Error handling
          shouldUpdateAnalyzingState = false;
          console.error("Error sending data to the server:", error);
  
          // Extract error message
          const errorMessage =
              error.response?.data?.message || error.message || "An unknown error occurred";
  
          setAnalyzingState("Failed"); // Final state for error
          setError(errorMessage); // Set meaningful error
          setIsLoading(false);
      }
  };
  
  const downloadPDFUUID = (fileContent, fileNamePrefix) => {
    const uuid = uuidv4(); // Generate a random UUID
    const doc = new jsPDF();
  
    const margin = 10; // Left and right margin
    const pageHeight = doc.internal.pageSize.height; // Page height
    const lineHeight = 10; // Line height
    let yPosition = margin; // Starting y position
  
    // Split content into paragraphs based on natural line breaks
    const paragraphs = fileContent.split("\n");
  
    paragraphs.forEach((paragraph) => {
      // Split paragraph into lines that fit within the page width
      const lines = doc.splitTextToSize(paragraph, doc.internal.pageSize.width - 2 * margin);
  
      lines.forEach((line) => {
        // Check if the line fits on the current page, or add a new page
        if (yPosition + lineHeight > pageHeight) {
          doc.addPage();
          yPosition = margin; // Reset yPosition for the new page
        }
  
        // Add the line to the PDF
        doc.text(line, margin, yPosition);
        yPosition += lineHeight; // Move to the next line
      });
  
      // Add extra space between paragraphs
      yPosition += lineHeight;
    });
  
    // Generate the file name with UUID
    const fileName = `${fileNamePrefix}_${uuid}.pdf`;
  
    // Save the PDF
    doc.save(fileName);
  };

  const arrayToString = (result) => {
    if (!Array.isArray(result) || result.length === 0) {
      console.error("Invalid or empty result array");
      return;
    }
  
    // Combine all parts of the result array into a single string with line breaks
    const ans = result.map((part, index) => `Result ${index + 1}:\n\n${part.text}`).join("\n\n");
  
    // Call downloadPDFUUID with the combined string and file name prefix
    downloadPDFUUID(ans, "promptfile");
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
      <Tooltip title="Choose .zip file to process">
          <TextField
            type="file"
            inputProps={{ accept: ".zip" }}
            onChange={handleFileUpload}
            variant="outlined"
            style={{ marginBottom: "20px" }}
          />
        </Tooltip>
        <Tooltip title="Remove file">
          <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => { setFileContent(""); setFileSize(""); setCompressedSize(""); setError(""); window.location.reload() }}>
            Remove File
          </Button>
        </Tooltip>
      

        <Tooltip title="Write a prompt">
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
        </Tooltip>
      </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Tooltip title="Start Analyzing">
            <Button
              variant="contained"
              color="primary"
              size="small"
              loading={isLoading}
              loadingPosition="start"
              startIcon={<i className="fa-solid fa-brain"></i>}
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
          </Tooltip>
          <Tooltip title="Clear prompt">
            <Button variant="text" color="success" sx={{marginRight: {xs : '5px',sm : '25px', md:'50px', lg :'150px', xl : '170px',}}} onClick={() => {setPrompt('')}}>
              Clear
            </Button>
          </Tooltip>
        </Box>

    <Box sx={{mt: 3}}>
      {error && (
        <Typography color="error" variant="body1" gutterBottom>
          {error}
        </Typography>
      )}

{fileContent && (
  <Paper elevation={3} sx={{ p: 3, mt: 3, backgroundColor: (theme) => theme.palette.background.default }}>
    <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
      Contents of the .txt File
    </Typography>

    <Divider sx={{ my: 2 }} />

    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" gutterBottom>
        <strong>Original Size:</strong> {fileSize}
      </Typography>
      <Typography variant="body2" gutterBottom>
        <strong>Compressed Size:</strong> {compressedSize}
      </Typography>
      {modelVersionF &&
        <Typography variant="body2" gutterBottom>
          <strong>Model Version:</strong> {modelVersionF}
        </Typography>
      }
      {numberOfChunks && 
        <Typography variant="body2" gutterBottom>
          <strong>Total number of Chunks:</strong> {numberOfChunks}
        </Typography>
      }
      {chunkSize &&
        <Typography variant="body2" gutterBottom sx={{visibility: 'hidden'}}>
          <strong>Chunk Characters:</strong> {chunkSize}
        </Typography>
      }
    </Box>
    
      {result.length !== 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Accordion sx={{ mt: 2, backgroundColor: "#001d50", color: "white" }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="results-content"
              id="results-header"
              sx={{
                backgroundColor: "#001d50",
                borderBottom: "1px solid #ddd",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", backgroundColor: "#001d50" }}
              >
                Results
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* Button to Expand/Collapse All */}
              <Box sx={{display: "flex", alignItems: "end", justifyContent: "end"}}>
                <Button>
                </Button>
                <Tooltip title="Download Results">
                    <Button variant="outlined"
                    onClick={() => arrayToString(result)}
                    sx={{ mb: 2, color: "white", fontWeight: "bold", mr: 1}}>
                      Download PDF <i className="fa-solid fa-file-pdf" style={{marginLeft: "5px"}}></i>
                    </Button>
                  </Tooltip>
              </Box>

              {/* Nested Accordions for Individual Results */}
              {Array.isArray(result) &&
                result.map((part, index) => (
                  <Accordion
                    key={index}
                    sx={{
                      mb: 2,
                      backgroundColor: "#001d50",
                      color: "white",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`result-${index}-content`}
                      id={`result-${index}-header`}
                      sx={{
                        backgroundColor: "#001d50",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold" }}
                      >
                        Result {index + 1}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: "#001d50",
                          borderRadius: 2,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          color: "white",
                        }}
                      >
                        <ReactMarkdown>{part.text}</ReactMarkdown>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
            </AccordionDetails>
          </Accordion>
        </>
      )}


    <Divider sx={{ my: 2 }} />

    <Accordion sx={{ mt: 2, backgroundColor: "#026f93", color: 'white' }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="raw-file-content"
        id="raw-file-content-header"
        sx={{
          backgroundColor: "#003243",
          borderBottom: "1px solid #ddd",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Raw File Content
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{display: "flex", alignItems: "end", justifyContent: "end"}}>
          <Button>
          </Button>
          <Tooltip title="Download Raw Content">
            <Button
              variant="outlined"
              onClick={() => downloadPDFUUID(fileContent, "rawfile")}  // Pass the callback
              sx={{ mb: 2, color: "white", fontWeight: "bold", mr: 1}}
            >
              Download PDF <i className="fa-solid fa-file-pdf" style={{marginLeft: "5px"}}></i>
            </Button>
          </Tooltip>
        </Box>
        <Box
          component="pre"
          sx={{
            p: 2,
            backgroundColor: "#014a62",
            borderRadius: 2,
            overflowX: "auto",
            fontSize: "0.9rem",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        >
          {fileContent || "No file content available"}
        </Box>
      </AccordionDetails>
    </Accordion>

  </Paper>
)}

    </Box>
    {error && (
      <Typography color="error" variant="body1">
          {error}
      </Typography>
    )}
  </Box>
  );
};


export default ZipFileLoader;
