const sections = [
    'offcanvasMain',
    'offcanvasLogin',
    'offcanvasRegister'
]

const displaySection = (sectionName) => {
    sections.forEach(id => {
        document.getElementById(id).style.display = 'none'
    })
    document.getElementById(sectionName).style.display = 'block'
}

document.getElementById('offcanvas').addEventListener('hidden.bs.offcanvas', () => {
    displaySection('offcanvasMain')
})

document.querySelectorAll('.main-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        displaySection('offcanvasMain');
    })
})

document.querySelectorAll('.login-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        displaySection('offcanvasLogin');
    })
})

document.getElementById('register-link').addEventListener('click', (e) => {
    e.preventDefault()
    displaySection('offcanvasRegister')
})


