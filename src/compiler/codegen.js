const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //匹配花括号 {{  }} 捕获花括号里面的内容

// 解析节点
function gen(node) {
  if (node.type == 1) {
    return generate(node);
  }

  let { text } = node;
  // 普通文本
  if (!defaultTagRE.test(text)) {
    return `_v(${text})`;
  }
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
      value = JSON.stringify(obj);
    }
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
  return `_c(${tagName} ,${genProps(attrs)},${getChildren(childrens)})`
  console.log(node, '14')
}


export { generate, gen };