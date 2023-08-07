'use strict';

let showDialog = function () {
    const curLine = (this.rep.lines.atIndex(this.rep.selEnd[0])).lineNode;
    $('.hyperlink-dialog').css('top', $(curLine).offset().top + $(curLine).height());
    $('.hyperlink-dialog').addClass('popup-show');
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
    console.log(hook, context);
    if ($('.hyperlink-dialog').hasClass('popup-show')) {
        const curLine = (context.rep.lines.atIndex(context.rep.selEnd[0])).lineNode;
        $('.hyperlink-dialog').css('top', $(curLine).offset().top + $(curLine).height());
    }
};

exports.postToolbarInit = (hookName, args) => {
    console.log(hookName);

    const editbar = args.toolbar;

    editbar.registerCommand('addHyperlink', () => {
        console.log('ADDD')
        $('.hyperlink-save').click();

        // $('.hyperlink-text').val('');
        // $('.hyperlink-url').val('');
        //
        // const padOuter = $('iframe[name="ace_outer"]').contents();
        // const padInner = padOuter.find('iframe[name="ace_inner"]').contents()[0];
        // const selection = padInner.getSelection();
        // $('.hyperlink-text').val(selection.toString());
        // showDialog();
    });
};

exports.postAceInit = (hook, context) => {
    console.log(hook, context);

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
        // showDialog();
    });

    /* Event: User creates new hyperlink */
    $('.hyperlink-save').on('click', () => {
        let url = $('.hyperlink-url').val();
        const text = $('.hyperlink-text').val();
        if (!(/^http:\/\//.test(url)) && !(/^https:\/\//.test(url))) {
            url = `http://${url}`;
        }
        context.ace.callWithAce((ace) => {
            const rep = ace.ace_getRep();
            const start = rep.selStart;

            console.log('url ?????', url);
            // console.log('text', text);
            //
            // ace.ace_replaceRange(start, rep.selEnd, text);
            //
            // console.log(start);
            // console.log(rep);
            // console.log(text);
            //
            // ace.ace_performSelectionChange(start, [start[0], start[1] + text.length], true);
            //

            // console.log('HERE !!!')
            ace.ace_toggleAttributeOnSelection('commendation');

            // console.log(ace);

            // console.log('???', ace.ace_getAttributeOnSelection('commendation'), ace.ace_getAttributeOnSelection('b'));

            // if (ace.ace_getAttributeOnSelection('commendation')) {
            //     console.log('111')
            //     ace.ace_setAttributeOnSelection('commendation', false);
            // } else {
            //     console.log('222')
            //     ace.ace_setAttributeOnSelection('commendation', true);
            //     // ace.ace_performDocumentApplyAttributesToCharRange();
            // }
        }, 'addHyperlink', true);
        // $('.hyperlink-text').val('');
        // $('.hyperlink-url').val('');
        // $('.hyperlink-dialog').removeClass('popup-show');
        // addLinkListeners();
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

    /* User press Enter on url input */
    $('.hyperlink-url').on('keyup', (e) => {
        if (e.keyCode === 13) {
            $('.hyperlink-save').click();
        }
    });
    addLinkListeners();
};

exports.acePostWriteDomLineHTML = () => {
    console.log('acePostWriteDomLineHTML');

    setTimeout(() => {
        addLinkListeners();
    });
};

exports.aceAttribsToClasses = (hook, context) => {
    console.log(hook, context.key, context);

    if (context.key === 'commendation') {
        return ['commendation'];
    }
};

/* Convert the classes into a tag */
exports.aceCreateDomLine = (name, context) => {

    console.log(name, context);

    const cls = context.cls;
    let url = /(?:^| )commendation-(\S*)/.exec(cls);
    let modifier = {};

    console.log(cls);
    console.log('URL', url, cls.toString().includes('commendation-'));

    if (url != null) {
        modifier = {
            extraOpenTags: `<span class="commendation">`,
            extraCloseTags: '</span>',
            cls,
        };
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')

        return modifier;
    }
    return [];
};

exports.aceInitialized = (hook, context) => {
    console.log(hook, context);

    addLinkListeners = addLinkListeners.bind(context);
    showDialog = showDialog.bind(context);
};

exports.collectContentPre = (hook, context) => {
    console.log(hook, context);

    const url = /(?:^| )commendation(\S*)/.exec(context.cls);
    if (url) {
        context.cc.doAttrib(context.state, `commendation`);
    }
};

exports.aceEditorCSS = () => ['ep_hyperlinks_weave/static/css/color.css'];


// exports.postToolbarInit = (hookName, context) => {
//     console.log(hookName);
//     const editbar = context.toolbar; // toolbar is actually editbar - http://etherpad.org/doc/v1.5.7/#index_editbar
//     editbar.registerCommand('commendation', () => {
//         // align(context, 0);
//
//         console.log('commendation')
//     });
//
//     editbar.registerCommand('recommendation', () => {
//         // align(context, 1);
//
//         console.log('recommendation')
//     });
//
//
//     return true;
// };
