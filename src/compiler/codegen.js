const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //匹配花括号 {{  }} 捕获花括号里面的内容

// 解析节点
function gen(node) {
  if (node.type == 1) {
    return generate(node);
  }

  let { text } = node;
  // 普通文本
  if (!defaultTagRE.test(text)) {
    return `_v(${JSON.stringify(text)})`;
  }

  let lastIndex = defaultTagRE.lastIndex = 0;
  let exec, tokens = [];
  while ((exec = defaultTagRE.exec(text))) {
    let index = exec.index;
    if (index > lastIndex) {
      tokens.push(JSON.stringify(text.slice(lastIndex, index)));
    }
    tokens.push(`_s(${exec[1].trim()})`);
    lastIndex = index + exec[0].length;
  }
  if (lastIndex < text.length) {
    tokens.push(JSON.stringify(text.slice(lastIndex)));
  }
  let str = `_v(${tokens.join('+')})`;
  return str;
}

function genProps(attrs) {
  if (!attrs.length) return 'undefined';
  let str = '';
  for (let i = 0; i < attrs.length; i++) {
    let { name, value } = attrs[i];
    if (name == 'style') {
      let obj = {};
      value = value.split(';');
      value.map(item => {
        if (item) {
          let [key, val] = item.split(':');
          obj[key] = val;
        }
      })
      value = obj;
    }
    value = JSON.stringify(value);
    str += `${name}:${value},`;
  }
  str = `{${str.slice(0, str.length - 1)}}`
  return str;
}

function getChildren(childrens) {
  if (!childrens.length) return '';
  return (childrens.map(child => gen(child))).join(',');
}

// 元素节点
function generate(node) {
  let { tagName, attrs, childrens } = node;
  return `_c('${tagName}' ,${genProps(attrs)},${getChildren(childrens)})`
}


export { generate };