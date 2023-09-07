'use strict';
const shared = require('./shared');

let etherpadTooltips = [];
let commendationsCaption = "-";
let recommendationsCaption = "-";

function updateCaptions(data) {
    commendationsCaption = data.commendationsCaption;
    recommendationsCaption = data.recommendationsCaption;

    // Update commendation
    const commendationsElement = document.querySelector('.a-buttonicon-commendation');
    if (commendationsElement) {
        commendationsElement.title = "Highlight " + commendationsCaption;
    }

    // Update recommendation
    const recommendationsElement = document.querySelector('.a-buttonicon-recommendation');
    if (recommendationsElement) {
        recommendationsElement.title = "Highlight " + recommendationsCaption;
    }
}

shared.parseWindowEvent(updateCaptions);

let cleanTooltips = () => {
    // Close opened tooltips
    etherpadTooltips.forEach(tooltip => {
        $(tooltip).remove();
    });
    etherpadTooltips = [];
}

let addTooltip = (element, e) => {

    // The tooltip will be added in the body of the top level iframe
    const topLevelIframe = $('body')[0];

    element = $(element)[0];
    const etherpadTooltip = document.createElement("div");
    let text = commendationsCaption;
    etherpadTooltip.className = "firepad-tooltip firepad-commendation-tooltip";
    if (element.classList.contains('recommendation')) {
        text = recommendationsCaption;
        etherpadTooltip.className = "firepad-tooltip firepad-recommendation-tooltip";
    }
    etherpadTooltip.textContent = text;

    const topLeveIframeRect = topLevelIframe.getBoundingClientRect();
    const hoveredElementRect = element.getBoundingClientRect();

    // Get the position of the inner iframe
    const parentFrame = $('iframe[name=ace_outer]')[0];
    const parentContent = parentFrame.contentDocument || parentFrame.contentWindow.document;
    const childFrame = $(parentContent).find('iframe[name=ace_inner]');
    const childFrameRect = childFrame[0].getBoundingClientRect();

    const x = childFrameRect.left + e.clientX; //x position within the element.
    const y = childFrameRect.top + hoveredElementRect.top;  //y position within the element.

    etherpadTooltip.style.left = (x) + "px";
    etherpadTooltip.style.top = (y + 42) + "px";

    etherpadTooltips.push(etherpadTooltip);
    topLevelIframe.appendChild(etherpadTooltip);
}


let addHoverListeners = () => {
    const padOuter = $('iframe[name="ace_outer"]').contents();
    const padInner = padOuter.find('iframe[name="ace_inner"]');
    padInner.contents().find('.commendation, .recommendation').off();
    padInner.contents().find('.commendation, .recommendation')
        .on('mouseenter', (e) => {

            const target = e.target;
            addTooltip($(target), e);

            return false;
        })
        .on('mouseleave', (e) => {

            cleanTooltips();

            return false;
        });
};

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

exports.postAceInit = (hook, context) => {
    addHoverListeners();
};

exports.acePostWriteDomLineHTML = (hook, node) => {
    setTimeout(() => {
        addHoverListeners();
    });

}

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

// Use this part of code to send http requests to Etherpad's server (those can be handled)
// bty the server side hooks
// setInterval(()=>{
//     // Make an HTTP POST request to send data to the server
//     fetch('/updateCaptions', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(data),
//     });
//
// }, 20000)