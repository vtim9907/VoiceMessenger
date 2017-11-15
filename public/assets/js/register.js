if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/serviceWorker.js')
    .then(reg => {
        console.log("Service worker has registered.");
    }).catch(err => {
        console.log("Failed to register service worker: ", err);
    })
} else {
    console.log("Does not support service worker.");
}
