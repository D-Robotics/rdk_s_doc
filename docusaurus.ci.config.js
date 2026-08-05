import mainConfig from './docusaurus.config.js';

export default {
  ...mainConfig,
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  onBrokenMarkdownLinks: 'throw',
};