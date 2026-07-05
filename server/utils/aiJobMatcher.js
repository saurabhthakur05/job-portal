export const calculateJobMatch = (user, job) => {
  const userSkills =
    user.profile?.skills?.map((skill) => skill.toLowerCase()) || [];

  const jobSkills =
    job.skills?.map((skill) => skill.toLowerCase()) || [];

  const matchedSkills = jobSkills.filter((skill) =>
    userSkills.includes(skill)
  );

  const missingSkills = jobSkills.filter(
    (skill) => !userSkills.includes(skill)
  );

  let matchPercentage = 0;

  if (jobSkills.length > 0) {
    matchPercentage = Math.round(
      (matchedSkills.length / jobSkills.length) * 100
    );
  }

  // AI Explanation
  let matchReason = "";

  if (matchPercentage >= 80) {
    matchReason = `Excellent match! Your skills in ${matchedSkills.join(
      ", "
    )} closely align with this job.`;
  } else if (matchPercentage >= 60) {
    matchReason = `Good match! You already have ${matchedSkills.join(
      ", "
    )}. Learning ${missingSkills.join(", ")} will make you even stronger.`;
  } else if (matchPercentage > 0) {
    matchReason = `Partial match. You have ${matchedSkills.join(
      ", "
    )}, but this role also requires ${missingSkills.join(", ")}.`;
  } else {
    matchReason =
      "Your profile currently doesn't match this job. Consider adding more relevant skills.";
  }

  return {
    matchPercentage,
    matchedSkills,
    missingSkills,
    matchReason,
  };
};