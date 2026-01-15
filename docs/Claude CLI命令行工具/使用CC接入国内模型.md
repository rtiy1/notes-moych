# 使用CC接入国内模型

#### 什么是基于CLI的AI编程工具？

“基于 CLI 的 AI 编程工具”是指**通过命令行（终端）调用人工智能能力来辅助编程的工具**。它们通常能帮你：

- 自动生成代码
- 解释/翻译代码
- 修复 Bug
- 写单元测试
- 优化性能
- 回答技术问题

主流的CLI工具有，Claude Code、Gemini CLI、OpenAI Codex CLI、OpenCode CLI。Claude Code是CLI编程工具届的GOAT，母庸置疑的强。

为什么不用Claude Code官方自己的模型呢，因为Claude月费贵的同时禁止中国地区购买使用他们公司的模型。但是Claude Code的Agent实力很强，所以我们可以选择接入国产模型，GLM4.7最佳，智谱官方模型对CC这个工具适配很高。

#### 使用国产厂商的AI Coding套餐：

[智谱AI开放平台]：https://bigmodel.cn/glm-coding?utm_source=BING&utm_campaign=BING&_channel_track_key=8JOkYuEj&msclkid=bed713ab5dfa1488256f7ac3d9c3c376

![image-20260115140826777](D:\尚硅谷JAVA\my-notes\docs\Claude CLI命令行工具\assets\image-20260115140826777.png)

[Coding Plan - MiniMax API 平台] ：https://platform.minimaxi.com/subscribe/coding-plan

![image-20260115141006343](D:\尚硅谷JAVA\my-notes\docs\Claude CLI命令行工具\assets\image-20260115141006343.png)

#### 通过取巧方式免费使用Claude Code + 国产模型：

[rtiy1/ifow2api]： https://github.com/rtiy1/ifow2api

在配置之前先安装iflow CLI

```javascript
npm i -g @iflow-ai/iflow-cli@latest
安装完成后iflow即可
```

如果显示命令不存在等问题，请找到你的npm仓库

```
npm root -g
```

![image-20260115230156422](D:\尚硅谷JAVA\my-notes\docs\Claude CLI命令行工具\assets\image-20260115230156422.png)

我们需要的是D:\npm-repository这个路径添加到环境变量的path中，重启终端就可以启动iflow了

登录之后就可以退出了，启动在仓库里下载的程序，进入到localhost:8000/admin就可以看到管理面板。

API: `http://localhost:8000`

端点说明

`/v1/models`获取模型列表

`/v1/chat/completions`

OpenAI 格式对话`/v1/messages`

Anthropic 格式对话`/admin`管理面板

在终端使用如下命令进行配置：

```
echo 'export ANTHROPIC_AUTH_TOKEN="123456"' >> ～/.zshrc
echo 'export ANTHROPIC_BASE_URL="http://127.0.0.1:8000"' >> ～/.zshrc
source ～/.zshrc
```

在你的c盘，用户，你的用户下找到.claude文件夹，点进去找到settings.json，如果没有就创建一个。

```
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "123456",
    "ANTHROPIC_BASE_URL": "http://127.0.0.1:8000"
  },
  "model": "glm-4.7"
}
```

复制这一段放进去就行，然后打开claude就可以愉快使用了！！