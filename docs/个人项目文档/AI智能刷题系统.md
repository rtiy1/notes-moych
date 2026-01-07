# AI 智能学习平台

> 本文档旨在帮助你在面试中全面、深入地介绍项目

---

## 一、项目概述

**项目名称**：AI Learning Room（AI 智能学习平台）

**项目定位**：一个集成了 AI 大模型能力的在线学习考试系统，核心亮点是利用阿里云通义千问大模型实现智能出题、智能批阅、考试总评等功能。

**技术架构**：Spring Boot 3 + MyBatis-Plus + MySQL + Redis + MinIO + WebFlux

---

## 二、技术栈详解

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 基础框架 | Spring Boot | 3.0.5 | 项目基础框架 |
| JDK | Java | 17 | 运行环境 |
| ORM框架 | MyBatis-Plus | 3.5.3.2 | 数据库操作、分页、逻辑删除 |
| 数据库 | MySQL | 8.0.32 | 数据持久化 |
| 连接池 | HikariCP | 内置 | 数据库连接池 |
| 缓存 | Redis | - | 热门题目排行、缓存 |
| 分布式锁 | Redisson | 3.24.3 | 分布式锁支持 |
| 对象存储 | MinIO | 8.5.7 | 视频、图片文件存储 |
| HTTP客户端 | WebFlux WebClient | - | 异步调用AI API |
| API文档 | Knife4j | 4.4.0 | OpenAPI3 接口文档 |
| JSON处理 | Fastjson2 | 2.0.54 | JSON解析 |
| Excel处理 | Apache POI | 5.2.4 | 题目批量导入导出 |
| AI服务 | 阿里云通义千问 | qwen-flash | 智能出题、批阅 |

---

## 三、核心模块深度分析

### 3.1 用户管理模块

**文件位置**：`UserController.java`, `UserServiceImpl.java`

**功能**：
- 用户登录认证
- 管理员权限验证
- 角色管理（ADMIN/TEACHER/STUDENT）

**技术要点**：
- 继承 MyBatis-Plus 的 `ServiceImpl` 简化 CRUD
- 角色枚举设计

---

### 3.2 题目管理模块 ⭐重点

**文件位置**：`QuestionServiceImpl.java` (第34-356行)

**功能**：
- 题目 CRUD 操作
- 多条件分页查询（分类、难度、题型、关键词）
- 支持三种题型：选择题(CHOICE)、判断题(JUDGE)、简答题(TEXT)
- 热门题目推荐（Redis ZSet）

**核心代码解析**：

```java
// 1. 分页查询 - 使用 MyBatis-Plus LambdaQueryWrapper
public Page<Question> getQuestionPageList(Integer pageNum, Integer pageSize, QuestionQueryVo vo) {
    Page<Question> page = new Page<>(pageNum, pageSize);
    LambdaQueryWrapper<Question> queryWrapper = new LambdaQueryWrapper<>();
    // 动态条件拼接
    queryWrapper.eq(vo.getCategoryId() != null, Question::getCategoryId, vo.getCategoryId());
    queryWrapper.eq(vo.getDifficulty() != null, Question::getDifficulty, vo.getDifficulty());
    queryWrapper.like(vo.getKeyword() != null, Question::getTitle, vo.getKeyword());
    queryWrapper.orderByDesc(Question::getCreateTime);
    return page(page, queryWrapper);
}
```

```java
// 2. 热门题目 - Redis ZSet 实现访问计数
public Question getQuestionDetailByID(Long id) {
    Question question = questionMapper.selectOne(...);
    // 访问计数 +1，利用 ZSet 的 score 特性
    BoundZSetOperations<String, Object> ops = redisTemplate.boundZSetOps(CacheConstants.POPULAR_QUESTIONS_KEY);
    ops.incrementScore(question.getId(), 1);
    return question;
}

// 获取热门题目 Top N
public List<Question> getHotQuestions(Integer size) {
    ZSetOperations<String, Object> ops = redisTemplate.opsForZSet();
    // reverseRange 按分数降序获取
    Set<Object> redisIds = ops.reverseRange(CacheConstants.POPULAR_QUESTIONS_KEY, 0, size - 1);
    // ...
}
```

**面试话术**：
> "题目模块使用 Redis ZSet 实现热门排行，每次访问题目详情时调用 `incrementScore` 增加访问计数，获取热门题目时使用 `reverseRange` 按分数降序获取 Top N，时间复杂度 O(logN)。"

---

### 3.3 AI 智能出题模块 ⭐⭐重点

**文件位置**：`DeepSeekAiServiceImpl.java` (第30-232行)

