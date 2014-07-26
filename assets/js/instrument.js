(function(window, jQuery, undefined) {
  var Instrument = function() {
    this.$container = $('#grid');
    this.$cells = this.$container.find('.cell');

    this.setup();
    this.sounds = [];
  };

  Instrument.prototype = {

    /**
     * An integer indicating the lowest note number that should be play
     * @type {Number}
     */
    NOTE_LOWER_BOUND: -21,

    /**
     * An integer indication the highest note number that should be play
     * @type {Number}
     */
    NOTE_UPPER_BOUND: 27,

    /**
     * An array of all the possible RandomColor hues
     * @type {Array}
     */
    COLORS: ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'],

    /**
     * The class to assign cells that are playing.
     * @type {String}
     */
    PLAYING_CLASS: 'playing',

    /**
     * The default length of the tone in number of samples
     * @type {Number}
     */
    TONE_LENGTH: 441000,

    /**
     * The default sample rate in Hz
     * @type {Number}
     */
    SAMPLE_RATE: 44100,

    /**
     * The default number of channels
     * @type {Number}
     */
    NUM_CHANNELS: 1,

    /**
     * The default number of bits per sample
     * @type {Number}
     */
    BITS_PER_SAMPLE: 8,

    /**
     * Get things going by adding a some style declarations and 
     * setting up our mouse events.
     **/
    setup: function() {
      this.colorize();
      this.generateTones();
      $(document).on('keydown touchstart mousedown', $.proxy(this.play, this));
      $(document).on('keyup touchend mouseup', $.proxy(this.stop, this));
      // seconds length is numsamples/sampling rate
    },

    /**
     * Generate and assign random colors to cells.
     */
    colorize: function() {
      var colors = randomColor({
        hue: this.COLORS[Math.floor(Math.random() * this.COLORS.length)],
        count: this.$cells.length
      });

      this.$cells.each(function(index) {
        this.style.backgroundColor = colors[index];
      });
    },

    /**
     * Generate all the tones and assign them to each cell.
     */
    generateTones: function() {
      var self = this;

      this.tones = {};

      this.$cells.each(function(index) {
        var $cell = $(this),
          audio = self.generateTone();

        audio.$cell = $cell;
        self.tones[$cell.text()] = audio;
      });
    },

    /**
     * Generate a tone, which is a sawtooth wave.
     * @return {Audio} A playable Audio object
     */
    generateTone: function() {
      var samples = [],
        sampleRate = this.SAMPLE_RATE,
        frequency = this.getRandomFrequency(),
        period = sampleRate / frequency,
        numChannels = this.NUM_CHANNELS,
        wave = new RIFFWAVE(),
        audio = new Audio(),
        i = 0;

      wave.header.sampleRate = sampleRate;
      wave.header.bitsPerSample = this.BITS_PER_SAMPLE;

      while(i < this.TONE_LENGTH) {
        // 127 is amplitude
        samples[i++] = Math.round(127 * (i/numChannels % period) / (period + 1));
      }

      wave.Make(samples);

      audio.src = wave.dataURI;

      return audio;
    },

    /**
     * Returns a random musical note frequency.
     * @return {Number} A musicical note frequency
     */
    getRandomFrequency: function() {
      var interval = this.NOTE_UPPER_BOUND - this.NOTE_LOWER_BOUND,
        n = Math.floor(Math.random() * interval) + this.NOTE_LOWER_BOUND;

      return 440 * Math.pow(2, n/12);
    },

    /**
     * Play the tone assigned to the pressed key.
     * @param  {jQuery.Event} event The triggering event
     */
    play: function( event ) {
      var key, x, y, cell, audio;

      if(event.which <= 3) {
        x = event.pageX || event.originalEvent.touches[0].pageX || event.originalEvent.changedTouches[0].pageX;
        y = event.pageY || event.originalEvent.touches[0].pageY || event.originalEvent.changedTouches[0].pageY;
        cell = document.elementFromPoint(x, y);
        key = cell.innerHTML;
      } else {
        key = String.fromCharCode(event.which);
      }

      audio = this.tones[key];

      if(audio) {
        audio.$cell.addClass(this.PLAYING_CLASS);
        audio.play();
      }
    },

    /**
     * Stop play of the audio assigned to the pressed key
     * @param  {jQuery.Event} event The triggering event
     */
    stop: function( event ) {
      var key, x, y, cell, audio;

      if(event.which <= 3 ) {
        x = event.pageX || event.originalEvent.touches[0].pageX || event.originalEvent.changedTouches[0].pageX;
        y = event.pageY || event.originalEvent.touches[0].pageY || event.originalEvent.changedTouches[0].pageY;
        cell = document.elementFromPoint(x, y);
        key = cell.innerHTML;
      } else {
        key = String.fromCharCode(event.which);
      }

      audio = this.tones[key];

      if(audio) {
        audio.$cell.removeClass(this.PLAYING_CLASS);
        audio.currentTime = 0;
        audio.pause();
      }

    }

  };

  window.Instrument = Instrument;
}(window, jQuery));