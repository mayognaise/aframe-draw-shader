/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * A shader to draw canvas for A-Frame VR.
	 */

	if (typeof AFRAME === 'undefined') {
	  throw 'Component attempted to register before AFRAME was available.';
	}

	/* get util from AFRAME */
	var debug = AFRAME.utils.debug;
	// debug.enable('shader:draw:*')

	debug.enable('shader:draw:warn');
	var warn = debug('shader:draw:warn');
	var log = debug('shader:draw:debug');

	AFRAME.registerShader('draw', {

	  /**
	   * For material component:
	   * @see https://github.com/aframevr/aframe/blob/60d198ef8e2bfbc57a13511ae5fca7b62e01691b/src/components/material.js
	   * For example of `registerShader`:
	   * @see https://github.com/aframevr/aframe/blob/41a50cd5ac65e462120ecc2e5091f5daefe3bd1e/src/shaders/flat.js
	   * For MeshBasicMaterial
	   * @see http://threejs.org/docs/#Reference/Materials/MeshBasicMaterial
	   */

	  schema: {

	    /* For material */
	    color: { type: 'color' },
	    fog: { default: true },

	    /* For texuture */
	    src: { default: null },
	    fps: { type: 'number', default: 60 },
	    width: { default: 256 },
	    height: { default: 256 }

	  },

	  /**
	   * Initialize material. Called once.
	   * @protected
	   */
	  init: function init(data) {
	    log('init', data);
	    this.__cnv = document.createElement('canvas');
	    this.__cnv.width = this.schema.width.default;
	    this.__cnv.height = this.schema.height.default;
	    this.__ctx = this.__cnv.getContext('2d');
	    this.__texture = new THREE.Texture(this.__cnv);
	    this.__reset();
	    this.material = new THREE.MeshBasicMaterial({ map: this.__texture });
	    this.el.sceneEl.addBehavior(this);
	    return this.material;
	  },


	  /**
	   * Update or create material.
	   * @param {object|null} oldData
	   */
	  update: function update(oldData) {
	    log('update', oldData);
	    this.__updateMaterial(oldData);
	    this.__updateTexture(oldData);
	    return this.material;
	  },


	  /**
	   * Called on each scene tick.
	   * @protected
	   */
	  tick: function tick(t) {

	    if (this.__fps <= 0 || !this.__nextTime) {
	      return;
	    }

	    var now = Date.now();
	    if (now > this.__nextTime) {
	      this.__render();
	    }
	  },


	  /*================================
	  =            material            =
	  ================================*/

	  /**
	   * Updating existing material.
	   * @param {object} data - Material component data.
	   */
	  __updateMaterial: function __updateMaterial(data) {
	    var material = this.material;

	    var newData = this.__getMaterialData(data);
	    Object.keys(newData).forEach(function (key) {
	      material[key] = newData[key];
	    });
	  },


	  /**
	   * Builds and normalize material data, normalizing stuff along the way.
	   * @param {Object} data - Material data.
	   * @return {Object} data - Processed material data.
	   */
	  __getMaterialData: function __getMaterialData(data) {
	    return {
	      fog: data.fog,
	      color: new THREE.Color(data.color)
	    };
	  },


	  /*==============================
	  =            texure            =
	  ==============================*/

	  /**
	   * Update or create texure.
	   * @param {Object} data - Material component data.
	   */
	  __updateTexture: function __updateTexture(data) {

	    this.__cnv.width = data.width ? THREE.Math.nearestPowerOfTwo(data.width) : this.schema.width.default;
	    this.__cnv.height = data.height ? THREE.Math.nearestPowerOfTwo(data.height) : this.schema.height.default;

	    /* fps */
	    if (typeof data.fps === 'undefined') {
	      this.__fps = this.schema.fps.default;
	    } else if (data.fps && data.fps > 0) {
	      this.__fps = data.fps;
	    } else {
	      this.__fps = 0;
	    }

	    if (this.__fps > 0) {
	      this.__render();
	    } else {
	      this.__nextTime = null;
	    }
	  },


	  /*================================
	  =            playback            =
	  ================================*/

	  /**
	   * Pause video
	   * @public
	   */
	  pause: function pause() {
	    log('pause');
	    this.__nextTime = null;
	  },


	  /**
	   * Play video
	   * @public
	   */
	  play: function play() {
	    log('play');
	    if (this.__nextTime) {
	      return;
	    }
	    this.__render();
	  },


	  /**
	   * Toggle playback. play if paused and pause if played.
	   * @public
	   */

	  togglePlayback: function togglePlayback() {
	    if (this.paused()) {
	      this.play();
	    } else {
	      this.pause();
	    }
	  },


	  /**
	   * Return if the playback is paused.
	   * @public
	   * @return {boolean}
	   */
	  paused: function paused() {
	    return !(this.__fps > 0);
	  },


	  /*==============================
	   =            canvas            =
	   ==============================*/

	  /**
	   * clear canvas
	   * @private
	   */
	  __clearCanvas: function __clearCanvas() {
	    if (!this.__ctx || !this.__texture) {
	      return;
	    }
	    this.__ctx.clearRect(0, 0, this.__width, this.__height);
	    this.__texture.needsUpdate = true;
	  },


	  /**
	   * render
	   * @private
	   */
	  __render: function __render() {
	    var _this = this;

	    log('render');
	    this.__nextTime = null;

	    /* emit */
	    this.el.emit('draw-render', {
	      ctx: this.__ctx,
	      texture: this.__texture
	    });

	    requestAnimationFrame(function () {
	      if (!_this.__texture) {
	        return;
	      }

	      /* texture upate */
	      _this.__texture.needsUpdate = true;

	      /* setup next tick */
	      _this.__setNextTick();
	    });
	  },


	  /**
	   * get next time to draw
	   * @private
	   */
	  __setNextTick: function __setNextTick() {
	    if (this.__fps > 0) {
	      this.__nextTime = Date.now() + 1000 / this.__fps;
	    }
	  },


	  /*=============================
	  =            reset            =
	  =============================*/

	  /**
	   * @private
	   */

	  __reset: function __reset() {
	    this.pause();
	    this.__clearCanvas();
	  }
	});

/***/ }
/******/ ]);