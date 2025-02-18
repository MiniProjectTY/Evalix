const { GoogleGenerativeAI } = require("@google/generative-ai");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const genAI = new GoogleGenerativeAI("AIzaSyDEL_IgZpn7FdhAZ_Wr2INJm820Ijvxh_I");

exports.sendToOpenAI = async (evaluationResult) => {
  console.log(evaluationResult.result.affective);

  const prompt = `
### Learning Domain's Analysis: Inputs and Outputs ###

**Inputs:**
- Affective domain levels: ${evaluationResult.result.affective}
- Cognitive domain levels: ${evaluationResult.result.cognitive}
- Psychomotor domain levels: ${evaluationResult.result.psychomotor}
- Target weights:
  - Affective: ${evaluationResult.targetAffectiveWeight.toFixed(2)}%
  - Cognitive: ${evaluationResult.targetCognitiveWeight.toFixed(2)}%
  - Psychomotor: ${evaluationResult.targetPsychomotorWeight.toFixed(2)}%
- Normalized values:
  - Affective: ${evaluationResult.NormalizedAffective.toFixed(2)}%
  - Cognitive: ${evaluationResult.NormalizedCognitive.toFixed(2)}%
  - Psychomotor: ${evaluationResult.NormalizedPsychomotor.toFixed(2)}%
- Total weighted score: ${evaluationResult.totalScore.toFixed(2)}

**Task:**
1. Acknowledge the **inputs** provided in a structured manner.
2. Provide a **crisp, professional summary** of the analysis results (outputs).
3. Offer **targeted recommendations** or observations for each domain (affective, cognitive, psychomotor) with actionable steps for alignment and improvement relative to the field of research.

**Note:** 
- The output generated should be properly indented and formatted.
- Do not use asterisks (*) to denote bold content. Use plain text without formatting symbols for emphasis.

**Response Format:**
1. **Outputs**: Provide the results of the analysis in a professional and concise manner.
2. **Recommendations**: Offer actionable steps to improve alignment with the targets and address any significant findings relative to the field of research.
`;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log("Generated Response:", responseText);

    const pdfPath = path.join(__dirname, "response.pdf");
    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream(pdfPath));

    doc.fontSize(14).text("Detailed Analysis of Learning Domains", {
      underline: true,
    });
    doc.moveDown();
    doc.text(`Target weights:`);
    doc.text(
      `  - Affective: ${evaluationResult.targetAffectiveWeight.toFixed(2)}%`
    );
    doc.text(
      `  - Cognitive: ${evaluationResult.targetCognitiveWeight.toFixed(2)}%`
    );
    doc.text(
      `  - Psychomotor: ${evaluationResult.targetPsychomotorWeight.toFixed(2)}%`
    );
    doc.text(`Normalized values:`);
    doc.text(
      `  - Affective: ${evaluationResult.NormalizedAffective.toFixed(2)}%`
    );
    doc.text(
      `  - Cognitive: ${evaluationResult.NormalizedCognitive.toFixed(2)}%`
    );
    doc.text(
      `  - Psychomotor: ${evaluationResult.NormalizedPsychomotor.toFixed(2)}%`
    );
    doc.text(`Total weighted score: ${evaluationResult.totalScore.toFixed(2)}`);
    doc.moveDown();
    doc.text("Outputs:");
    doc.text(responseText);

    doc.end();

    console.log("PDF generated at:", pdfPath);
    return pdfPath;
  } catch (error) {
    console.error("Error with Gemini API or PDF generation:", error);
    throw error;
  }
};
