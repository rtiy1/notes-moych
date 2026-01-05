# 遭遇的 Bug 记录

## 2026-01-05: VitePress Favicon 不生效
- **问题描述**：在 `config.ts` 中配置了 `favicon.ico`，但浏览器不显示。
- **原因**：缺少 `public` 目录，或者图标文件未放在 `public` 根目录下。
- **解决方案**：创建 `docs/public` 目录并放入图标，更新 `config.ts` 中的路径为 `/favicon.svg`。

## 2026-01-04: CSS 计数器嵌套失效
- **问题描述**：侧边栏子项全部显示为 1。
- **原因**：每次嵌套都重新 `reset` 了同一个计数器且没有正确处理层级。
- **解决方案**：使用 `counters(name, ".")` 并配合递归的 `counter-reset`。
