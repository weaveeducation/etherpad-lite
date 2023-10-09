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

const _handleNewLines = (ace) => {
    const rep = ace.ace_getRep();
    const lineNumber = rep.selStart[0];
    const curLine = rep.lines.atIndex(lineNumber);
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

    if (context.key === 'img') {
        let imgUrl = context.value;
        if (context.value.indexOf('<img') === 0) {
            const urlMatch = (/src\s*=\s*"([^\s]+\/\/[^/]+.\/[^\s]+\.\w*)/gi).exec(context.value);
            imgUrl = urlMatch[1];
        }

        const data = JSON.parse(context.value);
        return [`guid-${data.guid}`, `url-${data.url}`];
    }
};

// Rewrite the DOM contents when an IMG attribute is discovered
exports.aceDomLineProcessLineAttributes = (name, context) => {

    const cls = context.cls;
    let guid = /(?:^| )guid-(\S*)/.exec(cls);
    let url = /(?:^| )url-(\S*)/.exec(cls);
    if (!url) return [];

    if (url[1]) {
        const preHtml = `<img src="` + url[1] + `" data-guid="` + guid[1] + `">`;
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

exports.aceEditorCSS = () => [
    '/ep_image_upload_weave/static/css/ace.css',
    '/ep_image_upload_weave/static/css/ep_image_upload_weave.css',
];

exports.aceInitialized = (hook, context) => {
    const editorInfo = context.editorInfo;
    editorInfo.ace_addImage = image.addImage.bind(context);
    editorInfo.ace_removeImage = image.removeImage.bind(context);

    // showDialog = showDialog.bind(context);
};

exports.aceRegisterBlockElements = () => ['img'];

exports.postAceInit = (hook, context) => {

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

        context.ace.callWithAce((ace) => {
            const imageLineNr = _handleNewLines(ace);
            ace.ace_addImage(imageLineNr, data);
            ace.ace_doReturnKey();
        }, 'img', true);

        hideDialog();
    })

}

