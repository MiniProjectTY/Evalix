const XLSX = require('xlsx');
const fs = require("fs");
const xlsx = require("xlsx");
const pdfParse = require("pdf-parse");
const path = require('path');

const outputFileName = "analysis_output.xlsx";
// Function to load domains from input.json
const loadDomains = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'input.json'), 'utf8');

    // console.log("json data is", data);
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
// Function to analyze text
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
    // Log extracted text
    // console.log("Extracted text:", text);
    const domains = loadDomains();
    // console.log("Loaded domains:", domains);
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
    let workbook = XLSX.utils.book_new();
    let worksheet = XLSX.utils.aoa_to_sheet([["Title", "Cognitive", "Affective", "Psychomotor", "Unclassified"]]);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Analysis");
    const sheetData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    // console.log("Sheet data before adding new row:", sheetData);
    const newRow = [filePath.split("/").pop(), counts.Cognitive, counts.Affective, counts.Psychomotor, counts.Unclassified];
    sheetData.push(newRow);
    const newWorksheet = xlsx.utils.aoa_to_sheet(sheetData);
    workbook.Sheets["Analysis"] = newWorksheet;
    xlsx.writeFile(workbook, outputFileName);
    console.log("Analysis complete. Results appended to analysis_output.xlsx");
  } catch (err) {
    console.error("Error processing file:", err);
  }
}

module.exports = {
  analyzeFile
}
// Call the function with your file
// analyzeFile("../Converted/1-s2.0-S266628172300197X-main.txt");  // Change to "./sample.txt" if needed
