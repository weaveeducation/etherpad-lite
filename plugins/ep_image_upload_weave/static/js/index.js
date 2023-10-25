'use strict';
const shared = require('./shared');

// Global variables and methods
const Tabs = {
    EvidenceImages: 'evidence-images',
    ImageUrl: 'image-url'
};

let dialogActiveTab = Tabs.EvidenceImages;
let evidenceImages = [];
let selectedEvidenceImage = undefined;
let evidenceFilesSupport = false;

const image = {
    removeImage(lineNumber) {
        const documentAttributeManager = this.documentAttributeManager;
        documentAttributeManager.removeAttributeOnLine(lineNumber, 'img');
    },
    addImage(lineNumber, data) {
        const documentAttributeManager = this.documentAttributeManager;
        documentAttributeManager.setAttributeOnLine(lineNumber, 'img', data);
    },
    getImage(lineNumber) {
        const documentAttributeManager = this.documentAttributeManager;
        return documentAttributeManager.getAttributeOnLine(lineNumber, 'img');
    }
};

const prepareOptionElem = function (guid, text, url, isSelected) {
    const ulElement = $('<li>');
    ulElement.attr('id', guid);
    ulElement.addClass('evidence-images option');

    if (isSelected) {
        ulElement.addClass('selected');
    }

    if (guid)
        $(ulElement).data('guid', guid);

    if (url)
        $(ulElement).data('url', url);

    ulElement.text(text);
    return ulElement;
}

const setEvidenceImagesDropdown = function (selectedEvidenceImage) {
    // Remove previous set elements
    $('.input.evidence-images .current').text('');
    $('.input.evidence-images ul').empty();
    $('.evidence-images.option.selected').removeClass('selected')

    // Add an empty element
    $('.input.evidence-images ul').append(prepareOptionElem(undefined, '', undefined, true));

    // Set new elements
    evidenceImages.forEach(option => {
        $('.input.evidence-images ul').append(prepareOptionElem(option['evidenceGuid'], option['filename'], option['fileURL']));
    });

    if (selectedEvidenceImage) {
        $("[id='" + selectedEvidenceImage['evidenceGuid'] + "']").click();

        // hide drop down
        $('.hyperlink-container').click();
    }
}

const showDialog = function (text, type, value) {

    // Initialize popup's tabs
    $('.tab.evidence-images').show();
    $('.tab.image-url').show();

    // Check if evidence file tab is visible
    if (evidenceFilesSupport) {
        $('.tab.evidence-images').show();
        $('.tab.evidence-images').click();

        setEvidenceImagesDropdown();
    } else {
        $('.tab.evidence-images').hide();
        $('.tab.image-url').click();
    }

    // Clean up url text
    $('.input.image-url').val('');

    // Hide all error messages
    $('.error-message.evidence-images').hide();
    $('.error-message.upload-image').hide(); // Add message in the popup
    $('.error-message.image-url').hide();

    $('.image-upload-dialog').addClass('popup-show');
};

const hideDialog = function () {
    // $('.hyperlink-text').val('');
    // $('.hyperlink-url').val('');
    //
    // if (evidenceFilesSupport) {
    //     // Clean up selected file
    //     $('.evidence-images.option.selected').removeClass('selected')
    // }

    $('.image-upload-dialog').removeClass('popup-show');
};

const onDragenter = function (event) {
    $('#uploadWrapper').addClass('file-over');
    $('#uploadWrapperOnclick').removeClass('upload-file-on-click-area');
}

const onDragleave = function (event) {
    $('#uploadWrapper').removeClass('file-over');
    $('#uploadWrapperOnclick').addClass('upload-file-on-click-area');
}

const onDrop = function (event) {
    $('#uploadWrapper').removeClass('file-over');

    const dt = event.dataTransfer
    const files = dt.files

    shared.sendWindowEvent(files);

    event.preventDefault();
    event.stopPropagation();
}

const onDragover = function (event) {
    event.preventDefault();
    event.stopPropagation();
}

