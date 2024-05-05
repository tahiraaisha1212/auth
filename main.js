const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// Fungsi untuk membaca dan menghubungkan WebSocket dari file teks
async function readAndConnectWebSocket(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        // Loop melalui setiap dua baris untuk membaca pasangan wsUrl dan authHeader
        for (let i = 0; i < lines.length; i += 2) {
            const wsUrl = lines[i].trim();
            const authHeaderEncoded = lines[i + 1].trim();

            console.log(`WebSocket URL from file (${path.basename(filePath)}):`, wsUrl);
            console.log(`Auth Header (encoded) from file (${path.basename(filePath)}):`, authHeaderEncoded);

            // Decode authHeaderEncoded
            const authHeader = decodeAuthHeader(authHeaderEncoded);

            // Memanggil fungsi connectWebSocket dengan wsUrl dan authHeader yang sudah didekode
            connectWebSocket(wsUrl, authHeader);
        }
    } catch (error) {
        console.error(`Error reading or connecting WebSocket for ${path.basename(filePath)}:`, error.message);
    }
}

// Fungsi untuk melakukan koneksi WebSocket
function connectWebSocket(wsUrl, authHeader) {
    try {
        const ws = new WebSocket(wsUrl, {
            headers: {
                'X-Livestreaming-Auth': authHeader
            }
        });

        // Event saat koneksi terbuka
        ws.on('open', () => {
            console.log('Connected to WebSocket server');
        });

        // Event saat menerima pesan
        ws.on('message', (data) => {
            console.log('Received message:', data);
        });

        // Event saat terjadi kesalahan
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });

        // Event saat koneksi ditutup
        ws.on('close', () => {
            console.log('WebSocket connection closed');
            // Reconnect after a delay
            setTimeout(() => {
                console.log('Reconnecting WebSocket...');
                connectWebSocket(wsUrl, authHeader); // Lakukan koneksi ulang dengan wsUrl dan authHeader
            }, 3000); // Ulang koneksi setelah 3 detik
        });
    } catch (error) {
        console.error('Error connecting WebSocket:', error.message);
    }
}

// Fungsi untuk mendekode header dari format URL-encoded
function decodeAuthHeader(encodedHeader) {
    const decodedHeader = decodeURIComponent(encodedHeader);
    return decodedHeader;
}

// Direktori tempat file teks berada
const directoryPath = 'data'; // Sesuaikan dengan path ke direktori Anda

// Baca semua file teks dalam direktori
fs.readdir(directoryPath, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    // Filter hanya file dengan ekstensi .txt (file teks)
    const textFiles = files.filter(file => path.extname(file) === '.txt');

    // Loop melalui setiap file teks
    textFiles.forEach((file) => {
        const filePath = path.join(directoryPath, file);
        readAndConnectWebSocket(filePath);
    });
});
