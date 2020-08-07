import { BrowserWindow, screen } from 'electron';
import { getNonOverlappingBounds } from '@/../lib/bounds';

const debounce = require('lodash/debounce');
const Store = require('electron-store');

let store = new Store({
  name: 'evwt-ui-state'
});

const EvWindow = {};

EvWindow.startStoringOptions = (win, restoreId) => {
  let saveBounds = debounce(() => {
    console.log('Saving bounds...');
    store.set(`evwt.bounds.${restoreId}`, win.getNormalBounds());
  }, 200);

  win.on('resize', saveBounds);
  win.on('move', saveBounds);
};

EvWindow.getStoredOptions = (restoreId, defaultOptions) => {
  let sizeOptions = {};
  let savedBounds = store.get(`evwt.bounds.${restoreId}`);

  if (savedBounds) {
    sizeOptions = getNonOverlappingBounds(defaultOptions, savedBounds);
  }

  return sizeOptions;
};

EvWindow.arrange = {};

EvWindow.arrange.cascade = () => {
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
    win.setPosition(sideOfWidest + (32 * idx), topOfTallest + (32 * idx), false);
    win.focus();
  }
};

EvWindow.arrange.tile = () => {
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
      win.setPosition((widthOfEach * idxCol) + workArea.x, (heightOfEach * idxRow) + workArea.y, false);
    }
  }
};

EvWindow.arrange.rows = () => {
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

    win.setPosition(workArea.x, (heightOfEach * idx) + workArea.y, false);
  }
};

EvWindow.arrange.columns = () => {
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

    win.setPosition((widthOfEach * idx) + workArea.x, workArea.y, false);
  }
};

export default EvWindow;
