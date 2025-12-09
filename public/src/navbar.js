const sections = [
    'offcanvasMain',
    'offcanvasLogin',
    'offcanvasRegister',
    'offcanvasLoggedIn',
    'offcanvasAbout',
]

const displaySection = (sectionName) => {
    sections.forEach(id => {
        document.getElementById(id).style.display = 'none'
    })
    document.getElementById(sectionName).style.display = 'block'
}

if (localStorage.getItem("token")) {
    document.getElementById("usernameText").innerText = localStorage.getItem("username")
    displaySection('offcanvasLoggedIn')
} else displaySection('offcanvasMain')

document.getElementById('offcanvas').addEventListener('hidden.bs.offcanvas', () => {
    console.log('wut')
    if (localStorage.getItem("token")) displaySection('offcanvasLoggedIn')
    else displaySection('offcanvasMain')
})

document.querySelectorAll('.main-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault()
        if (localStorage.getItem("token")) displaySection('offcanvasLoggedIn')
        else displaySection('offcanvasMain')
    })
})

document.querySelectorAll('.login-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault()
        displaySection('offcanvasLogin')
    })
})

document.querySelectorAll('.about-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault()
        displaySection('offcanvasAbout')
    })
})

document.getElementById('register-link').addEventListener('click', (e) => {
    e.preventDefault()
    displaySection('offcanvasRegister')
})

document.getElementById("registerForm").addEventListener("submit", async e => {
    e.preventDefault()
    const formData = {
        username: e.target.registerUsername.value,
        password: e.target.registerPassword.value,
        confirmPassword: e.target.registerConfirmPassword.value,
    }
    try {
        const response = await fetch("/api/user/register",  {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
        if (!response.ok) console.log(`Error when trying to register: ${await response.json()}. Please try again.`)
        else displaySection('offcanvasLogin')
    } catch (error) {
        console.log(`Error while trying to register: ${error.message}`)
    }
})

document.getElementById("loginForm").addEventListener("submit", async e => {
    e.preventDefault()

    const formData = {
        username: e.target.loginUsername.value,
        password: e.target.loginPassword.value,
    }
    try {
        const response = await fetch("/api/user/login",  {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
        if (!response.ok) console.log(`Error when trying to login: ${await response.json()}. Please try again.`)
        else {
            const data = await response.json()
            if (data.token) {
                localStorage.setItem("token", data.token)
                localStorage.setItem("username", e.target.loginUsername.value)
                displaySection('offcanvasLoggedIn')
                document.getElementById("usernameText").innerText = e.target.loginUsername.value
            }
        }
    } catch (error) {
        console.log(`Error while trying to login: ${error.message}`)
    }
})

document.getElementById('logout-link').addEventListener('click', (e) => {
    e.preventDefault()
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    displaySection('offcanvasMain')
})
