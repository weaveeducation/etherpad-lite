'use strict';

var eejs = require('ep_etherpad-lite/node/eejs/');
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
        class: 'buttonicon buttonicon-link hyperlink-icon',
    });

    toolbar.registerButton('addHyperlink', button);

    return cb();
};

exports.eejsBlock_editbarMenuLeft = function(hook_name, args, cb) {
    args.content = args.content + eejs.require('ep_embedded_hyperlinks_weave/templates/editbarButtons.ejs');
    return cb();
}

exports.eejsBlock_editorContainerBox = function (hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_embedded_hyperlinks_weave/templates/popup.ejs", {}, module);
  return cb();
}
