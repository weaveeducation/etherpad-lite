'use strict';

exports.postToolbarInit = (hookName, context) => {
    const editbar = context.toolbar;

    // Set for 'commendation'
    editbar.registerCommand('commendation', () => {
        context.ace.callWithAce((ace) => {
            ace.ace_toggleAttributeOnSelection('commendation');
        }, 'commendation', true);
    });

    // Set for 'commendation'
    editbar.registerCommand('recommendation', () => {
        context.ace.callWithAce((ace) => {
            ace.ace_toggleAttributeOnSelection('recommendation');
        }, 'recommendation', true);
    });

    return true;
};

exports.aceAttribsToClasses = (hook, context) => {
    // Set for 'commendation'
    if (context.key === 'commendation') {
        return ['commendation'];
    }

    // Set for 'recommendation'
    if (context.key === 'recommendation') {
        return ['recommendation'];
    }
};

/* Convert the classes into a tag */
exports.aceCreateDomLine = (name, context) => {
    const cls = context.cls;

    // Set for 'commendation'
    const commendation = /(?:^| )commendation(\S*)/.exec(cls);
    if (commendation != null) {
       const modifier = {
            extraOpenTags: `<span class="commendation">`,
            extraCloseTags: '</span>',
            cls,
        };
        return modifier;
    }

    // Set for 'recommendation'
    const recommendation = /(?:^| )recommendation(\S*)/.exec(cls);
    if (recommendation != null) {
        const modifier = {
            extraOpenTags: `<span class="recommendation">`,
            extraCloseTags: '</span>',
            cls,
        };
        return modifier;
    }

    return [];
};

exports.collectContentPre = (hook, context) => {
    // Check for 'commendation'
    const commendation = /(?:^| )commendation(\S*)/.exec(context.cls);
    if (commendation) {
        context.cc.doAttrib(context.state, `commendation`);
    }

    // Check for 'recommendation'
    const recommendation = /(?:^| )recommendation(\S*)/.exec(context.cls);
    if (recommendation) {
        context.cc.doAttrib(context.state, `recommendation`);
    }
};

exports.aceEditorCSS = () => ['ep_commendation_recommendation_weave/static/css/main.css'];
