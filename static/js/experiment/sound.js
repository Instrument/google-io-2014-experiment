goog.provide('exp.SoundManager');

/**
 * Manage interactions with audio listening and emitting.
 * @constructor
 * @param {string} prefix The audio file path prefix.
 * @param {string} suffix The audio file path suffix.
 */
exp.SoundManager = function(prefix, suffix) {
  this.prefix_ = prefix;
  this.suffix_ = suffix;
  this.audioConstructor_ = this.getAudioContextConstructor();
  this.supportsWebAudio = !!this.audioConstructor_;
  this.unloadedSounds_ = {};

  this.supportsAudioAnalysis = false;

  this.enabled = true;

  if (this.supportsWebAudio) {
    this.audioContext_ = new this.audioConstructor_();

    if (this.audioContext_['createGain']) {
      this.masterGain_ = this.audioContext_['createGain']();
    } else {
      this.masterGain_ = this.audioContext_['createGainNode']();
    }

    this.masterGain_.connect(this.audioContext_.destination);
  }
};

/**
 * Set the master audio volume.
 * @param {number} newVolume The new volume.
 * @param {boolean=false} animate If the transition should animate.
 */
exp.SoundManager.prototype.setVolume = function(newVolume, animate) {
  if (!this.enabled || !this.masterGain_) {
    return;
  }

  if (animate) {
    TweenLite.to(this.masterGain_.gain, 1.0, {
      value: newVolume,
      'ease': Linear['easeNone']
    });
  } else {
    if ('undefined' !== typeof this.masterGain_.gain) {
      this.masterGain_.gain.value = newVolume;
    }
  }
};

/**
 * The current volume.
 * @return {number} Volume.
 */
exp.SoundManager.prototype.getVolume = function() {
  if ('undefined' !== typeof this.masterGain_.gain) {
    return this.masterGain_.gain.value;
  } else {
    return 1;
  }
};

/**
 * Enable sound.
 */
exp.SoundManager.prototype.enable = function() {
  if (this.enabled === false) {
    this.enabled = true;
    this.setVolume(1);
  }
};

/**
 * Disable sound.
 */
exp.SoundManager.prototype.disable = function() {
  if (this.enabled === true) {
    this.setVolume(0);
    this.enabled = false;
  }
};

/**
 * Request access to the user's microphone.
 */
exp.SoundManager.prototype.requestUserMedia = function() {
  if (this.supportsWebAudio) {
    var self = this;
    this.getUserMedia_(function(stream) {
      self.maxVolume = 10;
      self.averageVolume = 2;
      self.smoothedVolume = 2;
      self.supportsAudioAnalysis = true;
      self.startStreamListener_(stream);
    });
  }
};

/**
 * Attempt to get access to autio input.
 * @param {function} onSuccess Callback to invoke upon success.
 * @private
 */
exp.SoundManager.prototype.getUserMedia_ = function(onSuccess) {
  try {
    window['navigator']['getUserMedia'] =
      window['navigator']['getUserMedia'] ||
      window['navigator']['webkitGetUserMedia'] ||
      window['navigator']['mozGetUserMedia'];
    window['navigator']['getUserMedia']({ 'audio': true }, onSuccess);
  } catch (e) {
    // catch
  }
};

/**
 * Start monitoring an audio stream.
 * @param {MediaStream} stream An audio stream to be monitored.
 * @private
 */
