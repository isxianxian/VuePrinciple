const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //匹配花括号 {{  }} 捕获花括号里面的内容

// 解析节点
function gen(node) {
  let { type } = node;
  if (type == 1) { // 如果是元素的话，直接创建一个元素字符串
    return generate(node);
  }
  // 文本，需要判断是普通文本还是{{ 变量 }}
  let { text } = node;
  if (!defaultTagRE.test(text)) {
    return `_v(${JSON.stringify(text)})`;
  }

  // 重置正则匹配位置
  let lastIndex = (defaultTagRE.lastIndex = 0);
  let tokens = [];
  let match, index;

  while ((match = defaultTagRE.exec(text))) {
    index = match.index;
    if (index > lastIndex) {
      tokens.push(JSON.stringify(text.slice(lastIndex, index)));
    }
    tokens.push(`_s(${match[1].trim()})`);
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    tokens.push(JSON.stringify(text.slice(lastIndex)));
  }
  let s = `_v(${tokens.join('+')})`;
  return s;
}

function genProps(attrs) {
  if (!attrs.length) return 'undefined';
  let obj = {};

  for (let i = 0; i < attrs.length; i++) {
    let { name, value } = attrs[i];
    if (name == 'style') {
    }
    obj[name] = value;
  }

  return obj;
}

function getChildren(el) {
  let { childrens } = el;
  if (!childrens.length) return ""; // 如果没有子元素，返回空字符串
  let res = (childrens.map(child => {
    return gen(child);
  }))
  return res.join(',');
}

function generate(el) {
  let children = getChildren(el);
  let attr = genProps(el.attrs);
  return `_c('${el.tagName}' , ${attr} , ${children})`;
}


export { generate };