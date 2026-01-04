import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "阮喵喵笔记",
  description: "个人学习笔记网站",
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'one-dark-pro'
    }
  },
  themeConfig: {
    // 去掉头部的 vitepress 文字
    siteTitle: '溟如池鱼的个人笔记', 
    logo: undefined, 

    // nav: [
    //   { text: '学习待办', link: '/todo' },
    //   { text: '遭遇的bug', link: '/bugs' },
    //   { text: 'git使用', link: '/git' },
    //   { text: '演示用的demo', link: '/demo' },
    //   { text: 'css训练', link: '/css' },
    //   { text: '50天50个小项目', link: '/projects' }
    // ],

    sidebar: [
      {
        text: '1. 算法套路总结',
        collapsed: false,
        items: [
          { text: '定长滑动窗口', link: '/算法套路总结#定长滑动窗口算法' },
          { text: '可变滑动窗口', link: '/算法套路总结#可变滑动窗口算法' }
        ]
      },
      {
        text: '2. Redis 阶段笔记',
        collapsed: false,
        items: [
          { text: '事务和锁机制', link: '/Redis阶段笔记#事务和锁机制' },
          { text: 'RDB 和 AOF', link: '/Redis阶段笔记#rdb和aof' }
        ]
      },
      {
        text: '3. SSM 阶段学习笔记',
        collapsed: false,
        items: [
          { text: 'IOC 容器', link: '/SSM阶段学习笔记#1容器' },
          { text: '自动装配', link: '/SSM阶段学习笔记#此外可通过-autowired-实现自动装配' },
          { text: '第三方框架导入', link: '/SSM阶段学习笔记#将第三方框架或第三方类导入ioc容器' }
        ]
      },
      {
        text: '4. 其他笔记',
        collapsed: true,
        items: [
          { text: '学习待办', link: '/todo' },
          { text: '遭遇的bug', link: '/bugs' },
          { text: 'git使用', link: '/git' }
        ]
      }
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
    }
  }
})
