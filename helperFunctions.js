'use strict';

let _ = require('lodash');

let internals = [];

/**
 * Get angle from sun's longitude
 * @param sunLng
 * @returns {number}
 */
internals.getAngle = function(sunLng){
    sunLng += 1.75;
    let angle = sunLng / (360.0/384.0);
    if (angle>384.0) {
        angle = angle-384.0;
    }
    return Math.floor(angle);
};
/** End */

module.exports = internals;
