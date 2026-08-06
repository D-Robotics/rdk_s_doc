import mainConfig from './docusaurus.config.js';

export default {
  ...mainConfig,
  onBrokenLinks: 'throw',
  // onBrokenAnchors: 'throw',  // 锚点数量多，暂不开启，后续逐步清理
  onBrokenMarkdownLinks: 'throw',
};