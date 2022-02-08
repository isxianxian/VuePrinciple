export function isObject(object) {
   return typeof object === 'object' && object !== null;
}

export function def(obj, key, val) {
   Object.defineProperty(obj, key, {
      enumerable: false,
      configurable: false,
      value: val,
   })
}