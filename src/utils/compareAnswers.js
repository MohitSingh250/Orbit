function compareAnswers(problem, submissionAnswer) {
  if (!problem) return { correct: false, score: 0 };

  if (problem.inputType === 'mcq_single') {
    const correct = String(submissionAnswer).trim() === String(problem.correctAnswer).trim();
    return { correct, score: correct ? problem.points : 0 };
  }

  if (problem.inputType === 'numeric') {
    const submitted = Number(submissionAnswer);
    const correct = Number(problem.correctAnswer);
    if (Number.isNaN(submitted) || Number.isNaN(correct)) {
      return { correct: false, score: 0 };
    }
    const diff = Math.abs(submitted - correct);
    const correctFlag = diff <= (problem.numericTolerance || 1e-3);
    return { correct: correctFlag, score: correctFlag ? problem.points : 0 };
  }


  return { correct: false, score: 0, manual: true };
}

module.exports = compareAnswers;
