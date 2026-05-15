export function getProjectMilestones(completion: number) {
  if (completion <= 30) return [];

  if (completion <= 200) {
    return [Math.floor(completion / 2)];
  }

  if (completion <= 999) {
    return [
      Math.floor(completion / 3),
      Math.floor((completion * 2) / 3),
    ];
  }

  return [
    Math.floor(completion / 4),
    Math.floor(completion / 2),
    Math.floor((completion * 3) / 4),
  ];
}