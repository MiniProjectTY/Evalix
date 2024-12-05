const path = require("path");
const fileConverter = require("../FileToText/Converter");
const { evaluate } = require("../Evaluate/evaluate");
const fs = require("fs");

exports.handler = async (req, res) => {
  if (!req.file) {
    res.status(500).send("Error while uploading file");
    return;
  }
  const inputFileName = req.file.originalname;
  const timestamp = Date.now();
  const outputFileName = `${path.basename(
    inputFileName,
    path.extname(inputFileName)
  )}_${timestamp}.txt`;
  const outputDir = path.join(__dirname, "../Converted");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputFilePath = path.join(__dirname, "../Converted", outputFileName);

  try {
    await fileConverter.convertPDFToText(req.file.path, outputFilePath);
    evaluate(outputFilePath);

    let result = evaluate(outputFilePath);
    console.log(result);

    // // delete files after the task is done
    // // Delete the uploaded file and the converted output file
    // fs.unlink(req.file.path, (err) => {
    //     if (err) console.error(`Error deleting uploaded file: ${err.message}`);
    //     else console.log("Uploaded file deleted successfully.");
    // });

    // fs.unlink(outputFilePath, (err) => {
    //     if (err) console.error(`Error deleting output file: ${err.message}`);
    //     else console.log("Output file deleted successfully.");
    // });

    res.send("success");
  } catch (error) {
    console.error("Error converting file or saving to DB:", error);
    res.status(500).send("Error converting file or saving to DB");
  }
};
