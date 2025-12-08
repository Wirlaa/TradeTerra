let names = []
const modes = {
    game: [0, 'country', 'product'],
    trade: [0, 'export', 'import']
}
let selectedCountry = 'Finland'
const countryNameToCodeMap = {}

const initNames = async () => {
    let response
    if (modes.game[0] === 0) {
        response = await (await fetch(`/api/data/${modes.trade[modes.trade[0] + 1]}/?country=${selectedCountry}&limit=5`)).json()
        response = Object.keys(response)
    }
    else {
        response = await (await fetch(`/api/data/${modes.trade[modes.trade[0]+1]}/products/?country=${selectedCountry}`)).json()
        response = response.data.map(entry => entry['HS4']).slice(0,5)
    }
    names = response
    updateTiles()
}

const initCodeMap = async () => {
    const response = await (await fetch('https://flagcdn.com/en/codes.json')).json()
    for (let code in response) {
        const name = response[code]
        countryNameToCodeMap[name] = code
    }
}

const shuffleTiles = () => {
    const list = document.getElementById("tiles")
    const tiles = Array.from(list.children)
    // Fisher–Yates shuffle
    for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]]
    }
    tiles.forEach(tile => list.appendChild(tile))
}

const manageButtons = (buttonAName, buttonBName, modes) => {
    const buttonA = document.getElementById(buttonAName)
    const buttonB = document.getElementById(buttonBName)

    const switchClass = (button) => {
        if (button.classList.contains('btn-primary')) {
            button.classList.remove('btn-primary')
            button.classList.add('btn-secondary')
        } else {
            button.classList.add('btn-primary')
            button.classList.remove('btn-secondary')
        }
    }

    buttonA.addEventListener('click', () => {
        if (modes[modes[0]+1] === buttonAName) return
        switchClass(buttonA)
        switchClass(buttonB)
        modes[0] = 0
        initNames()
    })

    buttonB.addEventListener('click', () => {
        if (modes[modes[0]+1] === buttonBName) return
        switchClass(buttonA)
        switchClass(buttonB)
        modes[0] = 1
        initNames()
    })
}

const manageCountryDropdown = async () => {
    const select = document.getElementById('dropdown')
    const fragment = document.createDocumentFragment()
    const countries = await (await fetch(`/api/data/countries`)).json()
    console.log(await (await fetch(`https://flagcdn.com/en/codes.json`)).json())
    countries.sort().forEach(country => {
        const option = document.createElement('option')
        option.text = country
        option.value = country
        fragment.appendChild(option)
    })
    select.appendChild(fragment)
    select.value = selectedCountry

    select.addEventListener('change', async () => {
        selectedCountry = select.value
        initNames()
        updateFlag(selectedCountry)
    })
}

const updateFlag = (countryName) => {
    const flag = document.getElementById('flag')
    const code = countryNameToCodeMap[countryName]
    if (code) flag.src = `https://flagcdn.com/w40/${code}.png`
    else {flag.src = '../images/flag_blank.png'}
}

const updateTiles = () => {
    document.querySelectorAll("#tiles .tile").forEach(async (tile, i) => {
        tile.textContent = names[i]
        tile.classList.remove('bg-success')
        shuffleTiles()
    })
}

new Sortable(tiles, {
    animation: 150,
    ghostClass: "bg-light",
    onMove: (e) => {
        e.dragged.classList.remove('bg-success')
        e.related.classList.remove('bg-success')
    }
})

document.getElementById("submit").addEventListener("click", () => {
    const tiles = Array.from(document.getElementById("tiles").children)
    const currentOrder = tiles.map(item => item.textContent)
    console.log(currentOrder.every((name, i) => name === names[i]))

    tiles.forEach((tile, i) => {
        if (tile.textContent === names[i]) {
            tile.classList.add('bg-success')
        } else {
            tile.classList.remove('bg-success')
        }
    })
})

initNames()
initCodeMap()
manageButtons('country', 'product', modes.game)
manageButtons('export', 'import', modes.trade)
manageCountryDropdown()
