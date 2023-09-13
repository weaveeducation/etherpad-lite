'use strict';
const shared = require('./shared');

let dialogActiveTab = 'evidence-file';
let evidenceFiles = [];
let evidenceFilesSupport = false;

function getEvidenceFiles(data) {
    evidenceFiles = data.evidenceFiles;
    evidenceFilesSupport = data.evidenceFilesSupport;
}

shared.parseWindowEvent(getEvidenceFiles);

function isValidURL(url) {
    let pattern = /^(https?:\/\/)?([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,4})(:\d{1,5})?([/?#]\S*)?$/;
    return pattern.test(url);
}

let prepareOptionElem = function (guid, text, isSelected) {
    const ulElement = $('<li>');
    ulElement.addClass('evidence-file option');

    if(isSelected) {
        ulElement.addClass('selected');
    }

    if (guid)
        $(ulElement).data('guid', guid);

    ulElement.text(text);
    return ulElement;
}

let showDialog = function (text, type, value) {
    // const curLine = (this.rep.lines.atIndex(this.rep.selEnd[0])).lineNode;
    // $('.hyperlink-dialog').css('top', $(curLine).offset().top + $(curLine).height());

    // Initialize popup's tabs
    $('.tab.evidence-file').show();
    $('.tab.weblink').show();
    $('.tab.evidence-file').click();
    $('.btn-primary.hyperlink-save').text('Insert link');

    // Check if evidence file tab is visible
    if (evidenceFilesSupport) {
        $('.tab.evidence-file').show();
        $('.tab.evidence-file').click();

        // Remove previous set elements
        $('.input.evidence-file .current').text('');
        $('.input.evidence-file ul').empty();

        // Add an empty element
        $('.input.evidence-file ul').append(prepareOptionElem(undefined, '', true));

        // Set new elements
        evidenceFiles.forEach(option => {
            $('.input.evidence-file ul').append(prepareOptionElem(option['evidenceGuid'], option['filename']));
        });

    } else {
        $('.tab.evidence-file').hide();
        $('.tab.weblink').click();
    }

    // Hide all error messages
    $('.error-message.evidence-file').hide();
    $('.error-message.hyperlink-url').hide();
    $('.error-message.hyperlink-text').hide();

    // Show remove button only if an url is set (Weblink tab) or an evidence file is selected (Evidence file tab)
    if (!value) {
        $('.hyperlink-remove').hide();
    } else {
        $('.hyperlink-remove').show();
    }

    // Set text value only if was set
    if (text)
        $('.hyperlink-text').val(text);

    // Set urls
    if (type && type == 'weblink') {
        $('.hyperlink-url').val(value);

        $('.btn-primary.hyperlink-save').text('Update link');
        $('.tab.evidence-file').hide();
        $('.tab.weblink').click();
    }

    if (type && type == 'evidence-file' && value) {
        $('.evidence-file.option.selected').removeClass('selected');

        for (i = 0; i < $('.input.evidence-file li').length; i++) {
            if ($($('.input.evidence-file li')[i]).data('guid') == value) {
                $('.input.evidence-file li')[i].click();
                $('.evidence-file.open').removeClass('open');
                break;
            }
        }

        $('.btn-primary.hyperlink-save').text('Update link');
        $('.tab.weblink').hide();
        $('.tab.evidence-file').click();
    }

    $('.hyperlink-dialog').addClass('popup-show');
};

let prepareShowDialog = function () {
    $('.hyperlink-text').val('');
    $('.hyperlink-url').val('');

    if (evidenceFilesSupport) {
        // Clean up selected file
        $('.evidence-file.option.selected').removeClass('selected')
    }

    const padOuter = $('iframe[name="ace_outer"]').contents();
    const padInner = padOuter.find('iframe[name="ace_inner"]').contents()[0];
    const selection = padInner.getSelection();
    $('.hyperlink-text').val(selection.toString());
    showDialog();
}

let hideDialog = function () {
    $('.hyperlink-text').val('');
    $('.hyperlink-url').val('');

    if (evidenceFilesSupport) {
        // Clean up selected file
        $('.evidence-file.option.selected').removeClass('selected')
    }

    $('.hyperlink-dialog').removeClass('popup-show');
};

let addLinkListeners = () => {
    const padOuter = $('iframe[name="ace_outer"]').contents();
    const padInner = padOuter.find('iframe[name="ace_inner"]');
    padInner.contents().find('a').off();
    padInner.contents().find('a').on('click', (e) => {
        const range = new Range();
        const selection = padInner.contents()[0].getSelection();
        range.selectNodeContents($(e.target)[0]);
        selection.removeAllRanges();
        selection.addRange(range);

        // Show either Evidence file tab or Weblink tab only
        // If a tag has url set then show Weblink tab
        // else if a tag had guid set then show Evidence file tab
        const guid = $(e.currentTarget).data('guid');
        const url = $(e.currentTarget).data('url');

        const text = $(e.target).text();
        let type = '';
        let value = '';
        if (guid) {
            type = 'evidence-file';
            value = guid;
        } else if (url) {
            type = 'weblink';
            value = url;
        }

        padInner.contents().on('click', () => {
            hideDialog();
        });
        showDialog(text, type, value);
        e.preventDefault();
        return false;
    });
};

exports.aceSelectionChanged = (hook, context) => {
    if ($('.hyperlink-dialog').hasClass('popup-show')) {
        const curLine = (context.rep.lines.atIndex(context.rep.selEnd[0])).lineNode;
        $('.hyperlink-dialog').css('top', $(curLine).offset().top + $(curLine).height());
    }
};

exports.postToolbarInit = (hookName, args) => {
    const editbar = args.toolbar;

    editbar.registerCommand('addHyperlink', () => {
        prepareShowDialog();
    });
};

exports.postAceInit = (hook, context) => {
    if (!$('#editorcontainerbox').hasClass('flex-layout')) {
        $.gritter.add({
            title: 'Error',
            text: 'Ep_embed_hyperlink2: Please upgrade to etherpad 1.9 for this plugin to work correctly',
            sticky: true,
            class_name: 'error',
        });
    }
    /* Event: User clicks editbar button */
    $('.hyperlink-icon').on('click', () => {
        prepareShowDialog();
    });

    $('.evidence-file').on('click', () => {
        dialogActiveTab = 'evidence-file';
        $('.weblink').removeClass('active');
        $('.weblink-wrapper').hide();
        $('.evidence-file').addClass('active');
        $('.evidence-file-wrapper').show();
    });

    $('.weblink').on('click', () => {
        dialogActiveTab = 'weblink';
        $('.evidence-file').removeClass('active');
        $('.evidence-file-wrapper').hide();
        $('.weblink').addClass('active');
        $('.weblink-wrapper').show();
    });


    /* Event: User creates new hyperlink */
    $('.hyperlink-save').on('click', () => {

        const text = $('.hyperlink-text').val();
        !text ? $('.error-message.hyperlink-text').show() : $('.error-message.hyperlink-text').hide();

        let url = true;
        let evidenceFileId = ' ';
        let data = '';
        if (dialogActiveTab == 'evidence-file') {
            evidenceFileId = $('.evidence-file.option.selected').data('guid');
            !evidenceFileId ? $('.error-message.evidence-file').show() : $('.error-message.evidence-file').hide();

            data = {
                type: 'evidence-file',
                value: evidenceFileId, // In the case of evidence-file pass a guid as value
            };
            data = JSON.stringify(data);

        } else if (dialogActiveTab == 'weblink') {
            url = $('.hyperlink-url').val();
            if (!(/^http:\/\//.test(url)) && !(/^https:\/\//.test(url))) {
                url = `http://${url}`;
            }
            !isValidURL(url) ? $('.error-message.hyperlink-url').show() : $('.error-message.hyperlink-url').hide();

            data = {
                type: 'weblink',
                value: url, // In the case of weblink pass url as a value
            };
            data = JSON.stringify(data);
        }

        if (!text
            || (dialogActiveTab == 'weblink' && !isValidURL(url))
            || (dialogActiveTab == 'evidence-file' && !evidenceFileId)) {
            return false;
        }

        context.ace.callWithAce((ace) => {
            const rep = ace.ace_getRep();
            const start = rep.selStart;
            ace.ace_replaceRange(start, rep.selEnd, text);
            ace.ace_performSelectionChange(start, [start[0], start[1] + text.length], true);
            if (ace.ace_getAttributeOnSelection('data')) {
                ace.ace_setAttributeOnSelection('data', false);
            } else {
                ace.ace_setAttributeOnSelection('data', data);
            }
        }, 'insertLink', true);
        hideDialog();
        addLinkListeners();
    });

    $('.hyperlink-remove').on('click', () => {
        context.ace.callWithAce((ace) => {
            ace.ace_setAttributeOnSelection('data', false);
        }, 'removeLink', true);
        hideDialog();
        addLinkListeners();
    });

    $('.hyperlink-cancel').on('click', () => {
        hideDialog();
    });

    /* User press Enter on url input */
    $('.hyperlink-url').on('keyup', (e) => {
        if (e.keyCode === 13) {
            $('.hyperlink-save').click();
        }
    });
    addLinkListeners();
};

exports.acePostWriteDomLineHTML = () => {
    setTimeout(() => {
        addLinkListeners();
    });
};

exports.aceAttribsToClasses = (hook, context) => {
    if (context.key === 'data') {

        if (context.value == 'false')
            return ['data', `type-false`, `data-false`];

        const data = JSON.parse(context.value);

        return ['data', `type-${data.type}`, `data-${data.value}`];
    }
};

/* Convert the classes into a tag */
exports.aceCreateDomLine = (name, context) => {

    const cls = context.cls;

    let data = /(?:^| )data-(\S*)/.exec(cls);
    let type = /(?:^| )type-(\S*)/.exec(cls);

    let modifier = {};
    if (data != null && data != 'undefined' && data[1] != 'false') {
        if (type[1] === 'evidence-file') {
            modifier = {
                extraOpenTags: `<a href="#" data-guid="` + data[1] + `">`,
                extraCloseTags: '</a>',
                cls,
            };
        } else if (type[1] === 'weblink') {
            modifier = {
                extraOpenTags: `<a href="#" data-url="` + data[1] + `">`,
                extraCloseTags: '</a>',
                cls,
            };
        } else {
            console.log('You have to check this!');
            modifier = [];
        }

        return modifier;
    }

    return [];
};

exports.aceInitialized = (hook, context) => {
    addLinkListeners = addLinkListeners.bind(context);
    showDialog = showDialog.bind(context);
};

exports.collectContentPre = (hook, context) => {

    // console.log(hook, context);
    //
    // const url = /(?:^| )url-(\S*)/.exec(context.cls);
    // if (url) {
    //     context.cc.doAttrib(context.state, `url::${url[1]}`);
    // }
};
