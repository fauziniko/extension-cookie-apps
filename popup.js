document.addEventListener("DOMContentLoaded", () => {
    // Memuat data aplikasi dari chrome.storage
    chrome.storage.local.get(['apps'], (result) => {
        const apps = result.apps || [];
        displayApps(apps);
    });

    const addAppForm = document.getElementById("add-app-form");
    addAppForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document.getElementById("app-name").value;
        const link = document.getElementById("app-link").value;
        const iconFile = document.getElementById("app-icon").files[0];
        
        const reader = new FileReader();
        reader.onloadend = () => {
            const icon = reader.result;

            const newApp = { name, link, icon };
            chrome.storage.local.get(['apps'], (result) => {
                const apps = result.apps || [];
                apps.push(newApp);
                chrome.storage.local.set({ apps }, () => {
                    displayApps(apps);
                });
            });
        };

        if (iconFile) {
            reader.readAsDataURL(iconFile);
        }
    });

    function displayApps(apps) {
        let appsContainer = document.getElementById("apps-container");
        appsContainer.innerHTML = ""; // Clear existing apps

        apps.forEach((app, index) => {
            let appElement = document.createElement("div");
            appElement.className = "app";
            appElement.innerHTML = `
                <img src="${app.icon}" alt="${app.name}">
                <span>${app.name}</span>
            `;

            appElement.addEventListener("click", () => {
                document.getElementById("options-container").style.display = "block";
                document.getElementById("save-cookie").onclick = () => saveCookies(app);
                document.getElementById("open-app").onclick = () => openApp(app);
                document.getElementById("update-app").onclick = () => updateApp(index);
                document.getElementById("delete-app").onclick = () => deleteApp(index);
            });

            appsContainer.appendChild(appElement);
        });
    }

    function saveCookies(app) {
        chrome.runtime.sendMessage({ action: "saveCookies", name: app.name, domain: app.link }, (response) => {
            alert(response.message);
        });
    }

    function openApp(app) {
        chrome.runtime.sendMessage({ action: "loadCookies", name: app.name, domain: app.link }, (response) => {
            alert(response.message);
        });
        window.open(app.link, "_blank");
    }

    function updateApp(index) {
        chrome.storage.local.get(['apps'], (result) => {
            const apps = result.apps || [];
            const appToUpdate = apps[index];

            const name = prompt("Perbarui Nama Aplikasi:", appToUpdate.name);
            const link = prompt("Perbarui Link Aplikasi:", appToUpdate.link);

            const iconFile = prompt("Perbarui Ikon Aplikasi (masukkan URL gambar baru):");
            const icon = iconFile ? iconFile : appToUpdate.icon;

            if (name && link) {
                apps[index] = { name, link, icon };
                chrome.storage.local.set({ apps }, () => {
                    displayApps(apps);
                });
            }
        });
    }

    function deleteApp(index) {
        chrome.storage.local.get(['apps'], (result) => {
            const apps = result.apps || [];
            apps.splice(index, 1);
            chrome.storage.local.set({ apps }, () => {
                displayApps(apps);
            });
        });
    }
});
