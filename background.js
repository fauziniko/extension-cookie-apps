chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveCookies") {
        chrome.cookies.getAll({ domain: request.domain }, (cookies) => {
            if (chrome.runtime.lastError) {
                sendResponse({ message: `Error: ${chrome.runtime.lastError.message}` });
                return;
            }

            let cookieData = {};
            cookies.forEach(cookie => {
                cookieData[cookie.name] = cookie.value;
            });

            chrome.storage.local.set({ [request.name]: cookieData }, () => {
                sendResponse({ message: `Cookies untuk ${request.name} telah disimpan!` });
            });
        });

        return true; // Keep the message channel open for async response
    }

    if (request.action === "loadCookies") {
        chrome.storage.local.get([request.name], (data) => {
            if (data[request.name]) {
                for (let key in data[request.name]) {
                    chrome.cookies.set({
                        url: `https://${request.domain}`,
                        name: key,
                        value: data[request.name][key],
                        domain: request.domain
                    }, (cookie) => {
                        if (chrome.runtime.lastError) {
                            sendResponse({ message: `Error: ${chrome.runtime.lastError.message}` });
                            return;
                        }
                    });
                }
                sendResponse({ message: `Cookies untuk ${request.name} telah dimuat!` });
            } else {
                sendResponse({ message: `Tidak ada cookies yang tersimpan untuk ${request.name}.` });
            }
        });

        return true; // Keep the message channel open for async response
    }
});
