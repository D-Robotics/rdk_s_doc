# 若 Cursor/杀毒 占用导致无法改名，请先关闭编辑器中对下列目录的打开，再执行本脚本。
# 将 docs 下剩余旧名改为连续编号（应与 i18n\en\...\current 一致）。
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$docRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\docs')).Path

if (Test-Path (Join-Path $docRoot '07_Advanced_development')) {
  Rename-Item -LiteralPath (Join-Path $docRoot '07_Advanced_development') -NewName '05_Advanced_development'
}
if (Test-Path (Join-Path $docRoot '09_Appendix')) {
  Rename-Item -LiteralPath (Join-Path $docRoot '09_Appendix') -NewName '07_Appendix'
}

Get-ChildItem -LiteralPath $docRoot -Directory | Sort-Object Name | ForEach-Object { $_.Name }
