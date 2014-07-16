
/**
 * Centralized storage of SVG assets.
 * @constructor
 */
exp.Svgs = function() {
  var obj = this;

  obj.sources_ = {};

  obj.svgCount_ = 0;
};

/**
 * Get SVG content with auto-generated unique id's.
 * @param {string} svgName The name of the SVG resource.
 * @return {object} An object containing the SVG source and viewBox data.
 */
exp.Svgs.prototype.getSvg = function(svgName) {
  var svgString = this.makeUniqueIds(this.sources_[svgName]['html']);

  var svg = {
    'html': svgString,
    'viewBox': this.sources_[svgName]['viewBox']
  };

  return svg;
};

/**
 * Create the HTML to define an SVG dynamically.
 * @param {number} width The width (in screen space) of the svg.
 * @param {number} height The height (in screen space) of the svg.
 * @param {string} viewBox The viewBox attribute.
 * @param {number} detailFactor The detail factor (based on screen space).
 * @param {string} content Optional content to include inside the svg.
 * @return {string} The SVG code.
 */
exp.Svgs.makeSVGContainer = function(width, height, viewBox,
                                    detailFactor, content) {
  var scaledWidth = width * detailFactor;
  var scaledHeight = height * detailFactor;

  var svg = '<svg respectAspectRatio="none" ' +
        'xmlns="http://www.w3.org/2000/svg" ' +
        'width="' + scaledWidth + 'px" ' +
        'height="' + scaledHeight + 'px" ' +
        'viewBox="' + viewBox + '">' + (content ? content : '') + '</svg>';

  return svg;
};

/**
 * Enforce uniqueness of all id's found within an SVG.
 * @param {string} source Some SVG source code.
 * @return {string} The source code with all id's replaced with unique values.
 */
exp.Svgs.prototype.makeUniqueIds = function(source) {
  var svgString = source + '';
  var matches = svgString.match(/id="([^"]*)"/g);

  if (!matches) {
    return svgString;
  }

  for (var i = 0; i < matches.length; i++) {
    if (matches[i].indexOf('__') !== 4) {
      this.svgCount_++;
      name = matches[i].substring(4, matches[i].length - 1);

      var regexName = new RegExp(matches[i], 'g');
      var regexUrl = new RegExp('url\\(#' + name + '\\)', 'g');
      var regexId = new RegExp('"#' + name + '"', 'g');

      svgString = svgString.replace(regexName,
                                    'id="exp-svg-' + this.svgCount_ + '"');
      svgString = svgString.replace(regexUrl,
                                    'url(#exp-svg-' + this.svgCount_ + ')');
      svgString = svgString.replace(regexId,
                                    '"#exp-svg-' + this.svgCount_ + '"');
    }
  }

  return svgString;
};
