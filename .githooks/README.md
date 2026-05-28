# Git Hooks

## commit-msg

强制单行中文提交信息：

- **单行**: 提交信息只能有一行，不允许多行
- **中文**: 必须包含中文字符
- **无句号**: 末尾不能有句号
- **简短**: 建议不超过 50 字符

## 启用

```bash
git config core.hooksPath .githooks
```
