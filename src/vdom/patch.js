// patch 是用来渲染和更新视图的。
export function patch(oldVnode, vnode) {
  if (!oldVnode) {
    return createElement(vnode);
  }

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
  } else {
    if (oldVnode.tag !== vnode.tag) { // 当新旧元素完全不一样的时候，直接渲染新的去替换。
      oldVnode.el.parentNode.replaceChild(createElement(vnode), oldVnode.el);
    } else if (!oldVnode.tag) { // 是文本元素且标签一致的时候
      if (oldVnode.text != vnode.text) {
        oldVnode.el.textContent = vnode.text;
      }
    } else if (oldVnode.tag == vnode.tag) { // 是同一个元素
      let el = vnode.el = oldVnode.el; // 此时新旧节点上的el都是一个元素。
      updateProperties(vnode, oldVnode.data); // 更新属性

      let oldChildren = oldVnode.children || [],
        newChildren = vnode.children || [];
      if (oldChildren.length > 0 && newChildren.length > 0) {
        updateChildren(el, oldChildren, newChildren);
      } else if (oldChildren.length > 0) {
        el.innerHTML = '';
      } else {
        for (let child in newChildren) {
          el.appendChild(createElement(child));
        }
      }
    }
  }
}

function createComp(vnode) {
  let i = vnode.data;
  if ((i = i.hook) && (i = i.init)) {
    i(vnode);
  }
  if (vnode.componentInstance) {
    return true;
  }
}

function createElement(vnode) {
  let { tag, data, key, children, text } = vnode;

  if (typeof tag == 'string') { // 元素节点
    if (createComp(vnode)) { // 如果是个组件元素
      return vnode.componentInstance.$el;
    }

    // 真实创建的元素会挂在虚拟节点el的属性上。
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

function updateProperties(vnode, oldProps = {}) {
  // 更新属性，将新元素没有的属性全移除，新元素有的后面会设置上去。
  let { el, data: newProps = {} } = vnode;

  // console.log(vnode);
  // console.log(el, '81')
  // 先对oldnode的属性进行移除
  for (let k in oldProps) {
    if (!newProps[k]) {
      el.removeAttribute(k);
    }
  }

  let oldStyle = oldProps.style || [];
  let newStyle = vnode.style || [];
  for (let s in oldStyle) {
    if (!newStyle[s]) {
      el.style[s] = '';
    }
  }

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

function isSameNode(oldVnode, newVnode) { // 判断是否是同一个元素，通过节点的tag和key判断。
  return oldVnode.tag == newVnode.tag && oldVnode.key == newVnode.key;
}

function makeIndexByKey(oldCh) {
  let map = {};
  oldCh.forEach((item, i) => {
    map[item.key] = i;
  })
  return map;
}

function updateChildren(parent, oldCh, newCh) {
  let oldStartIndex = 0; //老儿子的起始下标
  let oldStartVnode = oldCh[oldStartIndex]; //老儿子的第一个节点
  let oldEndIndex = oldCh.length - 1; //老儿子的结束下标
  let oldEndVnode = oldCh[oldEndIndex]; //老儿子的起结束节点
  let map = makeIndexByKey(oldCh);

  let newStartIndex = 0; //同上  新儿子的
  let newStartVnode = newCh[newStartIndex];
  let newEndIndex = newCh.length - 1;
  let newEndVnode = newCh[newEndIndex];

  // 当newNode和oldNode刚好对比完的时候，startIndex都应该大于endIndex。
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {

    if (!oldStartVnode) { // 如果节点不存在可能是因为移动置空了，所以将节点往后走
      oldStartVnode = oldCh[++oldStartIndex];
    } else if (!oldEndVnode) {
      oldEndVnode = oldCh[--oldEndIndex];
    }
    else if (isSameNode(oldStartVnode, newStartVnode)) { // 当旧开始节点和新开始节点一致的时候
      patch(oldStartVnode, newStartVnode); // 对比更新属性更新children。
      oldStartVnode = oldCh[++oldStartIndex];
      newStartVnode = newCh[++newStartIndex];
    } else if (isSameNode(oldEndVnode, newEndVnode)) { // 当旧开始节点和新开始节点一致的时候
      patch(oldEndVnode, newEndVnode); // 对比更新属性更新children。
      oldEndVnode = oldCh[--oldEndIndex];
      newEndVnode = newCh[--newEndIndex];
    } else if (isSameNode(oldStartVnode, newEndVnode)) {
      // 老的开始节点和新的最后节点相同
      patch(oldStartVnode, newEndVnode);
      // 把老的开始节点放到最后的位置上
      parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
      oldStartVnode = oldCh[++oldStartIndex];
      newEndVnode = newCh[--newEndIndex];
    } else if (isSameNode(oldEndVnode, newStartVnode)) {
      patch(oldEndVnode, newStartVnode);
      parent.insertBefore(oldEndVnode.el, oldStartVnode.el);
      oldEndVnode = oldCh[--oldEndIndex];
      newStartVnode = newCh[++newStartIndex];
    } else {
      // 暴力对比
      let moveIndex = map[newStartVnode.key];
      if (!moveIndex) {
        // 在旧节点中没有相同的新节点，就创建元素插到指定位置。
        parent.insertBefore(createElement(newStartVnode), oldStartVnode.el);
        newStartVnode = newCh[++newStartIndex];
      } else {
        // 在旧节点中找到了相同的新元素，把找到的元素移动到指定位置并将旧节点集合指定索引位置设为undefined。
        let moveNode = oldCh[moveIndex];
        patch(moveNode, newStartVnode);
        parent.insertBefore(moveEle.el, oldStartVnode.el);
        oldCh[moveIndex] = undefined;
        newStartVnode = newCh[++newStartIndex];
      }
    }
  }

  if (newStartIndex <= newEndIndex) { // 说明新节点中还有元素没被插到页面中。
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      const ele = createElement(newCh[i]);
      const nextEle = newCh[newEndIndex + 1] ? newCh[newEndIndex + 1].el : null;
      parent.insertBefore(ele, nextEle);
      // 当insertBefore 的第二个参数为null的时候，就等同于appendChild。
    }
  }

  if (oldStartIndex <= oldEndIndex) { // 说明旧节点多了，需要被移除。

  }

}