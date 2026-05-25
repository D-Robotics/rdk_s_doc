/**
 * 文档范围：版本比较与匹配（与 scripts/generate-sidebar-config.js 语义一致）
 *
 * 支持：精确版本、>、>=、<、<=（见 README 中 sidebar_versions 说明）
 */

/**
 * @param {string} v1
 * @param {string} v2
 * @returns {number} -1: v1 < v2, 0: v1 == v2, 1: v1 > v2
 */
export function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  const maxLength = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < maxLength; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }
  return 0;
}

/**
 * @param {string} versionStr
 * @returns {{ operator: string, version: string } | null}
 */
export function parseVersionExpression(versionStr) {
  if (!versionStr || typeof versionStr !== 'string') {
    return null;
  }
  let trimmed = versionStr.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  const m = trimmed.match(/^(>=|<=|>|<)?\s*(\d+(?:\.\d+)*)$/);
  if (!m) {
    return null;
  }
  return { operator: m[1] || '', version: m[2] };
}

/**
 * Front Matter / 配置中的 versions 字段：逗号分隔或数组，解析为可与 matchVersion 配合的项
 * （每项为 { operator, version } 或不可解析时退化为精确匹配字面量）
 * @param {string|string[]|null|undefined} value
 * @returns {Array<string|{operator: string, version: string}>}
 */
export function parseVersionScopeList(value) {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value
      .map((v) => String(v).trim())
      .filter((s) => s !== '' && s !== '*')
      .map((v) => {
        const parsed = parseVersionExpression(v);
        return parsed || { operator: '', version: v };
      });
  }
  const s = String(value).trim();
  if (s === '' || s === '*') return [];
  return s
    .split(/[,，]/)
    .map((x) => x.trim())
    .filter(Boolean)
    .map((v) => {
      const parsed = parseVersionExpression(v);
      return parsed || { operator: '', version: v };
    });
}

function versionMatchesOperator(currentVersion, operator, version) {
  const cmp = compareVersions(currentVersion, version);
  switch (operator) {
    case '>':
      return cmp > 0;
    case '>=':
      return cmp >= 0;
    case '<':
      return cmp < 0;
    case '<=':
      return cmp <= 0;
    case '':
    default:
      return cmp === 0;
  }
}

/**
 * 任一版本规则命中则匹配（OR）
 * @param {string} currentVersion
 * @param {Array<string|{operator?: string, version: string}>|null|undefined} versionConfigs
 */
export function matchVersion(currentVersion, versionConfigs) {
  if (!versionConfigs || versionConfigs.length === 0) {
    return true;
  }
  for (const config of versionConfigs) {
    if (typeof config === 'string') {
      if (config === currentVersion) return true;
      const parsed = parseVersionExpression(config);
      if (parsed && parsed.version) {
        if (versionMatchesOperator(currentVersion, parsed.operator, parsed.version)) {
          return true;
        }
      }
      continue;
    }
    if (typeof config === 'object' && config != null && config.version) {
      const op = config.operator != null ? config.operator : '';
      if (versionMatchesOperator(currentVersion, op, config.version)) {
        return true;
      }
    }
  }
  return false;
}
