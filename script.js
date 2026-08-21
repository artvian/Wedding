// ==========================================
// 1. INISIALISASI AOS ANIMATION
// ==========================================
AOS.init({
    duration: 800,      
    once: false,        
    mirror: true,       
    anchorPlacement: 'top-bottom' 
});
const audio = document.getElementById('background-music');
const btnOpen = document.getElementById('btn-open');
const overlay = document.getElementById('overlay-welcome');

// Durasi Reff: 02:15 (135 detik) sampai 03:15 (195 detik)
const startTime = 135; 
const endTime = 195;

btnOpen.addEventListener('click', function() {
    // Sembunyikan overlay welcome
    overlay.style.display = 'none';
    
    // Mulai lagu dari menit ke-02:15
    audio.currentTime = startTime;
    audio.play();
});

// Logika looping agar berhenti di detik 195 lalu balik ke 135
audio.addEventListener('timeupdate', function() {
    if (this.currentTime >= endTime) {
        this.currentTime = startTime;
        this.play();
    }
});
// ==========================================
// 2. LOGIKA COUNTDOWN TIMER (H-14 TARGET)
// ==========================================
const targetWeddingDate = new Date("september 18, 2026 08:00:00").getTime();
const countdownWrapper = document.getElementById('countdownWrapper');

function updateCountdown() {
    const now = new Date().getTime();
    const timeDifference = targetWeddingDate - now;

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    // Validasi aturan: Hanya tampil jika masuk H-14 acara
    if (days <= 30 && timeDifference > 0) {
        countdownWrapper.innerHTML = `
            <div class="countdown-container">
                <div class="countdown-box">
                    <span class="countdown-number">${days}</span>
                    <span class="countdown-label">Hari</span>
                </div>
                <div class="countdown-box">
                    <span class="countdown-number">${hours < 10 ? '0' + hours : hours}</span>
                    <span class="countdown-label">Jam</span>
                </div>
                <div class="countdown-box">
                    <span class="countdown-number">${minutes < 10 ? '0' + minutes : minutes}</span>
                    <span class="countdown-label">Menit</span>
                </div>
                <div class="countdown-box">
                    <span class="countdown-number">${seconds < 10 ? '0' + seconds : seconds}</span>
                    <span class="countdown-label">Detik</span>
                </div>
            </div>
        `;
    } else if (timeDifference <= 0) {
        countdownWrapper.innerHTML = `<p class="countdown-pre-text">Acara Sedang Berlangsung / Selesai</p>`;
    } else {
        countdownWrapper.innerHTML = `<p class="countdown-pre-text">~ Menuju Hari Bahagia ~</p>`;
    }
}

// Jalankan interval countdown tiap 1 detik
setInterval(updateCountdown, 1000);
updateCountdown();

// ==========================================
// 3. LOGIKA BUKU TAMU / ARSIP UCAPAN PERSISTEN
// ==========================================
const wishesDisplayBox = document.getElementById('wishesDisplayBox');
const wishForm = document.getElementById('wishForm');

// Fungsi pembantu untuk membuat template HTML Kartu Ucapan
function createWishCardElement(name, message, timeString) {
    const card = document.createElement('div');
    card.className = 'wish-card';
    card.innerHTML = `
        <p class="wish-card-name">👤 ${name}</p>
        <p class="wish-card-text">${message}</p>
        <p class="wish-card-time">${timeString}</p>
    `;
    return card;
}

// Fungsi memuat arsip data ucapan dari memori internal lokal browser (localStorage)
function loadSavedWishes() {
    wishesDisplayBox.innerHTML = ''; 
    const savedWishes = JSON.parse(localStorage.getItem('wedding_wishes')) || [];
    
    savedWishes.forEach(wish => {
        const card = createWishCardElement(wish.name, wish.message, wish.time);
        wishesDisplayBox.appendChild(card);
    });
}

// Event handler ketika seseorang mengirim ucapan
wishForm.addEventListener('submit', function(e) {
    e.preventDefault(); 

    const nameInput = document.getElementById('guestName').value.trim();
    const messageInput = document.getElementById('guestMessage').value.trim();

    if (!nameInput || !messageInput) return;

    // Membaca format waktu lokal komputer tamu (Contoh: "20 Mei 2026, 15.30")
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const timeString = new Date().toLocaleDateString('id-ID', options);

    // Ambil database lama, tumpuk data baru di baris teratas (index 0)
    const savedWishes = JSON.parse(localStorage.getItem('wedding_wishes')) || [];
    const newWishData = { name: nameInput, message: messageInput, time: timeString };
    savedWishes.unshift(newWishData);

    // Kunci kembali ke penyimpanan internal browser
    localStorage.setItem('wedding_wishes', JSON.stringify(savedWishes));

    // Langsung munculkan di layar saat itu juga secara real-time
    const card = createWishCardElement(nameInput, messageInput, timeString);
    wishesDisplayBox.insertBefore(card, wishesDisplayBox.firstChild);

    // Bersihkan kotak form input
    document.getElementById('guestName').value = '';
    document.getElementById('guestMessage').value = '';
    
    // Refresh deteksi animasi scroll library AOS
    AOS.refresh();
});

function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
        document.execCommand('copy');
    } catch (error) {
        return Promise.reject(error);
    } finally {
        document.body.removeChild(textArea);
    }

    return Promise.resolve();
}

document.querySelectorAll('.copy-btn').forEach(button => {
    button.addEventListener('click', async function () {
        const value = this.dataset.copy;

        try {
            await copyTextToClipboard(value);
            const originalText = this.textContent;
            this.textContent = 'Tersalin';
            this.disabled = true;

            setTimeout(() => {
                this.textContent = originalText;
                this.disabled = false;
            }, 1400);
        } catch (error) {
            this.textContent = 'Gagal';
            setTimeout(() => {
                this.textContent = 'Salin';
            }, 1200);
        }
    });
});

// Jalankan penarikan arsip ucapan otomatis ketika dokumen web selesai dimuat browser
window.addEventListener('DOMContentLoaded', loadSavedWishes);