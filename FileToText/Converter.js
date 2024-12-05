const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");

async function convertPDFToText(inputFilePath, outputTextFilePath) {
  const dataBuffer = fs.readFileSync(inputFilePath);
  const data = await pdf(dataBuffer);
  const text = data.text;
  await fs.promises.writeFile(outputTextFilePath, text);
  return text;
}

module.exports = {
  convertPDFToText,
};
