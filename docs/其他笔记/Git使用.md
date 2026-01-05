# Git 使用技巧

## 常用命令
- `git checkout -b <branch>`: 创建并切换分支
- `git merge --no-ff <branch>`: 非快进模式合并，保留分支历史
- `git stash`: 暂存当前修改

## 遇到的坑
- **LF will be replaced by CRLF**: 这是 Windows 的换行符问题，建议设置 `git config --global core.autocrlf true`。
