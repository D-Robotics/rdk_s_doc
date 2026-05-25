# -*- coding: utf-8 -*-
import requests # 导入网络请求库
from urllib.parse import urlparse, quote
import os # 导入操作系统接口库
import re # 导入正则表达式库
import concurrent.futures # 导入并发库
from concurrent.futures import ThreadPoolExecutor # 从并发库导入线程池执行器
from tqdm import tqdm # 导入tqdm库用于显示进度条

# --- 配置项 ---
# 包含 Markdown 文件的根目录列表
MARKDOWN_ROOT_DIRS = ["docs", "i18n/en/docusaurus-plugin-content-docs/current"]
# 图片将下载到的子目录名。
IMAGE_OUTPUT_SUBDIR = "img"
# IMAGE_OUTPUT_SUBDIR 的父文件夹名
STATIC_DIR_NAME = "static"

# 用于查找指向阿里云 OSS 的 Markdown 图片链接的正则表达式
# 它捕获:
#   group(1): alt 文本 (图片替代文本)
#   group(2): 完整的阿里云 OSS URL
ALIYUN_OSS_IMAGE_PATTERN = re.compile(
    r"!\[(.*?)\]\((https?://(?:[a-zA-Z0-9-]+\.)*aliyuncs\.com(?:/[^\)]*?))\)"
)
# 最大并发下载数
MAX_WORKERS = 5
# 请求超时时间 (秒)
REQUEST_TIMEOUT = 15
# 错误日志文件名
ERROR_LOG_FILE = "error.txt"

def log_error(message, error_list):
    """记录错误到列表并打印到控制台"""
    print(message) # 控制台即时反馈
    error_list.append(message)

