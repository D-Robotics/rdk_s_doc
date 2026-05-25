/**
 * Doc scope ID normalization shared by config generation and runtime filtering.
 * Supports lookup by file path (e.g. 02_Python_API -> python_api) and front matter id (e.g. python-api).
 */

/** @param {string|null|undefined} pathOrDocId */
export function normalizeDocIdFromPath(pathOrDocId) {
  if (!pathOrDocId) {
    return '';
  }
  return pathOrDocId
    .toLowerCase()
    .split('/')
    .map((part) => part.replace(/^\d+_/, ''))
    .join('/');
}

/** @param {string|null|undefined} id */
export function normalizeFrontMatterDocId(id) {
  if (id == null || typeof id !== 'string') {
    return '';
  }
  return id.trim().toLowerCase();
}

/**
 * Collect config lookup keys for a document (path-based + optional front matter id).
 * @param {string} relativePathWithoutExt e.g. "02_Python_API"
 * @param {string|null|undefined} frontMatterId e.g. "python-api"
 * @returns {string[]}
 */
export function collectDocScopeKeys(relativePathWithoutExt, frontMatterId) {
  const keys = new Set();
  const pathKey = normalizeDocIdFromPath(relativePathWithoutExt);
  if (pathKey) {
    keys.add(pathKey);
  }
  const idKey = normalizeFrontMatterDocId(frontMatterId);
  if (idKey) {
    keys.add(idKey);
  }
  return [...keys];
}

/**
 * Build candidate lookup keys for a runtime docId (path key, front matter id, hyphen/underscore variants).
 * @param {string} docId
 * @returns {string[]}
 */
export function collectDocScopeLookupCandidates(docId) {
  const keys = new Set();
  const pathKey = normalizeDocIdFromPath(docId);
  const idKey = normalizeFrontMatterDocId(docId);
  if (pathKey) {
    keys.add(pathKey);
  }
  if (idKey) {
    keys.add(idKey);
  }
  for (const key of [...keys]) {
    if (key.includes('-')) {
      keys.add(key.replace(/-/g, '_'));
    }
    if (key.includes('_')) {
      keys.add(key.replace(/_/g, '-'));
    }
  }
  return [...keys];
}

/**
 * Resolve document-level scope config for a runtime docId.
 * @param {string} docId
 * @param {Record<string, object>} config
 * @returns {object|null}
 */
export function lookupDocScopeConfig(docId, config) {
  if (!docId || !config) {
    return null;
  }
  for (const key of collectDocScopeLookupCandidates(docId)) {
    const scope = config[key];
    if (scope && !scope.isCategory) {
      return scope;
    }
  }
  return null;
}
