export function highlightPage(
  keyword: string,
) {
  if (!keyword) return;

  const walker =
    document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );

  while (walker.nextNode()) {
    const node =
      walker.currentNode;

    const text =
      node.textContent || "";

    if (
      text.includes(keyword)
    ) {
      const span =
        document.createElement(
          "span",
        );

      span.innerHTML =
        text.replace(
          new RegExp(
            keyword,
            "g",
          ),
          `<mark>${keyword}</mark>`,
        );

      node.parentNode?.replaceChild(
        span,
        node,
      );
    }
  }
}