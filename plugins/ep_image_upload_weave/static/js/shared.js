function parseWindowEvent(cd) {
    window.addEventListener(
        "message",
        (event) => {
            const target = event.data.target;
            const data = event.data.data;

            // Maybe add this check later
            // if (event.origin !== "https://w4s.sitefpo.com") return;

            if (target === "ace_inner") {
                cd(data);
            }
        },
        false,
    );
}

function sendWindowEvent(file) {
    window.parent.postMessage({
        target: 'etherpad-editor',
        files: file
    }, 'https://w4s.sitefpo.com');
}

module.exports = {
    parseWindowEvent,
    sendWindowEvent
}


