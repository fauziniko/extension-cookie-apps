// background.js

// Menyimpan pengaturan MinIO di chrome.storage.local
const setMinioSettings = () => {
    const minioSettings = {
        MINIO_URL: "https://minio-gko4c8o8sw0ss0wco8c84ow0.coolify.fauziniko.my.id", // Gantilah dengan URL MinIO Anda
        ACCESS_KEY: "0TWJXiKtczuNpo9f5nHE", // Gantilah dengan ACCESS_KEY Anda
        SECRET_KEY: "HkTGfg9IMBs7tNRpl7WrGYsWXVWzv4nPlaYmtpha", // Gantilah dengan SECRET_KEY Anda
        BUCKET_NAME: "fauzi-bucket", // Gantilah dengan nama bucket Anda
        REGION: "jakarta", // Gantilah dengan region Anda
    };

    chrome.storage.local.set(minioSettings, () => {
        console.log("Pengaturan MinIO telah disimpan!");
    });
};

// Memanggil fungsi ini saat ekstensi di-load pertama kali
chrome.runtime.onInstalled.addListener(() => {
    setMinioSettings();
});

// Mengambil pengaturan MinIO dari storage lokal
const getMinioSettings = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([
            "MINIO_URL", 
            "ACCESS_KEY", 
            "SECRET_KEY", 
            "BUCKET_NAME", 
            "REGION"
        ], (settings) => {
            if (chrome.runtime.lastError) {
                reject(new Error("Gagal mengambil pengaturan MinIO"));
            } else {
                resolve(settings);
            }
        });
    });
};

// Fungsi untuk mengupload cookie ke MinIO
const uploadCookieToMinIO = (cookieData, fileName) => {
    getMinioSettings()
        .then(settings => {
            const headers = new Headers();
            headers.append("Authorization", "Bearer " + `${settings.ACCESS_KEY}:${settings.SECRET_KEY}`);
            
            const requestPayload = {
                method: "PUT",
                headers: headers,
                body: JSON.stringify(cookieData)
            };

            fetch(`${settings.MINIO_URL}/${settings.BUCKET_NAME}/${fileName}`, requestPayload)
                .then(response => {
                    if (response.ok) {
                        console.log(`Cookie untuk ${fileName} berhasil disimpan di MinIO!`);
                    } else {
                        console.log(`Gagal menyimpan cookie: ${response.statusText}`);
                    }
                })
                .catch(error => {
                    console.error("Terjadi kesalahan saat mengupload cookie ke MinIO: ", error);
                });
        })
        .catch(error => {
            console.error("Gagal mengambil pengaturan MinIO: ", error);
        });
};

// Fungsi untuk mengambil cookie dari MinIO
const getCookiesFromMinIO = (fileName) => {
    getMinioSettings()
        .then(settings => {
            const headers = new Headers();
            headers.append("Authorization", "Bearer " + `${settings.ACCESS_KEY}:${settings.SECRET_KEY}`);
            
            fetch(`${settings.MINIO_URL}/${settings.BUCKET_NAME}/${fileName}`, { method: "GET", headers })
                .then(response => response.json())
                .then(cookieData => {
                    console.log(`Cookie untuk ${fileName} berhasil dimuat.`);
                    loadCookiesToBrowser(cookieData);
                })
                .catch(error => {
                    console.error("Terjadi kesalahan saat mengambil cookie: ", error);
                });
        })
        .catch(error => {
            console.error("Gagal mengambil pengaturan MinIO: ", error);
        });
};

// Fungsi untuk memuat cookie ke browser
function loadCookiesToBrowser(cookieData) {
    for (let key in cookieData) {
        chrome.cookies.set({
            url: `https://${key}`,
            name: key,
            value: cookieData[key],
            domain: key
        });
    }
}
