'use strict';

const fs = require ('fs');
const Hapi = require('hapi');
const Joi = require ('joi');
const Plist = require('plist');
const Swisseph = require ('swisseph');
const Helper = require ('./helperFunctions');

let linesData = Plist.parse(fs.readFileSync('./ephe/lines.plist', 'utf8'));
let incarnationThemes = Plist.parse(fs.readFileSync('./ephe/IncarnationThemes.plist', 'utf8'));
let flag = Swisseph.SEFLG_SPEED;
let port = Number(process.env.PORT || 3000);

// path to ephemeris data
Swisseph.swe_set_ephe_path (__dirname + './ephe');

// Create a server with a host and port
const server = new Hapi.Server();

server.connection({    
    port: port
});

server.route({
    method: 'GET',
    path: '/',
    handler: function(req, rep){
        rep({
            status: "okay"
        });
    }
})


server.route({
    method: 'GET',
    path: '/get-lines',
    config: {
        validate: {
            query: {
                year: Joi.number().required(),
                month: Joi.number().required(),
                day: Joi.number().required(),
                hour: Joi.number().required()
            }
        }
    },
    handler: function(request, reply){

        let date = {
            year: request.query.year,
            month: request.query.month,
            day: request.query.day,
            hour: request.query.hour,
        }

        // Julian day
        Swisseph.swe_julday (date.year, date.month, date.day, date.hour,
            Swisseph.SE_GREG_CAL, function (julday_ut) {
            console.log ('Julian UT day for date:', julday_ut);

            // Sun position
                Swisseph.swe_calc_ut (julday_ut, Swisseph.SE_SUN, flag, function (body) {
                    let sunLng = body.longitude;
                    let angle = Helper.getAngle(sunLng);
                    let lineObject = linesData[angle];
                    let lineFromObject = lineObject.lines;
                    let sunGate = (lineFromObject + "").split(".")[0];
                    let sunLine = (lineFromObject + "").split(".")[1];
                    --sunGate;

                    let adder = 0; //personal Incarnation

                    if (sunLine == 4 ) {
                        adder = 1; //Fixed Incarnation
                    }
                    else if (sunLine > 4)
                    {
                        adder = 2;//Interpersonal Incarnation
                    }
                    let idxIncarnationTheme = ((sunGate*3)+adder);
                    let incarnationString = incarnationThemes[idxIncarnationTheme]["Name Of Theme"];
                    let incarnationColour = incarnationThemes[idxIncarnationTheme]['Colour'];


                    let response = {};

                    response['date'] = date;
                    response['julian_ut_day'] = julday_ut;
                    response['line'] = lineObject;
                    response['sunGate'] = sunGate;
                    response['sunLine'] = sunLine;
                    response['incarnationThemeIndex'] = idxIncarnationTheme;
                    response['incarnationString'] = incarnationString;
                    response['incarnationColour'] = incarnationColour;

                    return reply(response).code(200);

            });
        });

    }
});


// Start the server
server.start((err) => {

    if (err) {
    throw err;
}
console.log('Server running at:', server.info.uri);
});