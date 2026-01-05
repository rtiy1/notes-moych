# SSM阶段学习笔记
## 1、容器

在IOC容器中，每个Bean对象都具有唯一的标识ID。

使用`@Component` 注解可用于将当前类注册到IOC容器中。`@Controller`、`@Service`、`@Repository `是 `@Component` 的特化形式，本质上都等同于 @Component。它们均表示一个由 Spring 管理的 Bean，但适用于不同的业务层级。

*   `@Controller`：用于标注控制层（Controller层）的类；
    
*   `@Service`：用于标注业务逻辑层（Service层）的类；
    
*   `@Repository`：用于标注数据访问层（持久化层）的类。
    

Spring Boot 默认会扫描主启动类所在包及其子包中的组件。主启动类通常标记有 `@SpringBootApplication` 注解。若在此基础上添加 `@ComponentScan(value = "所需扫描包的全路径")`，则会覆盖默认的包扫描范围，仅扫描指定路径下的组件。

获取Bean对象的三种方式如下：

1.  `ioc.getBean("bean名称")`
    
2.  `ioc.getBean(类名.class)`
    
3.  `ioc.getBean("bean名称", 类名.class)`
    

此外，可通过 `@Autowired` 实现自动装配：

*   **装配**：例如，`EmpController` 需要使用 `EmpService`，因此需声明一个成员变量来接收 `EmpService` 的实例，Spring框架会自动将IOC容器中的 `EmpService` Bean 注入该变量。
    
*   **自动**：对象的创建、在IOC容器中查找匹配的Bean以及完成赋值等操作均由Spring框架自动完成。
    

使用 `@Autowired` 注解的前提是，当前类本身必须已被纳入IOC容器管理（例如通过 `@Component` 或其衍生注解标注），否则会导致自动装配失败。

从外部配置文件读取属性：

可使用 `@PropertySource` 注解指定外部配置文件的位置。其中以 `classpath:` 开头表示在类路径下查找文件；当加载的是Spring默认的 `application.properties` 文件时，`classpath:` 前缀可省略。结合 `@Value("${}")` 注解，可根据配置文件中的键（key）获取对应的值（value），并将其注入到成员变量中。

将第三方框架或第三方类导入IOC容器：

可在配置类中定义方法，并使用 `@Bean` 注解修饰该方法，通过返回所需实例的方式将其注册到IOC容器中，由Spring统一管理其生命周期。

```java
@Configuration
public class ThirdPartyConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate(); // 第三方对象
    }

    @Bean
    public DataSource dataSource() {
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl("jdbc:h2:mem:test");
        return ds;
    }
}
```

`@Profile` 注解用于指定特定环境的名称，当该环境被激活时，被标注的 Bean 将会被注册到 IOC 容器中。该注解常用于区分不同环境下的配置场景，例如在生产、开发或测试环境中使用不同的数据库配置。

---

## 2、AOP

**名词解释**：AOP（Aspect Oriented Programming），即面向切面编程。

功能作用：如同一枚硬币的两面——

1.  **代码简化**：将原本分散在多个方法中的通用性、重复性逻辑抽取出来，集中封装到切面类中，实现关注点分离。
    
2.  **代码增强**：将切面类中封装的非核心业务逻辑（如日志、事务、权限校验等），动态织入到目标方法执行流程中，从而扩展其功能。
    

---

**通知类型**：

1.  **前置通知（@Before）**：在目标方法执行前触发。
    
2.  **返回通知（@AfterReturning）**：在目标方法成功执行并返回结果后执行。
    
3.  **异常通知（@AfterThrowing）**：在目标方法抛出异常时执行。
    
4.  **后置通知（@After）**：无论目标方法是否正常完成，都会在其最终结束之后执行，类似于 finally 块的行为。
    
5.  **环绕通知（@Around）**：通过 `try{} catch{} finally{}` 结构完全包裹目标方法的执行过程，可控制方法的执行时机、参数、返回值甚至跳过方法调用，是最灵活且功能最强大的通知类型。
    

---

**通知执行顺序**：