**功能**：根据用户指定的题型、难度、数量、主题，调用 AI 大模型自动生成题目

**核心流程**：
```
构建 Prompt → 调用通义千问 API → 解析 JSON 响应 → 返回题目列表
```

**Prompt 工程设计**（第49-115行）：

```java
private String buildPrompt(AiGenerateRequestVo request) {
    StringBuilder prompt = new StringBuilder();
    prompt.append(String.format("请为我生成%s道关于%s的题目。\n", request.getCount(), request.getTopic()));
    prompt.append("要求：\n");

    // 动态拼接题型要求
    for (String t : request.getTypes().split(",")) {
        switch (t.trim()) {
            case "CHOICE" -> prompt.append("选择题(包含单选和多选) ");
            case "JUDGE" -> prompt.append("判断题（确保TRUE/FALSE数量平衡）");
            case "TEXT" -> prompt.append("简答题 ");
        }
    }

    // 指定返回 JSON 格式
    prompt.append("请严格按照以下 JSON 格式返回：\n");
    prompt.append("{ \"questions\": [ { \"title\": \"...\", \"type\": \"CHOICE\", ... } ] }");
    return prompt.toString();
}
```

**WebClient 异步调用 + 重试机制**（第117-169行）：

```java
private String callDeepSeekApi(String prompt) {
    Mono<String> stringMono = webClient.post()
        .bodyValue(requestBody)
        .retrieve()
        .bodyToMono(String.class)
        .timeout(Duration.ofMillis(deepSeekProperties.getReadTimeout()))
        // 指数退避重试：重试3次，初始间隔2秒
        .retryWhen(Retry.backoff(3, Duration.ofSeconds(2))
            .filter(e -> {
                // 重试条件：超时、网络异常、5xx错误
                return e instanceof RuntimeException ||
                       e.getMessage().contains("timeout") ||
                       e.getMessage().contains("500|502|503|504");
            }));
    return stringMono.block();
}
```

**面试话术**：
> "AI 出题模块的核心是 Prompt 工程，我设计了结构化的提示词，明确要求 AI 返回 JSON 格式，包含题目、选项、答案、解析等字段。调用 AI API 时使用 WebFlux 的 WebClient，它是非阻塞的，配合指数退避重试策略（Retry.backoff）处理网络不稳定的情况。"

---

### 3.4 AI 智能批阅模块 ⭐⭐⭐核心亮点

**文件位置**：`ExamServiceImpl.java` (第166-281行)

**功能**：
- 选择题/判断题：自动匹配答案
- 简答题：AI 语义分析评分
- 生成考试总评

**判题逻辑**（第306-374行）：

```java
private JudgementResult judgeAnswer(Question question, String correctAnswer, String userAnswer) {
    switch (question.getType()) {
        case "CHOICE": {
            // 选择题：标准化答案后比较（支持 A,B / AB / A B 等格式）
            String normalizedUser = userAnswer.replaceAll("[\\s,，]", "").toUpperCase();
            char[] userChars = normalizedUser.toCharArray();
            Arrays.sort(userChars);  // 排序保证顺序无关
            // ... 比较逻辑
        }

        case "JUDGE": {
            // 判断题：标准化 T/TRUE/F/FALSE
            String normalized = switch (userAnswer.toUpperCase()) {
                case "T", "TRUE" -> "TRUE";
                case "F", "FALSE" -> "FALSE";
                default -> null;
            };
            // ... 比较逻辑
        }

        case "TEXT": {
            // 简答题：调用 AI 进行语义分析评分
            String prompt = buildPrompt(question, userAnswer);
            String response = callDeepSeekApi(prompt);
            return parseGradingResult(response);
        }
    }
}
```

**简答题 AI 评分 Prompt**（第514-541行）：

```java
private String buildPrompt(Question question, String userAnswer) {
    StringBuilder prompt = new StringBuilder();
    prompt.append("你是一名专业的考试阅卷老师，请对以下题目进行判卷：\n\n");
    prompt.append("【题目】").append(question.getTitle()).append("\n");
    prompt.append("【标准答案】").append(question.getAnswer().getAnswer()).append("\n");
    prompt.append("【学生答案】").append(userAnswer).append("\n");
    prompt.append("【满分】").append(question.getPaperScore()).append("分\n\n");

    prompt.append("【判卷要求】\n");
    prompt.append("- 答案要点正确且完整：80-100%分数\n");
    prompt.append("- 答案基本正确但不够完整：60-80%分数\n");
    prompt.append("- 答案部分正确：30-60%分数\n");
    prompt.append("- 答案完全错误或未作答：0分\n");

    prompt.append("请按以下JSON格式返回：\n");
    prompt.append("{ \"score\": 实际得分, \"feedback\": \"评价\", \"reason\": \"扣分原因\" }");
    return prompt.toString();
}
```

