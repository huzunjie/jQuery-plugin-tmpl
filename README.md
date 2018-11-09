# jQuery-plugin-tmpl
jQuery模板插件
{info}省略\[data\]参数，则返回一个编译后可执行的tmpl方法；如果两个参数齐全，则直接返回处理替换后的输出字串。{info}
{toc}

h4. 用法示例

h5. 示例1-模板复用+数据对象

{code:lang=javascript}
var tmplFun = $.tmpl('<div>{$name}</div>');

tmplFun({name:'测试'});
//输出：'<div>测试</div>'

{code}

h5. 示例2-模板复用+字符串值

{code:lang=javascript}
var tmplFun2 = $.tmpl('<div>{opts}</div>');

tmplFun2('测试');
//输出：'<div>测试</div>'

{code}

h5. 示例3-单例模板+字符串值

{code:lang=javascript}
$.tmpl('<div>{opts}</div>','测试');
//输出：'<div>测试</div>'

{code}

h5. 副产品-快捷方法 $.tmplBySelector(selector\[,data\])

{code:lang=javascript}
//直接通过设定的选择器标识读取对应模板内容
var retStr = $.tmplBySelector(selector[,data]);

{code}

h4. 模板语法


h5. 定界符

{code:lang=html}
模板中变量以{$aaa}表示，相当于opts['aaa']。

{code}

h5. 字符转义

{code:lang=html}
模板里的字符'{'用'##7b'表示
模板里的实体'}'用'##7d'表示
模板里的实体'#'可以用'##23'表示。
例如：模板真的需要输出'##7d'，则需要这么写'##23#7d'

{code}

h5. 注意事项

{code:lang=html}
定界分隔符为{xxx}，'}'之前没有空格字符。

js表达式/js语句里的'}', 需使用' }'，即前面有空格字符

{}里只能使用表达式，不能使用语句，除非使用模板标记
{code}

h5. 模板标记

{code:lang=html}
{strip}...{/strip}里的所有\r\n打头的空白都会被清除掉

{js ...}                －－任意js语句, 里面如果需要输出到模板，用print('aaa');

{if($a>1)}              －－if语句,需要自带括号
{elseif($a<0)}          －－elseif语句，需要自带括号
{else}                  －－else语句
{/if}                   －－endif语句

{for(var i=0;i<1;i++)}  －－for语句，需要自带括号
{/for}                  －－endfor语句

{while(i-->0)}          －－while语句,需要自带括号
{/while}                －－endwhile语句

{code}

h5. 快捷方法

h6. inc

{code:lang=html}
//使用inc方法输出子模板：
{inc(selector,$item)}
相当于：
{js var str=$.tmplBySelector(selector,$item);}
{str}

{code}

h6. type

{code:lang=html}
//使用type方法取得对象类型：
{type($item)}
相当于：
{js var type=$.type;}
{type($item)}

{code}

h6. ' = '

{code:lang=html}
//使用'='标记转义HTML标签为字符串：
{=$item}
相当于：
{js var newStr=$.encode4HtmlValue($item);}
{newStr}
