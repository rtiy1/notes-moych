# Python 基础学习笔记

> 本笔记侧重于从 Java 开发者的视角快速上手 Python，记录了两者在语法规范、数据类型、函数及面向对象方面的核心差异。

---

## 一、 代码规范

### 1.1 缩进与块作用域
Python 使用**强制缩进**（建议 4 个空格）来定义代码块，而非 Java 中的花括号 `{}`。这要求每一行代码的对齐必须严格一致。

::: tip 建议
虽然 Python 允许使用 Tab，但在 PEP 8 规范中明确建议使用 **4 个空格**，以确保在不同编辑器下的表现一致。
:::

```python
# ✅ 正确示例
def specification():
    x = 10
    if x > 0:
        print("Positive")  
        print("Inside the if block")
    print("Outside the if block")  # 回到外层

# ❌ 错误示例
def bad_specification():
    x = 10
    if x > 0:
     print("Indentation error here!") # 缩进不统一会导致运行时错误
```

---

## 二、 基础语法

### 2.1 数据类型分类
Python 的数据类型分为**可变**与**不可变**两大类，理解这一点对内存管理至关重要。

| 类别 | 类型 | 特点 |
| :--- | :--- | :--- |
| **不可变类型** | 整数 (int)、浮点数 (float)、元组 (tuple)、字符串 (str) | 创建后内容不可修改，修改操作会生成新对象 |
| **可变类型** | 列表 (list)、字典 (dict)、集合 (set) | 可在原内存地址上直接修改内容，`id()` 保持不变 |

### 2.2 海象运算符 `:=`
海象运算符允许在表达式内部同时进行**赋值**和**返回结果**，能有效减少重复计算。

```python
# 传统写法
num = 4
square = num * num
if square > 10:
    print(f"{num} 的平方是 {square}，大于 10")

# 海象运算符写法
if (square := num * num) > 10:
    print(f"{num} 的平方是 {square}，大于 10")
```

### 2.3 控制流差异
::: info Java vs Python
Java 使用 `else if`，而 Python 使用更简洁的 `elif`。
:::

```python
if 条件1:
    # 语句1
elif 条件2: 
    # 语句2
else:
    # 语句3
```

### 2.4 三元运算符
Python 的三元运算逻辑非常“口语化”：`结果1 if 条件 else 结果2`。

```python
# Java 写法: result = (1 == 1) ? 1 : 0;
result = 1 if 1 == 1 else 0
```

---

## 三、 容器数据类型

### 3.1 集合与循环
Python 的容器类型对应 Java 中的集合框架，但语法更为简洁且不强制要求存储相同类型的数据。

*   **列表 (list)** $\approx$ `ArrayList`
*   **字典 (dict)** $\approx$ `HashMap`
*   **集合 (set)** $\approx$ `HashSet`

#### 字典的遍历技巧：
```python
my_dict = {"name": "夏目", "age": 20}

for item in my_dict:          # 默认遍历键 (keys)
    print(item)

for k, v in my_dict.items():  # 同时遍历键值对
    print(f"{k} = {v}")
```

---

## 四、 函数高级特性

### 4.1 参数形式
Python 的函数参数非常灵活，支持默认值、关键字传参及不定长参数。

*   **关键字参数**：调用时指定形参名，顺序可乱。
*   **默认值参数**：`def func(a, b=20)`，调用时可省略 `b`。
*   **不定长参数**：
    *   `*args`：接收多余位置参数，封装为**元组**。
    *   `**kwargs`：接收多余关键字参数，封装为**字典**。

```python
def print_info(num, *args, **kwargs):
    print(num, args, kwargs)

# 调用示例
print_info(10, 1, 2, 3, key1=20, key2=30) 
# 输出: 10 (1, 2, 3) {'key1': 20, 'key2': 30}
```

### 4.2 变量作用域
使用 `global` 声明全局变量，使用 `nonlocal` 声明闭包中的外层变量。

::: warning 注意
`nonlocal` 只能修改嵌套函数外层（非全局）的变量。如果外层变量已通过 `global` 声明为全局，则不能再使用 `nonlocal`。
:::

---

## 五、 匿名函数与函数式编程
Python 的 `lambda` 配合内置函数可以实现类似 Java Stream 的效果。

*   **`map(func, list)`**：映射转换。
*   **`filter(func, list)`**：条件过滤。
*   **`sorted(list, key=...)`**：自定义排序。

```python
students = [{"name": "A", "age": 20}, {"name": "B", "age": 18}]
# 按年龄排序
result = sorted(students, key=lambda x: x["age"])
```

---

## 六、 文件操作

| 模式 | 说明 |
| :--- | :--- |
| **r** | 只读（默认）。若文件不存在则报错。 |
| **w** | 覆盖写入。文件不存在则创建。 |
| **a** | 追加写入。 |
| **b** | 二进制模式（常用于图片/视频）。 |

::: tip 推荐做法
建议使用 `with open(...) as f:` 语法，它会自动管理文件的关闭，类似于 Java 的 `try-with-resources`。
:::

---

## 七、 类与对象

### 7.1 核心特性
Python 的类极其灵活，支持动态添加属性和方法。

::: danger 动态性警告
在 Python 中，**实例对象可以直接访问类属性**，甚至可以在运行时动态地给某个实例（或整个类）添加新函数。这种自由度远超 Java。
:::

```python
class GameAccount:
    def __init__(self, username, password):
        self.username = username      # 公有
        self._password = password    # 保护 (约定)
        self.__key = "secret"        # 私有 (名称修饰)

    @property
    def password(self):              # 计算属性 (Getter)
        return self._password

    @password.setter
    def password(self, val):         # Setter
        self._password = val
```

### 7.2 封装等级
Python 并没有真正的“私有”，它更多依赖命名约定。

| 类型 | 规则 | 访问建议 |
| :--- | :--- | :--- |
| **公有 (Public)** | `name` | 随意访问 |
| **保护 (Protected)** | `_name` | 仅类内部及子类使用（约定） |
| **私有 (Private)** | `__name` | 内部访问（外部需通过 `_ClassName__name` 强行访问） |

---

## 八、 异常处理

Python 使用 `try-except-else-finally` 结构。

```python
try:
    res = 1 / 1
except ZeroDivisionError as e:
    print(f"捕获特定异常: {e}")
except Exception as e:
    print(f"捕获通用异常: {e}")
else:
    print("没有发生异常时执行")
finally:
    print("无论是否发生异常都会执行")
```