*   **无异常时**：
    
    1.  @Around（proceed() 之前）
        
    2.  @Before
        
    3.  目标方法执行
        
    4.  @Around（proceed() 之后）
        
    5.  @AfterReturning
        
    6.  @After
    
*   **有异常时**：
    
    1.  @Around（proceed() 之前）
        
    2.  @Before
        
    3.  目标方法抛出异常
        
    4.  @AfterThrowing
        
    5.  @After
        
    6.  @Around（异常处理部分）
        

---

**基本概念说明**：

*   切面类（Aspect）：包含通知方法的类，需使用 `@Aspect` 注解进行标识。
    
*   **切入点（Pointcut）**：定义通知应应用于哪些方法的表达式。它决定了“在哪些方法上”织入横切逻辑；而通知类型（如 `@Before`）则决定“在方法执行的哪个阶段”织入。
    

---

**AspectJ 代理模式**：

在使用 AspectJ 实现 AOP 时，需在切面类上添加 `@Aspect` 注解，并确保该类被 Spring 容器管理（如添加 `@Component` 注解）。

通过结合 `@Before`、`@After`、`@AfterReturning`、`@AfterThrowing` 和 `@Around` 等通知注解与切入点表达式，可以精确指定目标方法。Spring 会自动创建代理对象（JDK 动态代理或 CGLIB），并在运行时动态织入横切逻辑。

为提升复用性，可使用 `@Pointcut` 注解定义公共切入点表达式。例如：

```java
@Pointcut("execution(* com.example.service.*.*(..))")
public void logPointcut() {}
```

其他通知可通过该方法引用该切入点。

*   若切入点定义在独立的配置类中（如 `LoggingConfig`），则在通知注解中引用时必须使用全限定名，如：  
    `value = "com.example.config.LoggingConfig.logPointcut()"`
    
*   若切入点与通知位于同一切面类中，则直接使用方法名即可，如：  
    `value = "logPointcut()"`
    

---

**通知方法参数**：

每个通知方法均可声明一个 `JoinPoint` 类型的参数（环绕通知除外，需使用 `ProceedingJoinPoint`）。通过该参数可获取目标方法的签名、方法名、参数列表等运行时信息。

*   在 **前置通知（@Before）** 中，可通过 `JoinPoint.getArgs()` 获取实际参数并进行处理（如日志记录）。
    
*   在 **返回通知（@AfterReturning）** 中，可通过 `returning` 属性指定接收返回值的变量名，并在方法参数中声明对应类型的参数来接收该值。例如：
    

```java
@AfterReturning(pointcut = "logPointcut()", returning = "result")
public void afterReturning(JoinPoint joinPoint, Object result) { ... }
```

*   在 **异常通知（@AfterThrowing）** 中，可通过 `throwing` 属性指定异常参数名，并在方法形参中声明相应异常类型以捕获和处理异常。例如：
    

```java
@AfterThrowing(pointcut = "logPointcut()", throwing = "ex")
public void afterThrowing(JoinPoint joinPoint, Exception ex) { ... }
```

*   在 **环绕通知（@Around）** 中，必须使用 `ProceedingJoinPoint` 参数。通过调用 `proceed()` 或 `proceed(args)` 执行目标方法，并可对其前后逻辑进行控制，甚至修改参数或返回值。例如：
    

```java
@Around("logPointcut()")
public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
    // 前置逻辑
    Object result = joinPoint.proceed(); // 执行目标方法
    // 后置逻辑
    return result;
}
```
---

**切面优先级**：

当多个切面同时作用于同一个目标方法时，其执行顺序由优先级决定。

*   **理解方式**：切面的执行顺序以“内外层”关系描述：
    
    *   **高优先级切面**：位于外层，先开始执行，后结束执行。
        
    *   **低优先级切面**：位于内层，后开始执行，先结束执行。
    
*   **控制方式**：使用 `@Order` 注解指定一个整数值，数值越小，优先级越高。
    

## 3、声明式事务

**事务回顾**：

数据库连接默认可能处于 `autocommit` 模式，即每条 SQL 语句执行后会立即自动提交，一旦提交便无法回滚。

