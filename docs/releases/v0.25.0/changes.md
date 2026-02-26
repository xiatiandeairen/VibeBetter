# v0.25.0 全部开发变更

## 修改文件
- `packages/cli/src/commands/init.ts`
  - 添加 `--auto` 选项
  - 使用 simple-git 读取 origin remote URL
  - 从 URL 中提取 owner/repo 作为项目标识
  - `--project` 改为可选参数（与 `--auto` 二选一）
  - 错误处理：无 remote 时提示用户指定 --project
