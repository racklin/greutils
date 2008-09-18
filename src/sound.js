/**
 * This is a set of utility functions for playing sounds through XPCOM.
 *
 * @public
 * @name GREUtils.Sound
 * @namespace GREUtils.Sound
 */
GREUtils.define('GREUtils.Sound');


/**
 * Returns the XPCOM service that implements the nsISound interface.
 *
 * @public
 * @static
 * @function
 * @return {nsISound}                     The nsISound service
 */
GREUtils.Sound.getSoundService = function() {
    return GREUtils.XPCOM.getUsefulService("sound");
};


/**
 * Plays the sound file located at the given URL.
 *
 * @public
 * @static
 * @function
 * @param {String} sURL                   This is the URL pointing to the location of the sound file
 */
GREUtils.Sound.play = function(sURL) {
    mURL = GREUtils.File.getURL(sURL);
    var snd = GREUtils.Sound.getSoundService();
    snd.init();
    return snd.play(mURL);
};


/**
 * Generates the system beep sound.
 *
 * @public
 * @static
 * @function
 */
GREUtils.Sound.beep = function() {
    return GREUtils.Sound.getSoundService().beep();
};


/**
 * Plays the specified system sound.
 *
 * @public
 * @static
 * @function
 * @param {String} sURL                   This is the system sound identifier.
 */
GREUtils.Sound.playSystemSound = function(sURL) {
    mURL = GREUtils.File.getURL(sURL);
    var snd = this.getSoundService();
    snd.init();
    return snd.playSystemSound(mURL);
};
