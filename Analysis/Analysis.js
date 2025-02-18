const XLSX = require('xlsx');
const fs = require("fs");
const xlsx = require("xlsx");

const outputFileName = "analysis_output.xlsx";

// Function to load domains from input.json
const loadDomains = () => {
  try {
    const data = fs.readFileSync("input.json", "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading input.json:", err);
    return {};
  }
};

// Function to analyze the text file
async function analyzeTextFile(txtPath) {
  try {
    const data = fs.readFileSync(txtPath, "utf8");

    const text = data.toLowerCase();
    // Log extracted text to make sure it is not empty or malformed
    console.log("Extracted text from TXT file:", text);

    const domains = loadDomains();
    // Log domains to check if they are loaded correctly
    console.log("Loaded domains:", domains);

    // Initialize counts
    let counts = { Cognitive: 0, Affective: 0, Psychomotor: 0, Unclassified: 0 };

    // Count occurrences of each verb
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
    let workbook = XLSX.utils.book_new(); // Ensure a new workbook is created
    let worksheet = XLSX.utils.aoa_to_sheet([["Title", "Cognitive", "Affective", "Psychomotor", "Unclassified"]]);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Analysis");

    // Ensure the worksheet exists
    if (!worksheet) {
      console.error("Analysis sheet not found in workbook.");
      return;
    }

    // Convert sheet to JSON to inspect current data
    const sheetData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    console.log("Sheet data before adding new row:", sheetData);

    // Append the new row
    const newRow = [txtPath.split("/").pop(), counts.Cognitive, counts.Affective, counts.Psychomotor, counts.Unclassified];
    sheetData.push(newRow);

    // Log new sheet data after adding the row
    console.log("Sheet data after adding new row:", sheetData);
    // Convert the sheet data back to a worksheet
    const newWorksheet = xlsx.utils.aoa_to_sheet(sheetData);
    workbook.Sheets["Analysis"] = newWorksheet;
    // Write the updated workbook to file
    xlsx.writeFile(workbook, outputFileName);
    console.log("Analysis complete. Results appended to analysis_output.xlsx");
  } catch (err) {
    console.error("Error processing TXT file:", err);
  }
}

// Call the analyzeTextFile function with the given TXT path
analyzeTextFile("./sample.txt");
