exports.material = {
  schema: {
    color: { type: "color" },
    fog: { default: true },
  },

  _setMaterial(map) {
    if (!map) {
      throw "Texuture is not set";
    }

    this.material = new THREE.MeshBasicMaterial({ map });
    this.el.sceneEl.addBehavior(this);
  },

  /**
   * Updating existing material.
   * @param {object} schema - Material component schema.
   */
  _updateMaterial(schema) {
    const { material } = this;
    const newData = this._getMaterialData(schema);
    Object.keys(newData).forEach((key) => {
      material[key] = newData[key];
    });
  },

  /**
   * Builds and normalize material schema, normalizing stuff along the way.
   * @param {Object} schema - Material schema.
   * @return {Object} schema - Processed material schema.
   */
  _getMaterialData(schema) {
    return {
      fog: schema.fog,
      color: new THREE.Color(schema.color),
    };
  },
};