在涉及多步操作的业务场景中（如银行转账），若未使用事务进行控制：第一步（扣款）成功并自动提交，而第二步（收款）因异常失败，则会导致数据不一致问题（例如资金“凭空消失”），从而违反事务的原子性要求。

---

**事务的ACID属性**：

原子性：一个事务包含多条语句，这些语句在逻辑上构成一个整体。若其中任意一条语句执行失败，则整个事务将无法提交，即要么所有操作全部成功提交，要么全部回滚。

一致性：事务的执行必须保证数据库从一个一致性的状态转换到另一个一致性的状态。

持久性：一旦事务成功提交，其对数据库所做的修改将永久保存，即使系统发生故障也不会丢失。

隔离性：多个事务并发执行时，彼此之间相互隔离，互不干扰。

---

**事务的并发问题**：

脏读：一个事务读取到了另一个事务未提交的修改。

不可重复读：在同一个事务中，两次读取同一行数据，但由于其他事务在此期间修改并提交了该行，导致两次读取结果不一致。

幻读：在同一个事务中，两次执行相同的范围查询，但由于其他事务在此期间插入或删除了符合条件的记录并提交，导致两次查询结果集的行数或内容不同。

---

**事务的隔离级别：**

读未提交（READ-UNCOMMITTED）：允许事务读取其他事务尚未提交的修改，可能导致脏读、不可重复读和幻读等所有并发问题。

读已提交（READ-COMMITTED）：允许事务读取其他事务已提交的修改，解决了脏读问题，但仍可能存在不可重复读和幻读的并发问题。

可重复读（REPEATABLE-READ）：保证在当前事务执行期间，其他事务不能修改当前事务所读取的数据，从而解决脏读和不可重复读问题，但在某些情况下仍可能出现幻读。

串行化（Serializable）：事务在执行过程中会对相关数据表进行锁定，禁止其他事务的修改操作，彻底避免并发问题，但并发性能最差，执行效率最低。

---

**声明式事务：**

声明式事务是指由Spring框架负责事务的开启与关闭、提交与回滚。我们只需在需要事务管理的方法上添加 `@Transactional` 注解，框架便会自动完成事务的管理。

**声明式事务的常用属性：**

*   **只读属性**：通过 `@Transactional(readOnly = true)` 标记仅执行查询操作的方法。该设置可向持久层（如 Hibernate）及数据库提示当前事务为只读，从而触发相应优化机制，例如跳过脏数据检查、使用只读数据库连接等，提升性能。
    
*   **超时属性**：使用 `@Transactional(timeout = 5)` 设置事务的最大执行时间（单位为秒）。若事务执行时间超过设定值，Spring 会主动回滚事务并抛出 `TransactionTimedOutException` 异常，防止长时间占用资源。
    
*   **隔离级别**：通过 `@Transactional(isolation = Isolation.READ_COMMITTED)` 指定事务的隔离级别，用于控制并发事务之间的数据可见性，有效避免脏读、不可重复读等问题。可根据实际需求选择不同的隔离级别。
    
*   **回滚规则**：通过 `rollbackFor` 和 `noRollbackFor` 属性配置事务的回滚行为。默认情况下，当方法抛出运行时异常（RuntimeException）或 Error 时，事务会自动回滚；而抛出编译时异常（checked exception）则不会触发回滚。通过设置 `rollbackFor` 可指定特定的编译时异常类型，使其也能触发事务回滚，从而实现更灵活的异常处理机制。
    
*   **传播行为**：  
    REQUIRED（默认值）：表示事务方法必须在事务环境中运行。如果当前存在事务，则加入该事务执行；如果当前不存在事务，则创建一个新的事务运行。  
    REQUIRES\_NEW：无论当前是否存在事务，都会启动一个新事务，并在新事务中执行方法。原有事务（如有）会被挂起，直到新事务完成。
    

---

**事务的底层原理：**

事务管理器负责具体的事务操作，其顶层接口为 `TransactionManager`，实际使用中常见的实现接口是 `DataSourceTransactionManager`。

