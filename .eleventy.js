const yaml = require("js-yaml");

module.exports = function (eleventyConfig) {
  return {
    dir: {
      input: "src",
      output: "dist",
    },
    htmlTemplateEngine: "liquid",
  };
};
