import { BrowserWindow, screen } from 'electron';
import { getNonOverlappingBounds } from '../lib/bounds';

const debounce = require('lodash/debounce');
const Store = require('electron-store');

let store = new Store({
  name: 'evwt-ui-state'
});

const BOUNDS_AUTOSAVE_INTERVAL = 200;
const BOUNDS_AUTOSAVE_PREFIX = 'evwindow.bounds';

let windows = new Map();

/**
 *
 *
 * @param {String} restoreId - A unique ID for the window. For single-window apps, this can be anything. For multi-window apps, give each window a unique ID.
 * @param {BrowserWindow} win - https://www.electronjs.org/docs/api/browser-window
 * @returns {Function} Function that saves the window position/size to storage. Use after moving the window manually.
 */
export function startStoringOptions(restoreId, win) {
  if (!win || !win.getNormalBounds) {
    console.log('[EvWindow] Invalid window passed, not storing');
    return;
  }

  if (!restoreId || typeof restoreId !== 'string' || !restoreId.length) {
    console.log('[EvWindow] Invalid restoreId passed, not storing');
    return;
  }

  let sanitizedRestoreId = Buffer.from(restoreId, 'binary').toString('base64');

  // if the win already exists with a storageId reset everything
  if (windows.has(win)) {
    let existingWin = windows.get(win);
    existingWin.cleanupEvents();
  }

  let handleSave = debounce(() => {
    if (win.isDestroyed()) return;
    let bounds = win.getNormalBounds();
    let key = `${BOUNDS_AUTOSAVE_PREFIX}.${sanitizedRestoreId}`;

    // For unit tests
    process.env.evwtTestEvWindow1 = `${key} ${JSON.stringify(bounds)}`;

    store.set(key, bounds);
  }, BOUNDS_AUTOSAVE_INTERVAL);

  handleSave();

  let handleClose = () => {
    let existingWin = windows.get(win);
    existingWin.cleanupEvents();
    windows.delete(win);
  };

  win.on('resize', handleSave);
  win.on('move', handleSave);
  win.on('close', handleClose);

  let cleanupEvents = () => {
    win.off('resize', handleSave);
    win.off('move', handleSave);
    win.off('close', handleClose);
  };

  windows.set(win, {
    handleSave,
    handleClose,
    cleanupEvents
  });

  return handleSave;
}

/**
 *
 * Arranges windows on the screen.
 * @param {String} arrangement - `tile`, `cascade`, `rows` or `columns`
 */
export function arrange(arrangement) {
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
export function getStoredOptions(restoreId, defaultOptions) {
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

export default {
  arrange,
  getStoredOptions,
  startStoringOptions
};
