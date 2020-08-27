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

    this.onDragStart(this.direction, this.track, this.element);
  }

  stopDragging() {
    this.dragging = false;

    // Remove the stored event listeners. This is why we store them.
    this.cleanup();

    this.onDragEnd(this.direction, this.track, this.element);

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
    this.onDrag(this.direction, this.track, this.element, style);
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
//

var script = {
  name: 'EvLayoutChild',

  props: {
    child: Object
  },

  computed: {
    classForChild() {
      if (this.child && this.child.name) {
        return `ev-pane-${this.child.name}`;
      }

      return '';
    },

    childStyle() {
      if (!this.child.sizes || !this.child.sizes.length || !this.child.direction) {
        return;
      }

      let sizes = this.child.sizes.map(s => [s, '0']).flat();
      sizes.pop();

      return `grid-template-${this.child.direction}s: ${sizes.join(' ')}`;
    }
  },

  methods: {
    gutterClass(child, direction) {
      let className = `ev-gutter ev-gutter-${child.name} ev-gutter-${direction}`;

      if (child.resizable === false) {
        className += ' ev-gutter-no-resize';
      }

      return className;
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
      class: _vm.classForChild,
      style: _vm.childStyle,
      attrs: {
        "data-min-size": _vm.child.minSize,
        "data-evlayout-name": _vm.child.name
      }
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
    inject("data-v-748ace0d_0", { source: "*[data-v-748ace0d] {\n  box-sizing: border-box;\n}\n*[data-v-748ace0d]:before,\n*[data-v-748ace0d]:after {\n  box-sizing: border-box;\n}\n.h-100[data-v-748ace0d] {\n  height: 100%;\n}\n.vh-100[data-v-748ace0d] {\n  height: 100vh;\n}\n.w-100[data-v-748ace0d] {\n  width: 100%;\n}\n.vw-100[data-v-748ace0d] {\n  width: 100vw;\n}\n.pre-line[data-v-748ace0d] {\n  white-space: pre-line;\n}\n.pre-wrap[data-v-748ace0d] {\n  white-space: pre-wrap;\n}\n.no-wrap[data-v-748ace0d] {\n  white-space: nowrap;\n}\n.d-block[data-v-748ace0d] {\n  display: block;\n}\n.d-inline-block[data-v-748ace0d] {\n  display: inline-block;\n}\n.d-flex[data-v-748ace0d] {\n  display: flex;\n}\n.d-inline-flex[data-v-748ace0d] {\n  display: inline-flex;\n}\n.d-grid[data-v-748ace0d] {\n  display: grid;\n}\n.d-none[data-v-748ace0d] {\n  display: none;\n}\n.hide[data-v-748ace0d] {\n  visibility: hidden;\n}\n.overflow-hidden[data-v-748ace0d] {\n  overflow: hidden;\n}\n.overflow-auto[data-v-748ace0d] {\n  overflow: auto;\n}\n.flex-center[data-v-748ace0d] {\n  justify-content: center;\n}\n.flex-middle[data-v-748ace0d] {\n  align-items: center;\n}\n.flex-grow[data-v-748ace0d] {\n  flex-grow: 1;\n}\n.flex-shrink[data-v-748ace0d] {\n  flex-shrink: 1;\n}\n.flex-vertical[data-v-748ace0d] {\n  flex-direction: column;\n}\n.flex-space[data-v-748ace0d] {\n  justify-content: space-between;\n}\n.flex-end[data-v-748ace0d] {\n  justify-content: flex-end;\n}\n.flex-start[data-v-748ace0d] {\n  justify-content: flex-start;\n}\n.text-center[data-v-748ace0d] {\n  text-align: center;\n}\n.m-z[data-v-748ace0d] {\n  margin: 0 !important;\n}\n.m-n-z[data-v-748ace0d] {\n  margin-top: 0 !important;\n}\n.m-e-z[data-v-748ace0d] {\n  margin-right: 0 !important;\n}\n.m-s-z[data-v-748ace0d] {\n  margin-bottom: 0 !important;\n}\n.m-w-z[data-v-748ace0d] {\n  margin-left: 0 !important;\n}\n.m-n-xl[data-v-748ace0d] {\n  margin-top: 25px;\n}\n.m-e-xl[data-v-748ace0d] {\n  margin-right: 25px;\n}\n.m-s-xl[data-v-748ace0d] {\n  margin-bottom: 25px;\n}\n.m-w-xl[data-v-748ace0d] {\n  margin-left: 25px;\n}\n.m-n-lg[data-v-748ace0d] {\n  margin-top: 20px;\n}\n.m-e-lg[data-v-748ace0d] {\n  margin-right: 20px;\n}\n.m-s-lg[data-v-748ace0d] {\n  margin-bottom: 20px;\n}\n.m-w-lg[data-v-748ace0d] {\n  margin-left: 20px;\n}\n.m-n-med[data-v-748ace0d] {\n  margin-top: 15px;\n}\n.m-e-med[data-v-748ace0d] {\n  margin-right: 15px;\n}\n.m-s-med[data-v-748ace0d] {\n  margin-bottom: 15px;\n}\n.m-w-med[data-v-748ace0d] {\n  margin-left: 15px;\n}\n.m-n-sm[data-v-748ace0d] {\n  margin-top: 10px;\n}\n.m-e-sm[data-v-748ace0d] {\n  margin-right: 10px;\n}\n.m-s-sm[data-v-748ace0d] {\n  margin-bottom: 10px;\n}\n.m-w-sm[data-v-748ace0d] {\n  margin-left: 10px;\n}\n.m-n-xs[data-v-748ace0d] {\n  margin-top: 5px;\n}\n.m-e-xs[data-v-748ace0d] {\n  margin-right: 5px;\n}\n.m-s-xs[data-v-748ace0d] {\n  margin-bottom: 5px;\n}\n.m-w-xs[data-v-748ace0d] {\n  margin-left: 5px;\n}\n.m-n-xxs[data-v-748ace0d] {\n  margin-top: 2px;\n}\n.m-e-xxs[data-v-748ace0d] {\n  margin-right: 2px;\n}\n.m-s-xxs[data-v-748ace0d] {\n  margin-bottom: 2px;\n}\n.m-w-xxs[data-v-748ace0d] {\n  margin-left: 2px;\n}\n.p-z[data-v-748ace0d] {\n  padding: 0 !important;\n}\n.p-n-z[data-v-748ace0d] {\n  padding-top: 0 !important;\n}\n.p-e-z[data-v-748ace0d] {\n  padding-right: 0 !important;\n}\n.p-s-z[data-v-748ace0d] {\n  padding-bottom: 0 !important;\n}\n.p-w-z[data-v-748ace0d] {\n  padding-left: 0 !important;\n}\n.p-n-xl[data-v-748ace0d] {\n  padding-top: 25px;\n}\n.p-e-xl[data-v-748ace0d] {\n  padding-right: 25px;\n}\n.p-s-xl[data-v-748ace0d] {\n  padding-bottom: 25px;\n}\n.p-w-xl[data-v-748ace0d] {\n  padding-left: 25px;\n}\n.p-n-lg[data-v-748ace0d] {\n  padding-top: 20px;\n}\n.p-e-lg[data-v-748ace0d] {\n  padding-right: 20px;\n}\n.p-s-lg[data-v-748ace0d] {\n  padding-bottom: 20px;\n}\n.p-w-lg[data-v-748ace0d] {\n  padding-left: 20px;\n}\n.p-n-med[data-v-748ace0d] {\n  padding-top: 15px;\n}\n.p-e-med[data-v-748ace0d] {\n  padding-right: 15px;\n}\n.p-s-med[data-v-748ace0d] {\n  padding-bottom: 15px;\n}\n.p-w-med[data-v-748ace0d] {\n  padding-left: 15px;\n}\n.p-n-sm[data-v-748ace0d] {\n  padding-top: 10px;\n}\n.p-e-sm[data-v-748ace0d] {\n  padding-right: 10px;\n}\n.p-s-sm[data-v-748ace0d] {\n  padding-bottom: 10px;\n}\n.p-w-sm[data-v-748ace0d] {\n  padding-left: 10px;\n}\n.p-n-xs[data-v-748ace0d] {\n  padding-top: 5px;\n}\n.p-e-xs[data-v-748ace0d] {\n  padding-right: 5px;\n}\n.p-s-xs[data-v-748ace0d] {\n  padding-bottom: 5px;\n}\n.p-w-xs[data-v-748ace0d] {\n  padding-left: 5px;\n}\n.p-xs[data-v-748ace0d] {\n  padding: 5px;\n}\n.p-n-xxs[data-v-748ace0d] {\n  padding-top: 2px;\n}\n.p-e-xxs[data-v-748ace0d] {\n  padding-right: 2px;\n}\n.p-s-xxs[data-v-748ace0d] {\n  padding-bottom: 2px;\n}\n.p-w-xxs[data-v-748ace0d] {\n  padding-left: 2px;\n}\n.p-xxs[data-v-748ace0d] {\n  padding: 2px;\n}\n.p-xs[data-v-748ace0d] {\n  padding: 5px;\n}\n.p-sm[data-v-748ace0d] {\n  padding: 10px;\n}\n.p-med[data-v-748ace0d] {\n  padding: 15px;\n}\n.p-lg[data-v-748ace0d] {\n  padding: 20px;\n}\n.p-xl[data-v-748ace0d] {\n  padding: 25px;\n}\n.m-xxs[data-v-748ace0d] {\n  margin: 2px;\n}\n.m-xs[data-v-748ace0d] {\n  margin: 5px;\n}\n.m-sm[data-v-748ace0d] {\n  margin: 10px;\n}\n.m-med[data-v-748ace0d] {\n  margin: 15px;\n}\n.m-lg[data-v-748ace0d] {\n  margin: 20px;\n}\n.m-xl[data-v-748ace0d] {\n  margin: 25px;\n}\n.ev-gutter-column[data-v-748ace0d] {\n  cursor: col-resize;\n}\n.ev-gutter-row[data-v-748ace0d] {\n  cursor: row-resize;\n}\n.ev-gutter[data-v-748ace0d]:not(.ev-gutter-no-resize)::after {\n  display: block;\n  position: relative;\n  content: \"\";\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-column[data-v-748ace0d]::after {\n  width: 8px;\n  height: 100%;\n  margin-left: -4px;\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-row[data-v-748ace0d]::after {\n  width: 100%;\n  height: 8px;\n  margin-top: -4px;\n}\n.ev-layout-pane-maximized[data-v-748ace0d] {\n  border: 0;\n}\n\n/*# sourceMappingURL=EvLayoutChild.vue.map */", map: {"version":3,"sources":["EvLayoutChild.vue","/Users/john/Code/evwt/components/src/EvLayoutChild.vue"],"names":[],"mappings":"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","file":"EvLayoutChild.vue","sourcesContent":["* {\n  box-sizing: border-box;\n}\n\n*:before,\n*:after {\n  box-sizing: border-box;\n}\n\n.h-100 {\n  height: 100%;\n}\n\n.vh-100 {\n  height: 100vh;\n}\n\n.w-100 {\n  width: 100%;\n}\n\n.vw-100 {\n  width: 100vw;\n}\n\n.pre-line {\n  white-space: pre-line;\n}\n\n.pre-wrap {\n  white-space: pre-wrap;\n}\n\n.no-wrap {\n  white-space: nowrap;\n}\n\n.d-block {\n  display: block;\n}\n\n.d-inline-block {\n  display: inline-block;\n}\n\n.d-flex {\n  display: flex;\n}\n\n.d-inline-flex {\n  display: inline-flex;\n}\n\n.d-grid {\n  display: grid;\n}\n\n.d-none {\n  display: none;\n}\n\n.hide {\n  visibility: hidden;\n}\n\n.overflow-hidden {\n  overflow: hidden;\n}\n\n.overflow-auto {\n  overflow: auto;\n}\n\n.flex-center {\n  justify-content: center;\n}\n\n.flex-middle {\n  align-items: center;\n}\n\n.flex-grow {\n  flex-grow: 1;\n}\n\n.flex-shrink {\n  flex-shrink: 1;\n}\n\n.flex-vertical {\n  flex-direction: column;\n}\n\n.flex-space {\n  justify-content: space-between;\n}\n\n.flex-end {\n  justify-content: flex-end;\n}\n\n.flex-start {\n  justify-content: flex-start;\n}\n\n.text-center {\n  text-align: center;\n}\n\n.m-z {\n  margin: 0 !important;\n}\n\n.m-n-z {\n  margin-top: 0 !important;\n}\n\n.m-e-z {\n  margin-right: 0 !important;\n}\n\n.m-s-z {\n  margin-bottom: 0 !important;\n}\n\n.m-w-z {\n  margin-left: 0 !important;\n}\n\n.m-n-xl {\n  margin-top: 25px;\n}\n\n.m-e-xl {\n  margin-right: 25px;\n}\n\n.m-s-xl {\n  margin-bottom: 25px;\n}\n\n.m-w-xl {\n  margin-left: 25px;\n}\n\n.m-n-lg {\n  margin-top: 20px;\n}\n\n.m-e-lg {\n  margin-right: 20px;\n}\n\n.m-s-lg {\n  margin-bottom: 20px;\n}\n\n.m-w-lg {\n  margin-left: 20px;\n}\n\n.m-n-med {\n  margin-top: 15px;\n}\n\n.m-e-med {\n  margin-right: 15px;\n}\n\n.m-s-med {\n  margin-bottom: 15px;\n}\n\n.m-w-med {\n  margin-left: 15px;\n}\n\n.m-n-sm {\n  margin-top: 10px;\n}\n\n.m-e-sm {\n  margin-right: 10px;\n}\n\n.m-s-sm {\n  margin-bottom: 10px;\n}\n\n.m-w-sm {\n  margin-left: 10px;\n}\n\n.m-n-xs {\n  margin-top: 5px;\n}\n\n.m-e-xs {\n  margin-right: 5px;\n}\n\n.m-s-xs {\n  margin-bottom: 5px;\n}\n\n.m-w-xs {\n  margin-left: 5px;\n}\n\n.m-n-xxs {\n  margin-top: 2px;\n}\n\n.m-e-xxs {\n  margin-right: 2px;\n}\n\n.m-s-xxs {\n  margin-bottom: 2px;\n}\n\n.m-w-xxs {\n  margin-left: 2px;\n}\n\n.p-z {\n  padding: 0 !important;\n}\n\n.p-n-z {\n  padding-top: 0 !important;\n}\n\n.p-e-z {\n  padding-right: 0 !important;\n}\n\n.p-s-z {\n  padding-bottom: 0 !important;\n}\n\n.p-w-z {\n  padding-left: 0 !important;\n}\n\n.p-n-xl {\n  padding-top: 25px;\n}\n\n.p-e-xl {\n  padding-right: 25px;\n}\n\n.p-s-xl {\n  padding-bottom: 25px;\n}\n\n.p-w-xl {\n  padding-left: 25px;\n}\n\n.p-n-lg {\n  padding-top: 20px;\n}\n\n.p-e-lg {\n  padding-right: 20px;\n}\n\n.p-s-lg {\n  padding-bottom: 20px;\n}\n\n.p-w-lg {\n  padding-left: 20px;\n}\n\n.p-n-med {\n  padding-top: 15px;\n}\n\n.p-e-med {\n  padding-right: 15px;\n}\n\n.p-s-med {\n  padding-bottom: 15px;\n}\n\n.p-w-med {\n  padding-left: 15px;\n}\n\n.p-n-sm {\n  padding-top: 10px;\n}\n\n.p-e-sm {\n  padding-right: 10px;\n}\n\n.p-s-sm {\n  padding-bottom: 10px;\n}\n\n.p-w-sm {\n  padding-left: 10px;\n}\n\n.p-n-xs {\n  padding-top: 5px;\n}\n\n.p-e-xs {\n  padding-right: 5px;\n}\n\n.p-s-xs {\n  padding-bottom: 5px;\n}\n\n.p-w-xs {\n  padding-left: 5px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-n-xxs {\n  padding-top: 2px;\n}\n\n.p-e-xxs {\n  padding-right: 2px;\n}\n\n.p-s-xxs {\n  padding-bottom: 2px;\n}\n\n.p-w-xxs {\n  padding-left: 2px;\n}\n\n.p-xxs {\n  padding: 2px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-sm {\n  padding: 10px;\n}\n\n.p-med {\n  padding: 15px;\n}\n\n.p-lg {\n  padding: 20px;\n}\n\n.p-xl {\n  padding: 25px;\n}\n\n.m-xxs {\n  margin: 2px;\n}\n\n.m-xs {\n  margin: 5px;\n}\n\n.m-sm {\n  margin: 10px;\n}\n\n.m-med {\n  margin: 15px;\n}\n\n.m-lg {\n  margin: 20px;\n}\n\n.m-xl {\n  margin: 25px;\n}\n\n.ev-gutter-column {\n  cursor: col-resize;\n}\n\n.ev-gutter-row {\n  cursor: row-resize;\n}\n\n.ev-gutter:not(.ev-gutter-no-resize)::after {\n  display: block;\n  position: relative;\n  content: \"\";\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-column::after {\n  width: 8px;\n  height: 100%;\n  margin-left: -4px;\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-row::after {\n  width: 100%;\n  height: 8px;\n  margin-top: -4px;\n}\n\n.ev-layout-pane-maximized {\n  border: 0;\n}\n\n/*# sourceMappingURL=EvLayoutChild.vue.map */","<template>\n  <div\n    :style=\"childStyle\"\n    :data-min-size=\"child.minSize\"\n    :data-evlayout-name=\"child.name\"\n    class=\"d-grid overflow-hidden h-100 w-100\"\n    :class=\"classForChild\">\n    <div v-if=\"!child.panes\" class=\"ev-layout-pane h-100 w-100 overflow-auto\">\n      <slot :name=\"child.name\" class=\"overflow-auto\" />\n    </div>\n\n    <template v-for=\"(grandChild, idx) in child.panes\">\n      <ev-layout-child\n        :key=\"grandChild.name\"\n        :child=\"grandChild\">\n        <slot v-for=\"(_, name) in $slots\" :slot=\"name\" :name=\"name\" />\n        <template v-for=\"(_, name) in $scopedSlots\" :slot=\"name\" slot-scope=\"slotData\">\n          <slot :name=\"name\" v-bind=\"slotData\" />\n        </template>\n      </ev-layout-child>\n\n      <div\n        v-if=\"child.panes[idx + 1]\"\n        :key=\"grandChild.name + 'gutter'\"\n        :class=\"gutterClass(grandChild, child.direction)\" />\n    </template>\n  </div>\n</template>\n\n<script>\nexport default {\n  name: 'EvLayoutChild',\n\n  props: {\n    child: Object\n  },\n\n  computed: {\n    classForChild() {\n      if (this.child && this.child.name) {\n        return `ev-pane-${this.child.name}`;\n      }\n\n      return '';\n    },\n\n    childStyle() {\n      if (!this.child.sizes || !this.child.sizes.length || !this.child.direction) {\n        return;\n      }\n\n      let sizes = this.child.sizes.map(s => [s, '0']).flat();\n      sizes.pop();\n\n      return `grid-template-${this.child.direction}s: ${sizes.join(' ')}`;\n    }\n  },\n\n  methods: {\n    gutterClass(child, direction) {\n      let className = `ev-gutter ev-gutter-${child.name} ev-gutter-${direction}`;\n\n      if (child.resizable === false) {\n        className += ' ev-gutter-no-resize';\n      }\n\n      return className;\n    }\n  }\n};\n</script>\n\n<style lang=\"scss\" scoped>\n@import '../../style/reset.scss';\n@import '../../style/utilities.scss';\n@import '../../style/split-grid.scss';\n</style>\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__ = "data-v-748ace0d";
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

var script$1 = {
  name: 'EvLayout',

  components: {
    EvLayoutChild: __vue_component__
  },

  props: {
    // The top-level Pane
    layout: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      layoutData: null
    };
  },

  async created() {
    this.layoutData = this.layout;
    this.loadUiState();
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

    let minSizeReducer = (acc, gutter) => {
      let prevPane = gutter.previousElementSibling;

      if (prevPane) {
        let minSize = parseInt(prevPane.dataset.minSize || 0);
        let index = Array.prototype.indexOf.call(prevPane.parentNode.children, prevPane);
        acc[index] = minSize;
      }

      let nextPane = gutter.nextElementSibling;

      if (nextPane) {
        let minSizeNext = parseInt(nextPane.dataset.minSize || 0);
        let indexNext = Array.prototype.indexOf.call(nextPane.parentNode.children, nextPane);

        acc[indexNext] = minSizeNext;
      }

      return acc;
    };

    let columnMinSizes = [...this.$el.querySelectorAll('.ev-gutter-column')].reduce(minSizeReducer, {});
    let rowMinSizes = [...this.$el.querySelectorAll('.ev-gutter-row')].reduce(minSizeReducer, {});

    let onDragStart = (direction, track, element) => {
      // Fired when any pane starts dragging
      // @arg direction, track, gutter element
      this.$emit('dragStart', { direction, track, element });
    };

    let onDrag = (direction, track, element, gridTemplateStyle) => {
      let parent = element.parentElement;
      let adjacentPane = element.previousElementSibling;
      let maximizedClassName = 'ev-layout-pane-maximized';
      let minimizedClassName = 'ev-layout-pane-minimized';

      if (adjacentPane && adjacentPane.offsetWidth === parent.offsetWidth) {
        adjacentPane.classList.add(maximizedClassName);
      } else if (adjacentPane.classList.contains(maximizedClassName)) {
        adjacentPane.classList.remove(maximizedClassName);
      }

      if (adjacentPane && adjacentPane.offsetWidth === 0) {
        adjacentPane.classList.add(minimizedClassName);
      } else if (adjacentPane.classList.contains(minimizedClassName)) {
        adjacentPane.classList.remove(minimizedClassName);
      }

      // Fired when any pane is dragging
      // @arg direction, track, gutter element, gridTemplateStyle
      this.$emit('drag', {
        direction, track, element, gridTemplateStyle
      });
    };

    let onDragEnd = async (direction, track, element) => {
      // Fired when any pane ends dragging
      // @arg direction, track, gutter element
      this.$emit('dragEnd', { direction, track, element });

      if (this.$evstore && this.$evstore.$ui) {
        let { gridTemplateColumns, gridTemplateRows } = element.parentElement.style;
        let gridTemplate = gridTemplateColumns || gridTemplateRows;
        let sizes = gridTemplate.split(' 0px ');
        let name = element.parentElement.dataset.evlayoutName;
        this.syncLayoutDataForPane(name, this.layoutData, sizes);
        this.saveUiState();
      }
    };

    Split({
      columnGutters, rowGutters, columnMinSizes, rowMinSizes, onDragStart, onDrag, onDragEnd
    });
  },

  methods: {
    loadUiState() {
      if (typeof this.$evstore.$ui.store.layout === 'object') {
        for (const [paneName, paneSizes] of Object.entries(this.$evstore.$ui.store.layout)) {
          this.syncLayoutDataForPane(paneName, this.layoutData, paneSizes);
        }
      }
    },

    saveUiState() {
      this.$set(this.$evstore.$ui.store, 'layout', this.getSizesForPanes(this.layoutData));
    },

    syncLayoutDataForPane(name, layoutData, sizes) {
      if (layoutData.name === name) {
        layoutData.sizes = sizes;
        return;
      }

      for (let idx = 0; idx < layoutData.panes.length; idx++) {
        let pane = layoutData.panes[idx];
        if (!pane) continue;
        if (pane.name === name) {
          pane.sizes = sizes;
        }
        if (pane.panes) {
          this.syncLayoutDataForPane(name, pane, sizes);
        }
      }
    },

    getSizesForPanes(layoutData, sizes = {}) {
      sizes[layoutData.name] = layoutData.sizes;

      for (let idx = 0; idx < layoutData.panes.length; idx++) {
        let pane = layoutData.panes[idx];
        if (!pane) continue;
        sizes[pane.name] = pane.sizes;
        if (pane.panes) {
          this.getSizesForPanes(pane, sizes);
        }
      }

      return sizes;
    }

  }
};

function normalizeComponent$1(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
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

const isOldIE$1 = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector$1(context) {
    return (id, style) => addStyle$1(id, style);
}
let HEAD$1;
const styles$1 = {};
function addStyle$1(id, css) {
    const group = isOldIE$1 ? css.media || 'default' : id;
    const style = styles$1[group] || (styles$1[group] = { ids: new Set(), styles: [] });
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
            if (HEAD$1 === undefined) {
                HEAD$1 = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD$1.appendChild(style.element);
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
const __vue_script__$1 = script$1;

/* template */
var __vue_render__$1 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _vm.layoutData
    ? _c(
        "ev-layout-child",
        {
          attrs: { child: _vm.layoutData },
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
    : _vm._e()
};
var __vue_staticRenderFns__$1 = [];
__vue_render__$1._withStripped = true;

  /* style */
  const __vue_inject_styles__$1 = function (inject) {
    if (!inject) return
    inject("data-v-d293c17c_0", { source: "*[data-v-d293c17c] {\n  box-sizing: border-box;\n}\n*[data-v-d293c17c]:before,\n*[data-v-d293c17c]:after {\n  box-sizing: border-box;\n}\n.h-100[data-v-d293c17c] {\n  height: 100%;\n}\n.vh-100[data-v-d293c17c] {\n  height: 100vh;\n}\n.w-100[data-v-d293c17c] {\n  width: 100%;\n}\n.vw-100[data-v-d293c17c] {\n  width: 100vw;\n}\n.pre-line[data-v-d293c17c] {\n  white-space: pre-line;\n}\n.pre-wrap[data-v-d293c17c] {\n  white-space: pre-wrap;\n}\n.no-wrap[data-v-d293c17c] {\n  white-space: nowrap;\n}\n.d-block[data-v-d293c17c] {\n  display: block;\n}\n.d-inline-block[data-v-d293c17c] {\n  display: inline-block;\n}\n.d-flex[data-v-d293c17c] {\n  display: flex;\n}\n.d-inline-flex[data-v-d293c17c] {\n  display: inline-flex;\n}\n.d-grid[data-v-d293c17c] {\n  display: grid;\n}\n.d-none[data-v-d293c17c] {\n  display: none;\n}\n.hide[data-v-d293c17c] {\n  visibility: hidden;\n}\n.overflow-hidden[data-v-d293c17c] {\n  overflow: hidden;\n}\n.overflow-auto[data-v-d293c17c] {\n  overflow: auto;\n}\n.flex-center[data-v-d293c17c] {\n  justify-content: center;\n}\n.flex-middle[data-v-d293c17c] {\n  align-items: center;\n}\n.flex-grow[data-v-d293c17c] {\n  flex-grow: 1;\n}\n.flex-shrink[data-v-d293c17c] {\n  flex-shrink: 1;\n}\n.flex-vertical[data-v-d293c17c] {\n  flex-direction: column;\n}\n.flex-space[data-v-d293c17c] {\n  justify-content: space-between;\n}\n.flex-end[data-v-d293c17c] {\n  justify-content: flex-end;\n}\n.flex-start[data-v-d293c17c] {\n  justify-content: flex-start;\n}\n.text-center[data-v-d293c17c] {\n  text-align: center;\n}\n.m-z[data-v-d293c17c] {\n  margin: 0 !important;\n}\n.m-n-z[data-v-d293c17c] {\n  margin-top: 0 !important;\n}\n.m-e-z[data-v-d293c17c] {\n  margin-right: 0 !important;\n}\n.m-s-z[data-v-d293c17c] {\n  margin-bottom: 0 !important;\n}\n.m-w-z[data-v-d293c17c] {\n  margin-left: 0 !important;\n}\n.m-n-xl[data-v-d293c17c] {\n  margin-top: 25px;\n}\n.m-e-xl[data-v-d293c17c] {\n  margin-right: 25px;\n}\n.m-s-xl[data-v-d293c17c] {\n  margin-bottom: 25px;\n}\n.m-w-xl[data-v-d293c17c] {\n  margin-left: 25px;\n}\n.m-n-lg[data-v-d293c17c] {\n  margin-top: 20px;\n}\n.m-e-lg[data-v-d293c17c] {\n  margin-right: 20px;\n}\n.m-s-lg[data-v-d293c17c] {\n  margin-bottom: 20px;\n}\n.m-w-lg[data-v-d293c17c] {\n  margin-left: 20px;\n}\n.m-n-med[data-v-d293c17c] {\n  margin-top: 15px;\n}\n.m-e-med[data-v-d293c17c] {\n  margin-right: 15px;\n}\n.m-s-med[data-v-d293c17c] {\n  margin-bottom: 15px;\n}\n.m-w-med[data-v-d293c17c] {\n  margin-left: 15px;\n}\n.m-n-sm[data-v-d293c17c] {\n  margin-top: 10px;\n}\n.m-e-sm[data-v-d293c17c] {\n  margin-right: 10px;\n}\n.m-s-sm[data-v-d293c17c] {\n  margin-bottom: 10px;\n}\n.m-w-sm[data-v-d293c17c] {\n  margin-left: 10px;\n}\n.m-n-xs[data-v-d293c17c] {\n  margin-top: 5px;\n}\n.m-e-xs[data-v-d293c17c] {\n  margin-right: 5px;\n}\n.m-s-xs[data-v-d293c17c] {\n  margin-bottom: 5px;\n}\n.m-w-xs[data-v-d293c17c] {\n  margin-left: 5px;\n}\n.m-n-xxs[data-v-d293c17c] {\n  margin-top: 2px;\n}\n.m-e-xxs[data-v-d293c17c] {\n  margin-right: 2px;\n}\n.m-s-xxs[data-v-d293c17c] {\n  margin-bottom: 2px;\n}\n.m-w-xxs[data-v-d293c17c] {\n  margin-left: 2px;\n}\n.p-z[data-v-d293c17c] {\n  padding: 0 !important;\n}\n.p-n-z[data-v-d293c17c] {\n  padding-top: 0 !important;\n}\n.p-e-z[data-v-d293c17c] {\n  padding-right: 0 !important;\n}\n.p-s-z[data-v-d293c17c] {\n  padding-bottom: 0 !important;\n}\n.p-w-z[data-v-d293c17c] {\n  padding-left: 0 !important;\n}\n.p-n-xl[data-v-d293c17c] {\n  padding-top: 25px;\n}\n.p-e-xl[data-v-d293c17c] {\n  padding-right: 25px;\n}\n.p-s-xl[data-v-d293c17c] {\n  padding-bottom: 25px;\n}\n.p-w-xl[data-v-d293c17c] {\n  padding-left: 25px;\n}\n.p-n-lg[data-v-d293c17c] {\n  padding-top: 20px;\n}\n.p-e-lg[data-v-d293c17c] {\n  padding-right: 20px;\n}\n.p-s-lg[data-v-d293c17c] {\n  padding-bottom: 20px;\n}\n.p-w-lg[data-v-d293c17c] {\n  padding-left: 20px;\n}\n.p-n-med[data-v-d293c17c] {\n  padding-top: 15px;\n}\n.p-e-med[data-v-d293c17c] {\n  padding-right: 15px;\n}\n.p-s-med[data-v-d293c17c] {\n  padding-bottom: 15px;\n}\n.p-w-med[data-v-d293c17c] {\n  padding-left: 15px;\n}\n.p-n-sm[data-v-d293c17c] {\n  padding-top: 10px;\n}\n.p-e-sm[data-v-d293c17c] {\n  padding-right: 10px;\n}\n.p-s-sm[data-v-d293c17c] {\n  padding-bottom: 10px;\n}\n.p-w-sm[data-v-d293c17c] {\n  padding-left: 10px;\n}\n.p-n-xs[data-v-d293c17c] {\n  padding-top: 5px;\n}\n.p-e-xs[data-v-d293c17c] {\n  padding-right: 5px;\n}\n.p-s-xs[data-v-d293c17c] {\n  padding-bottom: 5px;\n}\n.p-w-xs[data-v-d293c17c] {\n  padding-left: 5px;\n}\n.p-xs[data-v-d293c17c] {\n  padding: 5px;\n}\n.p-n-xxs[data-v-d293c17c] {\n  padding-top: 2px;\n}\n.p-e-xxs[data-v-d293c17c] {\n  padding-right: 2px;\n}\n.p-s-xxs[data-v-d293c17c] {\n  padding-bottom: 2px;\n}\n.p-w-xxs[data-v-d293c17c] {\n  padding-left: 2px;\n}\n.p-xxs[data-v-d293c17c] {\n  padding: 2px;\n}\n.p-xs[data-v-d293c17c] {\n  padding: 5px;\n}\n.p-sm[data-v-d293c17c] {\n  padding: 10px;\n}\n.p-med[data-v-d293c17c] {\n  padding: 15px;\n}\n.p-lg[data-v-d293c17c] {\n  padding: 20px;\n}\n.p-xl[data-v-d293c17c] {\n  padding: 25px;\n}\n.m-xxs[data-v-d293c17c] {\n  margin: 2px;\n}\n.m-xs[data-v-d293c17c] {\n  margin: 5px;\n}\n.m-sm[data-v-d293c17c] {\n  margin: 10px;\n}\n.m-med[data-v-d293c17c] {\n  margin: 15px;\n}\n.m-lg[data-v-d293c17c] {\n  margin: 20px;\n}\n.m-xl[data-v-d293c17c] {\n  margin: 25px;\n}\n.ev-gutter-column[data-v-d293c17c] {\n  cursor: col-resize;\n}\n.ev-gutter-row[data-v-d293c17c] {\n  cursor: row-resize;\n}\n.ev-gutter[data-v-d293c17c]:not(.ev-gutter-no-resize)::after {\n  display: block;\n  position: relative;\n  content: \"\";\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-column[data-v-d293c17c]::after {\n  width: 8px;\n  height: 100%;\n  margin-left: -4px;\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-row[data-v-d293c17c]::after {\n  width: 100%;\n  height: 8px;\n  margin-top: -4px;\n}\n.ev-layout-pane-maximized[data-v-d293c17c] {\n  border: 0;\n}\n\n/*# sourceMappingURL=EvLayout.vue.map */", map: {"version":3,"sources":["EvLayout.vue","/Users/john/Code/evwt/components/src/EvLayout/EvLayout.vue"],"names":[],"mappings":"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","file":"EvLayout.vue","sourcesContent":["* {\n  box-sizing: border-box;\n}\n\n*:before,\n*:after {\n  box-sizing: border-box;\n}\n\n.h-100 {\n  height: 100%;\n}\n\n.vh-100 {\n  height: 100vh;\n}\n\n.w-100 {\n  width: 100%;\n}\n\n.vw-100 {\n  width: 100vw;\n}\n\n.pre-line {\n  white-space: pre-line;\n}\n\n.pre-wrap {\n  white-space: pre-wrap;\n}\n\n.no-wrap {\n  white-space: nowrap;\n}\n\n.d-block {\n  display: block;\n}\n\n.d-inline-block {\n  display: inline-block;\n}\n\n.d-flex {\n  display: flex;\n}\n\n.d-inline-flex {\n  display: inline-flex;\n}\n\n.d-grid {\n  display: grid;\n}\n\n.d-none {\n  display: none;\n}\n\n.hide {\n  visibility: hidden;\n}\n\n.overflow-hidden {\n  overflow: hidden;\n}\n\n.overflow-auto {\n  overflow: auto;\n}\n\n.flex-center {\n  justify-content: center;\n}\n\n.flex-middle {\n  align-items: center;\n}\n\n.flex-grow {\n  flex-grow: 1;\n}\n\n.flex-shrink {\n  flex-shrink: 1;\n}\n\n.flex-vertical {\n  flex-direction: column;\n}\n\n.flex-space {\n  justify-content: space-between;\n}\n\n.flex-end {\n  justify-content: flex-end;\n}\n\n.flex-start {\n  justify-content: flex-start;\n}\n\n.text-center {\n  text-align: center;\n}\n\n.m-z {\n  margin: 0 !important;\n}\n\n.m-n-z {\n  margin-top: 0 !important;\n}\n\n.m-e-z {\n  margin-right: 0 !important;\n}\n\n.m-s-z {\n  margin-bottom: 0 !important;\n}\n\n.m-w-z {\n  margin-left: 0 !important;\n}\n\n.m-n-xl {\n  margin-top: 25px;\n}\n\n.m-e-xl {\n  margin-right: 25px;\n}\n\n.m-s-xl {\n  margin-bottom: 25px;\n}\n\n.m-w-xl {\n  margin-left: 25px;\n}\n\n.m-n-lg {\n  margin-top: 20px;\n}\n\n.m-e-lg {\n  margin-right: 20px;\n}\n\n.m-s-lg {\n  margin-bottom: 20px;\n}\n\n.m-w-lg {\n  margin-left: 20px;\n}\n\n.m-n-med {\n  margin-top: 15px;\n}\n\n.m-e-med {\n  margin-right: 15px;\n}\n\n.m-s-med {\n  margin-bottom: 15px;\n}\n\n.m-w-med {\n  margin-left: 15px;\n}\n\n.m-n-sm {\n  margin-top: 10px;\n}\n\n.m-e-sm {\n  margin-right: 10px;\n}\n\n.m-s-sm {\n  margin-bottom: 10px;\n}\n\n.m-w-sm {\n  margin-left: 10px;\n}\n\n.m-n-xs {\n  margin-top: 5px;\n}\n\n.m-e-xs {\n  margin-right: 5px;\n}\n\n.m-s-xs {\n  margin-bottom: 5px;\n}\n\n.m-w-xs {\n  margin-left: 5px;\n}\n\n.m-n-xxs {\n  margin-top: 2px;\n}\n\n.m-e-xxs {\n  margin-right: 2px;\n}\n\n.m-s-xxs {\n  margin-bottom: 2px;\n}\n\n.m-w-xxs {\n  margin-left: 2px;\n}\n\n.p-z {\n  padding: 0 !important;\n}\n\n.p-n-z {\n  padding-top: 0 !important;\n}\n\n.p-e-z {\n  padding-right: 0 !important;\n}\n\n.p-s-z {\n  padding-bottom: 0 !important;\n}\n\n.p-w-z {\n  padding-left: 0 !important;\n}\n\n.p-n-xl {\n  padding-top: 25px;\n}\n\n.p-e-xl {\n  padding-right: 25px;\n}\n\n.p-s-xl {\n  padding-bottom: 25px;\n}\n\n.p-w-xl {\n  padding-left: 25px;\n}\n\n.p-n-lg {\n  padding-top: 20px;\n}\n\n.p-e-lg {\n  padding-right: 20px;\n}\n\n.p-s-lg {\n  padding-bottom: 20px;\n}\n\n.p-w-lg {\n  padding-left: 20px;\n}\n\n.p-n-med {\n  padding-top: 15px;\n}\n\n.p-e-med {\n  padding-right: 15px;\n}\n\n.p-s-med {\n  padding-bottom: 15px;\n}\n\n.p-w-med {\n  padding-left: 15px;\n}\n\n.p-n-sm {\n  padding-top: 10px;\n}\n\n.p-e-sm {\n  padding-right: 10px;\n}\n\n.p-s-sm {\n  padding-bottom: 10px;\n}\n\n.p-w-sm {\n  padding-left: 10px;\n}\n\n.p-n-xs {\n  padding-top: 5px;\n}\n\n.p-e-xs {\n  padding-right: 5px;\n}\n\n.p-s-xs {\n  padding-bottom: 5px;\n}\n\n.p-w-xs {\n  padding-left: 5px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-n-xxs {\n  padding-top: 2px;\n}\n\n.p-e-xxs {\n  padding-right: 2px;\n}\n\n.p-s-xxs {\n  padding-bottom: 2px;\n}\n\n.p-w-xxs {\n  padding-left: 2px;\n}\n\n.p-xxs {\n  padding: 2px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-sm {\n  padding: 10px;\n}\n\n.p-med {\n  padding: 15px;\n}\n\n.p-lg {\n  padding: 20px;\n}\n\n.p-xl {\n  padding: 25px;\n}\n\n.m-xxs {\n  margin: 2px;\n}\n\n.m-xs {\n  margin: 5px;\n}\n\n.m-sm {\n  margin: 10px;\n}\n\n.m-med {\n  margin: 15px;\n}\n\n.m-lg {\n  margin: 20px;\n}\n\n.m-xl {\n  margin: 25px;\n}\n\n.ev-gutter-column {\n  cursor: col-resize;\n}\n\n.ev-gutter-row {\n  cursor: row-resize;\n}\n\n.ev-gutter:not(.ev-gutter-no-resize)::after {\n  display: block;\n  position: relative;\n  content: \"\";\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-column::after {\n  width: 8px;\n  height: 100%;\n  margin-left: -4px;\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-row::after {\n  width: 100%;\n  height: 8px;\n  margin-top: -4px;\n}\n\n.ev-layout-pane-maximized {\n  border: 0;\n}\n\n/*# sourceMappingURL=EvLayout.vue.map */","<template>\n  <ev-layout-child v-if=\"layoutData\" :child=\"layoutData\">\n    <!-- @vuese-ignore -->\n    <slot v-for=\"(_, name) in $slots\" :slot=\"name\" :name=\"name\" />\n    <template v-for=\"(_, name) in $scopedSlots\" :slot=\"name\" slot-scope=\"slotData\">\n      <!-- @vuese-ignore -->\n      <slot :name=\"name\" v-bind=\"slotData\" />\n    </template>\n  </ev-layout-child>\n</template>\n\n<script>\nimport Split from '../../../vendor/split-grid';\nimport EvLayoutChild from '../EvLayoutChild.vue';\n\nexport default {\n  name: 'EvLayout',\n\n  components: {\n    EvLayoutChild\n  },\n\n  props: {\n    // The top-level Pane\n    layout: {\n      type: Object,\n      required: true\n    }\n  },\n\n  data() {\n    return {\n      layoutData: null\n    };\n  },\n\n  async created() {\n    this.layoutData = this.layout;\n    this.loadUiState();\n  },\n\n  async mounted() {\n    let rowGutters = [...this.$el.querySelectorAll('.ev-gutter-row')].map((gutter) => ({\n      track: Array.prototype.indexOf.call(gutter.parentNode.children, gutter),\n      element: gutter\n    }));\n\n    let columnGutters = [...this.$el.querySelectorAll('.ev-gutter-column')].map((gutter) => ({\n      track: Array.prototype.indexOf.call(gutter.parentNode.children, gutter),\n      element: gutter\n    }));\n\n    let minSizeReducer = (acc, gutter) => {\n      let prevPane = gutter.previousElementSibling;\n\n      if (prevPane) {\n        let minSize = parseInt(prevPane.dataset.minSize || 0);\n        let index = Array.prototype.indexOf.call(prevPane.parentNode.children, prevPane);\n        acc[index] = minSize;\n      }\n\n      let nextPane = gutter.nextElementSibling;\n\n      if (nextPane) {\n        let minSizeNext = parseInt(nextPane.dataset.minSize || 0);\n        let indexNext = Array.prototype.indexOf.call(nextPane.parentNode.children, nextPane);\n\n        acc[indexNext] = minSizeNext;\n      }\n\n      return acc;\n    };\n\n    let columnMinSizes = [...this.$el.querySelectorAll('.ev-gutter-column')].reduce(minSizeReducer, {});\n    let rowMinSizes = [...this.$el.querySelectorAll('.ev-gutter-row')].reduce(minSizeReducer, {});\n\n    let onDragStart = (direction, track, element) => {\n      // Fired when any pane starts dragging\n      // @arg direction, track, gutter element\n      this.$emit('dragStart', { direction, track, element });\n    };\n\n    let onDrag = (direction, track, element, gridTemplateStyle) => {\n      let parent = element.parentElement;\n      let adjacentPane = element.previousElementSibling;\n      let maximizedClassName = 'ev-layout-pane-maximized';\n      let minimizedClassName = 'ev-layout-pane-minimized';\n\n      if (adjacentPane && adjacentPane.offsetWidth === parent.offsetWidth) {\n        adjacentPane.classList.add(maximizedClassName);\n      } else if (adjacentPane.classList.contains(maximizedClassName)) {\n        adjacentPane.classList.remove(maximizedClassName);\n      }\n\n      if (adjacentPane && adjacentPane.offsetWidth === 0) {\n        adjacentPane.classList.add(minimizedClassName);\n      } else if (adjacentPane.classList.contains(minimizedClassName)) {\n        adjacentPane.classList.remove(minimizedClassName);\n      }\n\n      // Fired when any pane is dragging\n      // @arg direction, track, gutter element, gridTemplateStyle\n      this.$emit('drag', {\n        direction, track, element, gridTemplateStyle\n      });\n    };\n\n    let onDragEnd = async (direction, track, element) => {\n      // Fired when any pane ends dragging\n      // @arg direction, track, gutter element\n      this.$emit('dragEnd', { direction, track, element });\n\n      if (this.$evstore && this.$evstore.$ui) {\n        let { gridTemplateColumns, gridTemplateRows } = element.parentElement.style;\n        let gridTemplate = gridTemplateColumns || gridTemplateRows;\n        let sizes = gridTemplate.split(' 0px ');\n        let name = element.parentElement.dataset.evlayoutName;\n        this.syncLayoutDataForPane(name, this.layoutData, sizes);\n        this.saveUiState();\n      }\n    };\n\n    Split({\n      columnGutters, rowGutters, columnMinSizes, rowMinSizes, onDragStart, onDrag, onDragEnd\n    });\n  },\n\n  methods: {\n    loadUiState() {\n      if (typeof this.$evstore.$ui.store.layout === 'object') {\n        for (const [paneName, paneSizes] of Object.entries(this.$evstore.$ui.store.layout)) {\n          this.syncLayoutDataForPane(paneName, this.layoutData, paneSizes);\n        }\n      }\n    },\n\n    saveUiState() {\n      this.$set(this.$evstore.$ui.store, 'layout', this.getSizesForPanes(this.layoutData));\n    },\n\n    syncLayoutDataForPane(name, layoutData, sizes) {\n      if (layoutData.name === name) {\n        layoutData.sizes = sizes;\n        return;\n      }\n\n      for (let idx = 0; idx < layoutData.panes.length; idx++) {\n        let pane = layoutData.panes[idx];\n        if (!pane) continue;\n        if (pane.name === name) {\n          pane.sizes = sizes;\n        }\n        if (pane.panes) {\n          this.syncLayoutDataForPane(name, pane, sizes);\n        }\n      }\n    },\n\n    getSizesForPanes(layoutData, sizes = {}) {\n      sizes[layoutData.name] = layoutData.sizes;\n\n      for (let idx = 0; idx < layoutData.panes.length; idx++) {\n        let pane = layoutData.panes[idx];\n        if (!pane) continue;\n        sizes[pane.name] = pane.sizes;\n        if (pane.panes) {\n          this.getSizesForPanes(pane, sizes);\n        }\n      }\n\n      return sizes;\n    }\n\n  }\n};\n</script>\n\n<style lang=\"scss\" scoped>\n@import '../../../style/reset.scss';\n@import '../../../style/utilities.scss';\n@import '../../../style/split-grid.scss';\n</style>\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$1 = "data-v-d293c17c";
  /* module identifier */
  const __vue_module_identifier__$1 = undefined;
  /* functional template */
  const __vue_is_functional_template__$1 = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$1 = /*#__PURE__*/normalizeComponent$1(
    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
    __vue_inject_styles__$1,
    __vue_script__$1,
    __vue_scope_id__$1,
    __vue_is_functional_template__$1,
    __vue_module_identifier__$1,
    false,
    createInjector$1,
    undefined,
    undefined
  );

function install(Vue) {
  if (install.installed) return;
  install.installed = true;
  Vue.component('EvLayout', __vue_component__$1);
}

const plugin = {
  install
};

let GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}

export default __vue_component__$1;
export { install };
