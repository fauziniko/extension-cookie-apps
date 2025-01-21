document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get([
        "MINIO_URL", 
        "ACCESS_KEY", 
        "SECRET_KEY", 
        "BUCKET_NAME", 
        "REGION"
    ], (settings) => {
        document.getElementById("minio-url").innerText = settings.MINIO_URL || "Belum diatur";
        document.getElementById("bucket-name").innerText = settings.BUCKET_NAME || "Belum diatur";
    });

    document.getElementById("add-app-form").addEventListener("submit", (event) => {
        event.preventDefault();

        const appName = document.getElementById("app-name").value;
        const appUrl = document.getElementById("app-url").value;
        const appIcon = document.getElementById("app-icon").files[0];

        if (appIcon) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const appData = {
                    name: appName,
                    url: appUrl,
                    icon: e.target.result
                };

                chrome.storage.local.get("apps", (result) => {
                    const apps = result.apps || [];
                    apps.push(appData);
                    chrome.storage.local.set({ apps }, () => {
                        renderApps();
                        showMessage('Aplikasi berhasil ditambahkan!', 'success');
                    });
                });
            };
            reader.readAsDataURL(appIcon);
        } else {
            showMessage('Harap pilih ikon aplikasi!', 'error');
        }
    });

    function renderApps() {
        chrome.storage.local.get("apps", (result) => {
            const apps = result.apps || [];
            const appsContainer = document.getElementById("apps-container");
            appsContainer.innerHTML = '';

            apps.forEach((app, index) => {
                const appElement = document.createElement("div");
                appElement.classList.add('app-item');
                appElement.innerHTML = `
                    <img src="${app.icon}" alt="${app.name}" class="app-icon"/>
                    <a href="${app.url}" target="_blank" class="app-link">${app.name}</a>
                    <button data-index="${index}" class="delete-btn">Hapus</button>
                `;
                appsContainer.appendChild(appElement);

                appElement.querySelector(".delete-btn").addEventListener("click", () => {
                    removeApp(index);
                });
            });
        });
    }

    function removeApp(index) {
        chrome.storage.local.get("apps", (result) => {
            const apps = result.apps || [];
            apps.splice(index, 1);
            chrome.storage.local.set({ apps }, () => {
                renderApps();
                showMessage('Aplikasi berhasil dihapus!', 'success');
            });
        });
    }

    function showMessage(message, type) {
        alert(message);
    }

    renderApps();
});
