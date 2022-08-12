AFRAME.registerShader("draw", {
  schema: {
    /* For material */
    color: { type: "color" },
    fog: { default: true },

    /* For texuture */
    src: { default: null },
    fps: { type: "number", default: 60 },
    width: { default: 256 },
    height: { default: 256 },
  },

  /**
   * Initialize material. Called once.
   * @protected
   */
  init(data) {
    console.log("init", data);
    this.__cnv = document.createElement("canvas");
    this.__cnv.width = this.schema.width.default;
    this.__cnv.height = this.schema.height.default;
    this.__ctx = this.__cnv.getContext("2d");
    this.__texture = new THREE.Texture(this.__cnv);
    // this.__reset();
    this.material = new THREE.MeshBasicMaterial({ map: this.__texture });
    this.el.sceneEl.addBehavior(this);
    return this.material;
  },

  /**
   * Update or create material.
   * @param {object|null} oldData
   */
  update(oldData) {
    console.log("update", oldData);
    // this.__updateMaterial(oldData);
    // this.__updateTexture(oldData);
    return this.material;
  },

  /**
   * Called on each scene tick.
   * @protected
   */
  tick(t) {
    console.log("tick", t);
    // if (this.__fps <= 0 || !this.__nextTime) {
    //   return;
    // }

    // const now = Date.now();
    // if (now > this.__nextTime) {
    //   // this.__render();
    // }
  },
});