let addUploadHandler = function () {
    const uploadWrapper = document.getElementById('uploadWrapper');
    uploadWrapper.addEventListener('dragenter', onDragenter, false);
    uploadWrapper.addEventListener('dragleave', onDragleave, false);
    uploadWrapper.addEventListener('drop', onDrop, false);
    uploadWrapper.addEventListener('dragover', onDragover, false);

    const uploadWrapperOnclick = document.getElementById('uploadWrapperOnclick');
    uploadWrapperOnclick.addEventListener('click', () => {
        fileUploadHandler();
    });
}


const calculatePadInnerPadding = (elem) => {
    let padding = $(elem).css('padding');
    padding = padding.split(' ');
    padding = padding.map(elem => elem.slice(0, -2));

    const calcPadding = {
        top: 0,
        left: 0
    }
    switch (padding.length) {
        // e.g. padding: 1px;
        case 1: {
            calcPadding.top = padding[0];
            calcPadding.left = padding[0];
            break;
        }
        // e.g. padding: 1px 2px;
        case 2 : {
            calcPadding.top = padding[0];
            calcPadding.left = padding[1];
            break;
        }
        // e.g. padding: 1px 2px 3px;
        case 3: {
            calcPadding.top = padding[0];
            calcPadding.left = padding[1];
        }
        // e.g. padding: 1px 2px 3px 4px;
        case 4: {
            calcPadding.top = padding[0];
            calcPadding.left = padding[4];
            break;
        }
        default: {
            // console.log('Check this case', $(elem).css('padding'));
            break;
        }
    }

    calcPadding.top = parseInt(calcPadding.top);
    calcPadding.left = parseInt(calcPadding.left);

    return calcPadding;
}

let currentImageInteractWithInfo = undefined;
const showImageResizeDialog = function () {

    // Initialize width and height
    const width = Math.round(currentImageInteractWithInfo.originalWidth);
    const height = Math.round(currentImageInteractWithInfo.originalHeight);
    $('.input.image-width').val(width);
    $('.input.image-height').val(height);
    $('.image-resizer-dialog').addClass('popup-show');
}

const hideImageResizeDialog = function (context) {
    currentImageInteractWithInfo = undefined;
    $('.image-resizer-dialog').removeClass('popup-show');

    addImageListeners(context);
};


const findElementsLine = (searchForElementId, element, line) => {

    if (!element) {
        console.log('WE HAVE PROBLEM');
    }
    // console.log('findElementsLine', line, element, element.id);

    // The end of the Nodes' list that means that element searched for was not found!
    if (!element) {
        return -1;
    }

    // Return the line of the found element
    if (searchForElementId == element.id) {
        return line;
    }

    return findElementsLine(searchForElementId, element.nextSibling, ++line);
}


