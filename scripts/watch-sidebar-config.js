/**
 * 监听文件变化，自动重新生成侧边栏配置文件
 * 用于开发环境，当修改 _sidebar_scope.json 或 Markdown 的 Front Matter 时自动更新配置。
 * 监听范围：docs/、i18n/en/docusaurus-plugin-content-docs/current/（若存在）。
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const docsDir = path.join(__dirname, '../docs');
/** 英文翻译文档根目录（与 docs 目录结构一致，docId 与默认语言相同） */
const i18nEnDocsCurrentDir = path.join(
  __dirname,
  '../i18n/en/docusaurus-plugin-content-docs/current',
);
const configFilePath = path.join(__dirname, '../src/context/generated-sidebar-config.json');

let isGenerating = false;
let lastGenerateTime = 0;

/**
 * 重新生成配置文件
 */
function regenerateConfig() {
  // 防抖：如果距离上次生成不到 1 秒，则跳过
  const now = Date.now();
  if (now - lastGenerateTime < 1000) {
    return;
  }
  
  // 如果正在生成，则跳过
  if (isGenerating) {
    return;
  }
  
  isGenerating = true;
  lastGenerateTime = now;
  
  console.log('\n🔄 检测到文件变化，重新生成配置文件...\n');
  
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
      console.log('\n✅ 配置文件已更新\n');
    } else {
      console.log('\n❌ 配置文件生成失败\n');
    }
  });
}

/**
 * 监听目录变化
 */
function watchDirectory(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  
  fs.watch(dir, { recursive: true }, (eventType, filename) => {
    if (!filename) {
      return;
    }
    
    // 只监听特定文件
    if (filename.endsWith('_sidebar_scope.json') || 
        (filename.endsWith('.md') && !filename.includes('node_modules'))) {
      console.log(`📝 文件变化: ${filename}`);
      regenerateConfig();
    }
  });
  
  console.log(`👀 监听目录: ${dir}`);
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 启动配置文件监听器...\n');
  
  // 监听 docs 目录
  watchDirectory(docsDir);

  // 监听英文 i18n 当前文档目录
  if (fs.existsSync(i18nEnDocsCurrentDir)) {
    watchDirectory(i18nEnDocsCurrentDir);
  }
  
  console.log(
    '\n✅ 监听器已启动，修改 _sidebar_scope.json 或 Markdown 文件的 Front Matter（含 i18n/en/.../current）将自动更新配置文件\n',
  );
  console.log('💡 提示：按 Ctrl+C 停止监听\n');
}

main();
