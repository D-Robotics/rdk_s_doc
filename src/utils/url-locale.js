import {useEffect, useState} from 'react';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

/**
 * 判断当前 URL 是否属于英文站点（baseUrl 之后的路径以 en 开头）。
 */
export function isEnglishPath(pathname, baseUrl) {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const relative = pathname.startsWith(base)
    ? pathname.slice(base.length)
    : pathname.replace(/^\/+/, '');
  return relative === 'en' || relative.startsWith('en/');
}

/**
 * GitHub Pages / OSS 只会用根目录的 404.html 兜底所有不存在的路径，而该文件是按
 * 默认语言（zh-Hans）预渲染的；直接访问 /en/ 下不存在的地址时，主题组件读到的
 * currentLocale 仍是 zh-Hans。这里改为根据真实 URL 前缀判断语言，供 404 页等
 * 需要在运行时切换文案的组件使用。
 *
 * 初始值跟构建语言保持一致（与 SSR 输出一致，避免 hydration 报错），挂载后再用
 * 实际路径纠正。
 */
export function useIsUrlEnglish() {
  const {
    i18n: {currentLocale},
    siteConfig: {baseUrl},
  } = useDocusaurusContext();
  const {pathname} = useLocation();
  const [english, setEnglish] = useState(currentLocale === 'en');

  useEffect(() => {
    setEnglish(isEnglishPath(pathname, baseUrl));
  }, [pathname, baseUrl]);

  return english;
}
