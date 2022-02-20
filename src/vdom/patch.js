// patch 是用来渲染和更新视图的。
export function patch(oldVnode, vnode) {
  let isRealElement = oldVnode.nodeType;
  if (isRealElement) {
    // 先将虚拟节点转化为真实的dom元素
    // 利用原来元素的位置插入生成的真实dom元素（父节点，兄弟节点，insertBefore）
    // 再删除原来元素
    let oldEle = oldVnode;
    let parentEle = oldEle.parentNode;
    let el = createElement(vnode);
    parentEle.insertBefore(el, oldEle.nextSibling); // 使用insertBefore是为了不破换位置。
    parentEle.removeChild(oldEle);
    return el;
  }
}

function createElement(vnode) {
  let { tag, data, key, children, text } = vnode;
  if (typeof tag == 'string') { // 元素节点
    vnode.el = document.createElement(tag);
    updateProperties(vnode); // 更新属性
    children ? children.forEach((child) => {
      return vnode.el.appendChild(createElement(child));
      // appendChild 插入一个子元素。返回插入的元素。
    }) : '';
  } else {  // 文本节点
    vnode.el = document.createTextNode(text);
  }

  return vnode.el;
}

function updateProperties(vnode) {
  let { el, data: newProps = {} } = vnode;
  for (let attr in newProps) {
    let val = newProps[attr];
    if (attr == 'style') {
      for (let styleName in val) {
        el.style[styleName] = val[styleName];
      }
    } else if (attr == 'class') {
      el.className = val;
    } else {
      el.setAttribute(attr, val);
    }
  }
}