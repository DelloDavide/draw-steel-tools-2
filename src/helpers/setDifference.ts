/** Strings in A that are not in B */
export function setDifference(A: string[], B: string[]) {
  return A.filter((x) => B.indexOf(x) === -1);
}