let addImageListeners = (context) => {
    const padOuter = $('iframe[name="ace_outer"]').contents();
    const padInner = padOuter.find('iframe[name="ace_inner"]');
    padInner.contents().find('img').off();

    console.log(padInner.contents().find('img'));

    padInner.contents().find('img').on('click', (e) => {

        padInner.contents().on('click', (e) => {
            hideImageResizeDialog(context);
        });

        // Set current image element clicked on
        currentImageInteractWithInfo = {
            parentDivId: $($(e.target).parent()[0]).attr('id'),
            originalWidth: $(e.target).width(),
            originalHeight: $(e.target).height(),
            line: 0,
        };

        context.ace.callWithAce((ace) => {
            // Find the line where this image is located in the pad
            const startNode = ace.ace_getRep().lines._start.downPtrs[0].entry.lineNode;
            const parentDivId = currentImageInteractWithInfo.parentDivId;
            currentImageInteractWithInfo.line = findElementsLine(parentDivId, startNode, 0);

            console.log('Current image resized INFO: ', currentImageInteractWithInfo);
        });


        // const parentDivId = $($(e.target).parent()[0]).attr('id')
        // console.log('Current image resized', e.target, parentDivId);
        //
        // context.ace.callWithAce((ace) => {
        //     console.log('ace.ace_getRep()', ace.ace_getRep());
        //
        //     const lines = ace.ace_getRep().lines._keyToNodeMap;
        //     const startNode = ace.ace_getRep().lines._start.downPtrs[0].entry.lineNode;
        //     const nextNode = ace.ace_getRep().lines._start.downPtrs[0].entry.lineNode.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling;
        //     const imageLineNr = findElementsLine(parentDivId, startNode, 0);
        //
        //     // console.log('Lines', lines);
        //     // console.log('Start Node', startNode);
        //     // console.log('Next Node', nextNode);
        //     console.log('ΙmageLineNr', imageLineNr);
        //
        //     const data = ace.ace_getImage(imageLineNr);
        //
        //     console.log('getAttributeOnLine', data);
        // }, 'img', true);

        showImageResizeDialog();

        return false;

        // const img = e.target;
        //
        // // console.log(this);
        //
        // // console.log('I feel Lucky here');
        //
        // // console.log(e.target, e);
        // // console.log(e.target.getBoundingClientRect());
        //
        // const imgRect = e.target.getBoundingClientRect();
        //
        // // The extra div will be added in the body of the top level iframe
        // const topLevelIframe = $('body')[0];
        // // const innerIframeHtml = padInner.contents().find('html')[0];
        //
        // // console.log(topLevelIframe);
        //
        // // console.log($('iframe'));
        //
        // // console.log(padInner.contents().find('html')[0]);
        //
        // // // console.log(innerIframeHtml.getBoundingClientRect());
        // // console.log($(padInner).css('padding'), calculatePadInnerPadding(padInner));
        //
        // const padInnerPadding = calculatePadInnerPadding(padInner);
        // const resizerFrame = $('<div class="resizer-frame"><div class="resizer"></div></div>');
        //
        // // console.log(imgRect.top, padInnerPadding.top, imgRect.top + padInnerPadding.top)
        // // console.log(imgRect.left, padInnerPadding.left, imgRect.left + padInnerPadding.left)
        //
        // resizerFrame.offset({
        //     'top': imgRect.top + padInnerPadding.top + 78,
        //     'left': imgRect.left + padInnerPadding.left + 34
        // });
        // resizerFrame.width(imgRect.width + 1);
        // resizerFrame.height(imgRect.height + 1);
        // $(topLevelIframe).append(resizerFrame);
        //
        // $('.resizer').on('mousedown', (e) => {
        //     initDrag(img, e);
        // });
        //
        // return false;
    });


    let startX, startY, startWidth, startHeight;

    function initDrag(img, e) {
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(document.defaultView.getComputedStyle(img).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(img).height, 10);


        // console.log(document.documentElement);

        const padOuter = $('iframe[name="ace_outer"]').contents();
        document.documentElement.addEventListener('mousemove', (e) => {
            doDrag(img, e);
        }, false);
        document.documentElement.addEventListener('mouseup', (e) => {
            stopDrag(img, e);
        }, false);
    }

    function doDrag(img, e) {
        let imgWidth = startWidth + e.clientX - startX;
        let imgHeight = startHeight + e.clientY - startY;

        if (imgWidth > 10 && imgHeight > 10) {
            img.parentElement.classList.add('active');

            img.width = startWidth + e.clientX - startX;
            img.height = startHeight + e.clientY - startY;

            const resizerFrame = $('.resizer-frame');
            resizerFrame.width(img.width + 1);
            resizerFrame.height(img.height + 1);
        }
    }

    function stopDrag(img, e) {
        // handle.replace({width: info.width, height: info.height, src: info.src});
        img.parentElement.classList.remove('active');

        document.documentElement.removeEventListener('mousemove', (e) => {
            doDrag(img, e);
        }, false);
        document.documentElement.removeEventListener('mouseup', (e) => {
            stopDrag(img, e);


            // console.log('stopDrag', $('.resizer-frame'));

            $('.resizer-frame').remove();

        }, false);
        // this.codeMirror.refresh();
    }


    $($('body')[0]).on('click', (e) => {
        // console.log('Here', e, e.target)
    })

}


const _findLine = (ace) => {
    const rep = ace.ace_getRep();

    // console.log('REP', rep);

    let index = -1;
    // console.log(rep.lines._keyToNodeMap);
    // rep.lines._keyToNodeMap.forEach(line => {
    //     index++;
    //     if (line.entry.lineNode
    //         && line.entry.lineNode.firstChild
    //         && line.entry.lineNode.firstChild.attributes
    //         && line.entry.lineNode.firstChild.attributes[0]
    //     ) {
    //         // console.log(line.entry.lineNode.firstChild.attributes[0].value, line);
    //         return false;
    //     } else {
    //         // console.log('mpaaa', line);
    //     }
    // })

    for (const [key, value] of rep.lines._keyToNodeMap) {
        index++;
        if (value.entry.lineNode
            && value.entry.lineNode.firstChild
            && value.entry.lineNode.firstChild.attributes
            && value.entry.lineNode.firstChild.attributes[0]
        ) {
            // console.log(value.entry.lineNode.firstChild.attributes[0].value, value);
            break;
        } else {
            // console.log('mpaaa', value);
        }
    }

    return index;
}

