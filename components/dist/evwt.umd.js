(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global['evwt-components'] = {}));
}(this, (function (exports) { 'use strict';

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

        let files = [];
        let items = ev.dataTransfer.items;

        if (items && items.length) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
              let file = items[i].getAsFile();
              files.push(file);
            }
          }

          // Emits array of Files when one or more files are dropped
          // @arg Array of https://developer.mozilla.org/en-US/docs/Web/API/File
          this.$emit('drop', files);
        }
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
  var __vue_staticRenderFns__ = [];
  __vue_render__._withStripped = true;

    /* style */
    const __vue_inject_styles__ = function (inject) {
      if (!inject) return
      inject("data-v-7328a24f_0", { source: ".ev-drop-zone-frame[data-v-7328a24f] {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  box-sizing: border-box;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  pointer-events: none;\n  z-index: 1;\n}\n.ev-drop-zone[data-v-7328a24f] {\n  position: relative;\n  width: 100%;\n  height: 100%;\n}\n\n/*# sourceMappingURL=EvDropZone.vue.map */", map: {"version":3,"sources":["/Users/john/Code/evwt/components/EvDropZone.vue","EvDropZone.vue"],"names":[],"mappings":"AA8FA;EACA,kBAAA;EACA,WAAA;EACA,YAAA;EACA,sBAAA;EACA,MAAA;EACA,SAAA;EACA,OAAA;EACA,QAAA;EACA,oBAAA;EACA,UAAA;AC7FA;ADgGA;EACA,kBAAA;EACA,WAAA;EACA,YAAA;AC7FA;;AAEA,yCAAyC","file":"EvDropZone.vue","sourcesContent":["<template>\n  <div\n    class=\"ev-drop-zone\"\n    @drop.stop=\"handleDrop\"\n    @dragenter=\"entered = true\"\n    @dragover.prevent.stop=\"entered = true\"\n    @dragleave=\"entered = false\">\n    <svg v-show=\"entered\" class=\"ev-drop-zone-frame\" :style=\"frameStyle\">\n      <rect\n        width=\"100%\"\n        height=\"100%\"\n        fill=\"none\"\n        :rx=\"radius\"\n        :ry=\"radius\"\n        :stroke=\"stroke\"\n        :stroke-width=\"strokeWidth\"\n        :stroke-dasharray=\"strokeDashArray\"\n        :stroke-dashoffset=\"strokeDashOffset\"\n        stroke-linecap=\"square\" />\n    </svg>\n    <!-- Component to wrap -->\n    <slot />\n  </div>\n</template>\n\n<script>\nexport default {\n  name: 'EvDropZone',\n\n  props: {\n    // Border radius of overlay\n    radius: {\n      type: Number,\n      default: 10\n    },\n    // Color of overlay border\n    stroke: {\n      type: String,\n      default: '#ccc'\n    },\n    // Width of overlay border\n    strokeWidth: {\n      type: Number,\n      default: 10\n    },\n    // Dash array spacing\n    strokeDashArray: {\n      type: String,\n      default: '10, 20'\n    },\n    // Dash offset\n    strokeDashOffset: {\n      type: Number,\n      default: 35\n    }\n  },\n\n  data() {\n    return {\n      entered: false\n    };\n  },\n\n  computed: {\n    frameStyle() {\n      return `border-radius: ${this.radius}px`;\n    }\n  },\n\n  methods: {\n    handleDrop(ev) {\n      this.entered = false;\n\n      let files = [];\n      let items = ev.dataTransfer.items;\n\n      if (items && items.length) {\n        for (let i = 0; i < items.length; i++) {\n          if (items[i].kind === 'file') {\n            let file = items[i].getAsFile();\n            files.push(file);\n          }\n        }\n\n        // Emits array of Files when one or more files are dropped\n        // @arg Array of https://developer.mozilla.org/en-US/docs/Web/API/File\n        this.$emit('drop', files);\n      }\n    }\n  }\n};\n</script>\n\n<style lang=\"scss\" scoped>\n.ev-drop-zone-frame {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  box-sizing: border-box;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  pointer-events: none;\n  z-index: 1;\n}\n\n.ev-drop-zone {\n  position: relative;\n  width: 100%;\n  height: 100%;\n}\n</style>\n",".ev-drop-zone-frame {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  box-sizing: border-box;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  pointer-events: none;\n  z-index: 1;\n}\n\n.ev-drop-zone {\n  position: relative;\n  width: 100%;\n  height: 100%;\n}\n\n/*# sourceMappingURL=EvDropZone.vue.map */"]}, media: undefined });

    };
    /* scoped */
    const __vue_scope_id__ = "data-v-7328a24f";
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

  function install(Vue) {
    if (install.installed) return;
    install.installed = true;
    Vue.component('EvDropZone', __vue_component__);
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

  var script$1 = {
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

        let sizes = this.child.sizes.map(s => [s, 0]).flat();
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

  /* script */
  const __vue_script__$1 = script$1;

  /* template */
  var __vue_render__$1 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c(
      "div",
      {
        staticClass: "d-grid overflow-hidden h-100 w-100",
        class: _vm.classForChild,
        style: _vm.childStyle,
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
  var __vue_staticRenderFns__$1 = [];
  __vue_render__$1._withStripped = true;

    /* style */
    const __vue_inject_styles__$1 = function (inject) {
      if (!inject) return
      inject("data-v-752e8741_0", { source: "*[data-v-752e8741] {\n  box-sizing: border-box;\n}\n*[data-v-752e8741]:before,\n*[data-v-752e8741]:after {\n  box-sizing: border-box;\n}\n.h-100[data-v-752e8741] {\n  height: 100%;\n}\n.vh-100[data-v-752e8741] {\n  height: 100vh;\n}\n.w-100[data-v-752e8741] {\n  width: 100%;\n}\n.vw-100[data-v-752e8741] {\n  width: 100vw;\n}\n.pre-line[data-v-752e8741] {\n  white-space: pre-line;\n}\n.pre-wrap[data-v-752e8741] {\n  white-space: pre-wrap;\n}\n.no-wrap[data-v-752e8741] {\n  white-space: nowrap;\n}\n.d-block[data-v-752e8741] {\n  display: block;\n}\n.d-inline-block[data-v-752e8741] {\n  display: inline-block;\n}\n.d-flex[data-v-752e8741] {\n  display: flex;\n}\n.d-inline-flex[data-v-752e8741] {\n  display: inline-flex;\n}\n.d-grid[data-v-752e8741] {\n  display: grid;\n}\n.d-none[data-v-752e8741] {\n  display: none;\n}\n.hide[data-v-752e8741] {\n  visibility: hidden;\n}\n.overflow-hidden[data-v-752e8741] {\n  overflow: hidden;\n}\n.overflow-auto[data-v-752e8741] {\n  overflow: auto;\n}\n.flex-center[data-v-752e8741] {\n  justify-content: center;\n}\n.flex-middle[data-v-752e8741] {\n  align-items: center;\n}\n.flex-grow[data-v-752e8741] {\n  flex-grow: 1;\n}\n.flex-shrink[data-v-752e8741] {\n  flex-shrink: 1;\n}\n.flex-vertical[data-v-752e8741] {\n  flex-direction: column;\n}\n.flex-space[data-v-752e8741] {\n  justify-content: space-between;\n}\n.flex-end[data-v-752e8741] {\n  justify-content: flex-end;\n}\n.flex-start[data-v-752e8741] {\n  justify-content: flex-start;\n}\n.text-center[data-v-752e8741] {\n  text-align: center;\n}\n.m-z[data-v-752e8741] {\n  margin: 0 !important;\n}\n.m-n-z[data-v-752e8741] {\n  margin-top: 0 !important;\n}\n.m-e-z[data-v-752e8741] {\n  margin-right: 0 !important;\n}\n.m-s-z[data-v-752e8741] {\n  margin-bottom: 0 !important;\n}\n.m-w-z[data-v-752e8741] {\n  margin-left: 0 !important;\n}\n.m-n-xl[data-v-752e8741] {\n  margin-top: 25px;\n}\n.m-e-xl[data-v-752e8741] {\n  margin-right: 25px;\n}\n.m-s-xl[data-v-752e8741] {\n  margin-bottom: 25px;\n}\n.m-w-xl[data-v-752e8741] {\n  margin-left: 25px;\n}\n.m-n-lg[data-v-752e8741] {\n  margin-top: 20px;\n}\n.m-e-lg[data-v-752e8741] {\n  margin-right: 20px;\n}\n.m-s-lg[data-v-752e8741] {\n  margin-bottom: 20px;\n}\n.m-w-lg[data-v-752e8741] {\n  margin-left: 20px;\n}\n.m-n-med[data-v-752e8741] {\n  margin-top: 15px;\n}\n.m-e-med[data-v-752e8741] {\n  margin-right: 15px;\n}\n.m-s-med[data-v-752e8741] {\n  margin-bottom: 15px;\n}\n.m-w-med[data-v-752e8741] {\n  margin-left: 15px;\n}\n.m-n-sm[data-v-752e8741] {\n  margin-top: 10px;\n}\n.m-e-sm[data-v-752e8741] {\n  margin-right: 10px;\n}\n.m-s-sm[data-v-752e8741] {\n  margin-bottom: 10px;\n}\n.m-w-sm[data-v-752e8741] {\n  margin-left: 10px;\n}\n.m-n-xs[data-v-752e8741] {\n  margin-top: 5px;\n}\n.m-e-xs[data-v-752e8741] {\n  margin-right: 5px;\n}\n.m-s-xs[data-v-752e8741] {\n  margin-bottom: 5px;\n}\n.m-w-xs[data-v-752e8741] {\n  margin-left: 5px;\n}\n.m-n-xxs[data-v-752e8741] {\n  margin-top: 2px;\n}\n.m-e-xxs[data-v-752e8741] {\n  margin-right: 2px;\n}\n.m-s-xxs[data-v-752e8741] {\n  margin-bottom: 2px;\n}\n.m-w-xxs[data-v-752e8741] {\n  margin-left: 2px;\n}\n.p-z[data-v-752e8741] {\n  padding: 0 !important;\n}\n.p-n-z[data-v-752e8741] {\n  padding-top: 0 !important;\n}\n.p-e-z[data-v-752e8741] {\n  padding-right: 0 !important;\n}\n.p-s-z[data-v-752e8741] {\n  padding-bottom: 0 !important;\n}\n.p-w-z[data-v-752e8741] {\n  padding-left: 0 !important;\n}\n.p-n-xl[data-v-752e8741] {\n  padding-top: 25px;\n}\n.p-e-xl[data-v-752e8741] {\n  padding-right: 25px;\n}\n.p-s-xl[data-v-752e8741] {\n  padding-bottom: 25px;\n}\n.p-w-xl[data-v-752e8741] {\n  padding-left: 25px;\n}\n.p-n-lg[data-v-752e8741] {\n  padding-top: 20px;\n}\n.p-e-lg[data-v-752e8741] {\n  padding-right: 20px;\n}\n.p-s-lg[data-v-752e8741] {\n  padding-bottom: 20px;\n}\n.p-w-lg[data-v-752e8741] {\n  padding-left: 20px;\n}\n.p-n-med[data-v-752e8741] {\n  padding-top: 15px;\n}\n.p-e-med[data-v-752e8741] {\n  padding-right: 15px;\n}\n.p-s-med[data-v-752e8741] {\n  padding-bottom: 15px;\n}\n.p-w-med[data-v-752e8741] {\n  padding-left: 15px;\n}\n.p-n-sm[data-v-752e8741] {\n  padding-top: 10px;\n}\n.p-e-sm[data-v-752e8741] {\n  padding-right: 10px;\n}\n.p-s-sm[data-v-752e8741] {\n  padding-bottom: 10px;\n}\n.p-w-sm[data-v-752e8741] {\n  padding-left: 10px;\n}\n.p-n-xs[data-v-752e8741] {\n  padding-top: 5px;\n}\n.p-e-xs[data-v-752e8741] {\n  padding-right: 5px;\n}\n.p-s-xs[data-v-752e8741] {\n  padding-bottom: 5px;\n}\n.p-w-xs[data-v-752e8741] {\n  padding-left: 5px;\n}\n.p-xs[data-v-752e8741] {\n  padding: 5px;\n}\n.p-n-xxs[data-v-752e8741] {\n  padding-top: 2px;\n}\n.p-e-xxs[data-v-752e8741] {\n  padding-right: 2px;\n}\n.p-s-xxs[data-v-752e8741] {\n  padding-bottom: 2px;\n}\n.p-w-xxs[data-v-752e8741] {\n  padding-left: 2px;\n}\n.p-xxs[data-v-752e8741] {\n  padding: 2px;\n}\n.p-xs[data-v-752e8741] {\n  padding: 5px;\n}\n.p-sm[data-v-752e8741] {\n  padding: 10px;\n}\n.p-med[data-v-752e8741] {\n  padding: 15px;\n}\n.p-lg[data-v-752e8741] {\n  padding: 20px;\n}\n.p-xl[data-v-752e8741] {\n  padding: 25px;\n}\n.m-xxs[data-v-752e8741] {\n  margin: 2px;\n}\n.m-xs[data-v-752e8741] {\n  margin: 5px;\n}\n.m-sm[data-v-752e8741] {\n  margin: 10px;\n}\n.m-med[data-v-752e8741] {\n  margin: 15px;\n}\n.m-lg[data-v-752e8741] {\n  margin: 20px;\n}\n.m-xl[data-v-752e8741] {\n  margin: 25px;\n}\n.ev-gutter-column[data-v-752e8741] {\n  cursor: col-resize;\n}\n.ev-gutter-row[data-v-752e8741] {\n  cursor: row-resize;\n}\n.ev-gutter[data-v-752e8741]:not(.ev-gutter-no-resize)::after {\n  display: block;\n  position: relative;\n  content: \"\";\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-column[data-v-752e8741]::after {\n  width: 8px;\n  height: 100%;\n  margin-left: -4px;\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-row[data-v-752e8741]::after {\n  width: 100%;\n  height: 8px;\n  margin-top: -4px;\n}\n\n/*# sourceMappingURL=EvLayoutChild.vue.map */", map: {"version":3,"sources":["EvLayoutChild.vue","/Users/john/Code/evwt/components/EvLayoutChild.vue"],"names":[],"mappings":"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","file":"EvLayoutChild.vue","sourcesContent":["* {\n  box-sizing: border-box;\n}\n\n*:before,\n*:after {\n  box-sizing: border-box;\n}\n\n.h-100 {\n  height: 100%;\n}\n\n.vh-100 {\n  height: 100vh;\n}\n\n.w-100 {\n  width: 100%;\n}\n\n.vw-100 {\n  width: 100vw;\n}\n\n.pre-line {\n  white-space: pre-line;\n}\n\n.pre-wrap {\n  white-space: pre-wrap;\n}\n\n.no-wrap {\n  white-space: nowrap;\n}\n\n.d-block {\n  display: block;\n}\n\n.d-inline-block {\n  display: inline-block;\n}\n\n.d-flex {\n  display: flex;\n}\n\n.d-inline-flex {\n  display: inline-flex;\n}\n\n.d-grid {\n  display: grid;\n}\n\n.d-none {\n  display: none;\n}\n\n.hide {\n  visibility: hidden;\n}\n\n.overflow-hidden {\n  overflow: hidden;\n}\n\n.overflow-auto {\n  overflow: auto;\n}\n\n.flex-center {\n  justify-content: center;\n}\n\n.flex-middle {\n  align-items: center;\n}\n\n.flex-grow {\n  flex-grow: 1;\n}\n\n.flex-shrink {\n  flex-shrink: 1;\n}\n\n.flex-vertical {\n  flex-direction: column;\n}\n\n.flex-space {\n  justify-content: space-between;\n}\n\n.flex-end {\n  justify-content: flex-end;\n}\n\n.flex-start {\n  justify-content: flex-start;\n}\n\n.text-center {\n  text-align: center;\n}\n\n.m-z {\n  margin: 0 !important;\n}\n\n.m-n-z {\n  margin-top: 0 !important;\n}\n\n.m-e-z {\n  margin-right: 0 !important;\n}\n\n.m-s-z {\n  margin-bottom: 0 !important;\n}\n\n.m-w-z {\n  margin-left: 0 !important;\n}\n\n.m-n-xl {\n  margin-top: 25px;\n}\n\n.m-e-xl {\n  margin-right: 25px;\n}\n\n.m-s-xl {\n  margin-bottom: 25px;\n}\n\n.m-w-xl {\n  margin-left: 25px;\n}\n\n.m-n-lg {\n  margin-top: 20px;\n}\n\n.m-e-lg {\n  margin-right: 20px;\n}\n\n.m-s-lg {\n  margin-bottom: 20px;\n}\n\n.m-w-lg {\n  margin-left: 20px;\n}\n\n.m-n-med {\n  margin-top: 15px;\n}\n\n.m-e-med {\n  margin-right: 15px;\n}\n\n.m-s-med {\n  margin-bottom: 15px;\n}\n\n.m-w-med {\n  margin-left: 15px;\n}\n\n.m-n-sm {\n  margin-top: 10px;\n}\n\n.m-e-sm {\n  margin-right: 10px;\n}\n\n.m-s-sm {\n  margin-bottom: 10px;\n}\n\n.m-w-sm {\n  margin-left: 10px;\n}\n\n.m-n-xs {\n  margin-top: 5px;\n}\n\n.m-e-xs {\n  margin-right: 5px;\n}\n\n.m-s-xs {\n  margin-bottom: 5px;\n}\n\n.m-w-xs {\n  margin-left: 5px;\n}\n\n.m-n-xxs {\n  margin-top: 2px;\n}\n\n.m-e-xxs {\n  margin-right: 2px;\n}\n\n.m-s-xxs {\n  margin-bottom: 2px;\n}\n\n.m-w-xxs {\n  margin-left: 2px;\n}\n\n.p-z {\n  padding: 0 !important;\n}\n\n.p-n-z {\n  padding-top: 0 !important;\n}\n\n.p-e-z {\n  padding-right: 0 !important;\n}\n\n.p-s-z {\n  padding-bottom: 0 !important;\n}\n\n.p-w-z {\n  padding-left: 0 !important;\n}\n\n.p-n-xl {\n  padding-top: 25px;\n}\n\n.p-e-xl {\n  padding-right: 25px;\n}\n\n.p-s-xl {\n  padding-bottom: 25px;\n}\n\n.p-w-xl {\n  padding-left: 25px;\n}\n\n.p-n-lg {\n  padding-top: 20px;\n}\n\n.p-e-lg {\n  padding-right: 20px;\n}\n\n.p-s-lg {\n  padding-bottom: 20px;\n}\n\n.p-w-lg {\n  padding-left: 20px;\n}\n\n.p-n-med {\n  padding-top: 15px;\n}\n\n.p-e-med {\n  padding-right: 15px;\n}\n\n.p-s-med {\n  padding-bottom: 15px;\n}\n\n.p-w-med {\n  padding-left: 15px;\n}\n\n.p-n-sm {\n  padding-top: 10px;\n}\n\n.p-e-sm {\n  padding-right: 10px;\n}\n\n.p-s-sm {\n  padding-bottom: 10px;\n}\n\n.p-w-sm {\n  padding-left: 10px;\n}\n\n.p-n-xs {\n  padding-top: 5px;\n}\n\n.p-e-xs {\n  padding-right: 5px;\n}\n\n.p-s-xs {\n  padding-bottom: 5px;\n}\n\n.p-w-xs {\n  padding-left: 5px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-n-xxs {\n  padding-top: 2px;\n}\n\n.p-e-xxs {\n  padding-right: 2px;\n}\n\n.p-s-xxs {\n  padding-bottom: 2px;\n}\n\n.p-w-xxs {\n  padding-left: 2px;\n}\n\n.p-xxs {\n  padding: 2px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-sm {\n  padding: 10px;\n}\n\n.p-med {\n  padding: 15px;\n}\n\n.p-lg {\n  padding: 20px;\n}\n\n.p-xl {\n  padding: 25px;\n}\n\n.m-xxs {\n  margin: 2px;\n}\n\n.m-xs {\n  margin: 5px;\n}\n\n.m-sm {\n  margin: 10px;\n}\n\n.m-med {\n  margin: 15px;\n}\n\n.m-lg {\n  margin: 20px;\n}\n\n.m-xl {\n  margin: 25px;\n}\n\n.ev-gutter-column {\n  cursor: col-resize;\n}\n\n.ev-gutter-row {\n  cursor: row-resize;\n}\n\n.ev-gutter:not(.ev-gutter-no-resize)::after {\n  display: block;\n  position: relative;\n  content: \"\";\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-column::after {\n  width: 8px;\n  height: 100%;\n  margin-left: -4px;\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-row::after {\n  width: 100%;\n  height: 8px;\n  margin-top: -4px;\n}\n\n/*# sourceMappingURL=EvLayoutChild.vue.map */","<template>\n  <div\n    :style=\"childStyle\"\n    :data-min-size=\"child.minSize\"\n    class=\"d-grid overflow-hidden h-100 w-100\"\n    :class=\"classForChild\">\n    <div v-if=\"!child.panes\" class=\"ev-layout-pane h-100 w-100 overflow-auto\">\n      <slot :name=\"child.name\" class=\"overflow-auto\" />\n    </div>\n\n    <template v-for=\"(grandChild, idx) in child.panes\">\n      <ev-layout-child\n        :key=\"grandChild.name\"\n        :child=\"grandChild\">\n        <slot v-for=\"(_, name) in $slots\" :slot=\"name\" :name=\"name\" />\n        <template v-for=\"(_, name) in $scopedSlots\" :slot=\"name\" slot-scope=\"slotData\">\n          <slot :name=\"name\" v-bind=\"slotData\" />\n        </template>\n      </ev-layout-child>\n\n      <div\n        v-if=\"child.panes[idx + 1]\"\n        :key=\"grandChild.name + 'gutter'\"\n        :class=\"gutterClass(grandChild, child.direction)\" />\n    </template>\n  </div>\n</template>\n\n<script>\nexport default {\n  name: 'EvLayoutChild',\n\n  props: {\n    child: Object\n  },\n\n  computed: {\n    classForChild() {\n      if (this.child && this.child.name) {\n        return `ev-pane-${this.child.name}`;\n      }\n\n      return '';\n    },\n\n    childStyle() {\n      if (!this.child.sizes || !this.child.sizes.length || !this.child.direction) {\n        return;\n      }\n\n      let sizes = this.child.sizes.map(s => [s, 0]).flat();\n      sizes.pop();\n\n      return `grid-template-${this.child.direction}s: ${sizes.join(' ')}`;\n    }\n  },\n\n  methods: {\n    gutterClass(child, direction) {\n      let className = `ev-gutter ev-gutter-${child.name} ev-gutter-${direction}`;\n\n      if (child.resizable === false) {\n        className += ' ev-gutter-no-resize';\n      }\n\n      return className;\n    }\n\n  }\n};\n</script>\n\n<style lang=\"scss\" scoped>\n@import '../style/reset.scss';\n@import '../style/utilities.scss';\n@import '../style/split-grid.scss';\n</style>\n"]}, media: undefined });

    };
    /* scoped */
    const __vue_scope_id__$1 = "data-v-752e8741";
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

  //

  var script$2 = {
    name: 'EvLayout',

    components: {
      EvLayoutChild: __vue_component__$1
    },

    props: {
      // The top-level Pane
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
  const __vue_script__$2 = script$2;

  /* template */
  var __vue_render__$2 = function() {
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
  var __vue_staticRenderFns__$2 = [];
  __vue_render__$2._withStripped = true;

    /* style */
    const __vue_inject_styles__$2 = function (inject) {
      if (!inject) return
      inject("data-v-0614cbd6_0", { source: "*[data-v-0614cbd6] {\n  box-sizing: border-box;\n}\n*[data-v-0614cbd6]:before,\n*[data-v-0614cbd6]:after {\n  box-sizing: border-box;\n}\n.h-100[data-v-0614cbd6] {\n  height: 100%;\n}\n.vh-100[data-v-0614cbd6] {\n  height: 100vh;\n}\n.w-100[data-v-0614cbd6] {\n  width: 100%;\n}\n.vw-100[data-v-0614cbd6] {\n  width: 100vw;\n}\n.pre-line[data-v-0614cbd6] {\n  white-space: pre-line;\n}\n.pre-wrap[data-v-0614cbd6] {\n  white-space: pre-wrap;\n}\n.no-wrap[data-v-0614cbd6] {\n  white-space: nowrap;\n}\n.d-block[data-v-0614cbd6] {\n  display: block;\n}\n.d-inline-block[data-v-0614cbd6] {\n  display: inline-block;\n}\n.d-flex[data-v-0614cbd6] {\n  display: flex;\n}\n.d-inline-flex[data-v-0614cbd6] {\n  display: inline-flex;\n}\n.d-grid[data-v-0614cbd6] {\n  display: grid;\n}\n.d-none[data-v-0614cbd6] {\n  display: none;\n}\n.hide[data-v-0614cbd6] {\n  visibility: hidden;\n}\n.overflow-hidden[data-v-0614cbd6] {\n  overflow: hidden;\n}\n.overflow-auto[data-v-0614cbd6] {\n  overflow: auto;\n}\n.flex-center[data-v-0614cbd6] {\n  justify-content: center;\n}\n.flex-middle[data-v-0614cbd6] {\n  align-items: center;\n}\n.flex-grow[data-v-0614cbd6] {\n  flex-grow: 1;\n}\n.flex-shrink[data-v-0614cbd6] {\n  flex-shrink: 1;\n}\n.flex-vertical[data-v-0614cbd6] {\n  flex-direction: column;\n}\n.flex-space[data-v-0614cbd6] {\n  justify-content: space-between;\n}\n.flex-end[data-v-0614cbd6] {\n  justify-content: flex-end;\n}\n.flex-start[data-v-0614cbd6] {\n  justify-content: flex-start;\n}\n.text-center[data-v-0614cbd6] {\n  text-align: center;\n}\n.m-z[data-v-0614cbd6] {\n  margin: 0 !important;\n}\n.m-n-z[data-v-0614cbd6] {\n  margin-top: 0 !important;\n}\n.m-e-z[data-v-0614cbd6] {\n  margin-right: 0 !important;\n}\n.m-s-z[data-v-0614cbd6] {\n  margin-bottom: 0 !important;\n}\n.m-w-z[data-v-0614cbd6] {\n  margin-left: 0 !important;\n}\n.m-n-xl[data-v-0614cbd6] {\n  margin-top: 25px;\n}\n.m-e-xl[data-v-0614cbd6] {\n  margin-right: 25px;\n}\n.m-s-xl[data-v-0614cbd6] {\n  margin-bottom: 25px;\n}\n.m-w-xl[data-v-0614cbd6] {\n  margin-left: 25px;\n}\n.m-n-lg[data-v-0614cbd6] {\n  margin-top: 20px;\n}\n.m-e-lg[data-v-0614cbd6] {\n  margin-right: 20px;\n}\n.m-s-lg[data-v-0614cbd6] {\n  margin-bottom: 20px;\n}\n.m-w-lg[data-v-0614cbd6] {\n  margin-left: 20px;\n}\n.m-n-med[data-v-0614cbd6] {\n  margin-top: 15px;\n}\n.m-e-med[data-v-0614cbd6] {\n  margin-right: 15px;\n}\n.m-s-med[data-v-0614cbd6] {\n  margin-bottom: 15px;\n}\n.m-w-med[data-v-0614cbd6] {\n  margin-left: 15px;\n}\n.m-n-sm[data-v-0614cbd6] {\n  margin-top: 10px;\n}\n.m-e-sm[data-v-0614cbd6] {\n  margin-right: 10px;\n}\n.m-s-sm[data-v-0614cbd6] {\n  margin-bottom: 10px;\n}\n.m-w-sm[data-v-0614cbd6] {\n  margin-left: 10px;\n}\n.m-n-xs[data-v-0614cbd6] {\n  margin-top: 5px;\n}\n.m-e-xs[data-v-0614cbd6] {\n  margin-right: 5px;\n}\n.m-s-xs[data-v-0614cbd6] {\n  margin-bottom: 5px;\n}\n.m-w-xs[data-v-0614cbd6] {\n  margin-left: 5px;\n}\n.m-n-xxs[data-v-0614cbd6] {\n  margin-top: 2px;\n}\n.m-e-xxs[data-v-0614cbd6] {\n  margin-right: 2px;\n}\n.m-s-xxs[data-v-0614cbd6] {\n  margin-bottom: 2px;\n}\n.m-w-xxs[data-v-0614cbd6] {\n  margin-left: 2px;\n}\n.p-z[data-v-0614cbd6] {\n  padding: 0 !important;\n}\n.p-n-z[data-v-0614cbd6] {\n  padding-top: 0 !important;\n}\n.p-e-z[data-v-0614cbd6] {\n  padding-right: 0 !important;\n}\n.p-s-z[data-v-0614cbd6] {\n  padding-bottom: 0 !important;\n}\n.p-w-z[data-v-0614cbd6] {\n  padding-left: 0 !important;\n}\n.p-n-xl[data-v-0614cbd6] {\n  padding-top: 25px;\n}\n.p-e-xl[data-v-0614cbd6] {\n  padding-right: 25px;\n}\n.p-s-xl[data-v-0614cbd6] {\n  padding-bottom: 25px;\n}\n.p-w-xl[data-v-0614cbd6] {\n  padding-left: 25px;\n}\n.p-n-lg[data-v-0614cbd6] {\n  padding-top: 20px;\n}\n.p-e-lg[data-v-0614cbd6] {\n  padding-right: 20px;\n}\n.p-s-lg[data-v-0614cbd6] {\n  padding-bottom: 20px;\n}\n.p-w-lg[data-v-0614cbd6] {\n  padding-left: 20px;\n}\n.p-n-med[data-v-0614cbd6] {\n  padding-top: 15px;\n}\n.p-e-med[data-v-0614cbd6] {\n  padding-right: 15px;\n}\n.p-s-med[data-v-0614cbd6] {\n  padding-bottom: 15px;\n}\n.p-w-med[data-v-0614cbd6] {\n  padding-left: 15px;\n}\n.p-n-sm[data-v-0614cbd6] {\n  padding-top: 10px;\n}\n.p-e-sm[data-v-0614cbd6] {\n  padding-right: 10px;\n}\n.p-s-sm[data-v-0614cbd6] {\n  padding-bottom: 10px;\n}\n.p-w-sm[data-v-0614cbd6] {\n  padding-left: 10px;\n}\n.p-n-xs[data-v-0614cbd6] {\n  padding-top: 5px;\n}\n.p-e-xs[data-v-0614cbd6] {\n  padding-right: 5px;\n}\n.p-s-xs[data-v-0614cbd6] {\n  padding-bottom: 5px;\n}\n.p-w-xs[data-v-0614cbd6] {\n  padding-left: 5px;\n}\n.p-xs[data-v-0614cbd6] {\n  padding: 5px;\n}\n.p-n-xxs[data-v-0614cbd6] {\n  padding-top: 2px;\n}\n.p-e-xxs[data-v-0614cbd6] {\n  padding-right: 2px;\n}\n.p-s-xxs[data-v-0614cbd6] {\n  padding-bottom: 2px;\n}\n.p-w-xxs[data-v-0614cbd6] {\n  padding-left: 2px;\n}\n.p-xxs[data-v-0614cbd6] {\n  padding: 2px;\n}\n.p-xs[data-v-0614cbd6] {\n  padding: 5px;\n}\n.p-sm[data-v-0614cbd6] {\n  padding: 10px;\n}\n.p-med[data-v-0614cbd6] {\n  padding: 15px;\n}\n.p-lg[data-v-0614cbd6] {\n  padding: 20px;\n}\n.p-xl[data-v-0614cbd6] {\n  padding: 25px;\n}\n.m-xxs[data-v-0614cbd6] {\n  margin: 2px;\n}\n.m-xs[data-v-0614cbd6] {\n  margin: 5px;\n}\n.m-sm[data-v-0614cbd6] {\n  margin: 10px;\n}\n.m-med[data-v-0614cbd6] {\n  margin: 15px;\n}\n.m-lg[data-v-0614cbd6] {\n  margin: 20px;\n}\n.m-xl[data-v-0614cbd6] {\n  margin: 25px;\n}\n.ev-gutter-column[data-v-0614cbd6] {\n  cursor: col-resize;\n}\n.ev-gutter-row[data-v-0614cbd6] {\n  cursor: row-resize;\n}\n.ev-gutter[data-v-0614cbd6]:not(.ev-gutter-no-resize)::after {\n  display: block;\n  position: relative;\n  content: \"\";\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-column[data-v-0614cbd6]::after {\n  width: 8px;\n  height: 100%;\n  margin-left: -4px;\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-row[data-v-0614cbd6]::after {\n  width: 100%;\n  height: 8px;\n  margin-top: -4px;\n}\n\n/*# sourceMappingURL=EvLayout.vue.map */", map: {"version":3,"sources":["EvLayout.vue","/Users/john/Code/evwt/components/EvLayout.vue"],"names":[],"mappings":"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","file":"EvLayout.vue","sourcesContent":["* {\n  box-sizing: border-box;\n}\n\n*:before,\n*:after {\n  box-sizing: border-box;\n}\n\n.h-100 {\n  height: 100%;\n}\n\n.vh-100 {\n  height: 100vh;\n}\n\n.w-100 {\n  width: 100%;\n}\n\n.vw-100 {\n  width: 100vw;\n}\n\n.pre-line {\n  white-space: pre-line;\n}\n\n.pre-wrap {\n  white-space: pre-wrap;\n}\n\n.no-wrap {\n  white-space: nowrap;\n}\n\n.d-block {\n  display: block;\n}\n\n.d-inline-block {\n  display: inline-block;\n}\n\n.d-flex {\n  display: flex;\n}\n\n.d-inline-flex {\n  display: inline-flex;\n}\n\n.d-grid {\n  display: grid;\n}\n\n.d-none {\n  display: none;\n}\n\n.hide {\n  visibility: hidden;\n}\n\n.overflow-hidden {\n  overflow: hidden;\n}\n\n.overflow-auto {\n  overflow: auto;\n}\n\n.flex-center {\n  justify-content: center;\n}\n\n.flex-middle {\n  align-items: center;\n}\n\n.flex-grow {\n  flex-grow: 1;\n}\n\n.flex-shrink {\n  flex-shrink: 1;\n}\n\n.flex-vertical {\n  flex-direction: column;\n}\n\n.flex-space {\n  justify-content: space-between;\n}\n\n.flex-end {\n  justify-content: flex-end;\n}\n\n.flex-start {\n  justify-content: flex-start;\n}\n\n.text-center {\n  text-align: center;\n}\n\n.m-z {\n  margin: 0 !important;\n}\n\n.m-n-z {\n  margin-top: 0 !important;\n}\n\n.m-e-z {\n  margin-right: 0 !important;\n}\n\n.m-s-z {\n  margin-bottom: 0 !important;\n}\n\n.m-w-z {\n  margin-left: 0 !important;\n}\n\n.m-n-xl {\n  margin-top: 25px;\n}\n\n.m-e-xl {\n  margin-right: 25px;\n}\n\n.m-s-xl {\n  margin-bottom: 25px;\n}\n\n.m-w-xl {\n  margin-left: 25px;\n}\n\n.m-n-lg {\n  margin-top: 20px;\n}\n\n.m-e-lg {\n  margin-right: 20px;\n}\n\n.m-s-lg {\n  margin-bottom: 20px;\n}\n\n.m-w-lg {\n  margin-left: 20px;\n}\n\n.m-n-med {\n  margin-top: 15px;\n}\n\n.m-e-med {\n  margin-right: 15px;\n}\n\n.m-s-med {\n  margin-bottom: 15px;\n}\n\n.m-w-med {\n  margin-left: 15px;\n}\n\n.m-n-sm {\n  margin-top: 10px;\n}\n\n.m-e-sm {\n  margin-right: 10px;\n}\n\n.m-s-sm {\n  margin-bottom: 10px;\n}\n\n.m-w-sm {\n  margin-left: 10px;\n}\n\n.m-n-xs {\n  margin-top: 5px;\n}\n\n.m-e-xs {\n  margin-right: 5px;\n}\n\n.m-s-xs {\n  margin-bottom: 5px;\n}\n\n.m-w-xs {\n  margin-left: 5px;\n}\n\n.m-n-xxs {\n  margin-top: 2px;\n}\n\n.m-e-xxs {\n  margin-right: 2px;\n}\n\n.m-s-xxs {\n  margin-bottom: 2px;\n}\n\n.m-w-xxs {\n  margin-left: 2px;\n}\n\n.p-z {\n  padding: 0 !important;\n}\n\n.p-n-z {\n  padding-top: 0 !important;\n}\n\n.p-e-z {\n  padding-right: 0 !important;\n}\n\n.p-s-z {\n  padding-bottom: 0 !important;\n}\n\n.p-w-z {\n  padding-left: 0 !important;\n}\n\n.p-n-xl {\n  padding-top: 25px;\n}\n\n.p-e-xl {\n  padding-right: 25px;\n}\n\n.p-s-xl {\n  padding-bottom: 25px;\n}\n\n.p-w-xl {\n  padding-left: 25px;\n}\n\n.p-n-lg {\n  padding-top: 20px;\n}\n\n.p-e-lg {\n  padding-right: 20px;\n}\n\n.p-s-lg {\n  padding-bottom: 20px;\n}\n\n.p-w-lg {\n  padding-left: 20px;\n}\n\n.p-n-med {\n  padding-top: 15px;\n}\n\n.p-e-med {\n  padding-right: 15px;\n}\n\n.p-s-med {\n  padding-bottom: 15px;\n}\n\n.p-w-med {\n  padding-left: 15px;\n}\n\n.p-n-sm {\n  padding-top: 10px;\n}\n\n.p-e-sm {\n  padding-right: 10px;\n}\n\n.p-s-sm {\n  padding-bottom: 10px;\n}\n\n.p-w-sm {\n  padding-left: 10px;\n}\n\n.p-n-xs {\n  padding-top: 5px;\n}\n\n.p-e-xs {\n  padding-right: 5px;\n}\n\n.p-s-xs {\n  padding-bottom: 5px;\n}\n\n.p-w-xs {\n  padding-left: 5px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-n-xxs {\n  padding-top: 2px;\n}\n\n.p-e-xxs {\n  padding-right: 2px;\n}\n\n.p-s-xxs {\n  padding-bottom: 2px;\n}\n\n.p-w-xxs {\n  padding-left: 2px;\n}\n\n.p-xxs {\n  padding: 2px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-sm {\n  padding: 10px;\n}\n\n.p-med {\n  padding: 15px;\n}\n\n.p-lg {\n  padding: 20px;\n}\n\n.p-xl {\n  padding: 25px;\n}\n\n.m-xxs {\n  margin: 2px;\n}\n\n.m-xs {\n  margin: 5px;\n}\n\n.m-sm {\n  margin: 10px;\n}\n\n.m-med {\n  margin: 15px;\n}\n\n.m-lg {\n  margin: 20px;\n}\n\n.m-xl {\n  margin: 25px;\n}\n\n.ev-gutter-column {\n  cursor: col-resize;\n}\n\n.ev-gutter-row {\n  cursor: row-resize;\n}\n\n.ev-gutter:not(.ev-gutter-no-resize)::after {\n  display: block;\n  position: relative;\n  content: \"\";\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-column::after {\n  width: 8px;\n  height: 100%;\n  margin-left: -4px;\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-row::after {\n  width: 100%;\n  height: 8px;\n  margin-top: -4px;\n}\n\n/*# sourceMappingURL=EvLayout.vue.map */","<template>\n  <ev-layout-child :child=\"layout\">\n    <!-- @vuese-ignore -->\n    <slot v-for=\"(_, name) in $slots\" :slot=\"name\" :name=\"name\" />\n    <template v-for=\"(_, name) in $scopedSlots\" :slot=\"name\" slot-scope=\"slotData\">\n      <!-- @vuese-ignore -->\n      <slot :name=\"name\" v-bind=\"slotData\" />\n    </template>\n  </ev-layout-child>\n</template>\n\n<script>\nimport Split from '../vendor/split-grid';\nimport EvLayoutChild from './EvLayoutChild.vue';\n\nexport default {\n  name: 'EvLayout',\n\n  components: {\n    EvLayoutChild\n  },\n\n  props: {\n    // The top-level Pane\n    layout: {\n      type: Object,\n      required: true\n    }\n  },\n\n  async mounted() {\n    let rowGutters = [...this.$el.querySelectorAll('.ev-gutter-row')].map((gutter) => ({\n      track: Array.prototype.indexOf.call(gutter.parentNode.children, gutter),\n      element: gutter\n    }));\n\n    let columnGutters = [...this.$el.querySelectorAll('.ev-gutter-column')].map((gutter) => ({\n      track: Array.prototype.indexOf.call(gutter.parentNode.children, gutter),\n      element: gutter\n    }));\n\n    let columnMinSizes = [...this.$el.querySelectorAll('.ev-gutter-column')].reduce((acc, gutter) => {\n      let pane = gutter.previousElementSibling;\n      let minSize = parseInt(pane.dataset.minSize || 0);\n      let index = Array.prototype.indexOf.call(pane.parentNode.children, pane);\n      acc[index] = minSize;\n      return acc;\n    }, {});\n\n    let rowMinSizes = [...this.$el.querySelectorAll('.ev-gutter-row')].reduce((acc, gutter) => {\n      let pane = gutter.previousElementSibling;\n      let minSize = parseInt(pane.dataset.minSize || 0);\n      let index = Array.prototype.indexOf.call(pane.parentNode.children, pane);\n      acc[index] = minSize;\n      return acc;\n    }, {});\n\n    let onDragStart = (direction, track) => {\n      // Fired when any pane starts dragging\n      // @arg direction, track\n      this.$emit('dragStart', { direction, track });\n    };\n\n    let onDrag = (direction, track, gridTemplateStyle) => {\n      // Fired when any pane is dragging\n      // @arg direction, track, gridTemplateStyle\n      this.$emit('drag', { direction, track, gridTemplateStyle });\n    };\n\n    let onDragEnd = (direction, track) => {\n      // Fired when any pane ends dragging\n      // @arg direction, track\n      this.$emit('dragEnd', { direction, track });\n    };\n\n    Split({\n      columnGutters, rowGutters, columnMinSizes, rowMinSizes, onDragStart, onDrag, onDragEnd\n    });\n  }\n};\n</script>\n\n<style lang=\"scss\" scoped>\n@import '../style/reset.scss';\n@import '../style/utilities.scss';\n@import '../style/split-grid.scss';\n</style>\n"]}, media: undefined });

    };
    /* scoped */
    const __vue_scope_id__$2 = "data-v-0614cbd6";
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

  function install$1(Vue) {
    if (install$1.installed) return;
    install$1.installed = true;
    Vue.component('EvLayout', __vue_component__$2);
  }

  const plugin$1 = {
    install: install$1
  };

  let GlobalVue$1 = null;
  if (typeof window !== 'undefined') {
    GlobalVue$1 = window.Vue;
  } else if (typeof global !== 'undefined') {
    GlobalVue$1 = global.Vue;
  }
  if (GlobalVue$1) {
    GlobalVue$1.use(plugin$1);
  }

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

  var script$3 = {
    props: {
      // Array of objects with your data
      items: {
        type: Array,
        required: true
      },
      // Unique identifying field within each item object
      keyField: {
        type: String,
        default: 'id'
      },
      // The height of each item
      rowHeight: {
        type: Number,
        default: 18
      }
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
  const __vue_script__$3 = script$3;

  /* template */
  var __vue_render__$3 = function() {
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
  var __vue_staticRenderFns__$3 = [];
  __vue_render__$3._withStripped = true;

    /* style */
    const __vue_inject_styles__$3 = function (inject) {
      if (!inject) return
      inject("data-v-40765c35_0", { source: ".root[data-v-40765c35] {\n  min-height: 100%;\n}\n.viewport[data-v-40765c35] {\n  overflow-y: auto;\n}\n\n/*# sourceMappingURL=EvVirtualScroll.vue.map */", map: {"version":3,"sources":["/Users/john/Code/evwt/components/EvVirtualScroll.vue","EvVirtualScroll.vue"],"names":[],"mappings":"AAyIA;EACA,gBAAA;ACxIA;AD2IA;EACA,gBAAA;ACxIA;;AAEA,8CAA8C","file":"EvVirtualScroll.vue","sourcesContent":["<template>\n  <div ref=\"root\" class=\"root\" :style=\"rootStyle\">\n    <div ref=\"viewport\" class=\"viewport\" :style=\"viewportStyle\">\n      <div ref=\"spacer\" class=\"spacer\" :style=\"spacerStyle\">\n        <div v-for=\"item in visibleItems\" :key=\"item[keyField]\" :style=\"itemStyle\">\n          <!-- Slot for your item component. Slot scope of `item` available with item properties. -->\n          <slot :item=\"item\">\n            {{ item }}\n          </slot>\n        </div>\n      </div>\n    </div>\n  </div>\n</template>\n\n<script>\nexport default {\n  props: {\n    // Array of objects with your data\n    items: {\n      type: Array,\n      required: true\n    },\n    // Unique identifying field within each item object\n    keyField: {\n      type: String,\n      default: 'id'\n    },\n    // The height of each item\n    rowHeight: {\n      type: Number,\n      default: 18\n    }\n  },\n\n  data() {\n    return {\n      rootHeight: window.innerHeight,\n      scrollTop: 0,\n      nodePadding: 10\n    };\n  },\n\n  computed: {\n    viewportHeight() {\n      return this.itemCount * this.rowHeight;\n    },\n\n    startIndex() {\n      let startNode = Math.floor(this.scrollTop / this.rowHeight) - this.nodePadding;\n      startNode = Math.max(0, startNode);\n      return startNode;\n    },\n\n    visibleNodeCount() {\n      let count = Math.ceil(this.rootHeight / this.rowHeight) + 2 * this.nodePadding;\n      count = Math.min(this.itemCount - this.startIndex, count);\n      return count;\n    },\n\n    visibleItems() {\n      return this.items.slice(\n        this.startIndex,\n        this.startIndex + this.visibleNodeCount\n      );\n    },\n\n    itemCount() {\n      return this.items.length;\n    },\n\n    offsetY() {\n      return this.startIndex * this.rowHeight;\n    },\n\n    spacerStyle() {\n      return {\n        transform: `translateY(${this.offsetY}px)`\n      };\n    },\n\n    viewportStyle() {\n      return {\n        overflow: 'hidden',\n        height: `${this.viewportHeight}px`,\n        position: 'relative'\n      };\n    },\n\n    rootStyle() {\n      return {\n        height: `${this.rootHeight}px`,\n        overflow: 'auto'\n      };\n    },\n\n    itemStyle() {\n      return {\n        height: `${this.rowHeight}px`\n      };\n    }\n  },\n\n  mounted() {\n    this.$refs.root.addEventListener(\n      'scroll',\n      this.handleScroll,\n      { passive: true }\n    );\n\n    this.observeSize();\n  },\n\n  beforeDestroy() {\n    this.$refs.root.removeEventListener('scroll', this.handleScroll);\n  },\n\n  methods: {\n    handleScroll() {\n      this.scrollTop = this.$refs.root.scrollTop;\n    },\n\n    observeSize() {\n      let rootSizeObserver = new ResizeObserver(entries => {\n        for (let entry of entries) {\n          let { contentRect } = entry;\n          this.rootHeight = contentRect.height;\n        }\n      });\n\n      rootSizeObserver.observe(this.$refs.root.parentElement);\n    }\n  }\n};\n</script>\n\n<style lang=\"scss\" scoped>\n.root {\n  min-height: 100%;\n}\n\n.viewport {\n  overflow-y: auto;\n}\n</style>\n",".root {\n  min-height: 100%;\n}\n\n.viewport {\n  overflow-y: auto;\n}\n\n/*# sourceMappingURL=EvVirtualScroll.vue.map */"]}, media: undefined });

    };
    /* scoped */
    const __vue_scope_id__$3 = "data-v-40765c35";
    /* module identifier */
    const __vue_module_identifier__$3 = undefined;
    /* functional template */
    const __vue_is_functional_template__$3 = false;
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$3 = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__$3, staticRenderFns: __vue_staticRenderFns__$3 },
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

  function install$2(Vue) {
    if (install$2.installed) return;
    install$2.installed = true;
    Vue.component('EvVirtualScroll', __vue_component__$3);
  }

  const plugin$2 = {
    install: install$2
  };

  let GlobalVue$2 = null;
  if (typeof window !== 'undefined') {
    GlobalVue$2 = window.Vue;
  } else if (typeof global !== 'undefined') {
    GlobalVue$2 = global.Vue;
  }
  if (GlobalVue$2) {
    GlobalVue$2.use(plugin$2);
  }

  exports.EvDropZone = __vue_component__;
  exports.EvLayout = __vue_component__$2;
  exports.EvVirtualScroll = __vue_component__$3;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