exp.SoundManager.prototype.startStreamListener_ = function(stream) {
  var audioContext = new this.audioConstructor_();

  // Create an AudioNode from the stream.
  var mediaStreamSource = audioContext['createMediaStreamSource'](stream);

  var analyser = audioContext.createAnalyser();
  analyser.smoothingTimeConstant = 0.3;
  analyser.fftSize = 512;
  mediaStreamSource.connect(analyser);

  var javascriptNode = audioContext.createJavaScriptNode(512, 1, 1);
  javascriptNode.connect(audioContext.destination);

  var self = this;
  self.smoothedVolume = 0;

  javascriptNode.onaudioprocess = function() {
    var array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    var max = self.getMaximum_(array);

    // TODO: make peak detection better
    if (max / self.maxVolume > 1.35) {
      if ('function' === typeof self.peakDetectionCallback_) {
        self.peakDetectionCallback_();
      }
    }

    self.maxVolume = Math.max(self.maxVolume, max);
    self.maxVolume *= 0.965;

    self.averageVolume = self.getAverageVolume_(array);
    self.smoothedVolume += (self.averageVolume - self.smoothedVolume) * 0.15;
    self.smoothedVolume = Math.max(0, Math.min(1, self.smoothedVolume));
  };

  // keep a reference to the script node so it doesn't get garbage collected.
  self.audioProcessor_ = javascriptNode;
};

/**
 * Get the maximum value from an array of values.
 * @param {array} arr An array of audio samples.
 * @return {number} The largest value in the array.
 * @private
 */
