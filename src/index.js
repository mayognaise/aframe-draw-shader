const { canvas } = require("../utils/canvas");
const { fps } = require("../utils/fps");
const { material } = require("../utils/material");

if (typeof AFRAME === "undefined") {
  throw "Component attempted to register before AFRAME was available.";
}

AFRAME.registerShader("draw", {
  ...canvas,
  ...fps,
  ...material,

  schema: {
    ...canvas.schema,
    ...fps.schema,
    ...material.schema,
  },

  /**
   * Pause drawing.
   * @public
   */
  pause() {
    this._pauseFpsTick();
  },

  /**
   * Play drawing.
   * @public
   */
  play() {
    if (!this.paused()) return;
    this._resumeFpsTick();
  },

  /**
   * Toggle playback. play if paused and pause if played.
   * @public
   */
  togglePlayback() {
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
  paused() {
    return this._isFpsPaused();
  },

  /**
   * Initialize material. Called once.
   * @protected
   * @returns THREE.MeshBasicMaterial
   */
  init(schema) {
    this._setFps(schema);
    const map = this._setCanvas(schema);
    this._setMaterial(map);

    if (!this.material) {
      throw "Material is not set";
    }

    return this.material;
  },

  /**
   * Update or create material.
   * @protected
   * @param {object|null} schema Old schema
   * @returns THREE.MeshBasicMaterial
   */
  update(schema) {
    this._updateMaterial(schema);
    this._updateTexture(schema);
    this._setFps(schema);
    return this.material;
  },

  /**
   * Called on each scene tick.
   * @protected
   */
  tick() {
    const canvas = this._canvas;
    const ctx = this._context;
    const texture = this._texture;
    if (!canvas || !ctx || !texture) return;
    const emit = () => {
      this.el.emit("draw-render", { canvas, ctx, texture });
      texture.needsUpdate = true;
    };
    this._fpsTick(emit);
  },
});
