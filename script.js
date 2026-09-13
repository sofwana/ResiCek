const API_KEY = "sk_tytmmq2pcp6xlvrflkml95bq8a1inllrohhgahsgg0nd0ibdfh4upmahpb8mfzoh";

// Menyambungkan tombol Lacak Paket dengan fungsi cekResi
document.getElementById('btn-cek').addEventListener('click', cekResi);

async function cekResi() {
    const awb = document.getElementById("awb").value.trim();
    const courier = document.getElementById("courier").value;
    const resultDiv = document.getElementById("result");
    const btnCek = document.getElementById("btn-cek");

    if (!awb) {
        resultDiv.style.display = "block";
        resultDiv.innerHTML = `<div class="error">Silakan masukkan nomor resi terlebih dahulu!</div>`;
        return;
    }

    resultDiv.style.display = "block";
    resultDiv.innerHTML = `<div class="loading">Sedang melacak paket... Mohon tunggu.</div>`;
    btnCek.disabled = true;

    try {
        const targetUrl = `https://api.binderbyte.com/v1/track?api_key=${API_KEY}&courier=${courier}&awb=${awb}`;
        
        // Proxy AllOrigins untuk melewati keamanan CORS
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
        
        const response = await fetch(proxyUrl);
        const data = await response.json();

        if (data.status !== 200) {
            const pesanError = data.message || "Resi tidak ditemukan atau kombinasi kurir salah.";
            resultDiv.innerHTML = `<div class="error"><strong>Gagal:</strong> ${pesanError}</div>`;
            btnCek.disabled = false;
            return;
        }

        const summary = data.data.summary;
        const history = data.data.history;

        let html = `
            <div class="status-box">
                <h3 style="margin-top:0; color:#28a745;">Status: ${summary.status || 'Tidak diketahui'}</h3>
                <p><strong>Kurir:</strong> ${summary.courier || '-'}</p>
                <p><strong>Pengirim:</strong> ${summary.shipper || '-'}</p>
                <p><strong>Penerima:</strong> ${summary.receiver || '-'}</p>
                <p><strong>Asal:</strong> ${summary.origin || '-'}</p>
                <p><strong>Tujuan:</strong> ${summary.destination || '-'}</p>
            </div>
            <h4>Riwayat Perjalanan:</h4>
            <ul class="timeline">
        `;

        if (history && history.length > 0) {
            history.forEach(item => {
                html += `
                    <li>
                        <span class="date">${item.date || '-'}</span>
                        <span class="desc">${item.desc || '-'}</span>
                    </li>
                `;
            });
        } else {
            html += `<li><span class="desc">Belum ada riwayat perjalanan.</span></li>`;
        }

        html += `</ul>`;
        resultDiv.innerHTML = html;

    } catch (error) {
        resultDiv.innerHTML = `
            <div class="error">
                <strong>Gagal Melacak:</strong> Terjadi kesalahan jaringan. Coba lagi dalam beberapa saat.
                <br><br>
                <small style="color: #721c24;">Detail: ${error.message}</small>
            </div>`;
        console.error("Error Detail:", error);
    } finally {
        btnCek.disabled = false;
    }
}
