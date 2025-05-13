const fs = require("fs");
const verbs = require("./input.json");
const { sendToOpenAI } = require("./sendToOpenAI");

// Exports a function `evaluate` that takes a file path, reads its content,
// and evaluates the content based on predefined verbs and their associated
// Bloom's taxonomy levels and domains.
exports.evaluate = async (filepath) => {
  // Initialize the result object to store counts for each domain and level of Bloom's taxonomy.
  let result = {
    affective: [0, 0, 0, 0, 0, 0], // Counts for 6 levels in the affective domain.
    cognitive: [0, 0, 0, 0, 0, 0], // Counts for 6 levels in the cognitive domain.
    psychomotor: [0, 0, 0, 0, 0, 0], // Counts for 6 levels in the psychomotor domain.
  };
  let fileText;
  try {
    // Read the file at the provided `filepath` in UTF-8 encoding.
    fileText = fs.readFileSync(filepath, "utf8");
  } catch (err) {
    console.error("Error reading file:", err);
    return;
  }
  // Remove common punctuation (.,!?) from the file content and split it into an array of words.
  const wordsArray = fileText.replace(/[.,!?]/g, "").split(/\s+/);
  // Iterate over each word in the words array.
  for (let word of wordsArray) {
    if (word === "") continue;
    // Find the first occurrence of the word in the `verbs` array.
    // `verbs` is assumed to be a predefined list containing verbs with their domains and levels.
    let verbIndex = verbs.findIndex((verb) => verb.verb === word);
    // If the word is not found in the `verbs` list, skip to the next word.
    if (verbIndex == -1) continue;
    // Process all matching entries for the current word in the `verbs` list.
    while (verbIndex < verbs.length && verbs[verbIndex].verb === word) {
      // Extract the domain (e.g., affective, cognitive, psychomotor)
      // and the Bloom's taxonomy level associated with the verb.
      const domain = verbs[verbIndex].domain;
      const level = verbs[verbIndex]["level_of_bloom's_taxonomy"];
      // Ensure the level is valid (should be between 1 and 6).
      if (level >= 1 && level <= 6) {
        // Increment the count for the corresponding domain and level.
        result[domain][level - 1]++;
      }
      // Move to the next verb in the `verbs` list.
      verbIndex++;
      // If `verbIndex` exceeds the bounds of the `verbs` list, stop further iteration.
      if (verbIndex >= verbs.length) {
        break;
      }
    }
  }

  const calculateWeightedSum = (domainArray) => {
    return domainArray.reduce((sum, value, index) => {
      return sum + value * (index + 1);
    }, 0);
  };

  const affectiveWeightedSum = calculateWeightedSum(result.affective);
  const cognitiveWeightedSum = calculateWeightedSum(result.cognitive);
  const psychomotorWeightedSum = calculateWeightedSum(result.psychomotor);

  // Apply weights (50%, 30%, 20%) for each domain
  const targetAffectiveWeight = 15;
  const targetCognitiveWeight = 57;
  const targetPsychomotorWeight = 28;

  const NormalizedAffective =
    (affectiveWeightedSum * 100) /
    (affectiveWeightedSum + cognitiveWeightedSum + psychomotorWeightedSum);
  const NormalizedCognitive =
    (cognitiveWeightedSum * 100) /
    (affectiveWeightedSum + cognitiveWeightedSum + psychomotorWeightedSum);
  const NormalizedPsychomotor =
    (psychomotorWeightedSum * 100) /
    (affectiveWeightedSum + cognitiveWeightedSum + psychomotorWeightedSum);

  function addRewardPenalty(targetWeight, NormalizedWeight) {
    let deviationFactor = 0;
    //penalty
    if (targetWeight > NormalizedWeight) {
      const difference = targetWeight - NormalizedWeight;
      if (difference < 10) {
        if (difference < 5) {
          deviationFactor = 0.5;
        } else {
          deviationFactor = 1;
        }
      } else {
        deviationFactor = 2;
      }
      return NormalizedWeight - difference * deviationFactor;
    }
    //reward
    else {
      const difference = NormalizedWeight - targetWeight;
      if (difference < 10) {
        if (difference < 5) {
          deviationFactor = 1.5;
        } else {
          deviationFactor = 1.1;
        }
      } else {
        deviationFactor = 0.8;
      }
      return NormalizedWeight + difference * deviationFactor;
    }
  }

  const totalScore =
    addRewardPenalty(targetAffectiveWeight, NormalizedAffective) +
    addRewardPenalty(targetCognitiveWeight, NormalizedCognitive) +
    addRewardPenalty(targetPsychomotorWeight, NormalizedPsychomotor);

  // Log or return the result
  console.log({
    result,
    targetAffectiveWeight,
    targetCognitiveWeight,
    targetPsychomotorWeight,
    NormalizedAffective,
    NormalizedCognitive,
    NormalizedPsychomotor,
    totalScore,
  });
  const response = await sendToOpenAI(
    {
      result,
      targetAffectiveWeight,
      targetCognitiveWeight,
      targetPsychomotorWeight,
      NormalizedAffective,
      NormalizedCognitive,
      NormalizedPsychomotor,
      totalScore,
    },
    filepath
  );
  return response;
};
