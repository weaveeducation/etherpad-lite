'use strict';

const eejs = require('ep_etherpad-lite/node/eejs/');
const settings = require('ep_etherpad-lite/node/utils/Settings');
const {JSDOM} = require('jsdom');

exports.padInitToolbar = (hookName, args, cb) => {
    const toolbar = args.toolbar;
    if (JSON.stringify(settings.toolbar).indexOf('addHyperlink') === -1) {
        settings.toolbar.left.push(['addHyperlink']);
    }
    const button = toolbar.button({
        command: 'addHyperlink',
        localizationId: 'ep_embedded_hyperlinks.editbarButtons.hyperlink.title',
        class: 'buttonicon buttonicon-star hyperlink-icon',
    });

    toolbar.registerButton('addHyperlink', button);

    return cb();
};

exports.eejsBlock_body = (hook, args, cb) => {
    args.content += eejs.require('ep_hyperlinks_weave/templates/popup.ejs', {}, module);
    return cb();
};


// Add the props to be supported in export
exports.exportHtmlAdditionalTagsWithData = async (hook, pad) => {
    const ret = [];
    pad.pool.eachAttrib((k, v) => { if (k === 'url') ret.push([k, v]); });
    return ret;
};


exports.getLineHTMLForExport = async (hook, context) => {
    const elem = JSDOM.fragment(context.lineContent);
    const parseNode = async (node) => {
        const attrs = node.attributes;

        if (attrs) {
            for (let i = 0; i < attrs.length; i++) {
                const attr = attrs[i];
                if (attr.name === 'data-url') {
                    const nodeHTML = node.outerHTML.trim();

                    const replaceHTML = (`${nodeHTML.substring(0, nodeHTML.length - 5)}a>`)
                        .replace('<span data-url', '<a href');
                    context.lineContent = JSDOM
                        .fragment(`<div>${context.lineContent}</div>`).firstChild.innerHTML
                        .replace(nodeHTML, replaceHTML);
                }
            }
        }

        if (node.childNodes) {
            node.childNodes.forEach(async (child) => {
                await parseNode(child);
            });
        }
    };

    await parseNode(elem);
};


// 'use strict';
//
// const eejs = require('ep_etherpad-lite/node/eejs/');
// const Changeset = require('ep_etherpad-lite/static/js/Changeset');
// const settings = require('ep_etherpad-lite/node/utils/Settings');
//
// exports.eejsBlock_editbarMenuLeft = (hookName, args, cb) => {
//     if (args.renderContext.isReadOnly) return cb();
//
//     for (const button of ['alignLeft', 'alignJustify', 'alignCenter', 'alignRight']) {
//         if (JSON.stringify(settings.toolbar).indexOf(button) > -1) {
//             return cb();
//         }
//     }
//
//     args.content += eejs.require('ep_hyperlinks_weave/templates/editbarButtons.ejs');
//     return cb();
// };
//
// const _analyzeLine = (alineAttrs, apool) => {
//     let alignment = null;
//     if (alineAttrs) {
//         const opIter = Changeset.opIterator(alineAttrs);
//         if (opIter.hasNext()) {
//             const op = opIter.next();
//             alignment = Changeset.opAttributeValue(op, 'align', apool);
//         }
//     }
//     return alignment;
// };
//
// // line, apool,attribLine,text
// exports.getLineHTMLForExport = async (hookName, context) => {
//     const align = _analyzeLine(context.attribLine, context.apool);
//     if (align) {
//         if (context.text.indexOf('*') === 0) {
//             context.lineContent = context.lineContent.replace('*', '');
//         }
//         const heading = context.lineContent.match(/<h([1-6])([^>]+)?>/);
//
//         if (heading) {
//             if (heading.indexOf('style=') === -1) {
//                 context.lineContent = context.lineContent.replace('>', ` style='text-align:${align}'>`);
//             } else {
//                 context.lineContent = context.lineContent.replace('style=', `style='text-align:${align} `);
//             }
//         } else {
//             context.lineContent =
//                 `<p style='text-align:${align}'>${context.lineContent}</p>`;
//         }
//         return context.lineContent;
//     }
// };
//
// exports.padInitToolbar = (hookName, args, cb) => {
//     const toolbar = args.toolbar;
//
//     const commendationButton = toolbar.button({
//         command: 'commendation',
//         localizationId: 'ep_hyperlinks_weave.toolbar.commendation.title',
//         class: 'buttonicon buttonicon-star ep_align',
//     });
//
//     const recommendationButton = toolbar.button({
//         command: 'recommendation',
//         localizationId: 'ep_hyperlinks_weave.toolbar.recommendation.title',
//         class: 'buttonicon buttonicon-recommendation ep_align',
//     });
//
//
//     toolbar.registerButton('commendation', commendationButton);
//     toolbar.registerButton('recommendation', recommendationButton);
//
//     return cb();
// };
