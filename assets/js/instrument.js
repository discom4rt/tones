(function(window, document, $, undefined) {

  var Instrument = function() {
    this.$container = $('#grid');
    this.$cells = this.$container.find('.cell');

    this.setup();
  };

  Instrument.prototype = {

    /**
     * An integer indicating the lowest note number that should be played
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
     * The default length of the tone in number of samples.
     * This is equivalent to 10 seconds (num_samples/sample_rate).
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
     * The frequency of the general tuning standard for musical pitch
     * @type {Number}
     */
    A440: 440,

    /**
     * Get things going by adding a some style declarations and
     * setting up our mouse events.
     **/
    setup: function() {
      this.colorize();
      this.generateTones();
      $(document).on('keydown touchstart mousedown', $.proxy(this.play, this));
      $(document).on('keyup touchend mouseup', $.proxy(this.stop, this));
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
     * @see http://michaelkrzyzaniak.com/AudioSynthesis/2_Audio_Synthesis/1_Basic_Waveforms/
     * @return {Audio} A playable Audio object
     */
    generateTone: function() {
      var samples = [],
        frequency = this.getRandomFrequency(),
        period = this.SAMPLE_RATE / frequency,
        wave = new WaveFile(),
        i = 0;

      wave.setFormat(this.SAMPLE_RATE, this.BITS_PER_SAMPLE, this.NUM_CHANNELS);

      while(i < this.TONE_LENGTH) {
        samples[i++] = Math.round(wave.sampleRange * (i/this.NUM_CHANNELS % period) / (period + 1));
      }

      wave.data = samples;

      return wave.generateAudioTag();
    },

    /**
     * Returns a random musical note frequency.
     * @return {Number} A musicical note frequency in Hz
     */
    getRandomFrequency: function() {
      var interval = this.NOTE_UPPER_BOUND - this.NOTE_LOWER_BOUND,
        n,
        i;

      // create a randomized pool to prevent
      // duplicate notes
      if(!this.pool) {
        this.pool = [];

        // populate the pool
        for (i = 0; i <= interval; i++) {
          this.pool[i] = i;
        }

        // randomize the pool
        this.pool.sort(function () {
            return Math.random() - 0.5;
        });
      }

      n = this.pool.pop() + this.NOTE_LOWER_BOUND;

      return this.A440 * Math.pow(2, n/12);
    },

    /**
     * Get the x and y coordinates of the given event
     * @param  {jQuery.Event} event The triggering event
     * @return {Object} Coordinates of the event
     */
    getEventPoint: function( event ) {
      var touch = (event.originalEvent.touches || event.originalEvent.changedTouches) &&
        (event.originalEvent.touches[0] || event.originalEvent.changedTouches[0]);
      x = event.pageX || touch.pageX;
      y = event.pageY || touch.pageY;

      return { x: x, y: y }
    },

    /**
     * Play the tone assigned to the pressed key.
     * @param  {jQuery.Event} event The triggering event
     */
    play: function( event ) {
      var key, x, y, cell, audio;

      event.preventDefault();

      if(event.which <= 3) {
        var point = this.getEventPoint(event)
        cell = document.elementFromPoint(point.x, point.y);
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

      event.preventDefault();

      if(event.which <= 3 ) {
        var point = this.getEventPoint(event)
        cell = document.elementFromPoint(point.x, point.y);
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

}(window, document, jQuery));