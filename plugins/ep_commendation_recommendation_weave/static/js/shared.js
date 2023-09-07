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

module.exports = {
    parseWindowEvent
}