**考试总评生成**（第592-614行）：

```java
private String generateAISummary(BigDecimal totalScore, int maxScore, int questionCount, int correctCount) {
    StringBuilder prompt = new StringBuilder();
    prompt.append("你是一名资深的教育专家，请为学生的考试表现提供专业的总评：\n\n");
    prompt.append("【考试成绩】\n");
    prompt.append("总得分：").append(maxScore).append("/").append(totalScore).append("分\n");
    prompt.append("得分率：").append(percentage).append("%\n");
    prompt.append("答对题数：").append(correctCount).append("/").append(questionCount).append("\n\n");
    prompt.append("请提供150字左右的考试总评，包括：\n");
    prompt.append("1. 客观评价  2. 优势和不足  3. 学习建议  4. 鼓励激励\n");
    return prompt.toString();
}
```

**面试话术**：
> "简答题无法用简单的字符串匹配判分，我设计了 AI 评分系统。Prompt 中包含题目、标准答案、学生答案和满分，并明确了评分标准（80-100%完整正确、60-80%基本正确等）。AI 返回具体得分、评价反馈和扣分原因，既保证了评分的合理性，也提供了详细的反馈供学生参考。"

---

### 3.5 试卷管理模块

**文件位置**：`PaperServiceImpl.java` (第29-367行)

**功能**：
- 手动组卷
- AI 智能组卷
- 试卷状态管理（DRAFT/PUBLISHED/STOPPED）

**AI 智能组卷**（第160-223行）：

```java
public Paper createPaperWithAI(AiPaperVo aiPaperVo) {
    for (RuleVo rule : aiPaperVo.getRules()) {
        // 根据规则查询题目（题型、分类）
        LambdaQueryWrapper<Question> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Question::getType, rule.getType().name());
        queryWrapper.in(Question::getCategoryId, rule.getCategoryIds());

        List<Question> allQuestions = questionMapper.selectList(queryWrapper);

        // 随机打乱后选取指定数量
        Collections.shuffle(allQuestions);
        int selectCount = Math.min(rule.getCount(), allQuestions.size());
        List<Question> selectedQuestions = allQuestions.subList(0, selectCount);

        // 计算总分
        totalScore = totalScore.add(BigDecimal.valueOf(selectCount * rule.getScore()));
    }
    // 保存试卷和题目关联
}
```

**面试话术**：
> "AI 组卷支持按规则自动生成试卷，用户可以指定每种题型的数量、分值和分类范围。系统会从题库中随机抽取符合条件的题目，使用 `Collections.shuffle` 保证随机性。"

---

### 3.6 视频学习模块

**文件位置**：`VideoServiceImpl.java` (第33-437行)

**功能**：
- 视频上传和管理
- 观看次数和点赞统计
- 视频审核流程
- 基于 IP 的点赞去重

**点赞功能**（第144-178行）：

```java
public boolean toggleVideoLike(Long videoId, HttpServletRequest request) {
    String userIp = IpUtils.getClientIp(request);
    boolean isLiked = videoLikeMapper.isLikedByIp(videoId, userIp);

    if (isLiked) {
        // 取消点赞
        videoLikeMapper.delete(...);
        videoMapper.decrementLikeCount(videoId);
        return false;
    } else {
        // 添加点赞
        VideoLike videoLike = new VideoLike();
        videoLike.setVideoId(videoId);
        videoLike.setUserIp(userIp);
        videoLikeMapper.insert(videoLike);
        videoMapper.incrementLikeCount(videoId);
        return true;
    }
}
```

---

## 四、技术亮点总结

### 4.1 WebClient 异步调用 + 重试机制

```java
webClient.post()
    .bodyValue(requestBody)
    .retrieve()
    .bodyToMono(String.class)
    .timeout(Duration.ofMillis(readTimeout))
    .retryWhen(Retry.backoff(3, Duration.ofSeconds(2))
        .filter(e -> /* 网络异常、超时、5xx错误 */));
```

**为什么用 WebClient 而不是 RestTemplate？**
- WebClient 是非阻塞的，不会占用线程等待响应
- AI 接口响应慢（可能几秒到几十秒），非阻塞可以提高系统吞吐量
- 内置响应式重试机制，代码更简洁

### 4.2 Redis ZSet 热门排行

```java
// 访问计数
ops.incrementScore(questionId, 1);  // O(logN)

// 获取 Top N
ops.reverseRange(0, size - 1);  // O(logN + M)
```

