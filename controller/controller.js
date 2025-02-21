const path = require("path");
const fileConverter = require("../FileToText/Converter");
const { evaluate } = require("../Evaluate/evaluate");
const fs = require("fs");

exports.handler = async (req, res) => {
  if (!req.file) {
    res.status(500).send("Error while uploading file");
    return;
  }

  const inputFilePath = req.file.path;
  const inputFileName = req.file.originalname;
  const outputDir = path.join(__dirname, "../Converted");

  // Ensure the output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Generate output filename with same name as uploaded file, but with .txt extension
    const outputFileName = path.parse(inputFileName).name + ".txt";
    const outputFilePath = path.join(outputDir, outputFileName);

    // Convert PDF to text and save with the same filename
    await fileConverter.convertPDFToText(inputFilePath, outputFilePath);

    // Process the converted file
    // let result = await evaluate(outputFilePath);

    // Send the processed file as a download
    // res.download(result);
    res.json({ msg: "hi" });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send("Error processing file");
  }
};
