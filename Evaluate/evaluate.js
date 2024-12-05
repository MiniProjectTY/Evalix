const fs = require('fs');
const verbs = require('./input.json');

exports.evaluate = (filepath) => {
    let result = {
        "affective": [0, 0, 0, 0, 0, 0],
        "cognitive": [0, 0, 0, 0, 0, 0],
        "psychomotor": [0, 0, 0, 0, 0, 0],
    };

    let fileText;
    try {
        fileText = fs.readFileSync(filepath, 'utf8');
    } catch (err) {
        console.error('Error reading file:', err);
        return;
    }

    const wordsArray = fileText.replace(/[.,!?]/g, '').split(/\s+/);

    for (let word of wordsArray) {
        if (word === "") continue;

        let verbIndex = verbs.findIndex(verb => verb.verb === word);

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
        const n = domainArray.length;
        return domainArray.reduce((sum, value, index) => {
            return sum + value * (index+1);
        }, 0);
    };


    const affectiveWeightedSum = calculateWeightedSum(result.affective);
    const cognitiveWeightedSum = calculateWeightedSum(result.cognitive);
    const psychomotorWeightedSum = calculateWeightedSum(result.psychomotor);

    const affectiveSum=result.affective.reduce((sum,value)=>{
        return sum+value;
    },0);

    const cognitiveSum=result.cognitive.reduce((sum,value)=>{
        return sum+value;
    },0);

    const psychomotorSum=result.psychomotor.reduce((sum,value)=>{
        return sum+value;
    },0);



    // Apply weights (50%, 30%, 20%) for each domain
    const affectiveWeight = 50;
    const cognitiveWeight = 30;
    const psychoWeight = 20;



    const weightedAffective = ((affectiveWeightedSum) / (affectiveSum*6)) * affectiveWeight;
    const weightedCognitive = ((cognitiveWeightedSum) / (cognitiveSum*6)) * cognitiveWeight;
    const weightedPsychomotor = ((psychomotorWeightedSum) / (psychomotorSum*6)) * psychoWeight;

    // Calculate total weighted score
    const totalScore = weightedAffective + weightedCognitive + weightedPsychomotor;

    // Log or return the result
    console.log({
        result,
        affectiveSum,
        cognitiveSum,
        psychomotorSum,
        weightedAffective,
        weightedCognitive,
        weightedPsychomotor,
        totalScore
    });

    return {
        result,
        affectiveSum,
        cognitiveSum,
        psychomotorSum,
        weightedAffective,
        weightedCognitive,
        weightedPsychomotor,
        totalScore
    };
};