const _handleNewLines = (ace) => {
    const rep = ace.ace_getRep();
    const lineNumber = rep.selStart[0];
    const curLine = rep.lines.atIndex(lineNumber);

    // console.log('lineNumber', lineNumber, 'curLine', curLine);

    if (curLine.text) {
        ace.ace_doReturnKey();

        return lineNumber + 1;
    }

    return lineNumber;
};

const _isValid = (file) => {
    const mimedb = clientVars.ep_image_upload_weave.mimeTypes;
    const mimeType = mimedb[file.type];
    let validMime = null;
    const errorTitle = html10n.get('ep_image_upload_weave.error.title');

    if (clientVars.ep_image_upload_weave && clientVars.ep_image_upload_weave.fileTypes) {
        validMime = false;
        if (mimeType && mimeType.extensions) {
            for (const fileType of clientVars.ep_image_upload_weave.fileTypes) {
                const exists = mimeType.extensions.indexOf(fileType);
                if (exists > -1) {
                    validMime = true;
                }
            }
        }
        if (validMime === false) {
            const errorMessage = html10n.get('ep_image_upload_weave.error.fileType');
            $.gritter.add({title: errorTitle, text: errorMessage, sticky: true, class_name: 'error'});

            return false;
        }
    }

    if (clientVars.ep_image_upload_weave && file.size > clientVars.ep_image_upload_weave.maxFileSize) {
        const allowedSize = (clientVars.ep_image_upload_weave.maxFileSize / 1000000);
        const errorText = html10n.get('ep_image_upload_weave.error.fileSize', {maxallowed: allowedSize});
        $.gritter.add({title: errorTitle, text: errorText, sticky: true, class_name: 'error'});

        return false;
    }

    return true;
};

function fileUploadHandler() {

    $(document).find('body').find('#imageInput').remove();
    const fileInputHtml = `<input
      style="width:1px;height:1px;z-index:-10000;"
      id="imageInput" type="file" multiple accept="image/*"/>`;
    $(document).find('body').append(fileInputHtml);

    $(document).find('body').find('#imageInput').on('change', (e) => {
        const files = e.target.files;
        if (!files.length) {
            return 'Please choose a file to upload first.';
        }

        shared.sendWindowEvent(files);
    });
    $(document).find('body').find('#imageInput').trigger('click');
}

