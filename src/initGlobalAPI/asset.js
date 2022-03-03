const ASSETS_TYPE = ["component", "directive", "filter"];

export default function initAssetRegisters(Vue) {
  ASSETS_TYPE.forEach(type => {
    Vue[type] = function (id, definition) {
      if (type === 'component') {
        definition = this.options._base.extend(definition);
      }
      this.options[type + 's'][id] = definition;
    }
  })
}

// Vue.component() 方法创建一个组件子类，并放到Vue的options的components 集合中。