exp.SoundManager.prototype.getMaximum_ = function(arr) {
  var length = arr.length;
  var max = 0.01;
  for (var i = 0; i < length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
};

/**
 * Set a callback function to be invoked when a peak occurs in the audio.
 * @param {function} callback The callback to be invoked.
 */
exp.SoundManager.prototype.setPeakDetectionCallback = function(callback) {
  this.peakDetectionCallback_ = callback;
};

/**
 * Normalize an audio sample given the current max values.
 * @param {number} value An audio sample value.
 * @return {number} The normalized value.
 * @private
 */
exp.SoundManager.prototype.normalize_ = function(value) {
  return Math.max(0, Math.min(1, value / this.maxVolume));
};

/**
 * Compute the average volume for a set of samples.
 * @param {array} arr An array of audio samples.
 * @return {number} The average value.
 * @private
 */
exp.SoundManager.prototype.getAverageVolume_ = function(arr) {
  var values = 0;
  var average;

  var length = arr.length;

  // get all the frequency amplitudes
  for (var i = 0; i < length; i++) {
    values += arr[i];
  }

  average = values / length;
  return this.normalize_(average);
};

/**
 * Get the prefixed audio constructor.
 * @return {Function} The constructor.
 */
exp.SoundManager.prototype.getAudioContextConstructor = function() {
  if ('undefined' !== typeof AudioContext) {
    return AudioContext;
  } else if ('undefined' !== typeof webkitAudioContext) {
    return webkitAudioContext;
  } else {
    return null;
  }
};

/**
 * Convert a name to a full path.
 * @private
 * @param {string} name The short name.
 * @return {string}
 */
exp.SoundManager.prototype.nameToFilename_ = function(name) {
  return this.prefix_ + name + this.suffix_;
};

/**
 * Load the sounds, trigger ready when complete.
 * @param {Function} onComplete After sounds are loaded.
 */
exp.SoundManager.prototype.loadSounds = function(onComplete) {
  if (!this.supportsWebAudio) {
    onComplete();
    return;
  }

  var self = this;
  var needingLoad = 0;
  var timeoutLength = 10000;
  var isComplete = false;

  for (var filename in this.unloadedSounds_) {
    if (this.unloadedSounds_.hasOwnProperty(filename)) {
      needingLoad++;
    }
  }

  if (needingLoad <= 0) {
    onComplete();
    return;
  }

  for (var url in this.unloadedSounds_) {
    if (this.unloadedSounds_.hasOwnProperty(url)) {
      (function(url) {
        self.fetchSoundBufferFromURL_(url, function() {
          needingLoad--;
          delete self.unloadedSounds_[url];

          if (needingLoad === 0) {
            if (!isComplete) {
              onComplete();
            }
            isComplete = true;
          }
        });
      })(url);
    }
  }

  setTimeout(function() {
    isComplete = true;
    onComplete();
  }, timeoutLength);
};

/**
 * Whether the sounds are ready.
 * @private
 * @return {boolean}
 */
exp.SoundManager.prototype.soundsReady_ = function() {
  return this.supportsWebAudio && !this.unloadedSounds_.length;
};

/**
 * Get a preloaded sound buffer (binary audio file).
 * @private
 * @param {String} url Audio file URL.
 * @return {AudioBuffer} Buffer representing sound.
 */
exp.SoundManager.prototype.getLoadedSoundBufferFromURL_ = function(url) {
  this.soundBuffersFromURL_ = this.soundBuffersFromURL_ || {};

  if (this.soundBuffersFromURL_[url]) {
    return this.soundBuffersFromURL_[url];
  }
};

/**
 * Load a sound buffer (binary audio file).
 * @private
 * @param {String} url Audio file URL.
 * @param {Function} gotSound On-load callback.
 */
exp.SoundManager.prototype.fetchSoundBufferFromURL_ = function(url, gotSound) {
  this.soundBuffersFromURL_ = this.soundBuffersFromURL_ || {};
  gotSound = gotSound || function() {};

  if (this.soundBuffersFromURL_[url]) {
    gotSound(this.soundBuffersFromURL_[url]);
    return;
  }

  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  var self = this;
  request.onload = function() {
    var audioContext = self.getAudioContext_();
    audioContext.decodeAudioData(request.response, function(buffer) {
      self.soundBuffersFromURL_[url] = buffer;
      gotSound(self.soundBuffersFromURL_[url]);
    }, function() {self.wantsAudio_ = false; gotSound();});
  };

  request.send();
};

/**
 * Get an audio context.
 * @private
 * @return {AudioContext} The shared audio context.
 */
exp.SoundManager.prototype.getAudioContext_ = function() {
  return this.audioContext_;
};

/**
 * Cache a sound file.
 * @param {string} name Audio name.
 */
exp.SoundManager.prototype.preloadSound = function(name) {
  this.unloadedSounds_ = this.unloadedSounds_ || {};
  var filename = this.nameToFilename_(name);
  this.unloadedSounds_[filename] = true;
};

/**
 * Play a sound by url.
 * @param {String} name Audio name.
 * @param {Function} onPlay Callback on play.
 * @param {object} params Params for augmenting sound playback.
 * @return {object} Get the buffer for sound
 */
exp.SoundManager.prototype.playSound = function(name, onPlay, params) {
  var filename = this.nameToFilename_(name);

  if (typeof params === 'undefined') {
    params = {};
  }
  if (!this.supportsWebAudio) { return; }

  if (!this.soundsReady_()) { return; }

  var audioContext = this.getAudioContext_();

  var buffer = this.getLoadedSoundBufferFromURL_(filename);
  if (!buffer) { return; }

  var source = audioContext.createBufferSource();

  var gain;
  if (audioContext['createGain']) {
    gain = audioContext['createGain']();
  } else {
    gain = audioContext['createGainNode']();
  }

  var pitch = params['pitch'] || 1;

  if ('undefined' !== typeof gain.gain) {
    gain.gain.value = params['gain'] || 1;
  }

  source.buffer = buffer;

  if (typeof params['loop'] !== 'undefined') {
    source.loop = params['loop'];
    // set the loop points in from the edges a little (avoids gaps in looping)
    if (params['loop']) {
      source.loopStart = 0.05;
      source.loopEnd = source.buffer.duration - 0.05;
    }
  }

  source.connect(gain);
  gain.connect(this.masterGain_);
  if (params['pitchVariance']) {
    var randomPitch = THREE.Math.randFloat(
      pitch - params['pitchVariance'] / 2,
      pitch + params['pitchVariance'] / 2);

    // constrain to reasonable values.
    randomPitch = THREE.Math.clamp(randomPitch, 0.1, 3);
    source.playbackRate.value = randomPitch;
  } else {
    source.playbackRate.value = pitch;
  }

  source.start(0, params['offset'] || 0);

  if ('function' === typeof onPlay) {
    onPlay(source);
  }

  return source;
};

/**
 * Given a source, cancel the sound being played.
 * @param {AreateBufferSource} source The source to cancel.
 */
exp.SoundManager.prototype.cancelSound = function(source) {
  try {
    source.stop(0);
  } catch (e) {

  }
};
