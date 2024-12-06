// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const genAI = new GoogleGenerativeAI("AIzaSyDEL_IgZpn7FdhAZ_Wr2INJm820Ijvxh_I");

// exports.sendToOpenAI = async (evaluationResult) => {
//   console.log(evaluationResult.result.affective);
//   //   const prompt = `
//   // The following are the results of a Bloom's taxonomy analysis:
//   // - Affective domain: ${evaluationResult.result.affective}
//   // - Cognitive domain: ${evaluationResult.result.cognitive}
//   // - Psychomotor domain: ${evaluationResult.result.psychomotor}
//   // - Target Affective:${evaluationResult.NormalizedAffective.toFixed(2)}
//   // - Target Cognitive:${evaluationResult.NormalizedAffective.toFixed(2)}
//   // - Target Psychomotor:${evaluationResult.NormalizedAffective.toFixed(2)}
//   // - Normalized Affective: ${evaluationResult.NormalizedAffective.toFixed(2)}
//   // - Normalized Cognitive: ${evaluationResult.NormalizedCognitive.toFixed(2)}
//   // - Normalized Psychomotor: ${evaluationResult.NormalizedPsychomotor.toFixed(2)}
//   // - Total Score: ${evaluationResult.totalScore.toFixed(2)}
//   // Please provide a detailed summary and recommendations based on these results.`;
//   //   const prompt = `
//   // ### Bloom's Taxonomy Analysis: Inputs and Outputs ###

//   // **Inputs:**
//   // - Affective domain levels: ${evaluationResult.result.affective}
//   // - Cognitive domain levels: ${evaluationResult.result.cognitive}
//   // - Psychomotor domain levels: ${evaluationResult.result.psychomotor}
//   // - Target weights:
//   //   - Affective: ${evaluationResult.NormalizedAffective.toFixed(2)}%
//   //   - Cognitive: ${evaluationResult.NormalizedCognitive.toFixed(2)}%
//   //   - Psychomotor: ${evaluationResult.NormalizedPsychomotor.toFixed(2)}%
//   // - Normalized values:
//   //   - Affective: ${evaluationResult.NormalizedAffective.toFixed(2)}%
//   //   - Cognitive: ${evaluationResult.NormalizedCognitive.toFixed(2)}%
//   //   - Psychomotor: ${evaluationResult.NormalizedPsychomotor.toFixed(2)}%
//   // - Total weighted score: ${evaluationResult.totalScore.toFixed(2)}

//   // **Output:**
//   // Based on the analysis, please provide:
//   // 1. A crisp, to-the-point summary of the results.
//   // 2. Targeted recommendations or observations for each domain (affective, cognitive, and psychomotor) to improve alignment with goals.
//   // 3. Highlight any significant deviations or key findings and suggest actionable steps for improvement.

//   // Ensure the response is concise, professional, and actionable.
//   // `;
//   const prompt = `
// ### Bloom's Taxonomy Analysis: Inputs and Outputs ###

// **Inputs:**
// - Affective domain levels: ${evaluationResult.result.affective}
// - Cognitive domain levels: ${evaluationResult.result.cognitive}
// - Psychomotor domain levels: ${evaluationResult.result.psychomotor}
// - Target weights:
//   - Affective: ${evaluationResult.NormalizedAffective.toFixed(2)}%
//   - Cognitive: ${evaluationResult.NormalizedCognitive.toFixed(2)}%
//   - Psychomotor: ${evaluationResult.NormalizedPsychomotor.toFixed(2)}%
// - Normalized values:
//   - Affective: ${evaluationResult.NormalizedAffective.toFixed(2)}%
//   - Cognitive: ${evaluationResult.NormalizedCognitive.toFixed(2)}%
//   - Psychomotor: ${evaluationResult.NormalizedPsychomotor.toFixed(2)}%
// - Total weighted score: ${evaluationResult.totalScore.toFixed(2)}

// **Task:**
// 1. Acknowledge the **inputs** provided in a structured manner.
// 2. Provide a **crisp, professional summary** of the analysis results (outputs).
// 3. Offer **targeted recommendations** or observations for each domain (affective, cognitive, psychomotor) with actionable steps for alignment and improvement.

// **Response Format:**
// 1. **Inputs**: Restate the inputs received to confirm understanding.
// 2. **Outputs**: Provide the results of the analysis in a professional and concise manner.
// 3. **Recommendations**: Offer actionable steps to improve alignment with the targets and address any significant findings.
// `;

//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     const result = await model.generateContent(prompt);
//     const responseText = result.response.text();
//     console.log(responseText);
//     return responseText;
//   } catch (error) {
//     console.error("Error with Gemini API:", error);
//   }
// };

const { GoogleGenerativeAI } = require("@google/generative-ai");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const genAI = new GoogleGenerativeAI("AIzaSyDEL_IgZpn7FdhAZ_Wr2INJm820Ijvxh_I");

exports.sendToOpenAI = async (evaluationResult) => {
  console.log(evaluationResult.result.affective);

  const prompt = `
### Bloom's Taxonomy Analysis: Inputs and Outputs ###

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
3. Offer **targeted recommendations** or observations for each domain (affective, cognitive, psychomotor) with actionable steps for alignment and improvement.

**Note:** 
- The output generated should be properly indented and formatted.
- Do not use asterisks (*) to denote bold content. Use plain text without formatting symbols for emphasis.

**Response Format:**
1. **Outputs**: Provide the results of the analysis in a professional and concise manner.
2. **Recommendations**: Offer actionable steps to improve alignment with the targets and address any significant findings.
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log("Generated Response:", responseText);

    const pdfPath = path.join(__dirname, "response.pdf");
    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream(pdfPath));

    doc.fontSize(14).text("Bloom's Taxonomy Analysis: Inputs and Outputs", {
      underline: true,
    });
    doc.moveDown();
    doc.fontSize(12).text("Inputs:");
    doc.text(`Affective domain levels: ${evaluationResult.result.affective}`);
    doc.text(`Cognitive domain levels: ${evaluationResult.result.cognitive}`);
    doc.text(
      `Psychomotor domain levels: ${evaluationResult.result.psychomotor}`
    );
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
