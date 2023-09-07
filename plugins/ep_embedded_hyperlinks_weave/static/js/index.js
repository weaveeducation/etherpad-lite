'use strict';
const shared = require('./shared');

let dialogActiveTab = 'evidence-file';
let evidenceFiles = [];
let evidenceFilesSupport = false;

function getEvidenceFiles(data) {
    evidenceFiles = data.evidenceFiles;
    evidenceFilesSupport = data.evidenceFilesSupport;
    console.log('getEvidenceFiles', data.evidenceFilesSupport, data.evidenceFiles);
}

shared.parseWindowEvent(getEvidenceFiles);

function isValidURL(url) {
    let pattern = /^(https?:\/\/)?([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,4})(:\d{1,5})?([/?#]\S*)?$/;
    return pattern.test(url);
}

let showDialog = function () {
    const curLine = (this.rep.lines.atIndex(this.rep.selEnd[0])).lineNode;
    // $('.hyperlink-dialog').css('top', $(curLine).offset().top + $(curLine).height());
    $('.hyperlink-dialog').addClass('popup-show');

    if (!$('.hyperlink-text').val()) {
        $('.hyperlink-remove').hide();
    } else {
        $('.hyperlink-remove').show();
    }

    $('.error-message.evidence-file').hide();
    $('.error-message.hyperlink-url').hide();
    $('.error-message.hyperlink-text').hide();

    // Check if evidence file tab is visible
    if (evidenceFilesSupport) {
        $('.tab.evidence-file').show();
        $('.evidence-file').click();

        // Remove previous set elements
        $('.input.evidence-file ul').empty();

        // Set new elements
        evidenceFiles.forEach(option => {
            const ulElement = $('<li>');
            ulElement.addClass('evidence-file option');
            $(ulElement).data('value', option['evidenceGuid']);
            ulElement.text(option['filename']);
            $('.input.evidence-file ul').append(ulElement);
        });

    } else {
        $('.tab.evidence-file').hide();
        $('.weblink').click();
    }
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
        $('.hyperlink-text').val($(e.target).text());
        $('.hyperlink-url').val($(e.target).attr('href'));
        padInner.contents().on('click', () => {
            $('.hyperlink-dialog').removeClass('popup-show');
        });
        showDialog();
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
        $('.hyperlink-text').val('');
        $('.hyperlink-url').val('');

        const padOuter = $('iframe[name="ace_outer"]').contents();
        const padInner = padOuter.find('iframe[name="ace_inner"]').contents()[0];
        const selection = padInner.getSelection();
        $('.hyperlink-text').val(selection.toString());
        showDialog();
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
        $('.hyperlink-text').val('');
        $('.hyperlink-url').val('');

        const padOuter = $('iframe[name="ace_outer"]').contents();
        const padInner = padOuter.find('iframe[name="ace_inner"]').contents()[0];
        const selection = padInner.getSelection();
        $('.hyperlink-text').val(selection.toString());
        showDialog();
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
            evidenceFileId = $('.evidence-file.option.selected').data('value');
            console.log('url', url);

            !evidenceFileId ? $('.error-message.evidence-file').show() : $('.error-message.evidence-file').hide();
            data = {
                type: 'evidence-file',
                value: evidenceFileId,
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
                value: url,
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
            if (ace.ace_getAttributeOnSelection('url')) {
                ace.ace_setAttributeOnSelection('url', false);
            } else {
                ace.ace_setAttributeOnSelection('url', data);
            }
        }, 'insertLink', true);
        $('.hyperlink-text').val('');
        $('.hyperlink-url').val('');
        $('.hyperlink-dialog').removeClass('popup-show');
        addLinkListeners();
    });

    $('.hyperlink-remove').on('click', () => {
        context.ace.callWithAce((ace) => {
            ace.ace_setAttributeOnSelection('url', false);
        }, 'removeLink', true);
        $('.hyperlink-text').val('');
        $('.hyperlink-url').val('');
        $('.hyperlink-dialog').removeClass('popup-show');
        addLinkListeners();
    });

    $('.hyperlink-cancel').on('click', () => {
        $('.hyperlink-text').val('');
        $('.hyperlink-url').val('');
        $('.hyperlink-dialog').removeClass('popup-show');
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
    if (context.key === 'url') {
        console.log(context);
        // console.log(JSON.parse(context));
        //
        const data = JSON.parse(context.value);

        // let url = /(?:^| )url-(\S*)/.exec(context.value);
        // if (!url) {
        //     console.log('1a', context.value);
        //
        //     url = context.value;
        // } else {
        //     console.log('1b', url);
        //
        //     url = url[1];
        // }

        return ['url', `type-${data.type}`,`url-${data.value}`];
    }
};

/* Convert the classes into a tag */
exports.aceCreateDomLine = (name, context) => {

    const cls = context.cls;
    let url = /(?:^| )url-(\S*)/.exec(cls);
    let type = /(?:^| )type-(\S*)/.exec(cls);
    console.log('Type', type)

    let modifier = {};

    if (url != null && url[1] != 'false') {
        // We need this only in the case we want to click on the <a> tag and open the page/file
        // url = url[1];
        // if (!(/^http:\/\//.test(url)) && !(/^https:\/\//.test(url))) {
        //     url = `'http://${url}`;
        // }

        modifier = {
            extraOpenTags: `<a href="#">`,
            extraCloseTags: '</a>',
            cls,
        };

        return modifier;
    }

    return [];
};

exports.aceInitialized = (hook, context) => {
    addLinkListeners = addLinkListeners.bind(context);
    showDialog = showDialog.bind(context);
};

exports.collectContentPre = (hook, context) => {
    //
    // console.log(hook, context);
    //
    // const url = /(?:^| )url-(\S*)/.exec(context.cls);
    // if (url) {
    //     context.cc.doAttrib(context.state, `url::${url[1]}`);
    // }
};
