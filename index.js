var swisseph = require ('swisseph');
var fs = require ('fs');
var plist = require('plist');

var getAngle = function(angle){
	angle += 1.75;
    angle = angle/ (360.0/384.0);
    if (angle>384.0) {
        angle = angle-384.0;
    }
    return Math.floor(angle);
}

var linesData = plist.parse(fs.readFileSync('./ephe/lines.plist', 'utf8'));



// Test date
var date = {year: 2015, month: 1, day: 1, hour: 0};
console.log ('Test date:', date);

var flag = swisseph.SEFLG_SPEED;

// path to ephemeris data
swisseph.swe_set_ephe_path (__dirname + './ephe');

// Julian day
swisseph.swe_julday (date.year, date.month, date.day, date.hour, swisseph.SE_GREG_CAL, function (julday_ut) {
    //assert.equal (julday_ut, 2455927.5);
    console.log ('Julian UT day for date:', julday_ut);

    // Sun position
    swisseph.swe_calc_ut (julday_ut, swisseph.SE_SUN, flag, function (body) {
        //assert (!body.error, body.error);
        var sunLng = body.longitude;

        // console.log ('Sun position:', body);

        // console.log('Sun Angle', getAngle(sunLng));

        // console.log('Line object: ', linesData[getAngle(sunLng)]);

        var lineObject = linesData[getAngle(sunLng)];
        var lineFromObject = lineObject.lines;
        console.log(lineFromObject);

        
    });
});