# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run docs:dev      # Start development server
npm run docs:build    # Build for production
npm run docs:preview  # Preview production build
```

Node.js >= 20 required.

## Architecture

VitePress static documentation site with Chinese content. All Markdown content lives in `docs/`.

Key locations:
- `docs/.vitepress/config.ts` - VitePress configuration (navigation, sidebar, theme settings)
- `docs/.vitepress/theme/` - Custom theme extending default VitePress theme
- `docs/index.md` - Homepage with hero layout

Sidebar is auto-generated from directory structure using `@ruan-cat/vitepress-preset-config`.

## Content Structure

- `docs/算法笔记/` - Algorithm notes
- `docs/后端笔记/` - Backend development notes
- `docs/其他笔记/` - Miscellaneous notes
- `docs/个人项目文档/` - Personal project documentation
