const fs = require("fs");
const verbs = require("./input.json");

exports.evaluate = (filepath) => {
  let result = {
    affective: [0, 0, 0, 0, 0, 0],
    cognitive: [0, 0, 0, 0, 0, 0],
    psychomotor: [0, 0, 0, 0, 0, 0],
  };

  let fileText;
  try {
    fileText = fs.readFileSync(filepath, "utf8");
  } catch (err) {
    console.error("Error reading file:", err);
    return;
  }

  const wordsArray = fileText.replace(/[.,!?]/g, "").split(/\s+/);

  for (let word of wordsArray) {
    if (word === "") continue;

    let verbIndex = verbs.findIndex((verb) => verb.verb === word);

    if (verbIndex == -1) continue;

    // Find the first index of the verb
    while (verbIndex < verbs.length && verbs[verbIndex].verb === word) {
      // Increment the count at the corresponding Bloom's level and domain
      const domain = verbs[verbIndex].domain;
      const level = verbs[verbIndex]["level_of_bloom's_taxonomy"];

      // Ensure that the level is within bounds (1 to 6)
      if (level >= 1 && level <= 6) {
        result[domain][level - 1]++;
      }

      // Move to the next verb in the array
      verbIndex++;

      // If verbIndex goes out of bounds, break out of the loop
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
  const targetAffectiveWeight = 50;
  const targetCognitiveWeight = 30;
  const targetPsychomotoWeight = 20;

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
    addRewardPenalty(targetPsychomotoWeight, NormalizedPsychomotor);

  // Log or return the result
  console.log({
    result,
    NormalizedAffective,
    NormalizedCognitive,
    NormalizedPsychomotor,
    totalScore,
  });

  return {
    result,
    NormalizedAffective,
    NormalizedCognitive,
    NormalizedPsychomotor,
    totalScore,
  };
};
