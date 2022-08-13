exports.fps = {
  schema: {
    fps: { type: "number", default: 0 },
  },

  _fps: null,
  _nextTick: null,

  _setFps(schema) {
    this._fps = schema.fps;
    this._nextTick = 0;
  },

  _setNextTick() {
    if (this._fps > 0) {
      this._nextTick = Date.now() + 1000 / this._fps;
    }
  },

  _fpsTick(callback) {
    if (!callback || this._isFpsPaused()) {
      return;
    } else if (this._fps <= 0) {
      callback();
    } else {
      if (Date.now() > this._nextTick) {
        this._setNextTick();
        callback();
      }
    }
  },

  _pauseFpsTick() {
    this._nextTick = null;
  },

  _resumeFpsTick() {
    this._nextTick = 0;
  },

  _isFpsPaused() {
    return typeof this._nextTick !== "number";
  },
};
