const form = document.querySelector('.login-form')
const loader = document.querySelector('.loader')
const error = document.querySelector('.error')
const box = document.querySelector('.login-box')

const VALID_USER = 'mngr'
const VALID_PASS = 'kPbRzN9F88AkELJEzA2#4W@bBSfEa87BbPjaTvMc'
const TOKEN_KEY = 'cslckrmngr_token'

if (localStorage.getItem(TOKEN_KEY)) {
    window.location.href = '/home'
}

form.addEventListener('submit', e => {
    e.preventDefault()
    error.classList.add('hidden')
    loader.classList.remove('hidden')

    const user = document.getElementById('username').value
    const pass = document.getElementById('password').value

    setTimeout(() => {
        loader.classList.add('hidden')

        if (user === VALID_USER && pass === VALID_PASS) {
            const token = crypto.randomUUID()
            localStorage.setItem(TOKEN_KEY, token)
            window.location.href = `/home?token=${token}`
        } else {
            error.classList.remove('hidden')
            box.classList.add('shake')
            setTimeout(() => box.classList.remove('shake'), 400)
        }
    }, 1500)
})
