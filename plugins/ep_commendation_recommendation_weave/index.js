'use strict';
const eejs = require('ep_etherpad-lite/node/eejs/');
const settings = require('ep_etherpad-lite/node/utils/Settings');

exports.padInitToolbar = (hookName, args, cb) => {
    const toolbar = args.toolbar;

    const commendationButton = toolbar.button({
        command: 'commendation',
        localizationId: 'ep_commendation_recommendation_weave.toolbar.commendation.title',
        class: 'buttonicon buttonicon-commendation',
    });

    const recommendationButton = toolbar.button({
        command: 'recommendation',
        localizationId: 'ep_commendation_recommendation_weave.toolbar.recommendation.title',
        class: 'buttonicon buttonicon-recommendation',
    });

    toolbar.registerButton('commendation', commendationButton);
    toolbar.registerButton('recommendation', recommendationButton);

    return cb();
};

exports.eejsBlock_editbarMenuLeft = (hookName, args, cb) => {
    if (args.renderContext.isReadOnly) return cb();

    for (const button of ['commendation', 'recommendation']) {
        if (JSON.stringify(settings.toolbar).indexOf(button) > -1) {
            return cb();
        }
    }

    args.content += eejs.require('ep_commendation_recommendation_weave/templates/editbarButtons.ejs');
    return cb();
};

// // Keep this to use it later
// // Create a custom API endpoint to handle dynamic captions data
// exports.expressCreateServer = (hookName, context) => {
//     const app = context.app;
//
//     // Apply body parsing middleware
//     app.use(express.json()); // Enable JSON body parsing middleware
//
//
//     app.post('/updateCaptions', (req, res) => {
//         const dynamicData = req.body; // Received dynamic data from the client
//         res.status(200).send('Data received and processed');
//     });
// };

// exports.eejsBlock_editbarMenuLeft = (hookName, args, cb) => {
//     if (args.renderContext.isReadOnly) return cb();
//
//     const dynamicData = {
//         commendationsCaption: 'xx1',
//         recommendationsCaption: 'xxx2'
//     }
//
//     for (const button of ['commendation', 'recommendation']) {
//         if (JSON.stringify(settings.toolbar).indexOf(button) > -1) {
//             return cb();
//         }
//     }
//
//     args.content += eejs.require('ep_commendation_recommendation_weave/templates/editbarButtons.ejs', dynamicData);
//     return cb();
// };