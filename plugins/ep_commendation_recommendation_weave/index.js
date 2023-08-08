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
