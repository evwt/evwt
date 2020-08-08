import { screen, BrowserWindow, ipcRenderer, Menu, ipcMain, app } from 'electron';

function getNonOverlappingBounds(rect, bounds) {
  let newX = rect.x;
  let newY = rect.y;
  let newWidth = rect.width;
  let newHeight = rect.height;

  let workArea = screen.getDisplayMatching(bounds).workArea;
  let overlap = getOverlap(bounds, workArea);

  if (overlap.height > 50 && overlap.width > 50 && bounds.y > workArea.y) {
    newX = bounds.x;
    newY = bounds.y;
  }

  if (bounds.width <= workArea.width || bounds.height <= workArea.height) {
    newWidth = bounds.width;
    newHeight = bounds.height;
  }

  return {
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight
  };
}

function getOverlap(rectA, rectB) {
  let intersectX1 = Math.max(rectA.x, rectB.x);
  let intersectX2 = Math.min(rectA.x + rectA.width, rectB.x + rectB.width);

  if (intersectX2 < intersectX1) {
    return;
  }

  let intersectY1 = Math.max(rectA.y, rectB.y);
  let intersectY2 = Math.min(rectA.y + rectA.height, rectB.y + rectB.height);

  if (intersectY2 < intersectY1) {
    return;
  }

  return {
    x: intersectX1,
    y: intersectY1,
    width: intersectX2 - intersectX1,
    height: intersectY2 - intersectY1
  };
}

const debounce = require('lodash/debounce');
const Store = require('electron-store');

let store = new Store({
  name: 'evwt-ui-state'
});

const EvWindow = {
  startStoringOptions,
  getStoredOptions,
  arrange
};

const BOUNDS_AUTOSAVE_INTERVAL = 200;
const BOUNDS_AUTOSAVE_PREFIX = 'evwindow.bounds';

/**
 *
 *
 * @param {String} restoreId - A unique ID for the window. For single-window apps, this can be anything. For multi-window apps, give each window a unique ID.
 * @param {BrowserWindow} win - https://www.electronjs.org/docs/api/browser-window
 */
function startStoringOptions(restoreId, win) {
  if (!win || !win.getNormalBounds) {
    console.log('[EvWindow] Invalid window passed, not storing');
    return;
  }

  if (!restoreId || typeof restoreId !== 'string' || !restoreId.length) {
    console.log('[EvWindow] Invalid restoreId passed, not storing');
    return;
  }

  let sanitizedRestoreId = Buffer.from(restoreId, 'binary').toString('base64');

  let saveBounds = debounce(() => {
    store.set(`${BOUNDS_AUTOSAVE_PREFIX}.${sanitizedRestoreId}`, win.getNormalBounds());
  }, BOUNDS_AUTOSAVE_INTERVAL);

  win.on('resize', saveBounds);
  win.on('move', saveBounds);
}

/**
 *
 * Arranges windows on the screen.
 * @param {String} arrangement - `tile`, `cascade`, `rows` or `columns`
 */
function arrange(arrangement) {
  if (arrangement === 'tile') {
    tile();
  } else
  if (arrangement === 'cascade') {
    cascade();
  } else
  if (arrangement === 'rows') {
    rows();
  } else
  if (arrangement === 'columns') {
    columns();
  }
}

/**
 *
 *
 * @param {String} restoreId - A unique ID for the window. For single-window apps, this can be anything. For multi-window apps, give each window a unique ID.
 * @param {Object} defaultOptions - https://www.electronjs.org/docs/api/browser-window#new-browserwindowoptions
 */
function getStoredOptions(restoreId, defaultOptions) {
  if (!defaultOptions) {
    console.log('[EvWindow] defaultOptions not passed, skipping');
    return;
  }

  if (!restoreId || typeof restoreId !== 'string' || !restoreId.length) {
    console.log('[EvWindow] Invalid restoreId passed, skipping');
    return;
  }

  let sizeOptions = {};

  let sanitizedRestoreId = Buffer.from(restoreId, 'binary').toString('base64');
  let savedBounds = store.get(`${BOUNDS_AUTOSAVE_PREFIX}.${sanitizedRestoreId}`);

  if (savedBounds) {
    sizeOptions = getNonOverlappingBounds(defaultOptions, savedBounds);
  }

  return sizeOptions;
}

function cascade() {
  let { workArea } = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  let windows = BrowserWindow.getAllWindows();
  let maxWidth = 0;
  let maxHeight = 0;

  // Loop through all windows, placing them at the top/left of where
  // the biggest window would be if it were centered, +32/32 pixels for each
  for (let win of windows) {
    let size = win.getSize();
    if (size[0] > maxWidth) maxWidth = size[0];
    if (size[1] > maxHeight) maxHeight = size[1];
  }

  let centerOfWidestWin = maxWidth / 2;
  let middleOfTallestWin = maxHeight / 2;
  let centerOfScreen = workArea.width / 2;
  let middleOfScreen = workArea.height / 2;
  let topOfTallest = middleOfScreen - middleOfTallestWin;
  let sideOfWidest = centerOfScreen - centerOfWidestWin;

  for (let idx = 0; idx < windows.length; idx++) {
    let win = windows[idx];
    let newX = Math.round(sideOfWidest + (32 * idx));
    let newY = Math.round(topOfTallest + (32 * idx));
    win.setPosition(newX, newY, false);
    win.focus();
  }
}

function tile() {
  let { workArea } = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  let windows = BrowserWindow.getAllWindows();
  let numRows = Math.ceil(Math.sqrt(windows.length));
  let numCols = Math.round(Math.sqrt(windows.length));

  let heightOfEach = parseInt(workArea.height / numRows);
  let widthOfEach = parseInt(workArea.width / numCols);
  let leftOverHeight = workArea.height % numRows;
  let leftOverWidth = workArea.width % numCols;

  for (let idxRow = 0; idxRow < numRows; idxRow++) {
    for (let idxCol = 0; idxCol < numCols; idxCol++) {
      let winIdx = (idxRow * numCols) + idxCol;
      let win = windows[winIdx];

      if (!win) continue;

      let newWidth = widthOfEach;
      let newHeight = heightOfEach;

      if (idxRow === numRows - 1) {
        newHeight += leftOverHeight;
      }

      if (idxCol === numCols - 1) {
        newWidth += leftOverWidth;
      }

      win.setSize(newWidth, newHeight, false);
      let newX = Math.round((widthOfEach * idxCol) + workArea.x);
      let newY = Math.round((heightOfEach * idxRow) + workArea.y);
      win.setPosition(newX, newY, false);
    }
  }
}

function rows() {
  let { workArea } = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  let windows = BrowserWindow.getAllWindows();
  let heightOfEach = parseInt(workArea.height / windows.length);
  let leftOverHeight = workArea.height % windows.length;

  for (let idx = 0; idx < windows.length; idx++) {
    let win = windows[idx];

    if (idx === windows.length - 1) {
      win.setSize(workArea.width, heightOfEach + leftOverHeight, false);
      win.focus();
    } else {
      win.setSize(workArea.width, heightOfEach, false);
    }

    let newY = Math.round((heightOfEach * idx) + workArea.y);
    win.setPosition(workArea.x, newY, false);
  }
}

function columns() {
  let { workArea } = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  let windows = BrowserWindow.getAllWindows();
  let widthOfEach = parseInt(workArea.width / windows.length);
  let leftOverWidth = workArea.width % windows.length;

  for (let idx = 0; idx < windows.length; idx++) {
    let win = windows[idx];

    if (idx === windows.length - 1) {
      win.setSize(widthOfEach + leftOverWidth, workArea.height, false);
      win.focus();
    } else {
      win.setSize(widthOfEach, workArea.height, false);
    }

    let newX = Math.round((widthOfEach * idx) + workArea.x);
    win.setPosition(newX, workArea.y, false);
  }
}

const EvMenu = {
  activate,
  attach
};

//
// This is the Vue/renderer portion of EvMenu
//

EvMenu.install = function (Vue, menuDefinition) {
  let menuVm = new Vue({
    data() {
      return {
        menu: Vue.observable(menuDefinition)
      };
    },

    watch: {
      menu: {
        deep: true,
        immediate: true,
        handler(newMenu) {
          ipcRenderer.invoke('evmenu:ipc:set', newMenu);
        }
      }
    },

    async created() {
      // evmenu:ipc:set will return a built menu with all the details,
      // as opposed to just the definition
      this.menu = await ipcRenderer.invoke('evmenu:ipc:set', menuDefinition);

      this.handleClick();
      this.handleFocus();
      this.listenIpc();

      this.$emit('ready');
    },

    methods: {
      get(id) {
        return this.findMenuItem(this.menu, id);
      },

      findMenuItem(items, id) {
        if (!items) { return; }

        for (let item of items) {
          if (item.id === id) return item;

          if (item.submenu) {
            let child = this.findMenuItem(item.submenu, id);
            if (child) return child;
          }
        }
      },

      handleFocus() {
        window.addEventListener('focus', () => {
          ipcRenderer.invoke('evmenu:ipc:set', this.menu);
        });
      },

      handleClick() {
        this.$on('click', command => {
          let menuItem = this.get(command);

          this.$emit(`input:${command}`, menuItem);
          this.$emit('input', menuItem);
          ipcRenderer.send('evmenu:ipc:click', menuItem);
        });
      },

      listenIpc() {
        ipcRenderer.on('evmenu:ipc:input', (event, payload) => {
          let menuItem = this.get(payload.id);

          for (let key of Object.keys(payload)) {
            menuItem[key] = payload[key];
          }

          this.$emit('input', payload);
          this.$emit(`input:${payload.id}`, payload);
        });
      }
    }
  });

  Vue.prototype.$evmenu = menuVm;
};

//
// This is the Electron/main portion of EvMenu
//

function decorateMenu(menuItem, builtMenu) {
  // This removes the click handler which can't be serialized for IPC
  delete menuItem.click;

  if (menuItem.id) {
    let builtMenuItem = findBuiltMenuItem(builtMenu.items, menuItem.id);

    // This adds properties from the built menu onto the menu definition
    for (let key of Object.keys(builtMenuItem)) {
      if (['string', 'number', 'boolean'].includes(typeof builtMenuItem[key])) {
        menuItem[key] = builtMenuItem[key];
      }
    }
  }

  if (menuItem.submenu) {
    for (let item of menuItem.submenu) {
      decorateMenu(item, builtMenu);
    }
  }
}

function findBuiltMenuItem(items, id) {
  if (!items) { return; }

  for (let item of items) {
    if (item.id === id) return item;

    if (item.submenu && item.submenu.items) {
      let child = findBuiltMenuItem(item.submenu.items, id);
      if (child) return child;
    }
  }
}

function onIpcClick(e, payload) {
  let sender = BrowserWindow.fromWebContents(e.sender);

  app.emit('evmenu', payload);
  app.emit(`evmenu:${payload.id}`, payload);
  sender.emit('evmenu', payload);
  sender.emit(`evmenu:${payload.id}`, payload);
}

function onIpcSet(e, definition) {
  if (!definition) {
    console.log('[EvMenu] No definition to build menu from');
    return;
  }

  EvMenu.menu = Menu.buildFromTemplate(buildMenuTemplate(definition));

  for (let item of definition) {
    decorateMenu(item, EvMenu.menu);
  }

  Menu.setApplicationMenu(EvMenu.menu);

  return definition;
}

/**
 *
 *
 * @param {BrowserWindow} win
 */
function attach(win) {
  win.on('focus', () => {
    Menu.setApplicationMenu(EvMenu.menu);
  });
}

/**
 *
 *
 */
function activate() {
  ipcMain.on('evmenu:ipc:click', onIpcClick);
  ipcMain.handle('evmenu:ipc:set', onIpcSet);
}

function payloadFromMenuItem(menuItem) {
  let payload = {};

  for (let key of Object.keys(menuItem)) {
    if (['string', 'number', 'boolean'].includes(typeof menuItem[key])) {
      payload[key] = menuItem[key];
    }
  }

  return payload;
}

function handleNativeClick(menuItem, focusedWindow) {
  if (!menuItem.id) {
    console.log(`[EvMenu] Menu item "${menuItem.label}" has no ID, not sending events.`);
    return;
  }

  let payload = payloadFromMenuItem(menuItem);

  app.emit('evmenu', payload);
  app.emit(`evmenu:${payload.id}`, payload);

  if (focusedWindow) {
    focusedWindow.emit('evmenu', payload);
    focusedWindow.emit(`evmenu:${payload.id}`, payload);

    if (focusedWindow.webContents) {
      focusedWindow.webContents.send('evmenu:ipc:input', payload);
    }
  }
}

function addClickToItems(menu) {
  for (let idx = 0; idx < menu.length; idx++) {
    menu[idx].click = handleNativeClick;
    if (menu[idx].submenu) {
      addClickToItems(menu[idx].submenu);
    }
  }
}

function buildMenuTemplate(definition) {
  addClickToItems(definition);
  return definition;
}

const EvStore = {
  activate: activate$1
};

//
// This is the Vue/renderer portion of EvStore
//

EvStore.install = function (Vue) {
  let storeVm = new Vue({

    data() {
      return {
        store: {},
        isClean: false
      };
    },

    computed: {
      size() {
        return ipcRenderer.invoke('evstore:ipc:size');
      },

      path() {
        return ipcRenderer.invoke('evstore:ipc:path');
      }
    },

    async created() {
      this.store = await ipcRenderer.invoke('evstore:ipc:store');

      this.watchStore();
    },

    methods: {
      watchStore() {
        // Send local changes to remote
        this.$watch(() => this.store, async (newStore) => {
          if (this.isClean) {
            this.isClean = false;
            return;
          }

          await ipcRenderer.invoke('evstore:ipc:write', newStore);
        },
        {
          deep: true
        });

        // Watch remote and update local
        ipcRenderer.on('evstore:ipc:changed', (e, store) => {
          this.isClean = true;
          this.store = store;
        });
      }
    }
  });

  Vue.prototype.$evstore = storeVm;
};

//
// This is the Electron/main portion of EvStore
//

/**
 *
 *
 * @param {Store} store - [electron-store Store](https://github.com/sindresorhus/electron-store#usage)
 */
function activate$1(store) {
  ipcMain.handle('evstore:ipc:store', () => store.store);

  ipcMain.handle('evstore:ipc:write', (e, newStore) => {
    store.store = newStore;
  });

  store.onDidAnyChange((newStore) => {
    for (let browserWindow of BrowserWindow.getAllWindows()) {
      browserWindow.webContents.send('evstore:ipc:changed', newStore);
    }
  });
}

const numeric = (value, unit) => Number(value.slice(0, -1 * unit.length));

const parseValue = value => {
  if (value.endsWith('px')) { return { value, type: 'px', numeric: numeric(value, 'px') }; }
  if (value.endsWith('fr')) { return { value, type: 'fr', numeric: numeric(value, 'fr') }; }
  if (value.endsWith('%')) { return { value, type: '%', numeric: numeric(value, '%') }; }
  if (value === 'auto') return { value, type: 'auto' };
  return null;
};

const parse = rule => rule.split(' ').map(parseValue);

const getSizeAtTrack = (index, tracks, gap = 0, end = false) => {
  const newIndex = end ? index + 1 : index;
  const trackSum = tracks
    .slice(0, newIndex)
    .reduce((accum, value) => accum + value.numeric, 0);
  const gapSum = gap ? index * gap : 0;

  return trackSum + gapSum;
};

const getStyles = (rule, ownRules, matchedRules) =>
    [...ownRules, ...matchedRules]
        .map(r => r.style[rule])
        .filter(style => style !== undefined && style !== '');

const getGapValue = (unit, size) => {
    if (size.endsWith(unit)) {
        return Number(size.slice(0, -1 * unit.length))
    }
    return null
};

const firstNonZero = tracks => {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].numeric > 0) {
            return i
        }
    }
    return null
};

const NOOP = () => false;

const defaultWriteStyle = (element, gridTemplateProp, style) => {
    // eslint-disable-next-line no-param-reassign
    element.style[gridTemplateProp] = style;
};

const getOption = (options, propName, def) => {
    const value = options[propName];
    if (value !== undefined) {
        return value
    }
    return def
};

var getMatchedCSSRules = el =>
    []
        .concat(
            ...Array.from(el.ownerDocument.styleSheets).map(s => {
                let rules = [];

                try {
                    rules = Array.from(s.cssRules || []);
                } catch (e) {
                    // Ignore results on security error
                }

                return rules
            }),
        )
        .filter(r => {
            let matches = false;
            try {
                matches = el.matches(r.selectorText);
            } catch (e) {
                // Ignore matching erros
            }

            return matches
        });

const gridTemplatePropColumns = 'grid-template-columns';
const gridTemplatePropRows = 'grid-template-rows';

class Gutter {
  constructor(direction, options, parentOptions) {
    this.direction = direction;
    this.element = options.element;
    this.track = options.track;

    if (direction === 'column') {
      this.gridTemplateProp = gridTemplatePropColumns;
      this.gridGapProp = 'grid-column-gap';
      this.cursor = getOption(
        parentOptions,
        'columnCursor',
        getOption(parentOptions, 'cursor', 'col-resize'),
      );
      this.snapOffset = getOption(
        parentOptions,
        'columnSnapOffset',
        getOption(parentOptions, 'snapOffset', 30),
      );
      this.dragInterval = getOption(
        parentOptions,
        'columnDragInterval',
        getOption(parentOptions, 'dragInterval', 1),
      );
      this.clientAxis = 'clientX';
      this.optionStyle = getOption(parentOptions, 'gridTemplateColumns');
    } else if (direction === 'row') {
      this.gridTemplateProp = gridTemplatePropRows;
      this.gridGapProp = 'grid-row-gap';
      this.cursor = getOption(
        parentOptions,
        'rowCursor',
        getOption(parentOptions, 'cursor', 'row-resize'),
      );
      this.snapOffset = getOption(
        parentOptions,
        'rowSnapOffset',
        getOption(parentOptions, 'snapOffset', 30),
      );
      this.dragInterval = getOption(
        parentOptions,
        'rowDragInterval',
        getOption(parentOptions, 'dragInterval', 1),
      );
      this.clientAxis = 'clientY';
      this.optionStyle = getOption(parentOptions, 'gridTemplateRows');
    }

    this.onDragStart = getOption(parentOptions, 'onDragStart', NOOP);
    this.onDragEnd = getOption(parentOptions, 'onDragEnd', NOOP);
    this.onDrag = getOption(parentOptions, 'onDrag', NOOP);
    this.writeStyle = getOption(
      parentOptions,
      'writeStyle',
      defaultWriteStyle,
    );

    this.startDragging = this.startDragging.bind(this);
    this.stopDragging = this.stopDragging.bind(this);
    this.drag = this.drag.bind(this);

    this.minSizeStart = options.minSizeStart;
    this.minSizeEnd = options.minSizeEnd;

    if (options.element) {
      this.element.addEventListener('mousedown', this.startDragging);
      this.element.addEventListener('touchstart', this.startDragging);
    }
  }

