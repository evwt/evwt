import { app, BrowserWindow, screen } from 'electron';
import debounce from 'lodash/debounce';
import log from '../lib/log';
import { getNonOverlappingBounds } from '../lib/bounds';
import { store as uiStore } from './lib/uiStore';

const BOUNDS_AUTOSAVE_INTERVAL = 200;

let windowSaveHandlers = new Map();
let evWindows = new Set();

class EvWindow {
  constructor(restoreId, options) {
    this.restoreId = restoreId;

    let storedOptions = this.getStoredUiState(options);
    this.win = new BrowserWindow({ ...options, ...storedOptions });
    this.startStoringUiState();

    this.handleClosed();

    EvWindow.addWindowToCollection(this);
  }

  /**
   * Add window to our collection of windows, so it can be retrieved with fromBrowserWindow
   *
   * @static
   * @memberof EvWindow
   */
  static addWindowToCollection(evWindow) {
    evWindows.add(evWindow);
    evWindow.win.on('close', () => evWindows.delete(evWindow));
  }

  /**
   * Return the EvWindow associated with the passed BrowserWindow
   *
   * @param {*} win
   * @returns EvWindow
   * @memberof EvWindow
   */
  static fromBrowserWindow(win) {
    for (const evWindow of evWindows) {
      if (evWindow.win === win) {
        return evWindow;
      }
    }
  }

  /**
   * When this window is closed, hide the app if there are no open windows
   *
   * @memberof EvWindow
   */
  handleClosed() {
    this.win.on('closed', () => {
      if (evWindows.size === 0) {
        app.hide();
      }
    });
  }

  /**
   *
   *
   * @param {String} restoreId - A unique ID for the window. For single-window apps, this can be anything. For multi-window apps, give each window a unique ID.
   * @param {BrowserWindow} win - https://www.electronjs.org/docs/api/browser-window
   * @returns {Function} Function that saves the window position/size to storage. Use after moving the window manually.
   */
  startStoringUiState() {
    if (!this.win || !this.win.getNormalBounds) {
      log.warn('[EvWindow] Invalid window passed, not storing');
      return;
    }

    if (!this.restoreId || typeof this.restoreId !== 'string' || !this.restoreId.length) {
      log.warn('[EvWindow] Invalid restoreId passed, not storing');
      return;
    }

    // if the win already exists with a storageId reset everything
    if (windowSaveHandlers.has(this.win)) {
      let existingWin = windowSaveHandlers.get(this.win);
      existingWin.cleanupEvents();
    }

    let handleSave = debounce(() => {
      if (this.win.isDestroyed()) return;
      let bounds = this.win.getNormalBounds();
      let key = `${this.restoreId}.bounds`;

      // For unit tests
      if (process.env.npm_lifecycle_event === 'test') {
        process.env.evwtTestEvWindow1 = `${key} ${JSON.stringify(bounds)}`;
      }

      uiStore.set(key, bounds);
    }, BOUNDS_AUTOSAVE_INTERVAL);

    handleSave();

    let handleClose = () => {
      let existingWin = windowSaveHandlers.get(this.win);
      existingWin.cleanupEvents();
      windowSaveHandlers.delete(this.win);
    };

    this.win.on('resize', handleSave);
    this.win.on('move', handleSave);
    this.win.on('close', handleClose);

    let cleanupEvents = () => {
      this.win.off('resize', handleSave);
      this.win.off('move', handleSave);
      this.win.off('close', handleClose);
    };

    windowSaveHandlers.set(this.win, {
      handleSave,
      handleClose,
      cleanupEvents
    });

    return handleSave;
  }

  /**
   *
   *
   * @param {String} restoreId - A unique ID for the window. For single-window apps, this can be anything. For multi-window apps, give each window a unique ID.
   * @param {Object} defaultOptions - https://www.electronjs.org/docs/api/browser-window#new-browserwindowoptions
   */
  getStoredUiState(defaultOptions) {
    if (!defaultOptions) {
      log.warn('[EvWindow] defaultOptions not passed, skipping');
      return;
    }

    if (!this.restoreId || typeof this.restoreId !== 'string' || !this.restoreId.length) {
      log.warn('[EvWindow] Invalid restoreId passed, skipping');
      return;
    }

    let sizeOptions = {};
    let key = `${this.restoreId}.bounds`;
    let savedBounds = uiStore.get(key);

    if (savedBounds) {
      sizeOptions = getNonOverlappingBounds(defaultOptions, savedBounds);
    }

    return sizeOptions;
  }
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

EvWindow.arrange = arrange;

function cascade() {
  let { workArea } = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  let allWindows = BrowserWindow.getAllWindows();
  let maxWidth = 0;
  let maxHeight = 0;

  // Loop through all windows, placing them at the top/left of where
  // the biggest window would be if it were centered, +32/32 pixels for each
  for (let win of allWindows) {
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

  for (let idx = 0; idx < allWindows.length; idx++) {
    let win = allWindows[idx];
    let newX = Math.round(sideOfWidest + (32 * idx));
    let newY = Math.round(topOfTallest + (32 * idx));
    win.setPosition(newX, newY, false);
    win.focus();
  }
}

function tile() {
  let { workArea } = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  let allWindows = BrowserWindow.getAllWindows();
  let numRows = Math.ceil(Math.sqrt(allWindows.length));
  let numCols = Math.round(Math.sqrt(allWindows.length));

  let heightOfEach = parseInt(workArea.height / numRows);
  let widthOfEach = parseInt(workArea.width / numCols);
  let leftOverHeight = workArea.height % numRows;
  let leftOverWidth = workArea.width % numCols;

  for (let idxRow = 0; idxRow < numRows; idxRow++) {
    for (let idxCol = 0; idxCol < numCols; idxCol++) {
      let winIdx = (idxRow * numCols) + idxCol;
      let win = allWindows[winIdx];

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
  let allWindows = BrowserWindow.getAllWindows();
  let heightOfEach = parseInt(workArea.height / allWindows.length);
  let leftOverHeight = workArea.height % allWindows.length;

  for (let idx = 0; idx < allWindows.length; idx++) {
    let win = allWindows[idx];

    if (idx === allWindows.length - 1) {
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
  let allWindows = BrowserWindow.getAllWindows();
  let widthOfEach = parseInt(workArea.width / allWindows.length);
  let leftOverWidth = workArea.width % allWindows.length;

  for (let idx = 0; idx < allWindows.length; idx++) {
    let win = allWindows[idx];

    if (idx === allWindows.length - 1) {
      win.setSize(widthOfEach + leftOverWidth, workArea.height, false);
      win.focus();
    } else {
      win.setSize(widthOfEach, workArea.height, false);
    }

    let newX = Math.round((widthOfEach * idx) + workArea.x);
    win.setPosition(newX, workArea.y, false);
  }
}

export default EvWindow;
