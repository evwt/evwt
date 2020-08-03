import { BrowserWindow, screen } from 'electron';
import { debounce } from 'lodash';
import { getNonOverlappingBounds } from '@/../lib/bounds';

class EvWindow {
  constructor(options, id, store) {
    this.id = id;
    this.store = store;

    this.win = new BrowserWindow({ ...options, ...this.getSizeOptions(options) });

    this.win.on('closed', () => this.handleClosed());

    this.saveBounds = debounce(() => {
      this.store.set(`evwt.bounds.${this.id}`, this.win.getNormalBounds());
    }, 200);

    this.startSavingBounds();

    EvWindow.windows.set(id, this);
  }

  getSizeOptions(options) {
    let sizeOptions = {};
    let savedBounds = this.store.get(`evwt.bounds.${this.id}`);

    if (savedBounds) {
      sizeOptions = getNonOverlappingBounds(options, savedBounds);
    }

    return sizeOptions;
  }

  startSavingBounds() {
    this.win.on('resize', this.saveBounds);
    this.win.on('move', this.saveBounds);
  }

  handleClosed() {
    this.win = null;
    EvWindow.windows.delete(this.id);
  }
}

EvWindow.windows = new Map();

EvWindow.arrange = {};

EvWindow.arrange.cascade = () => {
  let { workArea } = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  let windowsCount = EvWindow.windows.size;
  let maxWidth = 0;
  let maxHeight = 0;

  // Loop through all windows, placing them at the top/left of where
  // the biggest window would be if it were centered, +32/32 pixels for each
  for (let evWindow of EvWindow.windows.values()) {
    let size = evWindow.win.getSize();
    if (size[0] > maxWidth) maxWidth = size[0];
    if (size[1] > maxHeight) maxHeight = size[1];
  }

  let centerOfWidestWin = maxWidth / 2;
  let middleOfTallestWin = maxHeight / 2;
  let centerOfScreen = workArea.width / 2;
  let middleOfScreen = workArea.height / 2;
  let topOfTallest = middleOfScreen - middleOfTallestWin;
  let sideOfWidest = centerOfScreen - centerOfWidestWin;

  for (let idx = 0; idx < windowsCount; idx++) {
    let evWindow = [...EvWindow.windows.values()][idx];
    evWindow.win.setPosition(sideOfWidest + (32 * idx), topOfTallest + (32 * idx), false);
    evWindow.win.focus();
  }
};

EvWindow.arrange.tile = () => {
  let { workArea } = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  let windowsCount = EvWindow.windows.size;
  let numRows = Math.ceil(Math.sqrt(windowsCount));
  let numCols = Math.round(Math.sqrt(windowsCount));

  let heightOfEach = parseInt(workArea.height / numRows);
  let widthOfEach = parseInt(workArea.width / numCols);
  let leftOverHeight = workArea.height % numRows;
  let leftOverWidth = workArea.width % numCols;

  for (let idxRow = 0; idxRow < numRows; idxRow++) {
    for (let idxCol = 0; idxCol < numCols; idxCol++) {
      let winIdx = (idxRow * numCols) + idxCol;
      let evWindow = [...EvWindow.windows.values()][winIdx];

      if (!evWindow) continue;

      let newWidth = widthOfEach;
      let newHeight = heightOfEach;

      if (idxRow === numRows - 1) {
        newHeight += leftOverHeight;
      }

      if (idxCol === numCols - 1) {
        newWidth += leftOverWidth;
      }

      evWindow.win.setSize(newWidth, newHeight, false);
      evWindow.win.setPosition((widthOfEach * idxCol) + workArea.x, (heightOfEach * idxRow) + workArea.y, false);
    }
  }
};

EvWindow.arrange.rows = () => {
  let { workArea } = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  let windowsCount = EvWindow.windows.size;
  let heightOfEach = parseInt(workArea.height / windowsCount);
  let leftOverHeight = workArea.height % windowsCount;

  for (let idx = 0; idx < windowsCount; idx++) {
    let evWindow = [...EvWindow.windows.values()][idx];

    if (idx === windowsCount - 1) {
      evWindow.win.setSize(workArea.width, heightOfEach + leftOverHeight, false);
      evWindow.win.focus();
    } else {
      evWindow.win.setSize(workArea.width, heightOfEach, false);
    }

    evWindow.win.setPosition(workArea.x, (heightOfEach * idx) + workArea.y, false);
  }
};

EvWindow.arrange.columns = () => {
  let { workArea } = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  let windowsCount = EvWindow.windows.size;
  let widthOfEach = parseInt(workArea.width / windowsCount);
  let leftOverWidth = workArea.width % windowsCount;

  for (let idx = 0; idx < windowsCount; idx++) {
    let evWindow = [...EvWindow.windows.values()][idx];

    if (idx === windowsCount - 1) {
      evWindow.win.setSize(widthOfEach + leftOverWidth, workArea.height, false);
      evWindow.win.focus();
    } else {
      evWindow.win.setSize(widthOfEach, workArea.height, false);
    }

    evWindow.win.setPosition((widthOfEach * idx) + workArea.x, workArea.y, false);
  }
};

export default EvWindow;
