export function serializableProperties(source) {
  let target = {};

  for (let key of Object.keys(source)) {
    if (['string', 'number', 'boolean'].includes(typeof source[key])) {
      target[key] = source[key];
    }
  }

  return target;
}

export function findMenuFromItem(menuItem, { items = [] }) {
  for (let item of items) {
    if (item.id === menuItem.id) return items;

    if (item.submenu) {
      let found = findMenuFromItem(menuItem, item.submenu);
      if (found) return found;
    }
  }
}
