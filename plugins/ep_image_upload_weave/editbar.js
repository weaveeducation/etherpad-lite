'use strict';

const eejs = require('ep_etherpad-lite/node/eejs/');

exports.eejsBlock_editbarMenuLeft = (hookName, args, cb) => {
  if (args.renderContext.isReadOnly) return cb();
  args.content += eejs.require('ep_image_upload_weave/templates/editbarButton.ejs');
  return cb();
};
