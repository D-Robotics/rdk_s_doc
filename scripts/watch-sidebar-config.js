/**
 * Watch file changes and regenerate sidebar scope config automatically.
 * Intended for development: updates config when _sidebar_scope.json or Markdown front matter changes.
 * Watch targets: docs/ and i18n/en/docusaurus-plugin-content-docs/current/ (if present).
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const {
  getGeneratedSidebarConfigPath,
} = require('./lib/sidebar-scope-config-generator');

const docsDir = path.join(__dirname, '../docs');
const i18nEnDocsCurrentDir = path.join(
  __dirname,
  '../i18n/en/docusaurus-plugin-content-docs/current',
);
const configFilePath = getGeneratedSidebarConfigPath(path.join(__dirname, '..'));

let isGenerating = false;
let lastGenerateTime = 0;

/**
 * Regenerate config file
 */
function regenerateConfig() {
  // Debounce: skip if called within 1 second
  const now = Date.now();
  if (now - lastGenerateTime < 1000) {
    return;
  }
  
  // Skip if already generating
  if (isGenerating) {
    return;
  }
  
  isGenerating = true;
  lastGenerateTime = now;
  
  console.log('\nFile change detected. Regenerating sidebar scope config...\n');
  
  // 禁用 shell：项目路径含空格时（如 rdk x5），shell: true 会把路径截断，导致 MODULE_NOT_FOUND
  const scriptPath = path.join(__dirname, 'generate-sidebar-config.js');
  const generate = spawn(process.execPath, [scriptPath], {
    stdio: 'inherit',
    shell: false,
    cwd: path.join(__dirname, '..'),
  });
  
  generate.on('close', (code) => {
    isGenerating = false;
    if (code === 0) {
      console.log('\nSidebar scope config updated.\n');
    } else {
      console.log('\nFailed to generate sidebar scope config.\n');
    }
  });
}

/**
 * Watch directory changes
 */
function watchDirectory(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  
  fs.watch(dir, { recursive: true }, (eventType, filename) => {
    if (!filename) {
      return;
    }
    
    // Only watch relevant files
    if (filename.endsWith('_sidebar_scope.json') || 
        (filename.endsWith('.md') && !filename.includes('node_modules'))) {
      console.log(`Changed file: ${filename}`);
      regenerateConfig();
    }
  });
  
  console.log(`Watching directory: ${dir}`);
}

/**
 * Main entry
 */
function main() {
  console.log('Starting sidebar scope config watcher...\n');
  
  // Watch docs directory
  watchDirectory(docsDir);

  // Watch English i18n current docs directory
  if (fs.existsSync(i18nEnDocsCurrentDir)) {
    watchDirectory(i18nEnDocsCurrentDir);
  }
  
  console.log(
    '\nWatcher is running. Changes to _sidebar_scope.json or Markdown front matter (including i18n/en/.../current) will regenerate the config automatically.\n',
  );
  console.log('Tip: press Ctrl+C to stop watching.\n');
}

main();
