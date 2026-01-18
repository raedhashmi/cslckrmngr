const form = document.querySelector('.login-form')
const loader = document.querySelector('.loader')
const error = document.querySelector('.error')
const box = document.querySelector('.login-box')

async function POST(payload = {}) {
    const res = await fetch("https://cslckrwbcl.lrdevstudio.com/messages", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })

    return res.json()
}


form.addEventListener('submit', async e => {
    e.preventDefault()
    error.classList.add('hidden')
    loader.classList.remove('hidden')

    const user = document.getElementById('username').value
    const pass = document.getElementById('password').value

    const sessionid = await POST({ verify_creds: { "username": user, "password": pass } })
    loader.querySelector('span').innerText = 'TALKING TO SERVER'

    setTimeout(async () => {
        loader.classList.add('hidden')

        if (sessionid.sessionid) {
            localStorage.setItem('autoRefresh', 'false')
            localStorage.setItem('bootScreen', 'true')
            localStorage.setItem('flicker', 'true')
            localStorage.setItem('autoRefresh', 'false')
            window.location.href = `/home`
        } else {
            error.classList.remove('hidden')
            box.classList.add('shake')
            setTimeout(() => box.classList.remove('shake'), 400)
        }
    }, 1500)
})