function isValidURL(url) {
    let pattern = /^(https?:\/\/)?([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,4})(:\d{1,5})?([/?#]\S*)?$/;
    return pattern.test(url);
}

function getEvidenceImages(data) {

    evidenceImages = data.evidenceFiles;
    selectedEvidenceImage = data.selectedEvidenceFile;

    // Keep online images
    evidenceImages = evidenceImages.filter((evidenceFile) => {
        return evidenceFile.filename.match(/.(jpg|jpeg|png|gif)$/i) && !evidenceFile.isArchived;
    });

    evidenceFilesSupport = data.evidenceFilesSupport;

    // Update evidence files drop down list
    setEvidenceImagesDropdown(selectedEvidenceImage);
}

shared.parseWindowEvent(getEvidenceImages);

// Hooks
exports.aceAttribsToClasses = (name, context) => {
    // console.log('aceAttribsToClasses', context.value);

    if (context.key === 'img') {
        let imgUrl = context.value;
        if (context.value.indexOf('<img') === 0) {
            const urlMatch = (/src\s*=\s*"([^\s]+\/\/[^/]+.\/[^\s]+\.\w*)/gi).exec(context.value);
            imgUrl = urlMatch[1];
        }

        const data = JSON.parse(context.value);

        if (!data.localId)
            data.localId = uuidv4();

        return [`localId-${data.localId}`, `guid-${data.guid}`, `url-${data.url}`, `width-${data.width}`, `height-${data.height}`];
    }
};

// exports.aceEditEvent = (hook, context) => {
//     console.log(hook, context);
//     addImageListeners(context);
// }

// Rewrite the DOM contents when an IMG attribute is discovered
exports.aceDomLineProcessLineAttributes = (name, context) => {
    // console.log('aceDomLineProcessLineAttributes', context, context.addToLineClass);

    const cls = context.cls;
    let localId = /(?:^| )localId-(\S*)/.exec(cls);
    let guid = /(?:^| )guid-(\S*)/.exec(cls);
    let url = /(?:^| )url-(\S*)/.exec(cls);
    const width = /(?:^| )width-(\S*)/.exec(cls);
    const height = /(?:^| )height-(\S*)/.exec(cls);


    if (!url) return [];

    if (url[1]) {
        let preHtml;
        if (width[1]) {
            // preHtml = `<img id="` + localId[1] + `" src="` + url[1] + `" data-guid="` + guid[1] + `" width="` + parseInt(width[1]) + `" height=` + parseInt(height[1]) + `>`;
            preHtml = `<img src="` + url[1] + `" data-guid="` + guid[1] + `" width="` + parseInt(width[1]) + `" height=` + parseInt(height[1]) + `>`;
        } else {
            preHtml = `<img src="` + url[1] + `" data-guid="` + guid[1] + `">`;
        }
        const postHtml = '';
        const modifier = {
            preHtml,
            postHtml,
            processedMarker: true,
        };

        return [modifier];
    }

    return [];
};


// exports.acePostWriteDomLineHTML = (name, context) => {
//     // console.log('acePostWriteDomLineHTML');
//     // addImageListeners();
// };

exports.aceEditorCSS = () => [
    '/ep_image_upload_weave/static/css/ace.css',
    '/ep_image_upload_weave/static/css/ep_image_upload_weave.css',
];

exports.aceInitialized = (hook, context) => {

    // console.log('aceInitialized');

    const editorInfo = context.editorInfo;
    editorInfo.ace_addImage = image.addImage.bind(context);
    editorInfo.ace_removeImage = image.removeImage.bind(context);
    editorInfo.ace_getImage = image.getImage.bind(context);

    // showDialog = showDialog.bind(context);
};

exports.aceRegisterBlockElements = () => ['img'];


// exports.aceEndLineAndCharForPoint = (hook, context) => {
//     // // console.log(hook, context);
// }

exports.postAceInit = (hook, context) => {

    // console.log('postAceInit');

    addUploadHandler();

    /* Event: User clicks editbar button */
    $('.image-upload-toolbar').on('click', () => {
        showDialog();
    });

    /* Event: User click on Evidence image tab (evidence-images) */
    $('.tab.evidence-images').on('click', () => {
        // Update tabs
        dialogActiveTab = Tabs.EvidenceImages;
        $('.tab.image-url').removeClass('active');
        $('.tab.evidence-images').addClass('active');

        // Update wrappers
        $('.input-wrapper.image-url').hide();
        $('.input-wrapper.evidence-images').show();
        $('.input-wrapper.upload-image').show();
    });


    /* Event: User click on Image URL tab (image-url) */
    $('.tab.image-url').on('click', () => {
        // Update tabs
        dialogActiveTab = Tabs.ImageUrl;
        $('.tab.evidence-images').removeClass('active');
        $('.tab.image-url').addClass('active');

        // Update wrappers
        $('.input-wrapper.evidence-images').hide();
        $('.input-wrapper.upload-image').hide();
        $('.input-wrapper.image-url').show();
    });

    /* Event: User insert a new image */
    $('.cancel-image-btn').on('click', () => {
        hideDialog();
    });

    /* Event: User cancel image insert */
    $('.insert-image-btn').on('click', () => {

        let url = '';
        let evidenceImageId = '';
        switch (dialogActiveTab) {
            case Tabs.EvidenceImages: {
                url = $('.evidence-images.option.selected').data('url');
                evidenceImageId = $('.evidence-images.option.selected').data('guid');
                !evidenceImageId ? $('.error-message.evidence-images').show() : $('.error-message.evidence-images').hide();

                break;
            }
            case Tabs.ImageUrl: {
                url = $('.input.image-url').val();
                if (!(/^http:\/\//.test(url)) && !(/^https:\/\//.test(url))) {
                    url = `http://${url}`;
                }
                !isValidURL(url) ? $('.error-message.image-url').show() : $('.error-message.image-url').hide();

                break;
            }
            default: {
                break;
            }
        }

        if (
            (dialogActiveTab == Tabs.ImageUrl && !isValidURL(url))
            || (dialogActiveTab == Tabs.EvidenceImages && !evidenceImageId)) {
            return false;
        }

        let data = {
            guid: evidenceImageId,
            url: url
        };
        data = JSON.stringify(data);

        console.log('context', context);
        context.ace.callWithAce((ace) => {
            console.log('ace', ace);
            console.log('ace.ace_getRep()', ace.ace_getRep());

            const imageLineNr = _handleNewLines(ace);
            ace.ace_addImage(imageLineNr, data);
            ace.ace_doReturnKey();
        }, 'img', true);

        addImageListeners(context);
        hideDialog();
    })

    /* Event: User resize image */
    $('.update-image-resizer-btn').on('click', () => {

        const width = $('.input.image-width').val();
        const height = $('.input.image-height').val();

        hideImageResizeDialog(context);
    });

    /* Event: User resize image cancel */
    $('.cancel-image-resizer-btn').on('click', () => {
        // Reset image to initial width and height
        updateImageAttributes(
            currentImageInteractWithInfo.line,
            currentImageInteractWithInfo.originalWidth,
            currentImageInteractWithInfo.originalHeight,
            context
        );

        hideImageResizeDialog(context);
    });

    $('.input.image-width').on('change', (e) => {
        const resizedWidth = parseInt($('.input.image-width').val());
        let resizedHeight = calculateImageHeight(
            currentImageInteractWithInfo.originalWidth,
            currentImageInteractWithInfo.originalHeight,
            resizedWidth
        );

        // Set height based on image ratio
        resizedHeight = Math.round(resizedHeight);
        $('.input.image-height').val(resizedHeight);

        updateImageAttributes(currentImageInteractWithInfo.line, resizedWidth, resizedHeight, context);
    });

    $('.input.image-height').on('change', (e) => {
        const resizedHeight = parseInt($('.input.image-height').val());
        let resizedWidth = calculateImageWidth(
            currentImageInteractWithInfo.originalWidth,
            currentImageInteractWithInfo.originalHeight,
            resizedHeight
        );

        // Set width based on image ratio
        resizedWidth = Math.round(resizedWidth);
        $('.input.image-width').val(resizedWidth);

        updateImageAttributes(currentImageInteractWithInfo.line, resizedWidth, resizedHeight, context);
    });

    addImageListeners(context);

    // context.ace.callWithAce((ace) => {
    //
    //     let doc = ace.ace_getDocument();
    //
    //     $(doc).find('#innerdocbody').on('click', 'img',  (event)=>{
    //         console.log('Document', doc, event, context, ace.ace_getRep());
    //     });
    //
    // }, 'img', true);
}

function updateImageAttributes(line, setWidth, setHeight, context) {
    context.ace.callWithAce((ace) => {
        // const lines = ace.ace_getRep().lines._keyToNodeMap;
        // const startNode = ace.ace_getRep().lines._start.downPtrs[0].entry.lineNode;
        // const nextNode = ace.ace_getRep().lines._start.downPtrs[0].entry.lineNode.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling;
        // console.log('ace.ace_getRep()', ace.ace_getRep());
        // console.log('Lines', lines);
        // console.log('Start Node', startNode);
        // console.log('Next Node', nextNode);
        // console.log('ΙmageLineNr', currentImageInteractWithInfo.line);

        const data = JSON.parse(ace.ace_getImage(line));
        console.log('getAttributeOnLine', data);

        data.width = setWidth;
        data.height = setHeight;
        ace.ace_addImage(line, JSON.stringify(data));

    }, 'img', true);
}

function calculateImageWidth(originalWidth, originalHeight, resizedWidth) {
    return (originalWidth / originalHeight) * resizedWidth;
}

function calculateImageHeight(originalWidth, originalHeight, resizedHeight) {
    return (originalHeight / originalWidth) * resizedHeight;
}

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}