def download_image(session, url, save_path, error_list):
    """
    从 URL 下载图片并将其保存到本地路径。
    使用提供的 requests.Session 对象。
    如果下载成功或图片已存在，则返回 True，否则返回 False 并记录错误。
    """
    if os.path.exists(save_path):
        # print(f"图片已存在，跳过下载: {save_path}") # 可以取消这行注释来查看跳过信息
        return True
    try:
        # urlparse 会将 URL 分解为各个部分 (协议, 域名, 路径, 等)。
        parsed_url = urlparse(url)
        # 我们只对路径部分进行编码，并确保'/'不被编码，以保留目录结构。
        quoted_path = quote(parsed_url.path, safe='/')
        # 使用编码后的路径重新组装成一个安全的 URL。
        safe_url_for_request = parsed_url._replace(path=quoted_path).geturl()

        # print(f"开始下载: {safe_url_for_request} 到 {save_path}")
        # 使用新生成的 safe_url_for_request 进行下载
        response = session.get(safe_url_for_request, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()  # 对于错误的HTTP状态码，抛出异常

        os.makedirs(os.path.dirname(save_path), exist_ok=True)

        with open(save_path, 'wb') as f:
            f.write(response.content)
        # print(f"下载成功: {save_path}")
        return True
    except requests.exceptions.Timeout:
        log_error(f"下载超时: {url}", error_list)
    except requests.exceptions.RequestException as e:
        log_error(f"下载失败: {url}, 错误: {e}", error_list)
    except IOError as e:
        log_error(f"文件保存失败: {save_path}, 错误: {e}", error_list)
    except Exception as e:
        log_error(f"下载 {url} 时发生未知错误: {e}", error_list)
    return False

def process_markdown_file(md_path, image_output_abs_dir, pattern_re, session, executor, error_list):
    """
    处理单个 Markdown 文件。
    会查找、下载图片并替换链接，同时记录过程中发生的错误。
    """
    try:
        with open(md_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except IOError as e:
        log_error(f"读取文件失败: {md_path}, 错误: {e}", error_list)
        return

    images_to_download_info = {}
    unique_urls_to_download = {}
    matches = list(pattern_re.finditer(content))

    if not matches:
        return

    for match in matches:
        alt_text = match.group(1)
        original_url = match.group(2)
        try:
            parsed_url = urlparse(original_url)

            # 1. 获取 URL 中的完整相对路径，并移除开头的 '/'
            #    例如，从 "/path/to/image.png" 变为 "path/to/image.png"
            relative_image_path = parsed_url.path.lstrip('/')

            # 2. 安全性检查：防止路径遍历攻击 (e.g., ../../..)
            #    我们拒绝任何包含 '..' 或以 '/' 开头的路径来写入文件系统
            if '..' in relative_image_path:
                log_error(f"警告: 检测到不安全的图片路径 '{original_url}' (在 {md_path} 中)，已跳过。", error_list)
                continue

            # 3. 构建 Markdown 链接路径和本地文件保存路径
            #    local_md_path 用于写入 Markdown 文件，必须使用 '/' 作为分隔符
            local_md_path = f"/{IMAGE_OUTPUT_SUBDIR}/{relative_image_path}"
            #    full_save_path 用于保存到本地文件系统，使用 os.path.join 兼容不同操作系统
            full_save_path = os.path.join(image_output_abs_dir, relative_image_path)

        except Exception as e:
            log_error(f"警告: 解析 URL '{original_url}' (在 {md_path} 中) 失败: {e}，跳过。", error_list)
            continue

        images_to_download_info[original_url] = {
            "alt_text": alt_text,
            "local_md_path": local_md_path,
            "full_save_path": full_save_path
        }
        if not os.path.exists(full_save_path):
            unique_urls_to_download[original_url] = full_save_path


    future_to_url = {}
    if unique_urls_to_download:
        for original_url, full_save_path in unique_urls_to_download.items():
            future = executor.submit(download_image, session, original_url, full_save_path, error_list)
            future_to_url[future] = original_url

    download_results = {}
    for future in concurrent.futures.as_completed(future_to_url):
        url = future_to_url[future]
        try:
            success = future.result()
            download_results[url] = success
        except Exception as exc:
            log_error(f"文件 {md_path}: 图片 {url} 下载任务产生异常: {exc}", error_list)
            download_results[url] = False

    content_changed_flag = [False]

    def replace_image_link(matchobj):
        alt_text = matchobj.group(1)
        original_url = matchobj.group(2)

        if original_url in images_to_download_info:
            img_info = images_to_download_info[original_url]
            full_save_path = img_info["full_save_path"]

            if os.path.exists(full_save_path): 
                local_md_path = img_info["local_md_path"]
                new_tag = f"![{alt_text}]({local_md_path})"
                if new_tag != matchobj.group(0):
                    content_changed_flag[0] = True
                return new_tag
            else:
                return matchobj.group(0)
        return matchobj.group(0)

    new_content = pattern_re.sub(replace_image_link, content)

    if content_changed_flag[0]:
        try:
            with open(md_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
        except IOError as e:
            log_error(f"写入文件失败: {md_path}, 错误: {e}", error_list)

if __name__ == "__main__":
    error_logs = [] # 初始化错误日志列表

    script_dir = os.path.dirname(os.path.abspath(__file__))
    image_output_abs = os.path.abspath(os.path.join(script_dir, STATIC_DIR_NAME, IMAGE_OUTPUT_SUBDIR))

    print(f"统一图片输出目录: {image_output_abs}")
    os.makedirs(image_output_abs, exist_ok=True)

    all_md_file_paths = []
    print("开始扫描 Markdown 文件...")
    for root_dir_name in MARKDOWN_ROOT_DIRS:
        markdown_root_abs = os.path.abspath(os.path.join(script_dir, root_dir_name))
        if not os.path.isdir(markdown_root_abs):
            log_error(f"错误: Markdown 根目录 '{markdown_root_abs}' (来自配置 '{root_dir_name}') 不存在或不是一个目录。", error_logs)
            continue
        print(f"扫描目录: {markdown_root_abs}")
        for dirpath, _, filenames in os.walk(markdown_root_abs):
            for filename in filenames:
                if filename.endswith(".md"):
                    all_md_file_paths.append(os.path.join(dirpath, filename))

    total_md_files = len(all_md_file_paths)

    if total_md_files == 0:
        print("未在指定目录中找到任何 Markdown 文件进行处理。")
        if error_logs: # 如果仅有目录不存在的错误
             with open(ERROR_LOG_FILE, "w", encoding="utf-8") as f_err:
                for log_entry in error_logs:
                    f_err.write(log_entry + "\n")
             print(f"发现错误，详情请见 {ERROR_LOG_FILE}。")
        exit(0)

    print(f"共找到 {total_md_files} 个 Markdown 文件待处理。")

    with tqdm(total=total_md_files, desc="处理MD文件", unit="file") as progress_bar:
        with requests.Session() as http_session:
            http_session.headers.update({
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            })
            with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
                for md_path in all_md_file_paths:
                    progress_bar.set_description(f"处理中: {os.path.basename(md_path)}")
                    process_markdown_file(
                        md_path,
                        image_output_abs,
                        ALIYUN_OSS_IMAGE_PATTERN,
                        http_session,
                        executor,
                        error_logs
                    )
                    progress_bar.update(1)

    if error_logs:
        try:
            with open(ERROR_LOG_FILE, "w", encoding="utf-8") as f_err:
                f_err.write("--- 错误日志 ---\n")
                for log_entry in error_logs:
                    f_err.write(log_entry + "\n")
            print(f"处理完成。发现 {len(error_logs)} 个错误，详情请见 {ERROR_LOG_FILE}。")
        except IOError as e:
            print(f"致命错误: 无法写入错误日志文件 {ERROR_LOG_FILE}。错误: {e}")
            print("以下是收集到的错误信息:")
            for log_entry in error_logs:
                print(log_entry)
    else:
        print("🎉 所有处理完成，未报告错误。")