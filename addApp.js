document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("addAppForm");
    const appNameInput = document.getElementById("appName");
    const appIconInput = document.getElementById("appIcon");
    const appDomainInput = document.getElementById("appDomain");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Get form data
        const appName = appNameInput.value;
        const appIcon = appIconInput.files[0];
        const appDomain = appDomainInput.value;

        if (appIcon && appName && appDomain) {
            // Convert the icon image to base64
            const reader = new FileReader();
            reader.onloadend = function () {
                const iconBase64 = reader.result;

                // Get the current apps from storage
                chrome.storage.local.get(["apps"], (result) => {
                    const apps = result.apps || [];

                    // Add new app to the list
                    apps.push({
                        name: appName,
                        domain: appDomain,
                        icon: iconBase64
                    });

                    // Save the updated apps list back to storage
                    chrome.storage.local.set({ apps }, () => {
                        alert("Aplikasi berhasil ditambahkan!");
                        // Optionally, redirect back to the popup page
                        window.location.href = "popup.html";
                    });
                });
            };
            reader.readAsDataURL(appIcon);
        } else {
            alert("Semua kolom harus diisi!");
        }
    });
});
