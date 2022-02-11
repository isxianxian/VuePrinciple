// 以下为源码的正则  
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; //匹配标签名 形如 abc-123
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //匹配特殊标签 形如 abc:234 前面的abc:可有可无
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配标签开始 形如 <abc-123 捕获里面的标签名
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束  >
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾 如 </abc-123> 捕获里面的标签名
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性  形如 id="app"

let root, // 根元素
  currentParent, // 当前父元素
  stack = []; // 元素堆栈
const TEXT_TYPE = 3;
const ELEMENT_TYPE = 1;

function handleChars(text) {
  // 文本去掉空格
  text = text.replace(/\s/g, '');
  if (text) {
    currentParent.childrens.push({
      text,
      type: TEXT_TYPE,
    })
  }
}

// 处理开始标签
function handleStartTag({ tagName, attrs }) {
  let element = createASTElement({ tagName, attrs });
  if (!root) {
    root = element;
  }
  currentParent = element;
  stack.push(element);
}

// 处理结束标签
function handleEndTag() {
  let element = stack.pop();
  currentParent = stack[stack.length - 1];
  if (currentParent) {
    element.parent = currentParent;
    currentParent.childrens.push(element);
  }
}

// 创建元素的ast结构
function createASTElement({ tagName, attrs }) {
  return {
    tagName,
    attrs,
    type: ELEMENT_TYPE,
    childrens: [],
    parent: null,
  }
}


function parse(html) {

  while (html) {
    let htmlIndex = html.indexOf('<');

    if (htmlIndex == 0) {
      let match = parseStartTag();
      if (match) {
        handleStartTag(match);
        continue;
      }

      let endTagMatch = html.match(endTag);
      if (endTagMatch) {
        advance(endTagMatch[0].length);
        handleEndTag(endTagMatch);
        continue;
      }
    }

    let text;
    if (htmlIndex >= 0) {
      text = html.substring(0, htmlIndex);
    }
    if (text) {
      advance(htmlIndex);
      handleChars(text);
    }


  }

  return root;

  // 处理开始标签
  function parseStartTag() {
    let start = html.match(startTagOpen); // match 的返回值是数组或null

    if (start) {
      let match = {
        tagName: start[1],
        attrs: []
      }
      advance(start[0].length);

      let attr, end;
      // && 有执行优先级的。
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        advance(attr[0].length);
        attr = {
          name: attr[1],
          value: attr[3] || attr[4] || attr[5]
        }
        match.attrs.push(attr);
      }

      if (end) {
        advance(end[0].length);
      }

      return match;
    }

  }

  // 字符串前进n个
  function advance(n) {
    html = html.substring(n);
  }
}



export { parse };

