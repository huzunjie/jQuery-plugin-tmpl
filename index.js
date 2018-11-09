
 /* 为jQuery实现 $.tmpl 模板解析方法 -- 来自Qwrap
 */
(function() {

    var tmpl = (function() {
        var tmplFuns={};
        var sArrName = "sArrCMX",
            sLeft = '\n'+sArrName + '.push("';
        var tags = {
            '=': {
                tagG: '=',
                isBgn: 1,
                isEnd: 1,
                sBgn: '",$.encode4HtmlValue(',
                sEnd: '),"'
            },
            'js': {
                tagG: 'js',
                isBgn: 1,
                isEnd: 1,
                sBgn: '");\n',
                sEnd: ';' + sLeft
            },
            //任意js语句, 里面如果需要输出到模板，用print("aaa");
            'if': {
                tagG: 'if',
                isBgn: 1,
                rlt: 1,
                sBgn: '");\nif',
                sEnd: '{' + sLeft
            },
            //if语句，写法为{if($a>1)},需要自带括号
            'elseif': {
                tagG: 'if',
                cond: 1,
                rlt: 1,
                sBgn: '");\n} else if',
                sEnd: '{' + sLeft
            },
            //if语句，写法为{elseif($a>1)},需要自带括号
            'else': {
                tagG: 'if',
                cond: 1,
                rlt: 2,
                sEnd: '");\n}else{' + sLeft
            },
            //else语句，写法为{else}
            '/if': {
                tagG: 'if',
                isEnd: 1,
                sEnd: '");\n}' + sLeft
            },
            //endif语句，写法为{/if}
            'for': {
                tagG: 'for',
                isBgn: 1,
                rlt: 1,
                sBgn: '");\nfor',
                sEnd: '{' + sLeft
            },
            //for语句，写法为{for(var i=0;i<1;i++)},需要自带括号
            '/for': {
                tagG: 'for',
                isEnd: 1,
                sEnd: '");\n}' + sLeft
            },
            //endfor语句，写法为{/for}
            'while': {
                tagG: 'while',
                isBgn: 1,
                rlt: 1,
                sBgn: '");\nwhile',
                sEnd: '{' + sLeft
            },
            //while语句,写法为{while(i-->0)},需要自带括号
            '/while': {
                tagG: 'while',
                isEnd: 1,
                sEnd: '");\n}' + sLeft
            } //endwhile语句, 写法为{/while}
        };
        return function(sTmpl, opts) {
            var fun  = tmplFuns[sTmpl];
            if (!fun) {
                var N = -1,
                    NStat = []; //语句堆栈;
                var ss = [
                    [/`([\w$\[\]\x22\x27\.]+)/g, '$1'], //undefined输出为""
                    [/\{strip\}([\s\S]*?)\{\/strip\}/g, function(a, b) {
                        return b.replace(/[\r\n]\s*\}/g, " }").replace(/[\r\n]\s*/g, "");
                    }],
                    [/\\/g, '\\\\'],
                    [/\x22/g, '\\"'],
                    [/\r/g, '\\r'],
                    [/\n/g, '\\n'], //为js作转码.
                    [
                        /\{[\s\S]*?\S\}/g, //js里使用}时，前面要加空格。
                        function(a) {
                            a = a.substr(1, a.length - 2);
                            for (var i = 0; i < ss2.length; i++) {a = a.replace(ss2[i][0], ss2[i][1]); }
                            var tagName = a;
                            if (/^(=|.\w+)/.test(tagName)) {tagName = RegExp.$1; }
                            var tag = tags[tagName];
                            if (tag) {
                                if (tag.isBgn) {
                                    var stat = NStat[++N] = {
                                        tagG: tag.tagG,
                                        rlt: tag.rlt
                                    };
                                }
                                if (tag.isEnd) {
                                    if (N < 0) {throw new Error("Unexpected Tag: " + a); }
                                    stat = NStat[N--];
                                    if (stat.tagG != tag.tagG) {throw new Error("Unmatch Tags: " + stat.tagG + "--" + tagName); }
                                } else if (!tag.isBgn) {
                                    if (N < 0) {throw new Error("Unexpected Tag:" + a); }
                                    stat = NStat[N];
                                    if (stat.tagG != tag.tagG) {throw new Error("Unmatch Tags: " + stat.tagG + "--" + tagName); }
                                    if (tag.cond && !(tag.cond & stat.rlt)) {throw new Error("Unexpected Tag: " + tagName); }
                                    stat.rlt = tag.rlt;
                                }
                                return (tag.sBgn || '') + a.substr(tagName.length) + (tag.sEnd || '');
                            } else {
                                return '",(' + a + '),"';
                            }
                        }
                    ]
                ];
                var ss2 = [
                    [/\\n/g, '\n'],
                    [/\\r/g, '\r'],
                    [/\\\x22/g, '"'],
                    [/\\\\/g, '\\'],
                    [/\$(\w+)/g, 'opts["$1"]'],
                    [/print\x28/g, sArrName + '.push(']
                ];
                for (var i = 0; i < ss.length; i++) {
                    sTmpl = sTmpl.replace(ss[i][0], ss[i][1]);
                }
                if (N >= 0) {throw new Error("Lose end Tag: " + NStat[N].tagG); }
                sTmpl = sTmpl.replace(/##7b/g,'{').replace(/##7d/g,'}').replace(/##23/g,'#'); //替换特殊符号{}#
                sTmpl = 'var ' + sArrName + '=[], '
                        + 'inc = $.tmplBySelector; ' //让模板中支持inc(selector,data)
                        + sLeft + sTmpl + '");\n'
                        + 'return ' + sArrName + '.join("");';
                        
                // sTmpl = 'with(opts){'+sTmpl+'}';
                //alert('转化结果\n'+sTmpl);
                tmplFuns[sTmpl] = fun = new Function('opts', sTmpl);
            }
            if (arguments.length > 1) {return fun(opts); }
            return fun;
        };
    })();

    $.tmplBySelector = function(selector,data){
        var tmplFun = tmpl($(selector).html()||"[undefined selector ('"+selector+"')]");
        return data==undefined?tmplFun:tmplFun(data);
    };
    $.extend({
        /**
         * 将HTML转码为文本(tmpl插件中有用到)
         * @param {String} str 要转码的目标字串
         * @returns {String} 转码后的字串
         */
        encode4Html: function(str) {
            var el = document.createElement('pre'); //这里要用pre，用div有时会丢失换行，例如：'a\r\n\r\nb'
            var text = document.createTextNode(str);
            el.appendChild(text);
            return el.innerHTML;
        },
        /**
         * 将HTML转码为文本框文本(tmpl插件中有用到)
         * @param {String} str 要转码的目标字串
         * @returns {String} 转码后的字串
         */
        encode4HtmlValue: function(str) {
            return $.encode4Html(str).replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        },
        encode4JSHtml: function(str) {
            return $.encode4Html(str.replace(/\\/g, "\\\\").replace(/"/g, '\\\"'));
        }
    });
    return $.tmpl = tmpl;
})();
