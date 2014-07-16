goog.provide('exp.entity.planet.Earth');
goog.require('exp.entity.Circle');
goog.require('exp.entity.planet.Balloon');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');

/**
 * Our home, the Earth.
 * @param {exp.chapter.Planet} chapter The parent chapter.
 * @constructor
 */
exp.entity.planet.Earth = function(chapter) {

  var circ = '<circle fill="#eeeeee" cx="100" cy="100" r="100"/>';

  var params = {
    'patterns' : [
      {
        'html': circ,
        'viewBox': '0 0 200 200'
      },
      exp.svgs.getSvg('planet-globe-4'),
      exp.svgs.getSvg('planet-globe-3'),
      exp.svgs.getSvg('planet-globe-2'),
      exp.svgs.getSvg('planet-globe-1'),
      exp.svgs.getSvg('planet-globe-4')
    ],
    'patternsRepeat': false,
    'useLighting': true,
    'foldable': true,
    'foldSpeed': 1,
    'direction': -1,
    'width': 300,
    'height': 300,
    'detailFactor': 1.5,
    'tags': exp.Tags.PLANET
  };

  this.chapter_ = chapter;

  this.foldAllowed_ = true;
  this.foldInProgress_ = false;

  this.flipSound_ = 0;
  this.flipSounds_ = ['planet/PageFlip_01',
                      'planet/PageFlip_02'];

  goog.base(this, params, 'earth');

  this.bindInputEvent('tap', this.nextView);
};
goog.inherits(exp.entity.planet.Earth, exp.entity.Circle);

/**
 * Trigger the next view of the Earth via a fold.
 */
exp.entity.planet.Earth.prototype.nextView = function() {

  if (this.foldInProgress_ || !this.foldAllowed_) {
    return;
  }

  this.foldInProgress_ = true;

  exp.soundManager.playSound(this.flipSounds_[this.flipSound_],
    null,
    {'pitchVariance': 0.3}
  );

    this.chapter_.onPageTurn();

  this.flipSound_++;
  if (this.flipSound_ >= this.flipSounds_.length) {
    this.flipSound_ = 0;
  }

  this.createSlice(true, 1);

  this.foldAllowed_ = false;
};

/**
 * Invoked when a slice has closed.
 * @override
 */
exp.entity.planet.Earth.prototype.sliceClosed = function(slice) {
  this.foldInProgress_ = false;

  var obj = this;
  setTimeout(function() {
    obj.foldAllowed_ = true;
  }, 1000);

  goog.base(this, 'sliceClosed', slice);
};