**为什么用 ZSet？**
- 自动按分数排序，无需手动排序
- 增加分数和获取排名都是 O(logN)
- 支持范围查询，获取 Top N 非常高效

### 4.3 MyBatis-Plus 高级特性

```java
// 逻辑删除（配置后自动生效）
@TableLogic
private Byte isDeleted;

// 自动填充
@TableField(fill = FieldFill.INSERT)
private Date createTime;

// 非数据库字段（用于关联查询）
@TableField(exist = false)
private List<QuestionChoice> choices;
```

### 4.4 Prompt 工程设计

- 明确角色定位（"你是一名专业的考试阅卷老师"）
- 结构化输入（题目、答案、满分）
- 明确评分标准（分档评分）
- 指定输出格式（JSON）

---

## 五、数据库设计

### 核心实体关系

```
User (用户)
  ├── role: ADMIN/TEACHER/STUDENT

Category (分类) - 支持树形结构
  ├── parentId → Category

Question (题目)
  ├── categoryId → Category
  ├── type: CHOICE/JUDGE/TEXT
  ├── difficulty: EASY/MEDIUM/HARD
  │
  ├── QuestionChoice (选项) - 一对多
  └── QuestionAnswer (答案) - 一对一

Paper (试卷)
  ├── status: DRAFT/PUBLISHED/STOPPED
  └── PaperQuestion (试卷-题目关联) - 多对多

ExamRecord (考试记录)
  ├── examId → Paper
  ├── studentName
  ├── score
  ├── windowSwitches (防作弊)
  │
  └── AnswerRecord (答题记录) - 一对多
        ├── questionId
        ├── userAnswer
        ├── isCorrect
        └── aiCorrection (AI批改评语)

Video (视频)
  ├── categoryId → VideoCategory
  ├── status: 待审核/已发布/已拒绝/已下架
  │
  ├── VideoView (观看记录)
  └── VideoLike (点赞记录)
```

---

## 六、面试常见问题

### Q1: 为什么选择 WebClient 而不是 RestTemplate？
> WebClient 是非阻塞的响应式客户端，适合调用响应慢的 AI 接口。RestTemplate 是同步阻塞的，会占用线程等待响应，在高并发场景下可能导致线程池耗尽。

### Q2: AI 生成的题目格式不对怎么办？
> 1. Prompt 中明确要求返回 JSON 格式，并给出示例
> 2. 解析时做异常处理，移除可能的 markdown 标记（```json）
> 3. 解析失败时记录日志，返回友好错误提示

### Q3: 简答题 AI 判分准确吗？
> 设计了分档评分标准（80-100%/60-80%/30-60%/0分），AI 返回具体得分和扣分原因。同时保留了人工复核的入口，教师可以查看 AI 评分并手动调整。

### Q4: Redis 热门排行数据丢失怎么办？
> 1. 配置 Redis 持久化（RDB/AOF）
> 2. 定期将热门数据同步到数据库
> 3. 如果 Redis 数据不足，从数据库补充最新题目

### Q5: 如何防止考试作弊？
> 记录窗口切换次数（windowSwitches 字段），前端监听 visibilitychange 事件，每次切换窗口都上报后端。

### Q6: MinIO 和阿里云 OSS 的区别？
> MinIO 是私有化部署的对象存储，适合内网环境，成本更低，数据完全自主可控。OSS 是云服务，按量付费，适合公网访问场景。

---

## 七、项目架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         前端 (Vue/React)                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Controller 层 (REST API)                    │
│  UserController | QuestionController | PaperController | ...    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Service 层 (业务逻辑)                      │
│  QuestionService | ExamService | DeepSeekAiService | ...        │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│    MySQL      │      │    Redis      │      │  AI API       │
│   (数据库)     │      │   (缓存)      │      │ (通义千问)     │
└───────────────┘      └───────────────┘      └───────────────┘
                                                      │
                                              ┌───────┴───────┐
                                              │   WebClient   │
                                              │  (异步调用)    │
                                              └───────────────┘
```

---

## 八、项目亮点一句话总结

1. **AI 智能出题**：通过 Prompt 工程让 AI 生成结构化题目
2. **AI 智能批阅**：简答题语义分析评分，提供详细反馈
3. **响应式编程**：WebClient + 重试机制保证 AI 调用可靠性
4. **Redis 热门排行**：ZSet 实现 O(logN) 的实时排行
5. **MyBatis-Plus**：逻辑删除、自动填充、分页插件
6. **MinIO 对象存储**：私有化部署，成本可控

---

*祝面试顺利！🎉*
