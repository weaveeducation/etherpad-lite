'use strict';
const shared = require('./shared');

const Tabs = {
    EvidenceImages: 'evidence-images',
    ImageUrl: 'image-url'
};

let dialogActiveTab = Tabs.EvidenceImages;
let evidenceImages = [];
let evidenceImagesSupport = false;

function getEvidenceImages(data) {
    evidenceImages = data.evidenceFiles;

    // Keep online images
    evidenceImages = evidenceImages.filter((evidenceFile)=>{
        return evidenceFile.filename.match(/.(jpg|jpeg|png|gif)$/i) && !evidenceFile.isArchived;
    });

    evidenceImagesSupport = data.evidenceFilesSupport;

    console.log('Image upload', evidenceImages);
}

shared.parseWindowEvent(getEvidenceImages);

const image = {
    removeImage(lineNumber) {
        const documentAttributeManager = this.documentAttributeManager;
        documentAttributeManager.removeAttributeOnLine(lineNumber, 'img');
    },
    addImage(lineNumber, src) {
        const documentAttributeManager = this.documentAttributeManager;
        documentAttributeManager.setAttributeOnLine(lineNumber, 'img', src);
    },
};

exports.aceAttribsToClasses = (name, context) => {
    if (context.key === 'img') {
        let imgUrl = context.value;
        if (context.value.indexOf('<img') === 0) {
            const urlMatch = (/src\s*=\s*"([^\s]+\/\/[^/]+.\/[^\s]+\.\w*)/gi).exec(context.value);
            imgUrl = urlMatch[1];
        }
        return [`img:${imgUrl}`];
    }
};

// Rewrite the DOM contents when an IMG attribute is discovered
exports.aceDomLineProcessLineAttributes = (name, context) => {
    const imgType = (/(?:^| )img:([^> ]*)/).exec(context.cls);

    if (!imgType) return [];
    // const randomId = Math.floor((Math.random() * 100000) + 1);
    if (imgType[1]) {
        const preHtml = `<img src="${imgType[1]}">`;
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
};

exports.aceRegisterBlockElements = () => ['img'];

let prepareOptionElem = function (guid, text, isSelected) {
    const ulElement = $('<li>');
    ulElement.addClass('evidence-images option');

    if(isSelected) {
        ulElement.addClass('selected');
    }

    if (guid)
        $(ulElement).data('guid', guid);

    ulElement.text(text);
    return ulElement;
}
let showDialog = function (text, type, value) {

    // Initialize popup's tabs
    $('.tab.evidence-images').show();
    $('.tab.image-url').show();

    // Check if evidence file tab is visible
    if (evidenceFilesSupport) {
        $('.tab.evidence-images').show();
        $('.tab.evidence-images').click();

        // Remove previous set elements
        $('.input.evidence-images .current').text('');
        $('.input.evidence-images ul').empty();
        $('.evidence-images.option.selected').removeClass('selected')

        // Add an empty element
        $('.input.evidence-images ul').append(prepareOptionElem(undefined, '', true));

        // Set new elements
        evidenceFiles.forEach(option => {
            $('.input.evidence-images ul').append(prepareOptionElem(option['evidenceGuid'], option['filename']));
        });

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

let hideDialog = function () {
    $('.hyperlink-text').val('');
    $('.hyperlink-url').val('');

    if (evidenceFilesSupport) {
        // Clean up selected file
        $('.evidence-images.option.selected').removeClass('selected')
    }

    $('.hyperlink-dialog').removeClass('popup-show');
};

let handlerFunction = function (event) {
    console.log(event);
}

let onDragenter = function (event) {
    console.log(event);
    $('#uploadWrapper').addClass('file-over');
}

let onDragleave = function (event) {
    console.log(event);
    $('#uploadWrapper').removeClass('file-over');
}

let addUploadHandler = function () {
    let uploadWrapper = $('#uploadWrapper');

    uploadWrapper.on('click', () => {
        console.log('onClick event');
    });

    uploadWrapper.on('dragenter', onDragenter, false);
    uploadWrapper.on('dragleave', onDragleave, false);
    uploadWrapper.on('dragover', handlerFunction, false);
    uploadWrapper.on('drop', handlerFunction, false);
}

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
        console.log('Image cancel')
        hideDialog();
    });

    /* Event: User cancel image insert */
    $('.insert-image-btn').on('click', () => {
        console.log('Image insert')
        hideDialog();
    })

}