  getDimensions() {
    const {
      width,
      height,
      top,
      bottom,
      left,
      right
    } = this.grid.getBoundingClientRect();

    if (this.direction === 'column') {
      this.start = top;
      this.end = bottom;
      this.size = height;
    } else if (this.direction === 'row') {
      this.start = left;
      this.end = right;
      this.size = width;
    }
  }

  getSizeAtTrack(track, end) {
    return getSizeAtTrack(
      track,
      this.computedPixels,
      this.computedGapPixels,
      end,
    );
  }

  getSizeOfTrack(track) {
    return this.computedPixels[track].numeric;
  }

  getRawTracks() {
    const tracks = getStyles(
      this.gridTemplateProp,
      [this.grid],
      getMatchedCSSRules(this.grid),
    );
    if (!tracks.length) {
      if (this.optionStyle) return this.optionStyle;

      throw Error('Unable to determine grid template tracks from styles.');
    }
    return tracks[0];
  }

  getGap() {
    const gap = getStyles(
      this.gridGapProp,
      [this.grid],
      getMatchedCSSRules(this.grid),
    );
    if (!gap.length) {
      return null;
    }
    return gap[0];
  }

  getRawComputedTracks() {
    return window.getComputedStyle(this.grid)[this.gridTemplateProp];
  }

  getRawComputedGap() {
    return window.getComputedStyle(this.grid)[this.gridGapProp];
  }

  setTracks(raw) {
    this.tracks = raw.split(' ');
    this.trackValues = parse(raw);
  }

  setComputedTracks(raw) {
    this.computedTracks = raw.split(' ');
    this.computedPixels = parse(raw);
  }

  setGap(raw) {
    this.gap = raw;
  }

  setComputedGap(raw) {
    this.computedGap = raw;
    this.computedGapPixels = getGapValue('px', this.computedGap) || 0;
  }

  getMousePosition(e) {
    if ('touches' in e) return e.touches[0][this.clientAxis];
    return e[this.clientAxis];
  }

  startDragging(e) {
    if ('button' in e && e.button !== 0) {
      return;
    }

    // Don't actually drag the element. We emulate that in the drag function.
    e.preventDefault();

    if (this.element) {
      this.grid = this.element.parentNode;
    } else {
      this.grid = e.target.parentNode;
    }

    this.getDimensions();
    this.setTracks(this.getRawTracks());
    this.setComputedTracks(this.getRawComputedTracks());
    this.setGap(this.getGap());
    this.setComputedGap(this.getRawComputedGap());

    const trackPercentage = this.trackValues.filter(
      track => track.type === '%',
    );
    const trackFr = this.trackValues.filter(track => track.type === 'fr');

    this.totalFrs = trackFr.length;

    if (this.totalFrs) {
      const track = firstNonZero(trackFr);

      if (track !== null) {
        this.frToPixels = this.computedPixels[track].numeric / trackFr[track].numeric;
        if (this.frToPixels === 0) {
          this.frToPixels = Number.EPSILON;
        }
      }
    }

    if (trackPercentage.length) {
      const track = firstNonZero(trackPercentage);

      if (track !== null) {
        this.percentageToPixels = this.computedPixels[track].numeric
                    / trackPercentage[track].numeric;
      }
    }

    // get start of gutter track
    const gutterStart = this.getSizeAtTrack(this.track, false) + this.start;
    this.dragStartOffset = this.getMousePosition(e) - gutterStart;

    this.aTrack = this.track - 1;

    if (this.track < this.tracks.length - 1) {
      this.bTrack = this.track + 1;
    } else {
      throw Error(
        `Invalid track index: ${this.track}. Track must be between two other tracks and only ${this.tracks.length} tracks were found.`,
      );
    }

    this.aTrackStart = this.getSizeAtTrack(this.aTrack, false) + this.start;
    this.bTrackEnd = this.getSizeAtTrack(this.bTrack, true) + this.start;

    // Set the dragging property of the pair object.
    this.dragging = true;

    // All the binding. `window` gets the stop events in case we drag out of the elements.
    window.addEventListener('mouseup', this.stopDragging);
    window.addEventListener('touchend', this.stopDragging);
    window.addEventListener('touchcancel', this.stopDragging);
    window.addEventListener('mousemove', this.drag);
    window.addEventListener('touchmove', this.drag);

    // Disable selection. Disable!
    this.grid.addEventListener('selectstart', NOOP);
    this.grid.addEventListener('dragstart', NOOP);

    this.grid.style.userSelect = 'none';
    this.grid.style.webkitUserSelect = 'none';
    this.grid.style.MozUserSelect = 'none';
    this.grid.style.pointerEvents = 'none';

    // Set the cursor at multiple levels
    this.grid.style.cursor = this.cursor;
    window.document.body.style.cursor = this.cursor;

    this.onDragStart(this.direction, this.track);
  }

  stopDragging() {
    this.dragging = false;

    // Remove the stored event listeners. This is why we store them.
    this.cleanup();

    this.onDragEnd(this.direction, this.track);

    if (this.needsDestroy) {
      if (this.element) {
        this.element.removeEventListener(
          'mousedown',
          this.startDragging,
        );
        this.element.removeEventListener(
          'touchstart',
          this.startDragging,
        );
      }
      this.destroyCb();
      this.needsDestroy = false;
      this.destroyCb = null;
    }
  }

  drag(e) {
    let mousePosition = this.getMousePosition(e);

    const gutterSize = this.getSizeOfTrack(this.track);
    const minMousePosition = this.aTrackStart
            + this.minSizeStart
            + this.dragStartOffset
            + this.computedGapPixels;
    const maxMousePosition = this.bTrackEnd
            - this.minSizeEnd
            - this.computedGapPixels
            - (gutterSize - this.dragStartOffset);
    const minMousePositionOffset = minMousePosition + this.snapOffset;
    const maxMousePositionOffset = maxMousePosition - this.snapOffset;

    if (mousePosition < minMousePositionOffset) {
      mousePosition = minMousePosition;
    }

    if (mousePosition > maxMousePositionOffset) {
      mousePosition = maxMousePosition;
    }

    if (mousePosition < minMousePosition) {
      mousePosition = minMousePosition;
    } else if (mousePosition > maxMousePosition) {
      mousePosition = maxMousePosition;
    }

    let aTrackSize = mousePosition
            - this.aTrackStart
            - this.dragStartOffset
            - this.computedGapPixels;
    let bTrackSize = this.bTrackEnd
            - mousePosition
            + this.dragStartOffset
            - gutterSize
            - this.computedGapPixels;

    if (this.dragInterval > 1) {
      const aTrackSizeIntervaled = Math.round(aTrackSize / this.dragInterval) * this.dragInterval;
      bTrackSize -= aTrackSizeIntervaled - aTrackSize;
      aTrackSize = aTrackSizeIntervaled;
    }

    if (aTrackSize < this.minSizeStart) {
      aTrackSize = this.minSizeStart;
    }

    if (bTrackSize < this.minSizeEnd) {
      bTrackSize = this.minSizeEnd;
    }

    if (this.trackValues[this.aTrack].type === 'px') {
      this.tracks[this.aTrack] = `${aTrackSize}px`;
    } else if (this.trackValues[this.aTrack].type === 'fr') {
      if (this.totalFrs === 1) {
        this.tracks[this.aTrack] = '1fr';
      } else {
        const targetFr = aTrackSize / this.frToPixels;
        this.tracks[this.aTrack] = `${targetFr}fr`;
      }
    } else if (this.trackValues[this.aTrack].type === '%') {
      const targetPercentage = aTrackSize / this.percentageToPixels;
      this.tracks[this.aTrack] = `${targetPercentage}%`;
    }

    if (this.trackValues[this.bTrack].type === 'px') {
      this.tracks[this.bTrack] = `${bTrackSize}px`;
    } else if (this.trackValues[this.bTrack].type === 'fr') {
      if (this.totalFrs === 1) {
        this.tracks[this.bTrack] = '1fr';
      } else {
        const targetFr = bTrackSize / this.frToPixels;
        this.tracks[this.bTrack] = `${targetFr}fr`;
      }
    } else if (this.trackValues[this.bTrack].type === '%') {
      const targetPercentage = bTrackSize / this.percentageToPixels;
      this.tracks[this.bTrack] = `${targetPercentage}%`;
    }

    const style = this.tracks.join(' ');
    this.writeStyle(this.grid, this.gridTemplateProp, style);
    this.onDrag(this.direction, this.track, style);
  }

  cleanup() {
    window.removeEventListener('mouseup', this.stopDragging);
    window.removeEventListener('touchend', this.stopDragging);
    window.removeEventListener('touchcancel', this.stopDragging);
    window.removeEventListener('mousemove', this.drag);
    window.removeEventListener('touchmove', this.drag);

    if (this.grid) {
      this.grid.removeEventListener('selectstart', NOOP);
      this.grid.removeEventListener('dragstart', NOOP);

      this.grid.style.userSelect = '';
      this.grid.style.webkitUserSelect = '';
      this.grid.style.MozUserSelect = '';
      this.grid.style.pointerEvents = '';

      this.grid.style.cursor = '';
    }

    window.document.body.style.cursor = '';
  }

  destroy(immediate = true, cb) {
    if (immediate || this.dragging === false) {
      this.cleanup();
      if (this.element) {
        this.element.removeEventListener(
          'mousedown',
          this.startDragging,
        );
        this.element.removeEventListener(
          'touchstart',
          this.startDragging,
        );
      }

      if (cb) {
        cb();
      }
    } else {
      this.needsDestroy = true;
      if (cb) {
        this.destroyCb = cb;
      }
    }
  }
}

const getTrackOption = (options, track, defaultValue) => {
    if (track in options) {
        return options[track]
    }

    return defaultValue
};

const createGutter = (direction, options) => gutterOptions => {
    if (gutterOptions.track < 1) {
        throw Error(
            `Invalid track index: ${gutterOptions.track}. Track must be between two other tracks.`,
        )
    }

    const trackMinSizes =
        direction === 'column'
            ? options.columnMinSizes || {}
            : options.rowMinSizes || {};
    const trackMinSize = direction === 'column' ? 'columnMinSize' : 'rowMinSize';

    return new Gutter(
        direction,
        {
            minSizeStart: getTrackOption(
                trackMinSizes,
                gutterOptions.track - 1,
                getOption(
                    options,
                    trackMinSize,
                    getOption(options, 'minSize', 0),
                ),
            ),
            minSizeEnd: getTrackOption(
                trackMinSizes,
                gutterOptions.track + 1,
                getOption(
                    options,
                    trackMinSize,
                    getOption(options, 'minSize', 0),
                ),
            ),
            ...gutterOptions,
        },
        options,
    )
};

class Grid {
    constructor(options) {
        this.columnGutters = {};
        this.rowGutters = {};

        this.options = {
            columnGutters: options.columnGutters || [],
            rowGutters: options.rowGutters || [],
            columnMinSizes: options.columnMinSizes || {},
            rowMinSizes: options.rowMinSizes || {},
            ...options,
        };

        this.options.columnGutters.forEach(gutterOptions => {
            this.columnGutters[options.track] = createGutter(
                'column',
                this.options,
            )(gutterOptions);
        });

        this.options.rowGutters.forEach(gutterOptions => {
            this.rowGutters[options.track] = createGutter(
                'row',
                this.options,
            )(gutterOptions);
        });
    }

    addColumnGutter(element, track) {
        if (this.columnGutters[track]) {
            this.columnGutters[track].destroy();
        }

        this.columnGutters[track] = createGutter(
            'column',
            this.options,
        )({
            element,
            track,
        });
    }

    addRowGutter(element, track) {
        if (this.rowGutters[track]) {
            this.rowGutters[track].destroy();
        }

        this.rowGutters[track] = createGutter(
            'row',
            this.options,
        )({
            element,
            track,
        });
    }

    removeColumnGutter(track, immediate = true) {
        if (this.columnGutters[track]) {
            this.columnGutters[track].destroy(immediate, () => {
                delete this.columnGutters[track];
            });
        }
    }

    removeRowGutter(track, immediate = true) {
        if (this.rowGutters[track]) {
            this.rowGutters[track].destroy(immediate, () => {
                delete this.rowGutters[track];
            });
        }
    }

    handleDragStart(e, direction, track) {
        if (direction === 'column') {
            if (this.columnGutters[track]) {
                this.columnGutters[track].destroy();
            }

            this.columnGutters[track] = createGutter(
                'column',
                this.options,
            )({
                track,
            });
            this.columnGutters[track].startDragging(e);
        } else if (direction === 'row') {
            if (this.rowGutters[track]) {
                this.rowGutters[track].destroy();
            }

            this.rowGutters[track] = createGutter(
                'row',
                this.options,
            )({
                track,
            });
            this.rowGutters[track].startDragging(e);
        }
    }

    destroy(immediate = true) {
        Object.keys(this.columnGutters).forEach(track =>
            this.columnGutters[track].destroy(immediate, () => {
                delete this.columnGutters[track];
            }),
        );
        Object.keys(this.rowGutters).forEach(track =>
            this.rowGutters[track].destroy(immediate, () => {
                delete this.rowGutters[track];
            }),
        );
    }
}

var Split = options => new Grid(options);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script = {
  name: 'EvLayoutChild',

  props: {
    child: Object
  },

  methods: {
    gutterClass(child, direction) {
      let className = `ev-gutter ev-gutter-${child.name} ev-gutter-${direction}`;

      if (child.resizable === false) {
        className += ' ev-gutter-no-resize';
      }

      return className;
    },

    childStyle(child) {
      if (!child.sizes || !child.sizes.length || !child.direction) {
        return;
      }

      let sizes = child.sizes.map(s => [s, 0]).flat();
      sizes.pop();

      return `grid-template-${child.direction}s: ${sizes.join(' ')}`;
    }
  }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

const isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return (id, style) => addStyle(id, style);
}
let HEAD;
const styles = {};
function addStyle(id, css) {
    const group = isOldIE ? css.media || 'default' : id;
    const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        let code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                style.element.setAttribute('media', css.media);
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            const index = style.ids.size - 1;
            const textNode = document.createTextNode(code);
            const nodes = style.element.childNodes;
            if (nodes[index])
                style.element.removeChild(nodes[index]);
            if (nodes.length)
                style.element.insertBefore(textNode, nodes[index]);
            else
                style.element.appendChild(textNode);
        }
    }
}

/* script */
const __vue_script__ = script;

