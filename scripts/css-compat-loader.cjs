const postcss = require("postcss");
const cascadeLayers = require("@csstools/postcss-cascade-layers");
const oklab = require("@csstools/postcss-oklab-function");
const colorMix = require("@csstools/postcss-color-mix-function");

const processor = postcss([
  cascadeLayers(),
  oklab({ preserve: false }),
  colorMix({ preserve: false }),
]);

module.exports = function cssCompatLoader(source) {
  const callback = this.async();
  processor
    .process(source, { from: this.resourcePath })
    .then((result) => callback(null, result.css))
    .catch((error) => callback(error));
};
