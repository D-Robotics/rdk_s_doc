let cache = new Map<string, any>();

export function clearSearchCache() {
  cache = new Map();
}

export async function search(
  pagefindApi: any,
  query: string,
  scopeKey: string = "",
) {
  if (!query || !pagefindApi) return [];

  // 缓存 key 必须带上当前 Pagefind bundle 的 scope，否则切换产品/版本后
  // 输入相同关键词会命中旧 scope 缓存，导致显示其他产品的内容。
  const cacheKey = `${scopeKey}::${query}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const result: any = await pagefindApi.search(query);

  const finalResults = await Promise.all(
    result.results.map(async (r: any) => {
      const data: any = await r.data();
      return {
        url: data.url,
        title: data.meta.title,
        excerpt: data.excerpt,
        content: data.content || "",
      };
    }),
  );

  cache.set(cacheKey, finalResults);
  return finalResults;
}
