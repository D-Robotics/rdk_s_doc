export function tokenize(query: string) {
  const result: string[] = [];

  const english =
    query.match(/[a-zA-Z0-9_-]+/g) || [];

  result.push(...english);

  const chinese =
    query.match(/[\u4e00-\u9fa5]/g) || [];

  result.push(...chinese);

  for (let i = 0; i < chinese.length - 1; i++) {
    result.push(
      chinese[i] +
      chinese[i + 1],
    );
  }

  return [...new Set(result)];
}