**原理：** 基于 AOP 技术，拦截所有需要进行事务管理的方法调用，判断目标方法是否已被增强。对于被增强的方法，事务拦截器将创建事务信息对象，并通过事务管理器来负责事务的开启、提交和回滚操作。

---

**FactoryBean**：

Bean工厂允许第三方框架或技术通过实现 FactoryBean 接口并重写其抽象方法，以编程方式创建复杂的对象（例如需要多步初始化或依赖外部配置的对象），并将该对象注册为 Spring Bean。

---

**Bean作用域**：

Bean对象默认以单例（Singleton）方式由容器进行管理。我们可以通过在类上使用`@Scope`注解，并将其`value`属性设置为`"prototype"`，从而使IOC容器每次通过`getBean()`方法获取该Bean时都返回一个新的实例。

作用范围：被`@Component`注解标注的类，在框架运行时会于容器初始化过程中调用其无参构造方法完成实例化。同时，通过`@Autowired`注解实现的依赖注入也在此初始化阶段完成。当容器初始化完成后，即可调用该Bean对象所定义的业务方法。

---

Bean生命周期：

被 `@Component` 注解标注的类，在框架运行时会于容器初始化过程中通过调用其无参构造方法完成实例化。随后，通过 `@Autowired` 注解实现的依赖注入也在该阶段完成。接着，执行 Bean 后置处理器（BeanPostProcessor）的相关逻辑，即所谓的“外挂”处理。

之后，依次执行以下初始化操作：

1.  被 `@PostConstruct` 注解修饰的方法；
    
2.  实现 `InitializingBean` 接口并重写的 `afterPropertiesSet()` 方法；
    
3.  通过自定义注解配合切点表达式配置的 `initMethod` 所指定的方法。
    

完成上述初始化步骤后，再次执行 Bean 后置处理器（如 `postProcessAfterInitialization`）。至此，Bean 初始化完毕，容器启动完成，进入业务方法的调用阶段。

当容器准备关闭时，开始执行销毁逻辑，依次进行：

1.  被 `@PreDestroy` 注解修饰的方法；
    
2.  实现 `DisposableBean` 接口并重写的 `destroy()` 方法；
    
