
const modalContainer = document.getElementById('modal-container');
const subscribeButtons = document.querySelectorAll('.subscribe-btn');

const calendarInfo = {
    waste: {
        title: "Hulladéknaptár",
        fileName: "martonvasar_hulladek",
        icon: "fa-recycle",
        color: "var(--marton-blue)"
    },
    nameday: {
        title: "Magyar Névnapok",
        fileName: "magyar_nevnapok",
        icon: "fa-cake-candles",
        color: "var(--marton-green)"
    }
};

function showSubscriptionModal(calendarType, year) {
    const info = calendarInfo[calendarType];
    if (!info) return;

    const calendarUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname.replace('index.html', '')}data/${info.fileName}_${year}.ics`;

    const modalHtml = `
        <div class="modal-overlay">
            <div class="modal-content">
                <button class="modal-close-btn">&times;</button>
                <div class="modal-header" style="--card-color: ${info.color};">
                    <i class="fa-solid ${info.icon}"></i>
                    <h2>${info.title} ${year}</h2>
                </div>
                <div class="modal-body">
                    <p>A naptárra való feliratkozáshoz használja az alábbi URL-t. A legtöbb naptáralkalmazás (Google, Apple, Outlook) támogatja naptárak hozzáadását URL-ből.</p>
                    
                    <div class="url-container">
                        <input type="text" id="calendar-url-input" value="${calendarUrl}" readonly>
                        <button id="copy-url-btn" title="URL Másolása"><i class="fa-solid fa-copy"></i></button>
                    </div>
                    <div id="copy-feedback" class="copy-feedback">URL a vágólapra másolva!</div>

                    <h3>Segédlet a feliratkozáshoz</h3>
                    <div class="instructions">
                        <p><strong><i class="fa-brands fa-google"></i> Google Naptár (számítógépen):</strong></p>
                        <ol>
                            <li>Nyissa meg a Google Naptárat.</li>
                            <li>A bal oldali menüben, a "Más naptárak" mellett kattintson a <strong>+</strong> jelre.</li>
                            <li>Válassza az "<strong>URL-ből</strong>" opciót.</li>
                            <li>Illessze be a fent kimásolt URL-t, és kattintson a "Naptár felvétele" gombra.</li>
                        </ol>
                    </div>
                     <div class="instructions">
                        <p><strong><i class="fa-brands fa-apple"></i> Apple Naptár (iPhone/iPad):</strong></p>
                        <ol>
                            <li>Lépjen a Beállítások > Naptár > Fiókok > Fiók hozzáadása menüpontba.</li>
                            <li>Válassza az "<strong>Egyéb</strong>", majd az "<strong>Előfizetett naptár hozzáadása</strong>" lehetőséget.</li>
                            <li>Illessze be a kimásolt URL-t a "Szerver" mezőbe, majd koppintson a "Tovább" gombra.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    `;
    modalContainer.innerHTML = modalHtml;
    attachModalEvents();
}

function attachModalEvents() {
    const overlay = document.querySelector('.modal-overlay');
    const closeBtn = document.querySelector('.modal-close-btn');
    const copyBtn = document.getElementById('copy-url-btn');

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    });

    closeBtn.addEventListener('click', closeModal);

    copyBtn.addEventListener('click', () => {
        const urlInput = document.getElementById('calendar-url-input');
        navigator.clipboard.writeText(urlInput.value).then(() => {
            const feedback = document.getElementById('copy-feedback');
            feedback.classList.add('visible');
            setTimeout(() => {
                feedback.classList.remove('visible');
            }, 2000);
        });
    });
}

function closeModal() {
    modalContainer.innerHTML = '';
}

subscribeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const calendarType = button.dataset.calendar;
        const year = button.dataset.year;
        showSubscriptionModal(calendarType, year);
    });
});
