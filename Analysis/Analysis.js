const XLSX = require('xlsx');
const fs = require("fs");
const pdfParse = require("pdf-parse");
const path = require('path');

const outputFileName = "analysis_output.xlsx";

// Function to load domains from input.json
const loadDomains = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'input.json'), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading input.json:", err);
    return {};
  }
};

// Function to extract text from PDF
async function extractTextFromPDF(pdfPath) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    return data.text.toLowerCase();
  } catch (err) {
    console.error("Error extracting text from PDF:", err);
    return "";
  }
}

// Function to analyze text and append to Excel file
async function analyzeFile(filePath) {
  try {
    let text = "";
    if (filePath.endsWith(".pdf")) {
      text = await extractTextFromPDF(filePath);
    } else if (filePath.endsWith(".txt")) {
      text = fs.readFileSync(filePath, "utf8").toLowerCase();
    } else {
      console.error("Unsupported file type. Only TXT and PDF are allowed.");
      return;
    }

    const domains = loadDomains();
    let counts = { Cognitive: 0, Affective: 0, Psychomotor: 0, Unclassified: 0 };
    const words = text.split(/\s+/);
    words.forEach(word => {
      let classified = false;
      for (const domain in domains) {
        if (domains[domain].includes(word)) {
          counts[domain]++;
          classified = true;
          break;
        }
      }
      if (!classified) counts.Unclassified++;
    });

    // Check if the Excel file exists
    let workbook;
    let worksheet;
    if (fs.existsSync(outputFileName)) {
      // Read existing workbook
      workbook = XLSX.readFile(outputFileName);
      worksheet = workbook.Sheets["Analysis"];
    } else {
      // Create a new workbook if file does not exist
      workbook = XLSX.utils.book_new();
      worksheet = XLSX.utils.aoa_to_sheet([["Title", "Cognitive", "Affective", "Psychomotor", "Unclassified"]]);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Analysis");
    }

    // Convert worksheet to JSON (array of rows)
    const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Append new row
    const newRow = [path.basename(filePath), counts.Cognitive, counts.Affective, counts.Psychomotor, counts.Unclassified];
    sheetData.push(newRow);

    // Convert back to worksheet and update workbook
    const newWorksheet = XLSX.utils.aoa_to_sheet(sheetData);
    workbook.Sheets["Analysis"] = newWorksheet;

    // Write back to file
    XLSX.writeFile(workbook, outputFileName);
    console.log("Analysis complete. Results appended to analysis_output.xlsx");
  } catch (err) {
    console.error("Error processing file:", err);
  }
}

module.exports = {
  analyzeFile
};