3.  通过自定义注解配合切点表达式配置的 `destroyMethod` 所指定的方法。最终，容器完全关闭。![5d00b0f1-1f7f-4c54-8aee-9f80753f2770.png](https://note-cdn.tongyi.com/note/0f6ef589b3f658480b9669bdf2183263/e825bfcc14ab474180f3f29e1826ec3c.png)
    

---

**循环依赖**：

在IOC容器中，如果A对象依赖B对象，而B对象又反过来依赖A对象，就会形成循环依赖。Spring Boot容器默认不允许这种循环依赖关系。若需解除该限制，可在配置文件中设置 `spring.main.allow-circular-references=true`，以允许A与B之间的相互依赖。然而，在实际开发中，这种做法并不推荐，应通过合理的设计避免循环依赖，从而保障代码的可维护性和系统的稳定性。

**三级缓存机制**：

*   一级缓存（singletonObjects，成品区）：存放已完全初始化并装配完成的单例Bean对象。
    
*   二级缓存（earlySingletonObjects，半成品区）：存放已创建但尚未完成属性注入和初始化的Bean对象。
    
*   三级缓存（singletonFactories，工厂区）：存放用于创建Bean的工厂对象，主要用于提前暴露Bean的引用，解决循环依赖问题。
    

**执行流程**：

在工厂区域中，首先创建了A对象，而A对象需要注入B对象。于是工厂生成了原始的A对象，并将其暂存于半成品区。接着，工厂开始创建B对象，B对象同样需要注入A对象。此时，工厂在半成品区发现了尚未完全初始化的原始A对象，便将其用于B对象的依赖注入，完成装配后将完整的B对象放入成品区。

随后，原始A对象需要注入B对象。由于B对象已在成品区中存在，工厂从中获取该实例，并完成A对象对B对象的装配，最终将完整的A对象也放入成品区。至此，A与B之间的循环依赖得以顺利解决。

双检查锁：

IoC 容器需要保证 bean 对象在默认情况下是单例的，因此同样需要采用双检查锁机制来确保单例的正确实现。

第一次检查（锁外判空）：在获取同步锁之前进行实例是否为 null 的判断，用于排除已创建实例的情况。这样可以避免不必要的线程进入同步块，减少线程在锁上的等待开销，提升性能。

第二次检查（锁内判空）：在获得同步锁之后，再次检查实例是否为 null。这是为了防止多个线程同时通过第一重检查后，重复创建实例，从而确保对象的单例性。

通过双重检查机制，既保证了线程安全，又提高了并发性能。

---

## 4、SpringMVC

**请求映射**：

@RequestMapping注解的value属性用于指定映射的路径，method属性用于指定映射的请求方法。例如

```java
@RequestMapping(value="/servlet",method=RequestMethod.GET)
public String test06() {
    return "ok get";
}
```

在Spring MVC中，可以简化带有 `method` 属性的 `@RequestMapping` 注解的书写方式，具体体现在以下四个注解：`@GetMapping`、`@PostMapping`、`@PutMapping` 和 `@DeleteMapping`。

---

**路径映射**：

*   精确匹配：在实际开发中经常使用。
    
*   模糊匹配：常用于拦截器中。
    
    *   `/*` 匹配单层路径。
        
    *   `/**` 匹配多层路径。
        

---

**Spring MVC 接收前端发送的数据**：

请求参数传参：在方法的形参列表中添加 `@RequestParam` 注解，其 `value` 属性值应与请求参数的变量名一致。示例如下：

```java
@RequestMapping("/student")
  public String getStudent(@RequestParam(value = "stuName") String stuName,
                           @RequestParam(value = "stuAge") String stuAge,
                           @RequestParam(value = "hobbies",required = false,defaultValue = "hobby1") String[] hobbies){
  System.out.println("stuName:"+stuName);
  System.out.println("stuAge:"+stuAge);
  System.out.println("hobbies:"+ Arrays.toString(hobbies));
  return Arrays.toString(hobbies);
}
```

除了通过注解进行请求映射外，我们还可以根据所需获取的数据定义一个实体类。这样，在方法的参数列表中只需声明该实体类的引用，框架便会自动将请求参数映射到实体类对应的字段上。

```java
@RequestMapping("/student2")
  public Student getStudent2(Student student){
  System.out.println("stuName:"+student.getStuName());
System.out.println("stuAge:"+student.getStuAge());
System.out.println("hobbies:"+ Arrays.toString(student.getHobbies()));
return student;
}
```

如果前端传入的数据为JSON格式，则需要在原有实体类参数前添加@RequestBody注解，以便正确解析传入的JSON数据。

---

**路径变量传参**：

通过路径变量传参的方式把数据发送给后端，后端接受数据需要在方法形参列表加入@PathVariable注解，value属性为传入的变量名。

```java
@RequestMapping("/student3/{stuName}/{stuAge}")
  public Student getStudent3(@PathVariable(value = "stuName") String stuName,
                             @PathVariable(value = "stuAge") Integer stuAge){
  return new Student(stuName,stuAge,new String[]{"hobby1","hobby2"});
}
```
---

**获取原生对象**：

SpringMVC 作为表现层框架，在实际开发中有时需要使用原生的 HttpServletRequest、HttpServletResponse、HttpSession 和 ServletContext 等对象。

对于 HttpServletRequest、HttpServletResponse 和 HttpSession，可以通过在控制器方法中声明形参的方式直接获取，SpringMVC 会自动将这些对象注入到方法参数中。

而 ServletContext 无法通过声明形参的方式直接获取，可通过以下两种方式获得：

\[1\] 通过原生 HttpServletRequest 或 HttpSession 对象获取。

\[2\] 使用 @Autowired 注解自动装配。

---

获取请求头或cookie的value值：

```java
@RequestMapping("/request/header")
  public String getHeader(@RequestHeader(value = "Accept") String header){
  System.out.println("header = " + header);
  return "success";
}
@RequestMapping("/cookie")
  public String getCookie(@CookieValue(value = "JSESSIONID") String cookie,
                          HttpSession session){
  System.out.println("cookie = " + cookie);
  return "success";
}
```
