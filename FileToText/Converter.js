const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const pdf = require('pdf-parse');
const { analyzeFile } = require('../Analysis/Analysis');  // Assuming the analysis logic is in a separate file 'analysis.js'

// Path to the converted folder
const convertedFolder = path.join(__dirname, "../Converted");

// Path to the output analysis file
const outputFileName = "analysis_output.xlsx";

// Load the list of already processed files
let processedFiles = [];
try {
  const data = fs.readFileSync('processed_files.json', 'utf8');
  processedFiles = JSON.parse(data);
} catch (err) {
  console.log("No previous processed files found, starting fresh.");
}

// Function to convert PDF to Text
async function convertPDFToText(inputFilePath, outputTextFilePath) {
  try {
    const dataBuffer = fs.readFileSync(inputFilePath);
    const data = await pdf(dataBuffer);
    const text = data.text;
    await fs.promises.writeFile(outputTextFilePath, text);
    console.log(`Converted PDF to text: ${outputTextFilePath}`);
    return text;
  } catch (err) {
    console.error("Error converting PDF to text:", err);
    return '';
  }
}

// Function to process new PDF files
const processNewPDFFile = async (filePath) => {
  const fileName = path.basename(filePath);
  if (!processedFiles.includes(fileName)) {
    const txtFilePath = filePath.replace(/\.pdf$/, '.txt'); // Convert PDF file to .txt file

    // Convert PDF to Text
    try {
      const text = await convertPDFToText(filePath, txtFilePath);

      // Once the TXT file is created, trigger the external analysis logic
      await analyzeFile(txtFilePath);  // This calls the separate analysis code

      // Mark this PDF as processed
      processedFiles.push(fileName);

      // Save the updated list of processed files
      fs.writeFileSync('processed_files.json', JSON.stringify(processedFiles, null, 2));
      console.log(`File processed: ${fileName}`);
    } catch (err) {
      console.error(`Error processing PDF ${fileName}:`, err);
    }
  }
};

// Watch the Converted folder for newly added files
const watcher = chokidar.watch(convertedFolder, {
  persistent: true,
  ignoreInitial: true,  // Ignore files already present on initial watch
  awaitWriteFinish: true, // Wait for file write completion before processing
});

// Event listeners for file events in the folder
watcher.on('add', (filePath) => {
  if (filePath.endsWith('.pdf')) {
    processNewPDFFile(filePath);
  } else if (filePath.endsWith('.txt')) {
    // Directly trigger analysis for new TXT files
    analyzeFile(filePath);  // Call the analysis function here as well
  }
});

console.log("Watching for new files in the Converted folder...");

module.exports = {
  convertPDFToText
}