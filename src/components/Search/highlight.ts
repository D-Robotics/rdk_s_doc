export function highlight(
  text,
  keyword,
) {
  if (!keyword) return text;

  return text.replace(
    new RegExp(`(${keyword})`, "gi"),
    "<mark>$1</mark>",
  );
}