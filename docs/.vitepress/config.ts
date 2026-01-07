import { setUserConfig, setGenerateSidebar } from "@ruan-cat/vitepress-preset-config/config";

const userConfig = setUserConfig({
	title: "溟如池鱼的个人笔记",
	description: "个人学习笔记网站",
	head: [
		['link', { rel: 'icon', href: '/favicon.svg' }]
	],
	themeConfig: {
		search: {
			provider: 'local'
		},
		nav: [
			{ text: '算法笔记', link: '/算法笔记/' },
			{ text: '后端笔记', link: '/后端笔记/' },
			{ text: '其他笔记', link: '/其他笔记/' }
		],
		socialLinks: [
			{ icon: 'github', link: 'https://github.com/rtiy1' }
		],
		outline: {
			label: '页面导航'
		},
		docFooter: {
			prev: '上一页',
			next: '下一页'
		},
		lastUpdated: {
			text: '最后更新于',
			formatOptions: {
				dateStyle: 'full',
				timeStyle: 'medium'
			}
		},
		footer: {
			message: '基于 VitePress 搭建',
			copyright: `Copyright © 2024-${new Date().getFullYear()} 溟如池鱼`
		}
	},
});

// @ts-ignore
userConfig.themeConfig.sidebar = setGenerateSidebar({
	documentRootPath: "./docs",
});

export default userConfig;