/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "d-grid overflow-hidden h-100 w-100",
      class: "ev-pane-" + _vm.child.name,
      style: _vm.childStyle(_vm.child),
      attrs: { "data-min-size": _vm.child.minSize }
    },
    [
      !_vm.child.panes
        ? _c(
            "div",
            { staticClass: "ev-layout-pane h-100 w-100 overflow-auto" },
            [_vm._t(_vm.child.name)],
            2
          )
        : _vm._e(),
      _vm._v(" "),
      _vm._l(_vm.child.panes, function(grandChild, idx) {
        return [
          _c(
            "ev-layout-child",
            {
              key: grandChild.name,
              attrs: { child: grandChild },
              scopedSlots: _vm._u(
                [
                  _vm._l(_vm.$scopedSlots, function(_, name) {
                    return {
                      key: name,
                      fn: function(slotData) {
                        return [_vm._t(name, null, null, slotData)]
                      }
                    }
                  })
                ],
                null,
                true
              )
            },
            [
              _vm._l(_vm.$slots, function(_, name) {
                return _vm._t(name, null, { slot: name })
              })
            ],
            2
          ),
          _vm._v(" "),
          _vm.child.panes[idx + 1]
            ? _c("div", {
                key: grandChild.name + "gutter",
                class: _vm.gutterClass(grandChild, _vm.child.direction)
              })
            : _vm._e()
        ]
      })
    ],
    2
  )
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  const __vue_inject_styles__ = function (inject) {
    if (!inject) return
    inject("data-v-bb924b72_0", { source: "*[data-v-bb924b72] {\n  box-sizing: border-box;\n}\n*[data-v-bb924b72]:before,\n*[data-v-bb924b72]:after {\n  box-sizing: border-box;\n}\n.h-100[data-v-bb924b72] {\n  height: 100%;\n}\n.vh-100[data-v-bb924b72] {\n  height: 100vh;\n}\n.w-100[data-v-bb924b72] {\n  width: 100%;\n}\n.vw-100[data-v-bb924b72] {\n  width: 100vw;\n}\n.pre-line[data-v-bb924b72] {\n  white-space: pre-line;\n}\n.pre-wrap[data-v-bb924b72] {\n  white-space: pre-wrap;\n}\n.no-wrap[data-v-bb924b72] {\n  white-space: nowrap;\n}\n.d-block[data-v-bb924b72] {\n  display: block;\n}\n.d-inline-block[data-v-bb924b72] {\n  display: inline-block;\n}\n.d-flex[data-v-bb924b72] {\n  display: flex;\n}\n.d-inline-flex[data-v-bb924b72] {\n  display: inline-flex;\n}\n.d-grid[data-v-bb924b72] {\n  display: grid;\n}\n.d-none[data-v-bb924b72] {\n  display: none;\n}\n.hide[data-v-bb924b72] {\n  visibility: hidden;\n}\n.overflow-hidden[data-v-bb924b72] {\n  overflow: hidden;\n}\n.overflow-auto[data-v-bb924b72] {\n  overflow: auto;\n}\n.flex-center[data-v-bb924b72] {\n  justify-content: center;\n}\n.flex-middle[data-v-bb924b72] {\n  align-items: center;\n}\n.flex-grow[data-v-bb924b72] {\n  flex-grow: 1;\n}\n.flex-shrink[data-v-bb924b72] {\n  flex-shrink: 1;\n}\n.flex-vertical[data-v-bb924b72] {\n  flex-direction: column;\n}\n.flex-space[data-v-bb924b72] {\n  justify-content: space-between;\n}\n.flex-end[data-v-bb924b72] {\n  justify-content: flex-end;\n}\n.flex-start[data-v-bb924b72] {\n  justify-content: flex-start;\n}\n.text-center[data-v-bb924b72] {\n  text-align: center;\n}\n.m-z[data-v-bb924b72] {\n  margin: 0 !important;\n}\n.m-n-z[data-v-bb924b72] {\n  margin-top: 0 !important;\n}\n.m-e-z[data-v-bb924b72] {\n  margin-right: 0 !important;\n}\n.m-s-z[data-v-bb924b72] {\n  margin-bottom: 0 !important;\n}\n.m-w-z[data-v-bb924b72] {\n  margin-left: 0 !important;\n}\n.m-n-xl[data-v-bb924b72] {\n  margin-top: 25px;\n}\n.m-e-xl[data-v-bb924b72] {\n  margin-right: 25px;\n}\n.m-s-xl[data-v-bb924b72] {\n  margin-bottom: 25px;\n}\n.m-w-xl[data-v-bb924b72] {\n  margin-left: 25px;\n}\n.m-n-lg[data-v-bb924b72] {\n  margin-top: 20px;\n}\n.m-e-lg[data-v-bb924b72] {\n  margin-right: 20px;\n}\n.m-s-lg[data-v-bb924b72] {\n  margin-bottom: 20px;\n}\n.m-w-lg[data-v-bb924b72] {\n  margin-left: 20px;\n}\n.m-n-med[data-v-bb924b72] {\n  margin-top: 15px;\n}\n.m-e-med[data-v-bb924b72] {\n  margin-right: 15px;\n}\n.m-s-med[data-v-bb924b72] {\n  margin-bottom: 15px;\n}\n.m-w-med[data-v-bb924b72] {\n  margin-left: 15px;\n}\n.m-n-sm[data-v-bb924b72] {\n  margin-top: 10px;\n}\n.m-e-sm[data-v-bb924b72] {\n  margin-right: 10px;\n}\n.m-s-sm[data-v-bb924b72] {\n  margin-bottom: 10px;\n}\n.m-w-sm[data-v-bb924b72] {\n  margin-left: 10px;\n}\n.m-n-xs[data-v-bb924b72] {\n  margin-top: 5px;\n}\n.m-e-xs[data-v-bb924b72] {\n  margin-right: 5px;\n}\n.m-s-xs[data-v-bb924b72] {\n  margin-bottom: 5px;\n}\n.m-w-xs[data-v-bb924b72] {\n  margin-left: 5px;\n}\n.m-n-xxs[data-v-bb924b72] {\n  margin-top: 2px;\n}\n.m-e-xxs[data-v-bb924b72] {\n  margin-right: 2px;\n}\n.m-s-xxs[data-v-bb924b72] {\n  margin-bottom: 2px;\n}\n.m-w-xxs[data-v-bb924b72] {\n  margin-left: 2px;\n}\n.p-z[data-v-bb924b72] {\n  padding: 0 !important;\n}\n.p-n-z[data-v-bb924b72] {\n  padding-top: 0 !important;\n}\n.p-e-z[data-v-bb924b72] {\n  padding-right: 0 !important;\n}\n.p-s-z[data-v-bb924b72] {\n  padding-bottom: 0 !important;\n}\n.p-w-z[data-v-bb924b72] {\n  padding-left: 0 !important;\n}\n.p-n-xl[data-v-bb924b72] {\n  padding-top: 25px;\n}\n.p-e-xl[data-v-bb924b72] {\n  padding-right: 25px;\n}\n.p-s-xl[data-v-bb924b72] {\n  padding-bottom: 25px;\n}\n.p-w-xl[data-v-bb924b72] {\n  padding-left: 25px;\n}\n.p-n-lg[data-v-bb924b72] {\n  padding-top: 20px;\n}\n.p-e-lg[data-v-bb924b72] {\n  padding-right: 20px;\n}\n.p-s-lg[data-v-bb924b72] {\n  padding-bottom: 20px;\n}\n.p-w-lg[data-v-bb924b72] {\n  padding-left: 20px;\n}\n.p-n-med[data-v-bb924b72] {\n  padding-top: 15px;\n}\n.p-e-med[data-v-bb924b72] {\n  padding-right: 15px;\n}\n.p-s-med[data-v-bb924b72] {\n  padding-bottom: 15px;\n}\n.p-w-med[data-v-bb924b72] {\n  padding-left: 15px;\n}\n.p-n-sm[data-v-bb924b72] {\n  padding-top: 10px;\n}\n.p-e-sm[data-v-bb924b72] {\n  padding-right: 10px;\n}\n.p-s-sm[data-v-bb924b72] {\n  padding-bottom: 10px;\n}\n.p-w-sm[data-v-bb924b72] {\n  padding-left: 10px;\n}\n.p-n-xs[data-v-bb924b72] {\n  padding-top: 5px;\n}\n.p-e-xs[data-v-bb924b72] {\n  padding-right: 5px;\n}\n.p-s-xs[data-v-bb924b72] {\n  padding-bottom: 5px;\n}\n.p-w-xs[data-v-bb924b72] {\n  padding-left: 5px;\n}\n.p-xs[data-v-bb924b72] {\n  padding: 5px;\n}\n.p-n-xxs[data-v-bb924b72] {\n  padding-top: 2px;\n}\n.p-e-xxs[data-v-bb924b72] {\n  padding-right: 2px;\n}\n.p-s-xxs[data-v-bb924b72] {\n  padding-bottom: 2px;\n}\n.p-w-xxs[data-v-bb924b72] {\n  padding-left: 2px;\n}\n.p-xxs[data-v-bb924b72] {\n  padding: 2px;\n}\n.p-xs[data-v-bb924b72] {\n  padding: 5px;\n}\n.p-sm[data-v-bb924b72] {\n  padding: 10px;\n}\n.p-med[data-v-bb924b72] {\n  padding: 15px;\n}\n.p-lg[data-v-bb924b72] {\n  padding: 20px;\n}\n.p-xl[data-v-bb924b72] {\n  padding: 25px;\n}\n.m-xxs[data-v-bb924b72] {\n  margin: 2px;\n}\n.m-xs[data-v-bb924b72] {\n  margin: 5px;\n}\n.m-sm[data-v-bb924b72] {\n  margin: 10px;\n}\n.m-med[data-v-bb924b72] {\n  margin: 15px;\n}\n.m-lg[data-v-bb924b72] {\n  margin: 20px;\n}\n.m-xl[data-v-bb924b72] {\n  margin: 25px;\n}\n.ev-gutter-column[data-v-bb924b72] {\n  cursor: col-resize;\n}\n.ev-gutter-row[data-v-bb924b72] {\n  cursor: row-resize;\n}\n.ev-gutter[data-v-bb924b72]:not(.ev-gutter-no-resize)::after {\n  display: block;\n  position: relative;\n  content: \"\";\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-column[data-v-bb924b72]::after {\n  width: 8px;\n  height: 100%;\n  margin-left: -4px;\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-row[data-v-bb924b72]::after {\n  width: 100%;\n  height: 8px;\n  margin-top: -4px;\n}\n\n/*# sourceMappingURL=EvLayoutChild.vue.map */", map: {"version":3,"sources":["EvLayoutChild.vue","/Users/john/Code/evwt/packages/EvLayout/src/EvLayoutChild.vue"],"names":[],"mappings":"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","file":"EvLayoutChild.vue","sourcesContent":["* {\n  box-sizing: border-box;\n}\n\n*:before,\n*:after {\n  box-sizing: border-box;\n}\n\n.h-100 {\n  height: 100%;\n}\n\n.vh-100 {\n  height: 100vh;\n}\n\n.w-100 {\n  width: 100%;\n}\n\n.vw-100 {\n  width: 100vw;\n}\n\n.pre-line {\n  white-space: pre-line;\n}\n\n.pre-wrap {\n  white-space: pre-wrap;\n}\n\n.no-wrap {\n  white-space: nowrap;\n}\n\n.d-block {\n  display: block;\n}\n\n.d-inline-block {\n  display: inline-block;\n}\n\n.d-flex {\n  display: flex;\n}\n\n.d-inline-flex {\n  display: inline-flex;\n}\n\n.d-grid {\n  display: grid;\n}\n\n.d-none {\n  display: none;\n}\n\n.hide {\n  visibility: hidden;\n}\n\n.overflow-hidden {\n  overflow: hidden;\n}\n\n.overflow-auto {\n  overflow: auto;\n}\n\n.flex-center {\n  justify-content: center;\n}\n\n.flex-middle {\n  align-items: center;\n}\n\n.flex-grow {\n  flex-grow: 1;\n}\n\n.flex-shrink {\n  flex-shrink: 1;\n}\n\n.flex-vertical {\n  flex-direction: column;\n}\n\n.flex-space {\n  justify-content: space-between;\n}\n\n.flex-end {\n  justify-content: flex-end;\n}\n\n.flex-start {\n  justify-content: flex-start;\n}\n\n.text-center {\n  text-align: center;\n}\n\n.m-z {\n  margin: 0 !important;\n}\n\n.m-n-z {\n  margin-top: 0 !important;\n}\n\n.m-e-z {\n  margin-right: 0 !important;\n}\n\n.m-s-z {\n  margin-bottom: 0 !important;\n}\n\n.m-w-z {\n  margin-left: 0 !important;\n}\n\n.m-n-xl {\n  margin-top: 25px;\n}\n\n.m-e-xl {\n  margin-right: 25px;\n}\n\n.m-s-xl {\n  margin-bottom: 25px;\n}\n\n.m-w-xl {\n  margin-left: 25px;\n}\n\n.m-n-lg {\n  margin-top: 20px;\n}\n\n.m-e-lg {\n  margin-right: 20px;\n}\n\n.m-s-lg {\n  margin-bottom: 20px;\n}\n\n.m-w-lg {\n  margin-left: 20px;\n}\n\n.m-n-med {\n  margin-top: 15px;\n}\n\n.m-e-med {\n  margin-right: 15px;\n}\n\n.m-s-med {\n  margin-bottom: 15px;\n}\n\n.m-w-med {\n  margin-left: 15px;\n}\n\n.m-n-sm {\n  margin-top: 10px;\n}\n\n.m-e-sm {\n  margin-right: 10px;\n}\n\n.m-s-sm {\n  margin-bottom: 10px;\n}\n\n.m-w-sm {\n  margin-left: 10px;\n}\n\n.m-n-xs {\n  margin-top: 5px;\n}\n\n.m-e-xs {\n  margin-right: 5px;\n}\n\n.m-s-xs {\n  margin-bottom: 5px;\n}\n\n.m-w-xs {\n  margin-left: 5px;\n}\n\n.m-n-xxs {\n  margin-top: 2px;\n}\n\n.m-e-xxs {\n  margin-right: 2px;\n}\n\n.m-s-xxs {\n  margin-bottom: 2px;\n}\n\n.m-w-xxs {\n  margin-left: 2px;\n}\n\n.p-z {\n  padding: 0 !important;\n}\n\n.p-n-z {\n  padding-top: 0 !important;\n}\n\n.p-e-z {\n  padding-right: 0 !important;\n}\n\n.p-s-z {\n  padding-bottom: 0 !important;\n}\n\n.p-w-z {\n  padding-left: 0 !important;\n}\n\n.p-n-xl {\n  padding-top: 25px;\n}\n\n.p-e-xl {\n  padding-right: 25px;\n}\n\n.p-s-xl {\n  padding-bottom: 25px;\n}\n\n.p-w-xl {\n  padding-left: 25px;\n}\n\n.p-n-lg {\n  padding-top: 20px;\n}\n\n.p-e-lg {\n  padding-right: 20px;\n}\n\n.p-s-lg {\n  padding-bottom: 20px;\n}\n\n.p-w-lg {\n  padding-left: 20px;\n}\n\n.p-n-med {\n  padding-top: 15px;\n}\n\n.p-e-med {\n  padding-right: 15px;\n}\n\n.p-s-med {\n  padding-bottom: 15px;\n}\n\n.p-w-med {\n  padding-left: 15px;\n}\n\n.p-n-sm {\n  padding-top: 10px;\n}\n\n.p-e-sm {\n  padding-right: 10px;\n}\n\n.p-s-sm {\n  padding-bottom: 10px;\n}\n\n.p-w-sm {\n  padding-left: 10px;\n}\n\n.p-n-xs {\n  padding-top: 5px;\n}\n\n.p-e-xs {\n  padding-right: 5px;\n}\n\n.p-s-xs {\n  padding-bottom: 5px;\n}\n\n.p-w-xs {\n  padding-left: 5px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-n-xxs {\n  padding-top: 2px;\n}\n\n.p-e-xxs {\n  padding-right: 2px;\n}\n\n.p-s-xxs {\n  padding-bottom: 2px;\n}\n\n.p-w-xxs {\n  padding-left: 2px;\n}\n\n.p-xxs {\n  padding: 2px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-sm {\n  padding: 10px;\n}\n\n.p-med {\n  padding: 15px;\n}\n\n.p-lg {\n  padding: 20px;\n}\n\n.p-xl {\n  padding: 25px;\n}\n\n.m-xxs {\n  margin: 2px;\n}\n\n.m-xs {\n  margin: 5px;\n}\n\n.m-sm {\n  margin: 10px;\n}\n\n.m-med {\n  margin: 15px;\n}\n\n.m-lg {\n  margin: 20px;\n}\n\n.m-xl {\n  margin: 25px;\n}\n\n.ev-gutter-column {\n  cursor: col-resize;\n}\n\n.ev-gutter-row {\n  cursor: row-resize;\n}\n\n.ev-gutter:not(.ev-gutter-no-resize)::after {\n  display: block;\n  position: relative;\n  content: \"\";\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-column::after {\n  width: 8px;\n  height: 100%;\n  margin-left: -4px;\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-row::after {\n  width: 100%;\n  height: 8px;\n  margin-top: -4px;\n}\n\n/*# sourceMappingURL=EvLayoutChild.vue.map */","<template>\n  <div\n    :style=\"childStyle(child)\"\n    :data-min-size=\"child.minSize\"\n    class=\"d-grid overflow-hidden h-100 w-100\"\n    :class=\"`ev-pane-${child.name}`\">\n    <div v-if=\"!child.panes\" class=\"ev-layout-pane h-100 w-100 overflow-auto\">\n      <slot :name=\"child.name\" class=\"overflow-auto\" />\n    </div>\n\n    <template v-for=\"(grandChild, idx) in child.panes\">\n      <ev-layout-child\n        :key=\"grandChild.name\"\n        :child=\"grandChild\">\n        <slot v-for=\"(_, name) in $slots\" :slot=\"name\" :name=\"name\" />\n        <template v-for=\"(_, name) in $scopedSlots\" :slot=\"name\" slot-scope=\"slotData\">\n          <slot :name=\"name\" v-bind=\"slotData\" />\n        </template>\n      </ev-layout-child>\n\n      <div\n        v-if=\"child.panes[idx + 1]\"\n        :key=\"grandChild.name + 'gutter'\"\n        :class=\"gutterClass(grandChild, child.direction)\" />\n    </template>\n  </div>\n</template>\n\n<script>\nexport default {\n  name: 'EvLayoutChild',\n\n  props: {\n    child: Object\n  },\n\n  methods: {\n    gutterClass(child, direction) {\n      let className = `ev-gutter ev-gutter-${child.name} ev-gutter-${direction}`;\n\n      if (child.resizable === false) {\n        className += ' ev-gutter-no-resize';\n      }\n\n      return className;\n    },\n\n    childStyle(child) {\n      if (!child.sizes || !child.sizes.length || !child.direction) {\n        return;\n      }\n\n      let sizes = child.sizes.map(s => [s, 0]).flat();\n      sizes.pop();\n\n      return `grid-template-${child.direction}s: ${sizes.join(' ')}`;\n    }\n  }\n};\n</script>\n\n<style lang=\"scss\" scoped>\n@import '@/../style/utilities.scss';\n@import '@/../style/split-grid.scss';\n</style>\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__ = "data-v-bb924b72";
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__ = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    createInjector,
    undefined,
    undefined
  );

//

// @group Components
// Flexible pane-based app layouts, using CSS grid. Supports collapsible panes and sizing by relative or absolute units.
var script$1 = {
  name: 'EvLayout',

  components: {
    EvLayoutChild: __vue_component__
  },

  props: {
    // See usage section below
    layout: {
      type: Object,
      required: true
    }
  },

  async mounted() {
    let rowGutters = [...this.$el.querySelectorAll('.ev-gutter-row')].map((gutter) => ({
      track: Array.prototype.indexOf.call(gutter.parentNode.children, gutter),
      element: gutter
    }));

    let columnGutters = [...this.$el.querySelectorAll('.ev-gutter-column')].map((gutter) => ({
      track: Array.prototype.indexOf.call(gutter.parentNode.children, gutter),
      element: gutter
    }));

    let columnMinSizes = [...this.$el.querySelectorAll('.ev-gutter-column')].reduce((acc, gutter) => {
      let pane = gutter.previousElementSibling;
      let minSize = parseInt(pane.dataset.minSize || 0);
      let index = Array.prototype.indexOf.call(pane.parentNode.children, pane);
      acc[index] = minSize;
      return acc;
    }, {});

    let rowMinSizes = [...this.$el.querySelectorAll('.ev-gutter-row')].reduce((acc, gutter) => {
      let pane = gutter.previousElementSibling;
      let minSize = parseInt(pane.dataset.minSize || 0);
      let index = Array.prototype.indexOf.call(pane.parentNode.children, pane);
      acc[index] = minSize;
      return acc;
    }, {});

    let onDragStart = (direction, track) => {
      // Fired when any pane starts dragging
      // @arg direction, track
      this.$emit('dragStart', { direction, track });
    };

    let onDrag = (direction, track, gridTemplateStyle) => {
      // Fired when any pane is dragging
      // @arg direction, track, gridTemplateStyle
      this.$emit('drag', { direction, track, gridTemplateStyle });
    };

    let onDragEnd = (direction, track) => {
      // Fired when any pane ends dragging
      // @arg direction, track
      this.$emit('dragEnd', { direction, track });
    };

    Split({
      columnGutters, rowGutters, columnMinSizes, rowMinSizes, onDragStart, onDrag, onDragEnd
    });
  }
};

/* script */
const __vue_script__$1 = script$1;

/* template */
var __vue_render__$1 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "ev-layout-child",
    {
      attrs: { child: _vm.layout },
      scopedSlots: _vm._u(
        [
          _vm._l(_vm.$scopedSlots, function(_, name) {
            return {
              key: name,
              fn: function(slotData) {
                return [_vm._t(name, null, null, slotData)]
              }
            }
          })
        ],
        null,
        true
      )
    },
    [
      _vm._l(_vm.$slots, function(_, name) {
        return _vm._t(name, null, { slot: name })
      })
    ],
    2
  )
};
var __vue_staticRenderFns__$1 = [];
__vue_render__$1._withStripped = true;

  /* style */
  const __vue_inject_styles__$1 = function (inject) {
    if (!inject) return
    inject("data-v-7797216e_0", { source: "*[data-v-7797216e] {\n  box-sizing: border-box;\n}\n*[data-v-7797216e]:before,\n*[data-v-7797216e]:after {\n  box-sizing: border-box;\n}\n.h-100[data-v-7797216e] {\n  height: 100%;\n}\n.vh-100[data-v-7797216e] {\n  height: 100vh;\n}\n.w-100[data-v-7797216e] {\n  width: 100%;\n}\n.vw-100[data-v-7797216e] {\n  width: 100vw;\n}\n.pre-line[data-v-7797216e] {\n  white-space: pre-line;\n}\n.pre-wrap[data-v-7797216e] {\n  white-space: pre-wrap;\n}\n.no-wrap[data-v-7797216e] {\n  white-space: nowrap;\n}\n.d-block[data-v-7797216e] {\n  display: block;\n}\n.d-inline-block[data-v-7797216e] {\n  display: inline-block;\n}\n.d-flex[data-v-7797216e] {\n  display: flex;\n}\n.d-inline-flex[data-v-7797216e] {\n  display: inline-flex;\n}\n.d-grid[data-v-7797216e] {\n  display: grid;\n}\n.d-none[data-v-7797216e] {\n  display: none;\n}\n.hide[data-v-7797216e] {\n  visibility: hidden;\n}\n.overflow-hidden[data-v-7797216e] {\n  overflow: hidden;\n}\n.overflow-auto[data-v-7797216e] {\n  overflow: auto;\n}\n.flex-center[data-v-7797216e] {\n  justify-content: center;\n}\n.flex-middle[data-v-7797216e] {\n  align-items: center;\n}\n.flex-grow[data-v-7797216e] {\n  flex-grow: 1;\n}\n.flex-shrink[data-v-7797216e] {\n  flex-shrink: 1;\n}\n.flex-vertical[data-v-7797216e] {\n  flex-direction: column;\n}\n.flex-space[data-v-7797216e] {\n  justify-content: space-between;\n}\n.flex-end[data-v-7797216e] {\n  justify-content: flex-end;\n}\n.flex-start[data-v-7797216e] {\n  justify-content: flex-start;\n}\n.text-center[data-v-7797216e] {\n  text-align: center;\n}\n.m-z[data-v-7797216e] {\n  margin: 0 !important;\n}\n.m-n-z[data-v-7797216e] {\n  margin-top: 0 !important;\n}\n.m-e-z[data-v-7797216e] {\n  margin-right: 0 !important;\n}\n.m-s-z[data-v-7797216e] {\n  margin-bottom: 0 !important;\n}\n.m-w-z[data-v-7797216e] {\n  margin-left: 0 !important;\n}\n.m-n-xl[data-v-7797216e] {\n  margin-top: 25px;\n}\n.m-e-xl[data-v-7797216e] {\n  margin-right: 25px;\n}\n.m-s-xl[data-v-7797216e] {\n  margin-bottom: 25px;\n}\n.m-w-xl[data-v-7797216e] {\n  margin-left: 25px;\n}\n.m-n-lg[data-v-7797216e] {\n  margin-top: 20px;\n}\n.m-e-lg[data-v-7797216e] {\n  margin-right: 20px;\n}\n.m-s-lg[data-v-7797216e] {\n  margin-bottom: 20px;\n}\n.m-w-lg[data-v-7797216e] {\n  margin-left: 20px;\n}\n.m-n-med[data-v-7797216e] {\n  margin-top: 15px;\n}\n.m-e-med[data-v-7797216e] {\n  margin-right: 15px;\n}\n.m-s-med[data-v-7797216e] {\n  margin-bottom: 15px;\n}\n.m-w-med[data-v-7797216e] {\n  margin-left: 15px;\n}\n.m-n-sm[data-v-7797216e] {\n  margin-top: 10px;\n}\n.m-e-sm[data-v-7797216e] {\n  margin-right: 10px;\n}\n.m-s-sm[data-v-7797216e] {\n  margin-bottom: 10px;\n}\n.m-w-sm[data-v-7797216e] {\n  margin-left: 10px;\n}\n.m-n-xs[data-v-7797216e] {\n  margin-top: 5px;\n}\n.m-e-xs[data-v-7797216e] {\n  margin-right: 5px;\n}\n.m-s-xs[data-v-7797216e] {\n  margin-bottom: 5px;\n}\n.m-w-xs[data-v-7797216e] {\n  margin-left: 5px;\n}\n.m-n-xxs[data-v-7797216e] {\n  margin-top: 2px;\n}\n.m-e-xxs[data-v-7797216e] {\n  margin-right: 2px;\n}\n.m-s-xxs[data-v-7797216e] {\n  margin-bottom: 2px;\n}\n.m-w-xxs[data-v-7797216e] {\n  margin-left: 2px;\n}\n.p-z[data-v-7797216e] {\n  padding: 0 !important;\n}\n.p-n-z[data-v-7797216e] {\n  padding-top: 0 !important;\n}\n.p-e-z[data-v-7797216e] {\n  padding-right: 0 !important;\n}\n.p-s-z[data-v-7797216e] {\n  padding-bottom: 0 !important;\n}\n.p-w-z[data-v-7797216e] {\n  padding-left: 0 !important;\n}\n.p-n-xl[data-v-7797216e] {\n  padding-top: 25px;\n}\n.p-e-xl[data-v-7797216e] {\n  padding-right: 25px;\n}\n.p-s-xl[data-v-7797216e] {\n  padding-bottom: 25px;\n}\n.p-w-xl[data-v-7797216e] {\n  padding-left: 25px;\n}\n.p-n-lg[data-v-7797216e] {\n  padding-top: 20px;\n}\n.p-e-lg[data-v-7797216e] {\n  padding-right: 20px;\n}\n.p-s-lg[data-v-7797216e] {\n  padding-bottom: 20px;\n}\n.p-w-lg[data-v-7797216e] {\n  padding-left: 20px;\n}\n.p-n-med[data-v-7797216e] {\n  padding-top: 15px;\n}\n.p-e-med[data-v-7797216e] {\n  padding-right: 15px;\n}\n.p-s-med[data-v-7797216e] {\n  padding-bottom: 15px;\n}\n.p-w-med[data-v-7797216e] {\n  padding-left: 15px;\n}\n.p-n-sm[data-v-7797216e] {\n  padding-top: 10px;\n}\n.p-e-sm[data-v-7797216e] {\n  padding-right: 10px;\n}\n.p-s-sm[data-v-7797216e] {\n  padding-bottom: 10px;\n}\n.p-w-sm[data-v-7797216e] {\n  padding-left: 10px;\n}\n.p-n-xs[data-v-7797216e] {\n  padding-top: 5px;\n}\n.p-e-xs[data-v-7797216e] {\n  padding-right: 5px;\n}\n.p-s-xs[data-v-7797216e] {\n  padding-bottom: 5px;\n}\n.p-w-xs[data-v-7797216e] {\n  padding-left: 5px;\n}\n.p-xs[data-v-7797216e] {\n  padding: 5px;\n}\n.p-n-xxs[data-v-7797216e] {\n  padding-top: 2px;\n}\n.p-e-xxs[data-v-7797216e] {\n  padding-right: 2px;\n}\n.p-s-xxs[data-v-7797216e] {\n  padding-bottom: 2px;\n}\n.p-w-xxs[data-v-7797216e] {\n  padding-left: 2px;\n}\n.p-xxs[data-v-7797216e] {\n  padding: 2px;\n}\n.p-xs[data-v-7797216e] {\n  padding: 5px;\n}\n.p-sm[data-v-7797216e] {\n  padding: 10px;\n}\n.p-med[data-v-7797216e] {\n  padding: 15px;\n}\n.p-lg[data-v-7797216e] {\n  padding: 20px;\n}\n.p-xl[data-v-7797216e] {\n  padding: 25px;\n}\n.m-xxs[data-v-7797216e] {\n  margin: 2px;\n}\n.m-xs[data-v-7797216e] {\n  margin: 5px;\n}\n.m-sm[data-v-7797216e] {\n  margin: 10px;\n}\n.m-med[data-v-7797216e] {\n  margin: 15px;\n}\n.m-lg[data-v-7797216e] {\n  margin: 20px;\n}\n.m-xl[data-v-7797216e] {\n  margin: 25px;\n}\n.ev-gutter-column[data-v-7797216e] {\n  cursor: col-resize;\n}\n.ev-gutter-row[data-v-7797216e] {\n  cursor: row-resize;\n}\n.ev-gutter[data-v-7797216e]:not(.ev-gutter-no-resize)::after {\n  display: block;\n  position: relative;\n  content: \"\";\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-column[data-v-7797216e]::after {\n  width: 8px;\n  height: 100%;\n  margin-left: -4px;\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-row[data-v-7797216e]::after {\n  width: 100%;\n  height: 8px;\n  margin-top: -4px;\n}\n\n/*# sourceMappingURL=EvLayout.vue.map */", map: {"version":3,"sources":["EvLayout.vue","/Users/john/Code/evwt/packages/EvLayout/src/EvLayout.vue"],"names":[],"mappings":"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","file":"EvLayout.vue","sourcesContent":["* {\n  box-sizing: border-box;\n}\n\n*:before,\n*:after {\n  box-sizing: border-box;\n}\n\n.h-100 {\n  height: 100%;\n}\n\n.vh-100 {\n  height: 100vh;\n}\n\n.w-100 {\n  width: 100%;\n}\n\n.vw-100 {\n  width: 100vw;\n}\n\n.pre-line {\n  white-space: pre-line;\n}\n\n.pre-wrap {\n  white-space: pre-wrap;\n}\n\n.no-wrap {\n  white-space: nowrap;\n}\n\n.d-block {\n  display: block;\n}\n\n.d-inline-block {\n  display: inline-block;\n}\n\n.d-flex {\n  display: flex;\n}\n\n.d-inline-flex {\n  display: inline-flex;\n}\n\n.d-grid {\n  display: grid;\n}\n\n.d-none {\n  display: none;\n}\n\n.hide {\n  visibility: hidden;\n}\n\n.overflow-hidden {\n  overflow: hidden;\n}\n\n.overflow-auto {\n  overflow: auto;\n}\n\n.flex-center {\n  justify-content: center;\n}\n\n.flex-middle {\n  align-items: center;\n}\n\n.flex-grow {\n  flex-grow: 1;\n}\n\n.flex-shrink {\n  flex-shrink: 1;\n}\n\n.flex-vertical {\n  flex-direction: column;\n}\n\n.flex-space {\n  justify-content: space-between;\n}\n\n.flex-end {\n  justify-content: flex-end;\n}\n\n.flex-start {\n  justify-content: flex-start;\n}\n\n.text-center {\n  text-align: center;\n}\n\n.m-z {\n  margin: 0 !important;\n}\n\n.m-n-z {\n  margin-top: 0 !important;\n}\n\n.m-e-z {\n  margin-right: 0 !important;\n}\n\n.m-s-z {\n  margin-bottom: 0 !important;\n}\n\n.m-w-z {\n  margin-left: 0 !important;\n}\n\n.m-n-xl {\n  margin-top: 25px;\n}\n\n.m-e-xl {\n  margin-right: 25px;\n}\n\n.m-s-xl {\n  margin-bottom: 25px;\n}\n\n.m-w-xl {\n  margin-left: 25px;\n}\n\n.m-n-lg {\n  margin-top: 20px;\n}\n\n.m-e-lg {\n  margin-right: 20px;\n}\n\n.m-s-lg {\n  margin-bottom: 20px;\n}\n\n.m-w-lg {\n  margin-left: 20px;\n}\n\n.m-n-med {\n  margin-top: 15px;\n}\n\n.m-e-med {\n  margin-right: 15px;\n}\n\n.m-s-med {\n  margin-bottom: 15px;\n}\n\n.m-w-med {\n  margin-left: 15px;\n}\n\n.m-n-sm {\n  margin-top: 10px;\n}\n\n.m-e-sm {\n  margin-right: 10px;\n}\n\n.m-s-sm {\n  margin-bottom: 10px;\n}\n\n.m-w-sm {\n  margin-left: 10px;\n}\n\n.m-n-xs {\n  margin-top: 5px;\n}\n\n.m-e-xs {\n  margin-right: 5px;\n}\n\n.m-s-xs {\n  margin-bottom: 5px;\n}\n\n.m-w-xs {\n  margin-left: 5px;\n}\n\n.m-n-xxs {\n  margin-top: 2px;\n}\n\n.m-e-xxs {\n  margin-right: 2px;\n}\n\n.m-s-xxs {\n  margin-bottom: 2px;\n}\n\n.m-w-xxs {\n  margin-left: 2px;\n}\n\n.p-z {\n  padding: 0 !important;\n}\n\n.p-n-z {\n  padding-top: 0 !important;\n}\n\n.p-e-z {\n  padding-right: 0 !important;\n}\n\n.p-s-z {\n  padding-bottom: 0 !important;\n}\n\n.p-w-z {\n  padding-left: 0 !important;\n}\n\n.p-n-xl {\n  padding-top: 25px;\n}\n\n.p-e-xl {\n  padding-right: 25px;\n}\n\n.p-s-xl {\n  padding-bottom: 25px;\n}\n\n.p-w-xl {\n  padding-left: 25px;\n}\n\n.p-n-lg {\n  padding-top: 20px;\n}\n\n.p-e-lg {\n  padding-right: 20px;\n}\n\n.p-s-lg {\n  padding-bottom: 20px;\n}\n\n.p-w-lg {\n  padding-left: 20px;\n}\n\n.p-n-med {\n  padding-top: 15px;\n}\n\n.p-e-med {\n  padding-right: 15px;\n}\n\n.p-s-med {\n  padding-bottom: 15px;\n}\n\n.p-w-med {\n  padding-left: 15px;\n}\n\n.p-n-sm {\n  padding-top: 10px;\n}\n\n.p-e-sm {\n  padding-right: 10px;\n}\n\n.p-s-sm {\n  padding-bottom: 10px;\n}\n\n.p-w-sm {\n  padding-left: 10px;\n}\n\n.p-n-xs {\n  padding-top: 5px;\n}\n\n.p-e-xs {\n  padding-right: 5px;\n}\n\n.p-s-xs {\n  padding-bottom: 5px;\n}\n\n.p-w-xs {\n  padding-left: 5px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-n-xxs {\n  padding-top: 2px;\n}\n\n.p-e-xxs {\n  padding-right: 2px;\n}\n\n.p-s-xxs {\n  padding-bottom: 2px;\n}\n\n.p-w-xxs {\n  padding-left: 2px;\n}\n\n.p-xxs {\n  padding: 2px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-sm {\n  padding: 10px;\n}\n\n.p-med {\n  padding: 15px;\n}\n\n.p-lg {\n  padding: 20px;\n}\n\n.p-xl {\n  padding: 25px;\n}\n\n.m-xxs {\n  margin: 2px;\n}\n\n.m-xs {\n  margin: 5px;\n}\n\n.m-sm {\n  margin: 10px;\n}\n\n.m-med {\n  margin: 15px;\n}\n\n.m-lg {\n  margin: 20px;\n}\n\n.m-xl {\n  margin: 25px;\n}\n\n.ev-gutter-column {\n  cursor: col-resize;\n}\n\n.ev-gutter-row {\n  cursor: row-resize;\n}\n\n.ev-gutter:not(.ev-gutter-no-resize)::after {\n  display: block;\n  position: relative;\n  content: \"\";\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-column::after {\n  width: 8px;\n  height: 100%;\n  margin-left: -4px;\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-row::after {\n  width: 100%;\n  height: 8px;\n  margin-top: -4px;\n}\n\n/*# sourceMappingURL=EvLayout.vue.map */","<template>\n  <ev-layout-child :child=\"layout\">\n    <!-- @vuese-ignore -->\n    <slot v-for=\"(_, name) in $slots\" :slot=\"name\" :name=\"name\" />\n    <template v-for=\"(_, name) in $scopedSlots\" :slot=\"name\" slot-scope=\"slotData\">\n      <!-- @vuese-ignore -->\n      <slot :name=\"name\" v-bind=\"slotData\" />\n    </template>\n  </ev-layout-child>\n</template>\n\n<script>\nimport Split from '@/../vendor/split-grid';\nimport EvLayoutChild from './EvLayoutChild.vue';\n\n// @group Components\n// Flexible pane-based app layouts, using CSS grid. Supports collapsible panes and sizing by relative or absolute units.\nexport default {\n  name: 'EvLayout',\n\n  components: {\n    EvLayoutChild\n  },\n\n  props: {\n    // See usage section below\n    layout: {\n      type: Object,\n      required: true\n    }\n  },\n\n  async mounted() {\n    let rowGutters = [...this.$el.querySelectorAll('.ev-gutter-row')].map((gutter) => ({\n      track: Array.prototype.indexOf.call(gutter.parentNode.children, gutter),\n      element: gutter\n    }));\n\n    let columnGutters = [...this.$el.querySelectorAll('.ev-gutter-column')].map((gutter) => ({\n      track: Array.prototype.indexOf.call(gutter.parentNode.children, gutter),\n      element: gutter\n    }));\n\n    let columnMinSizes = [...this.$el.querySelectorAll('.ev-gutter-column')].reduce((acc, gutter) => {\n      let pane = gutter.previousElementSibling;\n      let minSize = parseInt(pane.dataset.minSize || 0);\n      let index = Array.prototype.indexOf.call(pane.parentNode.children, pane);\n      acc[index] = minSize;\n      return acc;\n    }, {});\n\n    let rowMinSizes = [...this.$el.querySelectorAll('.ev-gutter-row')].reduce((acc, gutter) => {\n      let pane = gutter.previousElementSibling;\n      let minSize = parseInt(pane.dataset.minSize || 0);\n      let index = Array.prototype.indexOf.call(pane.parentNode.children, pane);\n      acc[index] = minSize;\n      return acc;\n    }, {});\n\n    let onDragStart = (direction, track) => {\n      // Fired when any pane starts dragging\n      // @arg direction, track\n      this.$emit('dragStart', { direction, track });\n    };\n\n    let onDrag = (direction, track, gridTemplateStyle) => {\n      // Fired when any pane is dragging\n      // @arg direction, track, gridTemplateStyle\n      this.$emit('drag', { direction, track, gridTemplateStyle });\n    };\n\n    let onDragEnd = (direction, track) => {\n      // Fired when any pane ends dragging\n      // @arg direction, track\n      this.$emit('dragEnd', { direction, track });\n    };\n\n    Split({\n      columnGutters, rowGutters, columnMinSizes, rowMinSizes, onDragStart, onDrag, onDragEnd\n    });\n  }\n};\n</script>\n\n<style lang=\"scss\" scoped>\n@import '@/../style/utilities.scss';\n@import '@/../style/split-grid.scss';\n</style>\n\n<docs>\n\n## Setup\n\n```js\nimport { EvLayout } from 'evwt';\n\nexport default {\n  components: {\n    EvLayout\n  }\n}\n```\n\n## Usage\n\nProvide a definition of your UI layout and EvLayout will build it and provide slots to place your components. Panes can be infinitely nested.\n\n```vue\n<template>\n  <ev-layout :layout=\"layout\">\n    <template v-slot:sidebar>\n      side\n    </template>\n    <template v-slot:editor>\n      main stuff\n    </template>\n    <template v-slot:panel>\n      panel\n    </template>\n  </ev-layout>\n</template>\n\n<script>\nimport { EvLayout } from 'evwt';\n\nexport default {\n  components: {\n    EvLayout\n  },\n\n  data() {\n    return {\n      layout: {\n        direction: 'column',\n        sizes: ['250px', '1fr'],\n        panes: [\n          {\n            name: 'sidebar',\n            minSize: 50\n          },\n          {\n            name: 'main',\n            direction: 'row',\n            sizes: ['3fr', '1fr'],\n            panes: [\n              {\n                name: 'editor'\n              },\n              {\n                name: 'panel'\n              }\n            ]\n\n          }\n        ]\n      }\n    };\n  }\n};\n</script>\n\n<style>\n.ev-pane-sidebar {\n  background: #eee;\n}\n\n.ev-pane-panel {\n  background: #ddd;\n}\n</style>\n```\n\n### Pane definition\n\n| Property | Type | Description | Example\n| --- | --- | --- | --- |\n| name | String | A slot with this name will be created for use in your template. A css class is also added in the format `ev-pane-{name}`. ||\n| minSize | Number | The minimum size of the pane. ||\n| panes | Array: \\[Pane] | An array of child pane definitions to nest inside this pane. ||\n| sizes | Array: \\[String] | Sizes of the child panes in [css grid units](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/Basic_Concepts_of_Grid_Layout). 'auto' is valid only on non-resizable panes. | `['200px', '1fr']` |\n| direction | String: 'row'\\|'column' | Direction of child panes. ||\n| resizable | Boolean | Whether the trailing edge of the pane can be dragged to resize the pane. ||\n\n</docs>\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$1 = "data-v-7797216e";
  /* module identifier */
  const __vue_module_identifier__$1 = undefined;
  /* functional template */
  const __vue_is_functional_template__$1 = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$1 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
    __vue_inject_styles__$1,
    __vue_script__$1,
    __vue_scope_id__$1,
    __vue_is_functional_template__$1,
    __vue_module_identifier__$1,
    false,
    createInjector,
    undefined,
    undefined
  );

__vue_component__$1.install = function(Vue) {
  Vue.component(__vue_component__$1.name, __vue_component__$1);
};

//
//
//
//
//
//

// @group Components
// Easily create and use a library of svg icons for your app. Icon svg is inlined into the html so it can be styled with css.
var script$2 = {
  props: {
    // The filename of the icon without the .svg extension
    name: {
      type: String,
      required: true
    }
  }
};

/* script */
const __vue_script__$2 = script$2;

/* template */
var __vue_render__$2 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "ev-icon", class: "ev-icon-" + _vm.name },
    [_c("ev-icon-" + _vm.name, { tag: "component" })],
    1
  )
};
var __vue_staticRenderFns__$2 = [];
__vue_render__$2._withStripped = true;

  /* style */
  const __vue_inject_styles__$2 = function (inject) {
    if (!inject) return
    inject("data-v-0f04a95b_0", { source: "*[data-v-0f04a95b] {\n  box-sizing: border-box;\n}\n*[data-v-0f04a95b]:before,\n*[data-v-0f04a95b]:after {\n  box-sizing: border-box;\n}\n.h-100[data-v-0f04a95b] {\n  height: 100%;\n}\n.vh-100[data-v-0f04a95b] {\n  height: 100vh;\n}\n.w-100[data-v-0f04a95b] {\n  width: 100%;\n}\n.vw-100[data-v-0f04a95b] {\n  width: 100vw;\n}\n.pre-line[data-v-0f04a95b] {\n  white-space: pre-line;\n}\n.pre-wrap[data-v-0f04a95b] {\n  white-space: pre-wrap;\n}\n.no-wrap[data-v-0f04a95b] {\n  white-space: nowrap;\n}\n.d-block[data-v-0f04a95b] {\n  display: block;\n}\n.d-inline-block[data-v-0f04a95b] {\n  display: inline-block;\n}\n.d-flex[data-v-0f04a95b] {\n  display: flex;\n}\n.d-inline-flex[data-v-0f04a95b] {\n  display: inline-flex;\n}\n.d-grid[data-v-0f04a95b] {\n  display: grid;\n}\n.d-none[data-v-0f04a95b] {\n  display: none;\n}\n.hide[data-v-0f04a95b] {\n  visibility: hidden;\n}\n.overflow-hidden[data-v-0f04a95b] {\n  overflow: hidden;\n}\n.overflow-auto[data-v-0f04a95b] {\n  overflow: auto;\n}\n.flex-center[data-v-0f04a95b] {\n  justify-content: center;\n}\n.flex-middle[data-v-0f04a95b] {\n  align-items: center;\n}\n.flex-grow[data-v-0f04a95b] {\n  flex-grow: 1;\n}\n.flex-shrink[data-v-0f04a95b] {\n  flex-shrink: 1;\n}\n.flex-vertical[data-v-0f04a95b] {\n  flex-direction: column;\n}\n.flex-space[data-v-0f04a95b] {\n  justify-content: space-between;\n}\n.flex-end[data-v-0f04a95b] {\n  justify-content: flex-end;\n}\n.flex-start[data-v-0f04a95b] {\n  justify-content: flex-start;\n}\n.text-center[data-v-0f04a95b] {\n  text-align: center;\n}\n.m-z[data-v-0f04a95b] {\n  margin: 0 !important;\n}\n.m-n-z[data-v-0f04a95b] {\n  margin-top: 0 !important;\n}\n.m-e-z[data-v-0f04a95b] {\n  margin-right: 0 !important;\n}\n.m-s-z[data-v-0f04a95b] {\n  margin-bottom: 0 !important;\n}\n.m-w-z[data-v-0f04a95b] {\n  margin-left: 0 !important;\n}\n.m-n-xl[data-v-0f04a95b] {\n  margin-top: 25px;\n}\n.m-e-xl[data-v-0f04a95b] {\n  margin-right: 25px;\n}\n.m-s-xl[data-v-0f04a95b] {\n  margin-bottom: 25px;\n}\n.m-w-xl[data-v-0f04a95b] {\n  margin-left: 25px;\n}\n.m-n-lg[data-v-0f04a95b] {\n  margin-top: 20px;\n}\n.m-e-lg[data-v-0f04a95b] {\n  margin-right: 20px;\n}\n.m-s-lg[data-v-0f04a95b] {\n  margin-bottom: 20px;\n}\n.m-w-lg[data-v-0f04a95b] {\n  margin-left: 20px;\n}\n.m-n-med[data-v-0f04a95b] {\n  margin-top: 15px;\n}\n.m-e-med[data-v-0f04a95b] {\n  margin-right: 15px;\n}\n.m-s-med[data-v-0f04a95b] {\n  margin-bottom: 15px;\n}\n.m-w-med[data-v-0f04a95b] {\n  margin-left: 15px;\n}\n.m-n-sm[data-v-0f04a95b] {\n  margin-top: 10px;\n}\n.m-e-sm[data-v-0f04a95b] {\n  margin-right: 10px;\n}\n.m-s-sm[data-v-0f04a95b] {\n  margin-bottom: 10px;\n}\n.m-w-sm[data-v-0f04a95b] {\n  margin-left: 10px;\n}\n.m-n-xs[data-v-0f04a95b] {\n  margin-top: 5px;\n}\n.m-e-xs[data-v-0f04a95b] {\n  margin-right: 5px;\n}\n.m-s-xs[data-v-0f04a95b] {\n  margin-bottom: 5px;\n}\n.m-w-xs[data-v-0f04a95b] {\n  margin-left: 5px;\n}\n.m-n-xxs[data-v-0f04a95b] {\n  margin-top: 2px;\n}\n.m-e-xxs[data-v-0f04a95b] {\n  margin-right: 2px;\n}\n.m-s-xxs[data-v-0f04a95b] {\n  margin-bottom: 2px;\n}\n.m-w-xxs[data-v-0f04a95b] {\n  margin-left: 2px;\n}\n.p-z[data-v-0f04a95b] {\n  padding: 0 !important;\n}\n.p-n-z[data-v-0f04a95b] {\n  padding-top: 0 !important;\n}\n.p-e-z[data-v-0f04a95b] {\n  padding-right: 0 !important;\n}\n.p-s-z[data-v-0f04a95b] {\n  padding-bottom: 0 !important;\n}\n.p-w-z[data-v-0f04a95b] {\n  padding-left: 0 !important;\n}\n.p-n-xl[data-v-0f04a95b] {\n  padding-top: 25px;\n}\n.p-e-xl[data-v-0f04a95b] {\n  padding-right: 25px;\n}\n.p-s-xl[data-v-0f04a95b] {\n  padding-bottom: 25px;\n}\n.p-w-xl[data-v-0f04a95b] {\n  padding-left: 25px;\n}\n.p-n-lg[data-v-0f04a95b] {\n  padding-top: 20px;\n}\n.p-e-lg[data-v-0f04a95b] {\n  padding-right: 20px;\n}\n.p-s-lg[data-v-0f04a95b] {\n  padding-bottom: 20px;\n}\n.p-w-lg[data-v-0f04a95b] {\n  padding-left: 20px;\n}\n.p-n-med[data-v-0f04a95b] {\n  padding-top: 15px;\n}\n.p-e-med[data-v-0f04a95b] {\n  padding-right: 15px;\n}\n.p-s-med[data-v-0f04a95b] {\n  padding-bottom: 15px;\n}\n.p-w-med[data-v-0f04a95b] {\n  padding-left: 15px;\n}\n.p-n-sm[data-v-0f04a95b] {\n  padding-top: 10px;\n}\n.p-e-sm[data-v-0f04a95b] {\n  padding-right: 10px;\n}\n.p-s-sm[data-v-0f04a95b] {\n  padding-bottom: 10px;\n}\n.p-w-sm[data-v-0f04a95b] {\n  padding-left: 10px;\n}\n.p-n-xs[data-v-0f04a95b] {\n  padding-top: 5px;\n}\n.p-e-xs[data-v-0f04a95b] {\n  padding-right: 5px;\n}\n.p-s-xs[data-v-0f04a95b] {\n  padding-bottom: 5px;\n}\n.p-w-xs[data-v-0f04a95b] {\n  padding-left: 5px;\n}\n.p-xs[data-v-0f04a95b] {\n  padding: 5px;\n}\n.p-n-xxs[data-v-0f04a95b] {\n  padding-top: 2px;\n}\n.p-e-xxs[data-v-0f04a95b] {\n  padding-right: 2px;\n}\n.p-s-xxs[data-v-0f04a95b] {\n  padding-bottom: 2px;\n}\n.p-w-xxs[data-v-0f04a95b] {\n  padding-left: 2px;\n}\n.p-xxs[data-v-0f04a95b] {\n  padding: 2px;\n}\n.p-xs[data-v-0f04a95b] {\n  padding: 5px;\n}\n.p-sm[data-v-0f04a95b] {\n  padding: 10px;\n}\n.p-med[data-v-0f04a95b] {\n  padding: 15px;\n}\n.p-lg[data-v-0f04a95b] {\n  padding: 20px;\n}\n.p-xl[data-v-0f04a95b] {\n  padding: 25px;\n}\n.m-xxs[data-v-0f04a95b] {\n  margin: 2px;\n}\n.m-xs[data-v-0f04a95b] {\n  margin: 5px;\n}\n.m-sm[data-v-0f04a95b] {\n  margin: 10px;\n}\n.m-med[data-v-0f04a95b] {\n  margin: 15px;\n}\n.m-lg[data-v-0f04a95b] {\n  margin: 20px;\n}\n.m-xl[data-v-0f04a95b] {\n  margin: 25px;\n}\nsvg[data-v-0f04a95b] {\n  width: auto;\n  height: 100%;\n}\n\n/*# sourceMappingURL=EvIcon.vue.map */", map: {"version":3,"sources":["EvIcon.vue","/Users/john/Code/evwt/packages/EvIcon/src/EvIcon.vue"],"names":[],"mappings":"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","file":"EvIcon.vue","sourcesContent":["* {\n  box-sizing: border-box;\n}\n\n*:before,\n*:after {\n  box-sizing: border-box;\n}\n\n.h-100 {\n  height: 100%;\n}\n\n.vh-100 {\n  height: 100vh;\n}\n\n.w-100 {\n  width: 100%;\n}\n\n.vw-100 {\n  width: 100vw;\n}\n\n.pre-line {\n  white-space: pre-line;\n}\n\n.pre-wrap {\n  white-space: pre-wrap;\n}\n\n.no-wrap {\n  white-space: nowrap;\n}\n\n.d-block {\n  display: block;\n}\n\n.d-inline-block {\n  display: inline-block;\n}\n\n.d-flex {\n  display: flex;\n}\n\n.d-inline-flex {\n  display: inline-flex;\n}\n\n.d-grid {\n  display: grid;\n}\n\n.d-none {\n  display: none;\n}\n\n.hide {\n  visibility: hidden;\n}\n\n.overflow-hidden {\n  overflow: hidden;\n}\n\n.overflow-auto {\n  overflow: auto;\n}\n\n.flex-center {\n  justify-content: center;\n}\n\n.flex-middle {\n  align-items: center;\n}\n\n.flex-grow {\n  flex-grow: 1;\n}\n\n.flex-shrink {\n  flex-shrink: 1;\n}\n\n.flex-vertical {\n  flex-direction: column;\n}\n\n.flex-space {\n  justify-content: space-between;\n}\n\n.flex-end {\n  justify-content: flex-end;\n}\n\n.flex-start {\n  justify-content: flex-start;\n}\n\n.text-center {\n  text-align: center;\n}\n\n.m-z {\n  margin: 0 !important;\n}\n\n.m-n-z {\n  margin-top: 0 !important;\n}\n\n.m-e-z {\n  margin-right: 0 !important;\n}\n\n.m-s-z {\n  margin-bottom: 0 !important;\n}\n\n.m-w-z {\n  margin-left: 0 !important;\n}\n\n.m-n-xl {\n  margin-top: 25px;\n}\n\n.m-e-xl {\n  margin-right: 25px;\n}\n\n.m-s-xl {\n  margin-bottom: 25px;\n}\n\n.m-w-xl {\n  margin-left: 25px;\n}\n\n.m-n-lg {\n  margin-top: 20px;\n}\n\n.m-e-lg {\n  margin-right: 20px;\n}\n\n.m-s-lg {\n  margin-bottom: 20px;\n}\n\n.m-w-lg {\n  margin-left: 20px;\n}\n\n.m-n-med {\n  margin-top: 15px;\n}\n\n.m-e-med {\n  margin-right: 15px;\n}\n\n.m-s-med {\n  margin-bottom: 15px;\n}\n\n.m-w-med {\n  margin-left: 15px;\n}\n\n.m-n-sm {\n  margin-top: 10px;\n}\n\n.m-e-sm {\n  margin-right: 10px;\n}\n\n.m-s-sm {\n  margin-bottom: 10px;\n}\n\n.m-w-sm {\n  margin-left: 10px;\n}\n\n.m-n-xs {\n  margin-top: 5px;\n}\n\n.m-e-xs {\n  margin-right: 5px;\n}\n\n.m-s-xs {\n  margin-bottom: 5px;\n}\n\n.m-w-xs {\n  margin-left: 5px;\n}\n\n.m-n-xxs {\n  margin-top: 2px;\n}\n\n.m-e-xxs {\n  margin-right: 2px;\n}\n\n.m-s-xxs {\n  margin-bottom: 2px;\n}\n\n.m-w-xxs {\n  margin-left: 2px;\n}\n\n.p-z {\n  padding: 0 !important;\n}\n\n.p-n-z {\n  padding-top: 0 !important;\n}\n\n.p-e-z {\n  padding-right: 0 !important;\n}\n\n.p-s-z {\n  padding-bottom: 0 !important;\n}\n\n.p-w-z {\n  padding-left: 0 !important;\n}\n\n.p-n-xl {\n  padding-top: 25px;\n}\n\n.p-e-xl {\n  padding-right: 25px;\n}\n\n.p-s-xl {\n  padding-bottom: 25px;\n}\n\n.p-w-xl {\n  padding-left: 25px;\n}\n\n.p-n-lg {\n  padding-top: 20px;\n}\n\n.p-e-lg {\n  padding-right: 20px;\n}\n\n.p-s-lg {\n  padding-bottom: 20px;\n}\n\n.p-w-lg {\n  padding-left: 20px;\n}\n\n.p-n-med {\n  padding-top: 15px;\n}\n\n.p-e-med {\n  padding-right: 15px;\n}\n\n.p-s-med {\n  padding-bottom: 15px;\n}\n\n.p-w-med {\n  padding-left: 15px;\n}\n\n.p-n-sm {\n  padding-top: 10px;\n}\n\n.p-e-sm {\n  padding-right: 10px;\n}\n\n.p-s-sm {\n  padding-bottom: 10px;\n}\n\n.p-w-sm {\n  padding-left: 10px;\n}\n\n.p-n-xs {\n  padding-top: 5px;\n}\n\n.p-e-xs {\n  padding-right: 5px;\n}\n\n.p-s-xs {\n  padding-bottom: 5px;\n}\n\n.p-w-xs {\n  padding-left: 5px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-n-xxs {\n  padding-top: 2px;\n}\n\n.p-e-xxs {\n  padding-right: 2px;\n}\n\n.p-s-xxs {\n  padding-bottom: 2px;\n}\n\n.p-w-xxs {\n  padding-left: 2px;\n}\n\n.p-xxs {\n  padding: 2px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-sm {\n  padding: 10px;\n}\n\n.p-med {\n  padding: 15px;\n}\n\n.p-lg {\n  padding: 20px;\n}\n\n.p-xl {\n  padding: 25px;\n}\n\n.m-xxs {\n  margin: 2px;\n}\n\n.m-xs {\n  margin: 5px;\n}\n\n.m-sm {\n  margin: 10px;\n}\n\n.m-med {\n  margin: 15px;\n}\n\n.m-lg {\n  margin: 20px;\n}\n\n.m-xl {\n  margin: 25px;\n}\n\nsvg {\n  width: auto;\n  height: 100%;\n}\n\n/*# sourceMappingURL=EvIcon.vue.map */","<template>\n  <div class=\"ev-icon\" :class=\"`ev-icon-${name}`\">\n    <component :is=\"`ev-icon-${name}`\" />\n  </div>\n</template>\n\n<script>\n// @group Components\n// Easily create and use a library of svg icons for your app. Icon svg is inlined into the html so it can be styled with css.\nexport default {\n  props: {\n    // The filename of the icon without the .svg extension\n    name: {\n      type: String,\n      required: true\n    }\n  }\n};\n</script>\n\n<style lang=\"scss\" scoped>\n@import '@/../style/utilities.scss';\n\nsvg {\n  width: auto;\n  height: 100%;\n}\n</style>\n\n<docs>\n\n## Usage\n\nAssuming you have a file named folder-open.svg in /src/icons:\n```vue\n<template>\n  <ev-icon name=\"folder-open\" :size=\"16\" />\n</template>\n\n<script>\nimport { EvIcon } from 'evwt';\n\nexport default {\n  components: {\n    EvIcon\n  }\n};\n</script>\n\n<style>\n.ev-icon-folder-open svg {\n  fill: red;\n}\n</style>\n```\n</docs>\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$2 = "data-v-0f04a95b";
  /* module identifier */
  const __vue_module_identifier__$2 = undefined;
  /* functional template */
  const __vue_is_functional_template__$2 = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$2 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 },
    __vue_inject_styles__$2,
    __vue_script__$2,
    __vue_scope_id__$2,
    __vue_is_functional_template__$2,
    __vue_module_identifier__$2,
    false,
    createInjector,
    undefined,
    undefined
  );

__vue_component__$2.install = function(Vue) {
  Vue.component(__vue_component__$2.name, __vue_component__$2);
};

// @group Components
var script$3 = {
  props: {
    iconShow: {
      type: Boolean,
      default: true
    },
    labels: Boolean,
    minWidth: Number,
    height: Number,
    fontSize: Number,
    iconSize: Number,
    padding: Number,
    iconPos: {
      type: String,
      default: 'aside'
    }
  },

  computed: {
    toolbarStyle() {
      if (this.height) {
        return `height: ${this.height}px`;
      }

      return '';
    }
  },

  render(createElement) {
    for (const vnode of this.$slots.default) {
      vnode.componentOptions.propsData = {
        labels: this.labels,
        iconPos: this.iconPos,
        iconSize: this.iconSize,
        fontSize: this.fontSize,
        minWidth: this.minWidth,
        padding: this.padding,
        iconShow: this.iconShow,
        ...vnode.componentOptions.propsData
      };
    }

    let attrs = {
      class: 'ev-toolbar d-flex h-100 flex-middle p-n-xs p-s-xs p-w-xs p-e-xs',
      style: this.toolbarStyle,
      props: {
        iconPos: this.iconPos,
        iconSize: this.iconSize
      }
    };

    return createElement('div', attrs, this.$slots.default);
  }
};

/* script */
const __vue_script__$3 = script$3;

/* template */

  /* style */
  const __vue_inject_styles__$3 = function (inject) {
    if (!inject) return
    inject("data-v-1d56d89c_0", { source: "*[data-v-1d56d89c] {\n  box-sizing: border-box;\n}\n*[data-v-1d56d89c]:before,\n*[data-v-1d56d89c]:after {\n  box-sizing: border-box;\n}\n.h-100[data-v-1d56d89c] {\n  height: 100%;\n}\n.vh-100[data-v-1d56d89c] {\n  height: 100vh;\n}\n.w-100[data-v-1d56d89c] {\n  width: 100%;\n}\n.vw-100[data-v-1d56d89c] {\n  width: 100vw;\n}\n.pre-line[data-v-1d56d89c] {\n  white-space: pre-line;\n}\n.pre-wrap[data-v-1d56d89c] {\n  white-space: pre-wrap;\n}\n.no-wrap[data-v-1d56d89c] {\n  white-space: nowrap;\n}\n.d-block[data-v-1d56d89c] {\n  display: block;\n}\n.d-inline-block[data-v-1d56d89c] {\n  display: inline-block;\n}\n.d-flex[data-v-1d56d89c] {\n  display: flex;\n}\n.d-inline-flex[data-v-1d56d89c] {\n  display: inline-flex;\n}\n.d-grid[data-v-1d56d89c] {\n  display: grid;\n}\n.d-none[data-v-1d56d89c] {\n  display: none;\n}\n.hide[data-v-1d56d89c] {\n  visibility: hidden;\n}\n.overflow-hidden[data-v-1d56d89c] {\n  overflow: hidden;\n}\n.overflow-auto[data-v-1d56d89c] {\n  overflow: auto;\n}\n.flex-center[data-v-1d56d89c] {\n  justify-content: center;\n}\n.flex-middle[data-v-1d56d89c] {\n  align-items: center;\n}\n.flex-grow[data-v-1d56d89c] {\n  flex-grow: 1;\n}\n.flex-shrink[data-v-1d56d89c] {\n  flex-shrink: 1;\n}\n.flex-vertical[data-v-1d56d89c] {\n  flex-direction: column;\n}\n.flex-space[data-v-1d56d89c] {\n  justify-content: space-between;\n}\n.flex-end[data-v-1d56d89c] {\n  justify-content: flex-end;\n}\n.flex-start[data-v-1d56d89c] {\n  justify-content: flex-start;\n}\n.text-center[data-v-1d56d89c] {\n  text-align: center;\n}\n.m-z[data-v-1d56d89c] {\n  margin: 0 !important;\n}\n.m-n-z[data-v-1d56d89c] {\n  margin-top: 0 !important;\n}\n.m-e-z[data-v-1d56d89c] {\n  margin-right: 0 !important;\n}\n.m-s-z[data-v-1d56d89c] {\n  margin-bottom: 0 !important;\n}\n.m-w-z[data-v-1d56d89c] {\n  margin-left: 0 !important;\n}\n.m-n-xl[data-v-1d56d89c] {\n  margin-top: 25px;\n}\n.m-e-xl[data-v-1d56d89c] {\n  margin-right: 25px;\n}\n.m-s-xl[data-v-1d56d89c] {\n  margin-bottom: 25px;\n}\n.m-w-xl[data-v-1d56d89c] {\n  margin-left: 25px;\n}\n.m-n-lg[data-v-1d56d89c] {\n  margin-top: 20px;\n}\n.m-e-lg[data-v-1d56d89c] {\n  margin-right: 20px;\n}\n.m-s-lg[data-v-1d56d89c] {\n  margin-bottom: 20px;\n}\n.m-w-lg[data-v-1d56d89c] {\n  margin-left: 20px;\n}\n.m-n-med[data-v-1d56d89c] {\n  margin-top: 15px;\n}\n.m-e-med[data-v-1d56d89c] {\n  margin-right: 15px;\n}\n.m-s-med[data-v-1d56d89c] {\n  margin-bottom: 15px;\n}\n.m-w-med[data-v-1d56d89c] {\n  margin-left: 15px;\n}\n.m-n-sm[data-v-1d56d89c] {\n  margin-top: 10px;\n}\n.m-e-sm[data-v-1d56d89c] {\n  margin-right: 10px;\n}\n.m-s-sm[data-v-1d56d89c] {\n  margin-bottom: 10px;\n}\n.m-w-sm[data-v-1d56d89c] {\n  margin-left: 10px;\n}\n.m-n-xs[data-v-1d56d89c] {\n  margin-top: 5px;\n}\n.m-e-xs[data-v-1d56d89c] {\n  margin-right: 5px;\n}\n.m-s-xs[data-v-1d56d89c] {\n  margin-bottom: 5px;\n}\n.m-w-xs[data-v-1d56d89c] {\n  margin-left: 5px;\n}\n.m-n-xxs[data-v-1d56d89c] {\n  margin-top: 2px;\n}\n.m-e-xxs[data-v-1d56d89c] {\n  margin-right: 2px;\n}\n.m-s-xxs[data-v-1d56d89c] {\n  margin-bottom: 2px;\n}\n.m-w-xxs[data-v-1d56d89c] {\n  margin-left: 2px;\n}\n.p-z[data-v-1d56d89c] {\n  padding: 0 !important;\n}\n.p-n-z[data-v-1d56d89c] {\n  padding-top: 0 !important;\n}\n.p-e-z[data-v-1d56d89c] {\n  padding-right: 0 !important;\n}\n.p-s-z[data-v-1d56d89c] {\n  padding-bottom: 0 !important;\n}\n.p-w-z[data-v-1d56d89c] {\n  padding-left: 0 !important;\n}\n.p-n-xl[data-v-1d56d89c] {\n  padding-top: 25px;\n}\n.p-e-xl[data-v-1d56d89c] {\n  padding-right: 25px;\n}\n.p-s-xl[data-v-1d56d89c] {\n  padding-bottom: 25px;\n}\n.p-w-xl[data-v-1d56d89c] {\n  padding-left: 25px;\n}\n.p-n-lg[data-v-1d56d89c] {\n  padding-top: 20px;\n}\n.p-e-lg[data-v-1d56d89c] {\n  padding-right: 20px;\n}\n.p-s-lg[data-v-1d56d89c] {\n  padding-bottom: 20px;\n}\n.p-w-lg[data-v-1d56d89c] {\n  padding-left: 20px;\n}\n.p-n-med[data-v-1d56d89c] {\n  padding-top: 15px;\n}\n.p-e-med[data-v-1d56d89c] {\n  padding-right: 15px;\n}\n.p-s-med[data-v-1d56d89c] {\n  padding-bottom: 15px;\n}\n.p-w-med[data-v-1d56d89c] {\n  padding-left: 15px;\n}\n.p-n-sm[data-v-1d56d89c] {\n  padding-top: 10px;\n}\n.p-e-sm[data-v-1d56d89c] {\n  padding-right: 10px;\n}\n.p-s-sm[data-v-1d56d89c] {\n  padding-bottom: 10px;\n}\n.p-w-sm[data-v-1d56d89c] {\n  padding-left: 10px;\n}\n.p-n-xs[data-v-1d56d89c] {\n  padding-top: 5px;\n}\n.p-e-xs[data-v-1d56d89c] {\n  padding-right: 5px;\n}\n.p-s-xs[data-v-1d56d89c] {\n  padding-bottom: 5px;\n}\n.p-w-xs[data-v-1d56d89c] {\n  padding-left: 5px;\n}\n.p-xs[data-v-1d56d89c] {\n  padding: 5px;\n}\n.p-n-xxs[data-v-1d56d89c] {\n  padding-top: 2px;\n}\n.p-e-xxs[data-v-1d56d89c] {\n  padding-right: 2px;\n}\n.p-s-xxs[data-v-1d56d89c] {\n  padding-bottom: 2px;\n}\n.p-w-xxs[data-v-1d56d89c] {\n  padding-left: 2px;\n}\n.p-xxs[data-v-1d56d89c] {\n  padding: 2px;\n}\n.p-xs[data-v-1d56d89c] {\n  padding: 5px;\n}\n.p-sm[data-v-1d56d89c] {\n  padding: 10px;\n}\n.p-med[data-v-1d56d89c] {\n  padding: 15px;\n}\n.p-lg[data-v-1d56d89c] {\n  padding: 20px;\n}\n.p-xl[data-v-1d56d89c] {\n  padding: 25px;\n}\n.m-xxs[data-v-1d56d89c] {\n  margin: 2px;\n}\n.m-xs[data-v-1d56d89c] {\n  margin: 5px;\n}\n.m-sm[data-v-1d56d89c] {\n  margin: 10px;\n}\n.m-med[data-v-1d56d89c] {\n  margin: 15px;\n}\n.m-lg[data-v-1d56d89c] {\n  margin: 20px;\n}\n.m-xl[data-v-1d56d89c] {\n  margin: 25px;\n}\n.ev-toolbar[data-v-1d56d89c] {\n  user-select: none;\n}\n\n/*# sourceMappingURL=EvToolbar.vue.map */", map: {"version":3,"sources":["EvToolbar.vue","/Users/john/Code/evwt/packages/EvToolbar/src/EvToolbar.vue"],"names":[],"mappings":"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","file":"EvToolbar.vue","sourcesContent":["* {\n  box-sizing: border-box;\n}\n\n*:before,\n*:after {\n  box-sizing: border-box;\n}\n\n.h-100 {\n  height: 100%;\n}\n\n.vh-100 {\n  height: 100vh;\n}\n\n.w-100 {\n  width: 100%;\n}\n\n.vw-100 {\n  width: 100vw;\n}\n\n.pre-line {\n  white-space: pre-line;\n}\n\n.pre-wrap {\n  white-space: pre-wrap;\n}\n\n.no-wrap {\n  white-space: nowrap;\n}\n\n.d-block {\n  display: block;\n}\n\n.d-inline-block {\n  display: inline-block;\n}\n\n.d-flex {\n  display: flex;\n}\n\n.d-inline-flex {\n  display: inline-flex;\n}\n\n.d-grid {\n  display: grid;\n}\n\n.d-none {\n  display: none;\n}\n\n.hide {\n  visibility: hidden;\n}\n\n.overflow-hidden {\n  overflow: hidden;\n}\n\n.overflow-auto {\n  overflow: auto;\n}\n\n.flex-center {\n  justify-content: center;\n}\n\n.flex-middle {\n  align-items: center;\n}\n\n.flex-grow {\n  flex-grow: 1;\n}\n\n.flex-shrink {\n  flex-shrink: 1;\n}\n\n.flex-vertical {\n  flex-direction: column;\n}\n\n.flex-space {\n  justify-content: space-between;\n}\n\n.flex-end {\n  justify-content: flex-end;\n}\n\n.flex-start {\n  justify-content: flex-start;\n}\n\n.text-center {\n  text-align: center;\n}\n\n.m-z {\n  margin: 0 !important;\n}\n\n.m-n-z {\n  margin-top: 0 !important;\n}\n\n.m-e-z {\n  margin-right: 0 !important;\n}\n\n.m-s-z {\n  margin-bottom: 0 !important;\n}\n\n.m-w-z {\n  margin-left: 0 !important;\n}\n\n.m-n-xl {\n  margin-top: 25px;\n}\n\n.m-e-xl {\n  margin-right: 25px;\n}\n\n.m-s-xl {\n  margin-bottom: 25px;\n}\n\n.m-w-xl {\n  margin-left: 25px;\n}\n\n.m-n-lg {\n  margin-top: 20px;\n}\n\n.m-e-lg {\n  margin-right: 20px;\n}\n\n.m-s-lg {\n  margin-bottom: 20px;\n}\n\n.m-w-lg {\n  margin-left: 20px;\n}\n\n.m-n-med {\n  margin-top: 15px;\n}\n\n.m-e-med {\n  margin-right: 15px;\n}\n\n.m-s-med {\n  margin-bottom: 15px;\n}\n\n.m-w-med {\n  margin-left: 15px;\n}\n\n.m-n-sm {\n  margin-top: 10px;\n}\n\n.m-e-sm {\n  margin-right: 10px;\n}\n\n.m-s-sm {\n  margin-bottom: 10px;\n}\n\n.m-w-sm {\n  margin-left: 10px;\n}\n\n.m-n-xs {\n  margin-top: 5px;\n}\n\n.m-e-xs {\n  margin-right: 5px;\n}\n\n.m-s-xs {\n  margin-bottom: 5px;\n}\n\n.m-w-xs {\n  margin-left: 5px;\n}\n\n.m-n-xxs {\n  margin-top: 2px;\n}\n\n.m-e-xxs {\n  margin-right: 2px;\n}\n\n.m-s-xxs {\n  margin-bottom: 2px;\n}\n\n.m-w-xxs {\n  margin-left: 2px;\n}\n\n.p-z {\n  padding: 0 !important;\n}\n\n.p-n-z {\n  padding-top: 0 !important;\n}\n\n.p-e-z {\n  padding-right: 0 !important;\n}\n\n.p-s-z {\n  padding-bottom: 0 !important;\n}\n\n.p-w-z {\n  padding-left: 0 !important;\n}\n\n.p-n-xl {\n  padding-top: 25px;\n}\n\n.p-e-xl {\n  padding-right: 25px;\n}\n\n.p-s-xl {\n  padding-bottom: 25px;\n}\n\n.p-w-xl {\n  padding-left: 25px;\n}\n\n.p-n-lg {\n  padding-top: 20px;\n}\n\n.p-e-lg {\n  padding-right: 20px;\n}\n\n.p-s-lg {\n  padding-bottom: 20px;\n}\n\n.p-w-lg {\n  padding-left: 20px;\n}\n\n.p-n-med {\n  padding-top: 15px;\n}\n\n.p-e-med {\n  padding-right: 15px;\n}\n\n.p-s-med {\n  padding-bottom: 15px;\n}\n\n.p-w-med {\n  padding-left: 15px;\n}\n\n.p-n-sm {\n  padding-top: 10px;\n}\n\n.p-e-sm {\n  padding-right: 10px;\n}\n\n.p-s-sm {\n  padding-bottom: 10px;\n}\n\n.p-w-sm {\n  padding-left: 10px;\n}\n\n.p-n-xs {\n  padding-top: 5px;\n}\n\n.p-e-xs {\n  padding-right: 5px;\n}\n\n.p-s-xs {\n  padding-bottom: 5px;\n}\n\n.p-w-xs {\n  padding-left: 5px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-n-xxs {\n  padding-top: 2px;\n}\n\n.p-e-xxs {\n  padding-right: 2px;\n}\n\n.p-s-xxs {\n  padding-bottom: 2px;\n}\n\n.p-w-xxs {\n  padding-left: 2px;\n}\n\n.p-xxs {\n  padding: 2px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-sm {\n  padding: 10px;\n}\n\n.p-med {\n  padding: 15px;\n}\n\n.p-lg {\n  padding: 20px;\n}\n\n.p-xl {\n  padding: 25px;\n}\n\n.m-xxs {\n  margin: 2px;\n}\n\n.m-xs {\n  margin: 5px;\n}\n\n.m-sm {\n  margin: 10px;\n}\n\n.m-med {\n  margin: 15px;\n}\n\n.m-lg {\n  margin: 20px;\n}\n\n.m-xl {\n  margin: 25px;\n}\n\n.ev-toolbar {\n  user-select: none;\n}\n\n/*# sourceMappingURL=EvToolbar.vue.map */","<script>\n// @group Components\nexport default {\n  props: {\n    iconShow: {\n      type: Boolean,\n      default: true\n    },\n    labels: Boolean,\n    minWidth: Number,\n    height: Number,\n    fontSize: Number,\n    iconSize: Number,\n    padding: Number,\n    iconPos: {\n      type: String,\n      default: 'aside'\n    }\n  },\n\n  computed: {\n    toolbarStyle() {\n      if (this.height) {\n        return `height: ${this.height}px`;\n      }\n\n      return '';\n    }\n  },\n\n  render(createElement) {\n    for (const vnode of this.$slots.default) {\n      vnode.componentOptions.propsData = {\n        labels: this.labels,\n        iconPos: this.iconPos,\n        iconSize: this.iconSize,\n        fontSize: this.fontSize,\n        minWidth: this.minWidth,\n        padding: this.padding,\n        iconShow: this.iconShow,\n        ...vnode.componentOptions.propsData\n      };\n    }\n\n    let attrs = {\n      class: 'ev-toolbar d-flex h-100 flex-middle p-n-xs p-s-xs p-w-xs p-e-xs',\n      style: this.toolbarStyle,\n      props: {\n        iconPos: this.iconPos,\n        iconSize: this.iconSize\n      }\n    };\n\n    return createElement('div', attrs, this.$slots.default);\n  }\n};\n</script>\n\n<style lang=\"scss\" scoped>\n@import '@/../style/utilities.scss';\n\n.ev-toolbar {\n  user-select: none;\n}\n</style>\n\n<docs>\n\n## Setup\n\n```js\nimport { EvToolbar, EvToolbarItem } from 'evwt';\n\nexport default {\n  components: {\n    EvToolbar,\n    EvToolbarItem\n  }\n}\n```\n\n## Usage\n```vue\n  <ev-toolbar :icon-size=\"16\" icon-pos=\"above\" :icon-show=\"true\" :labels=\"true\" :min-width=\"32\" :font-size=\"11\" :padding=\"5\">\n    <ev-toolbar-item menu-id=\"new-file\" icon=\"file-plus\" label=\"New\" tooltip=\"New File\" />\n    <ev-toolbar-item menu-id=\"open-file\" icon=\"folder-open\" label=\"Open\" tooltip=\"Open File\" @click.native=\"handleOpenFile\" />\n    <ev-toolbar-item menu-id=\"save-file\" icon=\"save\" label=\"Save\" tooltip=\"Save File\" />\n  </ev-toolbar>\n```\n</docs>\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$3 = "data-v-1d56d89c";
  /* module identifier */
  const __vue_module_identifier__$3 = undefined;
  /* functional template */
  const __vue_is_functional_template__$3 = undefined;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$3 = /*#__PURE__*/normalizeComponent(
    {},
    __vue_inject_styles__$3,
    __vue_script__$3,
    __vue_scope_id__$3,
    __vue_is_functional_template__$3,
    __vue_module_identifier__$3,
    false,
    createInjector,
    undefined,
    undefined
  );

__vue_component__$3.install = function(Vue) {
  Vue.component(__vue_component__$3.name, __vue_component__$3);
};

//

const PADDING_XS = 5;

// @group Components
var script$4 = {
  name: 'EvToolbarItem',

  components: {
    EvIcon: __vue_component__$2
  },

  props: {
    menuId: String,
    icon: String,
    iconPos: String,
    fontSize: Number,
    iconSize: Number,
    label: String,
    labels: Boolean,
    iconShow: Boolean,
    minWidth: Number,
    tooltip: String,
    padding: Number,
    disabled: Boolean
  },

  computed: {
    labelStyle() {
      let style = {
        lineHeight: 1
      };

      if (this.fontSize) {
        style.fontSize = `${this.fontSize}px`;
      }

      return style;
    },

    itemStyle() {
      let style = {
        padding: `${this.padding || PADDING_XS}px`
      };

      if (this.minWidth) {
        style.minWidth = `${this.minWidth}px`;
      }

      return style;
    },

    iconStyle() {
      return `height: ${this.iconSize}px`;
    },

    labelClass() {
      if (this.iconPos === 'aside') {
        return 'p-w-xs';
      }

      if (this.iconShow) return 'p-n-xxs';

      return '';
    },

    itemClass() {
      let classes = 'flex-center flex-middle';

      if (this.iconPos === 'above') {
        classes += ' flex-vertical p-n-xs p-s-xs';
      }

      if (this.menuItem.enabled === false) {
        classes += ' ev-disabled';
      }

      if (this.menuItem.checked === true) {
        classes += ' ev-selected';
      }

      return classes;
    },

    menuItem() {
      return this.$evmenu.get(this.menuId) || {};
    }
  },

  methods: {
    handleClick() {
      if (!this.$evmenu) return;

      let menuItem = this.$evmenu.get(this.menuId);

      if (menuItem) {
        if (menuItem.type === 'checkbox') {
          menuItem.checked = !menuItem.checked;
        }
      }
    }
  }
};

/* script */
const __vue_script__$4 = script$4;

/* template */
var __vue_render__$3 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "ev-toolbar-item d-flex h-100 m-e-xs",
      class: _vm.itemClass,
      style: _vm.itemStyle,
      attrs: { title: _vm.tooltip },
      on: { click: _vm.handleClick }
    },
    [
      _vm.iconShow
        ? _c("ev-icon", {
            staticClass: "h-100",
            style: _vm.iconStyle,
            attrs: { name: _vm.icon }
          })
        : _vm._e(),
      _vm._v(" "),
      _vm.labels
        ? _c("label", { class: _vm.labelClass, style: _vm.labelStyle }, [
            _vm._v("\n    " + _vm._s(_vm.label) + "\n  ")
          ])
        : _vm._e()
    ],
    1
  )
};
var __vue_staticRenderFns__$3 = [];
__vue_render__$3._withStripped = true;

  /* style */
  const __vue_inject_styles__$4 = function (inject) {
    if (!inject) return
    inject("data-v-a7c84462_0", { source: "*[data-v-a7c84462] {\n  box-sizing: border-box;\n}\n*[data-v-a7c84462]:before,\n*[data-v-a7c84462]:after {\n  box-sizing: border-box;\n}\n.h-100[data-v-a7c84462] {\n  height: 100%;\n}\n.vh-100[data-v-a7c84462] {\n  height: 100vh;\n}\n.w-100[data-v-a7c84462] {\n  width: 100%;\n}\n.vw-100[data-v-a7c84462] {\n  width: 100vw;\n}\n.pre-line[data-v-a7c84462] {\n  white-space: pre-line;\n}\n.pre-wrap[data-v-a7c84462] {\n  white-space: pre-wrap;\n}\n.no-wrap[data-v-a7c84462] {\n  white-space: nowrap;\n}\n.d-block[data-v-a7c84462] {\n  display: block;\n}\n.d-inline-block[data-v-a7c84462] {\n  display: inline-block;\n}\n.d-flex[data-v-a7c84462] {\n  display: flex;\n}\n.d-inline-flex[data-v-a7c84462] {\n  display: inline-flex;\n}\n.d-grid[data-v-a7c84462] {\n  display: grid;\n}\n.d-none[data-v-a7c84462] {\n  display: none;\n}\n.hide[data-v-a7c84462] {\n  visibility: hidden;\n}\n.overflow-hidden[data-v-a7c84462] {\n  overflow: hidden;\n}\n.overflow-auto[data-v-a7c84462] {\n  overflow: auto;\n}\n.flex-center[data-v-a7c84462] {\n  justify-content: center;\n}\n.flex-middle[data-v-a7c84462] {\n  align-items: center;\n}\n.flex-grow[data-v-a7c84462] {\n  flex-grow: 1;\n}\n.flex-shrink[data-v-a7c84462] {\n  flex-shrink: 1;\n}\n.flex-vertical[data-v-a7c84462] {\n  flex-direction: column;\n}\n.flex-space[data-v-a7c84462] {\n  justify-content: space-between;\n}\n.flex-end[data-v-a7c84462] {\n  justify-content: flex-end;\n}\n.flex-start[data-v-a7c84462] {\n  justify-content: flex-start;\n}\n.text-center[data-v-a7c84462] {\n  text-align: center;\n}\n.m-z[data-v-a7c84462] {\n  margin: 0 !important;\n}\n.m-n-z[data-v-a7c84462] {\n  margin-top: 0 !important;\n}\n.m-e-z[data-v-a7c84462] {\n  margin-right: 0 !important;\n}\n.m-s-z[data-v-a7c84462] {\n  margin-bottom: 0 !important;\n}\n.m-w-z[data-v-a7c84462] {\n  margin-left: 0 !important;\n}\n.m-n-xl[data-v-a7c84462] {\n  margin-top: 25px;\n}\n.m-e-xl[data-v-a7c84462] {\n  margin-right: 25px;\n}\n.m-s-xl[data-v-a7c84462] {\n  margin-bottom: 25px;\n}\n.m-w-xl[data-v-a7c84462] {\n  margin-left: 25px;\n}\n.m-n-lg[data-v-a7c84462] {\n  margin-top: 20px;\n}\n.m-e-lg[data-v-a7c84462] {\n  margin-right: 20px;\n}\n.m-s-lg[data-v-a7c84462] {\n  margin-bottom: 20px;\n}\n.m-w-lg[data-v-a7c84462] {\n  margin-left: 20px;\n}\n.m-n-med[data-v-a7c84462] {\n  margin-top: 15px;\n}\n.m-e-med[data-v-a7c84462] {\n  margin-right: 15px;\n}\n.m-s-med[data-v-a7c84462] {\n  margin-bottom: 15px;\n}\n.m-w-med[data-v-a7c84462] {\n  margin-left: 15px;\n}\n.m-n-sm[data-v-a7c84462] {\n  margin-top: 10px;\n}\n.m-e-sm[data-v-a7c84462] {\n  margin-right: 10px;\n}\n.m-s-sm[data-v-a7c84462] {\n  margin-bottom: 10px;\n}\n.m-w-sm[data-v-a7c84462] {\n  margin-left: 10px;\n}\n.m-n-xs[data-v-a7c84462] {\n  margin-top: 5px;\n}\n.m-e-xs[data-v-a7c84462] {\n  margin-right: 5px;\n}\n.m-s-xs[data-v-a7c84462] {\n  margin-bottom: 5px;\n}\n.m-w-xs[data-v-a7c84462] {\n  margin-left: 5px;\n}\n.m-n-xxs[data-v-a7c84462] {\n  margin-top: 2px;\n}\n.m-e-xxs[data-v-a7c84462] {\n  margin-right: 2px;\n}\n.m-s-xxs[data-v-a7c84462] {\n  margin-bottom: 2px;\n}\n.m-w-xxs[data-v-a7c84462] {\n  margin-left: 2px;\n}\n.p-z[data-v-a7c84462] {\n  padding: 0 !important;\n}\n.p-n-z[data-v-a7c84462] {\n  padding-top: 0 !important;\n}\n.p-e-z[data-v-a7c84462] {\n  padding-right: 0 !important;\n}\n.p-s-z[data-v-a7c84462] {\n  padding-bottom: 0 !important;\n}\n.p-w-z[data-v-a7c84462] {\n  padding-left: 0 !important;\n}\n.p-n-xl[data-v-a7c84462] {\n  padding-top: 25px;\n}\n.p-e-xl[data-v-a7c84462] {\n  padding-right: 25px;\n}\n.p-s-xl[data-v-a7c84462] {\n  padding-bottom: 25px;\n}\n.p-w-xl[data-v-a7c84462] {\n  padding-left: 25px;\n}\n.p-n-lg[data-v-a7c84462] {\n  padding-top: 20px;\n}\n.p-e-lg[data-v-a7c84462] {\n  padding-right: 20px;\n}\n.p-s-lg[data-v-a7c84462] {\n  padding-bottom: 20px;\n}\n.p-w-lg[data-v-a7c84462] {\n  padding-left: 20px;\n}\n.p-n-med[data-v-a7c84462] {\n  padding-top: 15px;\n}\n.p-e-med[data-v-a7c84462] {\n  padding-right: 15px;\n}\n.p-s-med[data-v-a7c84462] {\n  padding-bottom: 15px;\n}\n.p-w-med[data-v-a7c84462] {\n  padding-left: 15px;\n}\n.p-n-sm[data-v-a7c84462] {\n  padding-top: 10px;\n}\n.p-e-sm[data-v-a7c84462] {\n  padding-right: 10px;\n}\n.p-s-sm[data-v-a7c84462] {\n  padding-bottom: 10px;\n}\n.p-w-sm[data-v-a7c84462] {\n  padding-left: 10px;\n}\n.p-n-xs[data-v-a7c84462] {\n  padding-top: 5px;\n}\n.p-e-xs[data-v-a7c84462] {\n  padding-right: 5px;\n}\n.p-s-xs[data-v-a7c84462] {\n  padding-bottom: 5px;\n}\n.p-w-xs[data-v-a7c84462] {\n  padding-left: 5px;\n}\n.p-xs[data-v-a7c84462] {\n  padding: 5px;\n}\n.p-n-xxs[data-v-a7c84462] {\n  padding-top: 2px;\n}\n.p-e-xxs[data-v-a7c84462] {\n  padding-right: 2px;\n}\n.p-s-xxs[data-v-a7c84462] {\n  padding-bottom: 2px;\n}\n.p-w-xxs[data-v-a7c84462] {\n  padding-left: 2px;\n}\n.p-xxs[data-v-a7c84462] {\n  padding: 2px;\n}\n.p-xs[data-v-a7c84462] {\n  padding: 5px;\n}\n.p-sm[data-v-a7c84462] {\n  padding: 10px;\n}\n.p-med[data-v-a7c84462] {\n  padding: 15px;\n}\n.p-lg[data-v-a7c84462] {\n  padding: 20px;\n}\n.p-xl[data-v-a7c84462] {\n  padding: 25px;\n}\n.m-xxs[data-v-a7c84462] {\n  margin: 2px;\n}\n.m-xs[data-v-a7c84462] {\n  margin: 5px;\n}\n.m-sm[data-v-a7c84462] {\n  margin: 10px;\n}\n.m-med[data-v-a7c84462] {\n  margin: 15px;\n}\n.m-lg[data-v-a7c84462] {\n  margin: 20px;\n}\n.m-xl[data-v-a7c84462] {\n  margin: 25px;\n}\n.ev-toolbar-item[data-v-a7c84462] {\n  user-select: none;\n}\n.ev-toolbar-item[data-v-a7c84462]:active, .ev-toolbar-item.ev-active[data-v-a7c84462] {\n  transform: scale(0.94);\n}\n.ev-toolbar-item.ev-disabled[data-v-a7c84462] {\n  pointer-events: none;\n  opacity: 0.5;\n}\n\n/*# sourceMappingURL=EvToolbarItem.vue.map */", map: {"version":3,"sources":["EvToolbarItem.vue","/Users/john/Code/evwt/packages/EvToolbarItem/src/EvToolbarItem.vue"],"names":[],"mappings":"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","file":"EvToolbarItem.vue","sourcesContent":["* {\n  box-sizing: border-box;\n}\n\n*:before,\n*:after {\n  box-sizing: border-box;\n}\n\n.h-100 {\n  height: 100%;\n}\n\n.vh-100 {\n  height: 100vh;\n}\n\n.w-100 {\n  width: 100%;\n}\n\n.vw-100 {\n  width: 100vw;\n}\n\n.pre-line {\n  white-space: pre-line;\n}\n\n.pre-wrap {\n  white-space: pre-wrap;\n}\n\n.no-wrap {\n  white-space: nowrap;\n}\n\n.d-block {\n  display: block;\n}\n\n.d-inline-block {\n  display: inline-block;\n}\n\n.d-flex {\n  display: flex;\n}\n\n.d-inline-flex {\n  display: inline-flex;\n}\n\n.d-grid {\n  display: grid;\n}\n\n.d-none {\n  display: none;\n}\n\n.hide {\n  visibility: hidden;\n}\n\n.overflow-hidden {\n  overflow: hidden;\n}\n\n.overflow-auto {\n  overflow: auto;\n}\n\n.flex-center {\n  justify-content: center;\n}\n\n.flex-middle {\n  align-items: center;\n}\n\n.flex-grow {\n  flex-grow: 1;\n}\n\n.flex-shrink {\n  flex-shrink: 1;\n}\n\n.flex-vertical {\n  flex-direction: column;\n}\n\n.flex-space {\n  justify-content: space-between;\n}\n\n.flex-end {\n  justify-content: flex-end;\n}\n\n.flex-start {\n  justify-content: flex-start;\n}\n\n.text-center {\n  text-align: center;\n}\n\n.m-z {\n  margin: 0 !important;\n}\n\n.m-n-z {\n  margin-top: 0 !important;\n}\n\n.m-e-z {\n  margin-right: 0 !important;\n}\n\n.m-s-z {\n  margin-bottom: 0 !important;\n}\n\n.m-w-z {\n  margin-left: 0 !important;\n}\n\n.m-n-xl {\n  margin-top: 25px;\n}\n\n.m-e-xl {\n  margin-right: 25px;\n}\n\n.m-s-xl {\n  margin-bottom: 25px;\n}\n\n.m-w-xl {\n  margin-left: 25px;\n}\n\n.m-n-lg {\n  margin-top: 20px;\n}\n\n.m-e-lg {\n  margin-right: 20px;\n}\n\n.m-s-lg {\n  margin-bottom: 20px;\n}\n\n.m-w-lg {\n  margin-left: 20px;\n}\n\n.m-n-med {\n  margin-top: 15px;\n}\n\n.m-e-med {\n  margin-right: 15px;\n}\n\n.m-s-med {\n  margin-bottom: 15px;\n}\n\n.m-w-med {\n  margin-left: 15px;\n}\n\n.m-n-sm {\n  margin-top: 10px;\n}\n\n.m-e-sm {\n  margin-right: 10px;\n}\n\n.m-s-sm {\n  margin-bottom: 10px;\n}\n\n.m-w-sm {\n  margin-left: 10px;\n}\n\n.m-n-xs {\n  margin-top: 5px;\n}\n\n.m-e-xs {\n  margin-right: 5px;\n}\n\n.m-s-xs {\n  margin-bottom: 5px;\n}\n\n.m-w-xs {\n  margin-left: 5px;\n}\n\n.m-n-xxs {\n  margin-top: 2px;\n}\n\n.m-e-xxs {\n  margin-right: 2px;\n}\n\n.m-s-xxs {\n  margin-bottom: 2px;\n}\n\n.m-w-xxs {\n  margin-left: 2px;\n}\n\n.p-z {\n  padding: 0 !important;\n}\n\n.p-n-z {\n  padding-top: 0 !important;\n}\n\n.p-e-z {\n  padding-right: 0 !important;\n}\n\n.p-s-z {\n  padding-bottom: 0 !important;\n}\n\n.p-w-z {\n  padding-left: 0 !important;\n}\n\n.p-n-xl {\n  padding-top: 25px;\n}\n\n.p-e-xl {\n  padding-right: 25px;\n}\n\n.p-s-xl {\n  padding-bottom: 25px;\n}\n\n.p-w-xl {\n  padding-left: 25px;\n}\n\n.p-n-lg {\n  padding-top: 20px;\n}\n\n.p-e-lg {\n  padding-right: 20px;\n}\n\n.p-s-lg {\n  padding-bottom: 20px;\n}\n\n.p-w-lg {\n  padding-left: 20px;\n}\n\n.p-n-med {\n  padding-top: 15px;\n}\n\n.p-e-med {\n  padding-right: 15px;\n}\n\n.p-s-med {\n  padding-bottom: 15px;\n}\n\n.p-w-med {\n  padding-left: 15px;\n}\n\n.p-n-sm {\n  padding-top: 10px;\n}\n\n.p-e-sm {\n  padding-right: 10px;\n}\n\n.p-s-sm {\n  padding-bottom: 10px;\n}\n\n.p-w-sm {\n  padding-left: 10px;\n}\n\n.p-n-xs {\n  padding-top: 5px;\n}\n\n.p-e-xs {\n  padding-right: 5px;\n}\n\n.p-s-xs {\n  padding-bottom: 5px;\n}\n\n.p-w-xs {\n  padding-left: 5px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-n-xxs {\n  padding-top: 2px;\n}\n\n.p-e-xxs {\n  padding-right: 2px;\n}\n\n.p-s-xxs {\n  padding-bottom: 2px;\n}\n\n.p-w-xxs {\n  padding-left: 2px;\n}\n\n.p-xxs {\n  padding: 2px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-sm {\n  padding: 10px;\n}\n\n.p-med {\n  padding: 15px;\n}\n\n.p-lg {\n  padding: 20px;\n}\n\n.p-xl {\n  padding: 25px;\n}\n\n.m-xxs {\n  margin: 2px;\n}\n\n.m-xs {\n  margin: 5px;\n}\n\n.m-sm {\n  margin: 10px;\n}\n\n.m-med {\n  margin: 15px;\n}\n\n.m-lg {\n  margin: 20px;\n}\n\n.m-xl {\n  margin: 25px;\n}\n\n.ev-toolbar-item {\n  user-select: none;\n}\n.ev-toolbar-item:active, .ev-toolbar-item.ev-active {\n  transform: scale(0.94);\n}\n.ev-toolbar-item.ev-disabled {\n  pointer-events: none;\n  opacity: 0.5;\n}\n\n/*# sourceMappingURL=EvToolbarItem.vue.map */","<template>\n  <div\n    class=\"ev-toolbar-item d-flex h-100 m-e-xs\"\n    :title=\"tooltip\"\n    :class=\"itemClass\"\n    :style=\"itemStyle\"\n    @click=\"handleClick\">\n    <ev-icon v-if=\"iconShow\" class=\"h-100\" :name=\"icon\" :style=\"iconStyle\" />\n    <label v-if=\"labels\" :class=\"labelClass\" :style=\"labelStyle\">\n      {{ label }}\n    </label>\n  </div>\n</template>\n\n<script>\nimport EvIcon from '../../EvIcon';\n\nconst PADDING_XS = 5;\n\n// @group Components\nexport default {\n  name: 'EvToolbarItem',\n\n  components: {\n    EvIcon\n  },\n\n  props: {\n    menuId: String,\n    icon: String,\n    iconPos: String,\n    fontSize: Number,\n    iconSize: Number,\n    label: String,\n    labels: Boolean,\n    iconShow: Boolean,\n    minWidth: Number,\n    tooltip: String,\n    padding: Number,\n    disabled: Boolean\n  },\n\n  computed: {\n    labelStyle() {\n      let style = {\n        lineHeight: 1\n      };\n\n      if (this.fontSize) {\n        style.fontSize = `${this.fontSize}px`;\n      }\n\n      return style;\n    },\n\n    itemStyle() {\n      let style = {\n        padding: `${this.padding || PADDING_XS}px`\n      };\n\n      if (this.minWidth) {\n        style.minWidth = `${this.minWidth}px`;\n      }\n\n      return style;\n    },\n\n    iconStyle() {\n      return `height: ${this.iconSize}px`;\n    },\n\n    labelClass() {\n      if (this.iconPos === 'aside') {\n        return 'p-w-xs';\n      }\n\n      if (this.iconShow) return 'p-n-xxs';\n\n      return '';\n    },\n\n    itemClass() {\n      let classes = 'flex-center flex-middle';\n\n      if (this.iconPos === 'above') {\n        classes += ' flex-vertical p-n-xs p-s-xs';\n      }\n\n      if (this.menuItem.enabled === false) {\n        classes += ' ev-disabled';\n      }\n\n      if (this.menuItem.checked === true) {\n        classes += ' ev-selected';\n      }\n\n      return classes;\n    },\n\n    menuItem() {\n      return this.$evmenu.get(this.menuId) || {};\n    }\n  },\n\n  methods: {\n    handleClick() {\n      if (!this.$evmenu) return;\n\n      let menuItem = this.$evmenu.get(this.menuId);\n\n      if (menuItem) {\n        if (menuItem.type === 'checkbox') {\n          menuItem.checked = !menuItem.checked;\n        }\n      }\n    }\n  }\n};\n</script>\n\n<style lang=\"scss\" scoped>\n@import '@/../style/utilities.scss';\n\n.ev-toolbar-item {\n  user-select: none;\n\n  &:active,\n  &.ev-active {\n    transform: scale(0.94);\n  }\n\n  &.ev-disabled {\n    pointer-events: none;\n    opacity: 0.5;\n  }\n}\n</style>\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$4 = "data-v-a7c84462";
  /* module identifier */
  const __vue_module_identifier__$4 = undefined;
  /* functional template */
  const __vue_is_functional_template__$4 = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$4 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$3, staticRenderFns: __vue_staticRenderFns__$3 },
    __vue_inject_styles__$4,
    __vue_script__$4,
    __vue_scope_id__$4,
    __vue_is_functional_template__$4,
    __vue_module_identifier__$4,
    false,
    createInjector,
    undefined,
    undefined
  );

__vue_component__$4.install = function(Vue) {
  Vue.component(__vue_component__$4.name, __vue_component__$4);
};

//
//
//
//
//
//
//
//
//
//
//
//
//
//

// @group Components
var script$5 = {
  props: {
    items: Array,
    keyField: String,
    rowHeight: Number
  },

  data() {
    return {
      rootHeight: window.innerHeight,
      scrollTop: 0,
      nodePadding: 10
    };
  },

  computed: {
    viewportHeight() {
      return this.itemCount * this.rowHeight;
    },

    startIndex() {
      let startNode = Math.floor(this.scrollTop / this.rowHeight) - this.nodePadding;
      startNode = Math.max(0, startNode);
      return startNode;
    },

    visibleNodeCount() {
      let count = Math.ceil(this.rootHeight / this.rowHeight) + 2 * this.nodePadding;
      count = Math.min(this.itemCount - this.startIndex, count);
      return count;
    },

    visibleItems() {
      return this.items.slice(
        this.startIndex,
        this.startIndex + this.visibleNodeCount
      );
    },

    itemCount() {
      return this.items.length;
    },

    offsetY() {
      return this.startIndex * this.rowHeight;
    },

    spacerStyle() {
      return {
        transform: `translateY(${this.offsetY}px)`
      };
    },

    viewportStyle() {
      return {
        overflow: 'hidden',
        height: `${this.viewportHeight}px`,
        position: 'relative'
      };
    },

    rootStyle() {
      return {
        height: `${this.rootHeight}px`,
        overflow: 'auto'
      };
    },

    itemStyle() {
      return {
        height: `${this.rowHeight}px`
      };
    }
  },

  mounted() {
    this.$refs.root.addEventListener(
      'scroll',
      this.handleScroll,
      { passive: true }
    );

    this.observeSize();
  },

  beforeDestroy() {
    this.$refs.root.removeEventListener('scroll', this.handleScroll);
  },

  methods: {
    handleScroll() {
      this.scrollTop = this.$refs.root.scrollTop;
    },

    observeSize() {
      let rootSizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          let { contentRect } = entry;
          this.rootHeight = contentRect.height;
        }
      });

      rootSizeObserver.observe(this.$refs.root.parentElement);
    }
  }
};

/* script */
const __vue_script__$5 = script$5;

/* template */
var __vue_render__$4 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { ref: "root", staticClass: "root", style: _vm.rootStyle }, [
    _c(
      "div",
      { ref: "viewport", staticClass: "viewport", style: _vm.viewportStyle },
      [
        _c(
          "div",
          { ref: "spacer", staticClass: "spacer", style: _vm.spacerStyle },
          _vm._l(_vm.visibleItems, function(item) {
            return _c(
              "div",
              { key: item[_vm.keyField], style: _vm.itemStyle },
              [
                _vm._t(
                  "default",
                  [_vm._v("\n          " + _vm._s(item) + "\n        ")],
                  { item: item }
                )
              ],
              2
            )
          }),
          0
        )
      ]
    )
  ])
};
var __vue_staticRenderFns__$4 = [];
__vue_render__$4._withStripped = true;

  /* style */
  const __vue_inject_styles__$5 = function (inject) {
    if (!inject) return
    inject("data-v-673476b4_0", { source: ".root[data-v-673476b4] {\n  min-height: 100%;\n}\n.viewport[data-v-673476b4] {\n  overflow-y: auto;\n}\n\n/*# sourceMappingURL=EvVirtualScroll.vue.map */", map: {"version":3,"sources":["/Users/john/Code/evwt/packages/EvVirtualScroll/src/EvVirtualScroll.vue","EvVirtualScroll.vue"],"names":[],"mappings":"AA6HA;EACA,gBAAA;AC5HA;AD+HA;EACA,gBAAA;AC5HA;;AAEA,8CAA8C","file":"EvVirtualScroll.vue","sourcesContent":["<template>\n  <div ref=\"root\" class=\"root\" :style=\"rootStyle\">\n    <div ref=\"viewport\" class=\"viewport\" :style=\"viewportStyle\">\n      <div ref=\"spacer\" class=\"spacer\" :style=\"spacerStyle\">\n        <div v-for=\"item in visibleItems\" :key=\"item[keyField]\" :style=\"itemStyle\">\n          <slot :item=\"item\">\n            {{ item }}\n          </slot>\n        </div>\n      </div>\n    </div>\n  </div>\n</template>\n\n<script>\n// @group Components\nexport default {\n  props: {\n    items: Array,\n    keyField: String,\n    rowHeight: Number\n  },\n\n  data() {\n    return {\n      rootHeight: window.innerHeight,\n      scrollTop: 0,\n      nodePadding: 10\n    };\n  },\n\n  computed: {\n    viewportHeight() {\n      return this.itemCount * this.rowHeight;\n    },\n\n    startIndex() {\n      let startNode = Math.floor(this.scrollTop / this.rowHeight) - this.nodePadding;\n      startNode = Math.max(0, startNode);\n      return startNode;\n    },\n\n    visibleNodeCount() {\n      let count = Math.ceil(this.rootHeight / this.rowHeight) + 2 * this.nodePadding;\n      count = Math.min(this.itemCount - this.startIndex, count);\n      return count;\n    },\n\n    visibleItems() {\n      return this.items.slice(\n        this.startIndex,\n        this.startIndex + this.visibleNodeCount\n      );\n    },\n\n    itemCount() {\n      return this.items.length;\n    },\n\n    offsetY() {\n      return this.startIndex * this.rowHeight;\n    },\n\n    spacerStyle() {\n      return {\n        transform: `translateY(${this.offsetY}px)`\n      };\n    },\n\n    viewportStyle() {\n      return {\n        overflow: 'hidden',\n        height: `${this.viewportHeight}px`,\n        position: 'relative'\n      };\n    },\n\n    rootStyle() {\n      return {\n        height: `${this.rootHeight}px`,\n        overflow: 'auto'\n      };\n    },\n\n    itemStyle() {\n      return {\n        height: `${this.rowHeight}px`\n      };\n    }\n  },\n\n  mounted() {\n    this.$refs.root.addEventListener(\n      'scroll',\n      this.handleScroll,\n      { passive: true }\n    );\n\n    this.observeSize();\n  },\n\n  beforeDestroy() {\n    this.$refs.root.removeEventListener('scroll', this.handleScroll);\n  },\n\n  methods: {\n    handleScroll() {\n      this.scrollTop = this.$refs.root.scrollTop;\n    },\n\n    observeSize() {\n      let rootSizeObserver = new ResizeObserver(entries => {\n        for (let entry of entries) {\n          let { contentRect } = entry;\n          this.rootHeight = contentRect.height;\n        }\n      });\n\n      rootSizeObserver.observe(this.$refs.root.parentElement);\n    }\n  }\n};\n</script>\n\n<style lang=\"scss\" scoped>\n.root {\n  min-height: 100%;\n}\n\n.viewport {\n  overflow-y: auto;\n}\n</style>\n",".root {\n  min-height: 100%;\n}\n\n.viewport {\n  overflow-y: auto;\n}\n\n/*# sourceMappingURL=EvVirtualScroll.vue.map */"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$5 = "data-v-673476b4";
  /* module identifier */
  const __vue_module_identifier__$5 = undefined;
  /* functional template */
  const __vue_is_functional_template__$5 = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$5 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$4, staticRenderFns: __vue_staticRenderFns__$4 },
    __vue_inject_styles__$5,
    __vue_script__$5,
    __vue_scope_id__$5,
    __vue_is_functional_template__$5,
    __vue_module_identifier__$5,
    false,
    createInjector,
    undefined,
    undefined
  );

__vue_component__$5.install = function(Vue) {
  Vue.component(__vue_component__$5.name, __vue_component__$5);
};

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

// @group Components
// Simplest possible file drop component with a non-intrusive customizable overlay.
var script$6 = {
  name: 'EvDropZone',

  props: {
    // Border radius of overlay
    radius: {
      type: Number,
      default: 10
    },
    // Color of overlay border
    stroke: {
      type: String,
      default: '#ccc'
    },
    // Width of overlay border
    strokeWidth: {
      type: Number,
      default: 10
    },
    // Dash array spacing
    strokeDashArray: {
      type: String,
      default: '10, 20'
    },
    // Dash offset
    strokeDashOffset: {
      type: Number,
      default: 35
    }
  },

  data() {
    return {
      entered: false
    };
  },

  computed: {
    frameStyle() {
      return `border-radius: ${this.radius}px`;
    }
  },

  methods: {
    handleDrop(ev) {
      this.entered = false;

      if (ev.dataTransfer.items) {
        // Emits data transfer items when file is dropped
        // @arg https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/items
        this.$emit('drop', ev.dataTransfer.items);
      }
    }
  }
};

/* script */
const __vue_script__$6 = script$6;

/* template */
var __vue_render__$5 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "ev-drop-zone",
      on: {
        drop: function($event) {
          $event.stopPropagation();
          return _vm.handleDrop($event)
        },
        dragenter: function($event) {
          _vm.entered = true;
        },
        dragover: function($event) {
          $event.preventDefault();
          $event.stopPropagation();
          _vm.entered = true;
        },
        dragleave: function($event) {
          _vm.entered = false;
        }
      }
    },
    [
      _c(
        "svg",
        {
          directives: [
            {
              name: "show",
              rawName: "v-show",
              value: _vm.entered,
              expression: "entered"
            }
          ],
          staticClass: "ev-drop-zone-frame",
          style: _vm.frameStyle
        },
        [
          _c("rect", {
            attrs: {
              width: "100%",
              height: "100%",
              fill: "none",
              rx: _vm.radius,
              ry: _vm.radius,
              stroke: _vm.stroke,
              "stroke-width": _vm.strokeWidth,
              "stroke-dasharray": _vm.strokeDashArray,
              "stroke-dashoffset": _vm.strokeDashOffset,
              "stroke-linecap": "square"
            }
          })
        ]
      ),
      _vm._v(" "),
      _vm._t("default")
    ],
    2
  )
};
var __vue_staticRenderFns__$5 = [];
__vue_render__$5._withStripped = true;

  /* style */
  const __vue_inject_styles__$6 = function (inject) {
    if (!inject) return
    inject("data-v-02a4b446_0", { source: ".ev-drop-zone-frame[data-v-02a4b446] {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  box-sizing: border-box;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  pointer-events: none;\n  z-index: 1;\n}\n.ev-drop-zone[data-v-02a4b446] {\n  position: relative;\n  width: 100%;\n  height: 100%;\n}\n\n/*# sourceMappingURL=EvDropZone.vue.map */", map: {"version":3,"sources":["/Users/john/Code/evwt/packages/EvDropZone/src/EvDropZone.vue","EvDropZone.vue"],"names":[],"mappings":"AAsFA;EACA,kBAAA;EACA,WAAA;EACA,YAAA;EACA,sBAAA;EACA,MAAA;EACA,SAAA;EACA,OAAA;EACA,QAAA;EACA,oBAAA;EACA,UAAA;ACrFA;ADwFA;EACA,kBAAA;EACA,WAAA;EACA,YAAA;ACrFA;;AAEA,yCAAyC","file":"EvDropZone.vue","sourcesContent":["<template>\n  <div\n    class=\"ev-drop-zone\"\n    @drop.stop=\"handleDrop\"\n    @dragenter=\"entered = true\"\n    @dragover.prevent.stop=\"entered = true\"\n    @dragleave=\"entered = false\">\n    <svg v-show=\"entered\" class=\"ev-drop-zone-frame\" :style=\"frameStyle\">\n      <rect\n        width=\"100%\"\n        height=\"100%\"\n        fill=\"none\"\n        :rx=\"radius\"\n        :ry=\"radius\"\n        :stroke=\"stroke\"\n        :stroke-width=\"strokeWidth\"\n        :stroke-dasharray=\"strokeDashArray\"\n        :stroke-dashoffset=\"strokeDashOffset\"\n        stroke-linecap=\"square\" />\n    </svg>\n    <!-- Component to wrap -->\n    <slot />\n  </div>\n</template>\n\n<script>\n// @group Components\n// Simplest possible file drop component with a non-intrusive customizable overlay.\nexport default {\n  name: 'EvDropZone',\n\n  props: {\n    // Border radius of overlay\n    radius: {\n      type: Number,\n      default: 10\n    },\n    // Color of overlay border\n    stroke: {\n      type: String,\n      default: '#ccc'\n    },\n    // Width of overlay border\n    strokeWidth: {\n      type: Number,\n      default: 10\n    },\n    // Dash array spacing\n    strokeDashArray: {\n      type: String,\n      default: '10, 20'\n    },\n    // Dash offset\n    strokeDashOffset: {\n      type: Number,\n      default: 35\n    }\n  },\n\n  data() {\n    return {\n      entered: false\n    };\n  },\n\n  computed: {\n    frameStyle() {\n      return `border-radius: ${this.radius}px`;\n    }\n  },\n\n  methods: {\n    handleDrop(ev) {\n      this.entered = false;\n\n      if (ev.dataTransfer.items) {\n        // Emits data transfer items when file is dropped\n        // @arg https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/items\n        this.$emit('drop', ev.dataTransfer.items);\n      }\n    }\n  }\n};\n</script>\n\n<style lang=\"scss\" scoped>\n.ev-drop-zone-frame {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  box-sizing: border-box;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  pointer-events: none;\n  z-index: 1;\n}\n\n.ev-drop-zone {\n  position: relative;\n  width: 100%;\n  height: 100%;\n}\n</style>\n\n<docs>\n</docs>\n",".ev-drop-zone-frame {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  box-sizing: border-box;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  pointer-events: none;\n  z-index: 1;\n}\n\n.ev-drop-zone {\n  position: relative;\n  width: 100%;\n  height: 100%;\n}\n\n/*# sourceMappingURL=EvDropZone.vue.map */"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$6 = "data-v-02a4b446";
  /* module identifier */
  const __vue_module_identifier__$6 = undefined;
  /* functional template */
  const __vue_is_functional_template__$6 = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$6 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$5, staticRenderFns: __vue_staticRenderFns__$5 },
    __vue_inject_styles__$6,
    __vue_script__$6,
    __vue_scope_id__$6,
    __vue_is_functional_template__$6,
    __vue_module_identifier__$6,
    false,
    createInjector,
    undefined,
    undefined
  );

__vue_component__$6.install = function(Vue) {
  Vue.component(__vue_component__$6.name, __vue_component__$6);
};

export { __vue_component__$6 as EvDropZone, __vue_component__$2 as EvIcon, __vue_component__$1 as EvLayout, EvMenu, EvStore, __vue_component__$3 as EvToolbar, __vue_component__$4 as EvToolbarItem, __vue_component__$5 as EvVirtualScroll, EvWindow };
