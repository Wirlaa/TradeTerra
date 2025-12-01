class MainClass {
    constructor() {
        this.tradeModes = ['export', 'import']
        this.selectedTradeMode = 0
        this.selectedCountry = 'Finland'
        this.selectedLimit = 50
        this.countryMaxLimit = 210
        this.darkModeOn = false
    }

    async run() {
        this.countryToTradeValueMap = await this.fetchGet(`/api/data/${this.tradeModes[this.selectedTradeMode]}/?country=${this.selectedCountry}&limit=${this.selectedLimit}`)

        this.manageCountryDropdown()
        this.manageLimitSlider()
        this.manageImportExportButtons()
        await this.manageCharts()
        this.manageDarkmode()

        this.bordersData = await this.fetchGet('data/CNTR_RG_10M_2024_4326.geojson')
        this.initMap(this.bordersData)
    }

    async fetchGet(url) {
        const response = await fetch(url)
        return response.json()
    }

    /**
     * Initiates leaflet map with custom styling
     */
    initMap(data) {
        this.map = L.map('map', {minZoom: 2, maxZoom: 5})
        this.geoJsonLayer = L.geoJSON(data, {
            onEachFeature: this.getFeature.bind(this),
            style: this.getStyle.bind(this),
            weight: 2
        }).addTo(this.map)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: 'OpenStreetMap | EuroGeographics'}).addTo(this.map)
        this.map.fitBounds(this.geoJsonLayer.getBounds())
        this.updateLimitSlider()
    }

    /**
     * Sets tooltip and popup for countries
     */
    getFeature(feature, layer) {
        const countryName = feature.properties.NAME_ENGL
        const countryTradeValue = this.countryToTradeValueMap[countryName]
        if (!countryTradeValue) return
        layer.bindPopup(Intl.NumberFormat('fr-FR').format(countryTradeValue))
    }

    /**
     * Styles country color based on trade value
     * - selected country is colored in black
     * - countries outside topX have no styling
     * - uses min max normalization ratio
     * - takes a cube root of ratio to differentiate more between lower values
     *   since usually largest trade partners have substantially bigger values
     */
    getStyle(feature) {
        if (feature.properties.NAME_ENGL === this.selectedCountry) return { color: 'black' }
        const countryTradeValue = this.countryToTradeValueMap[feature.properties.NAME_ENGL]
        if (!countryTradeValue) return { color: '' }

        const calculateRatio = (value) => {
            const values = Object.values(this.countryToTradeValueMap)
            const min = Math.min(...values)
            const max = Math.max(...values)
            return (value - min) / (max - min)
        }

        const ratio = calculateRatio(countryTradeValue)
        const hue = Math.min(120 * ( ratio ) ** (1/3), 120)
        return { color: `hsl(${hue}, 75%, 50%)` }
    }

    /**
     * Refreshes the map based on the currently selected options
     * - updates limit slider as well (to match the max limit)
     */
    async refreshMap() {
        await this.updateLimitSlider()
        this.countryToTradeValueMap = await this.fetchGet(`/api/data/${this.tradeModes[this.selectedTradeMode]}/?country=${this.selectedCountry}&limit=${this.selectedLimit}`)
        this.map.removeLayer(this.geoJsonLayer)
        this.geoJsonLayer = L.geoJSON(this.bordersData, {
            onEachFeature: this.getFeature.bind(this),
            style: this.getStyle.bind(this),
            weight: 2
        }).addTo(this.map)
    }

    /**
     * Sets up and controls the country dropdown menu
     */
    async manageCountryDropdown() {
        const select = document.getElementById('countryDropdown')
        const fragment = document.createDocumentFragment()
        const countries = await this.fetchGet(`/api/data/countries`)
        countries.sort().forEach(country => {
            const option = document.createElement('option')
            option.text = country
            option.value = country
            fragment.appendChild(option)
        })
        select.appendChild(fragment)
        select.value = this.selectedCountry

        select.addEventListener('change', async () => {
            this.selectedCountry = select.value
            this.refreshMap()
            this.refreshChart(this.exportsChart, 0)
            this.refreshChart(this.importsChart, 1)
        })
    }

    /**
     * Sets up and controls the country limit slider
     * - also controls the custom limit slider tooltip
     */
    manageLimitSlider() {
        const slider = document.getElementById('limitSlider')
        const tooltip = document.getElementById('valueTooltip')
        let sliderSteps

        this.updateLimitSlider = async () => {
            this.countryMaxLimit = Object.keys(await this.fetchGet(`/api/data/${this.tradeModes[this.selectedTradeMode]}/?country=${this.selectedCountry}`)).length
            console.log(this.countryMaxLimit)
            let originalSteps = [10, 25, 50, 100, 200]
            sliderSteps = originalSteps.filter(step => step <= this.countryMaxLimit)
            if (this.countryMaxLimit > sliderSteps[sliderSteps.length - 1]) sliderSteps.push(this.countryMaxLimit)

            slider.max = sliderSteps.length-1
            this.updateLimitTooltip()
        }

        this.updateLimitTooltip = () => {
            const index = parseInt(slider.value)
            this.selectedLimit = sliderSteps[index]
            tooltip.textContent = this.selectedLimit

            const percent = index / (sliderSteps.length - 1)
            tooltip.style.left = `${percent * slider.offsetWidth}px`
        }

        slider.addEventListener('change', async () => {
            this.updateLimitTooltip()
            this.refreshMap()
        })
    }

    /**
     * Sets up and controls the import/export buttons
     */
    manageImportExportButtons() {
        const importButton = document.getElementById('importButton')
        const exportButton = document.getElementById('exportButton')

        const switchClass = (button) => {
            if (button.classList.contains('btn-primary')) {
                button.classList.remove('btn-primary')
                button.classList.add('btn-secondary')
            } else {
                button.classList.add('btn-primary')
                button.classList.remove('btn-secondary')
            }
        }

        exportButton.addEventListener('click', () => {
            switchClass(importButton)
            switchClass(exportButton)
            this.selectedTradeMode = 0
            this.refreshMap()
        })

        importButton.addEventListener('click', () => {
            switchClass(importButton)
            switchClass(exportButton)
            this.selectedTradeMode = 1
            this.refreshMap()
        })
    }

    /**
     * Sets up and controls the charts
     * - defines a custom plugin for creating labels
     * - handles darkmode for charts
     */
    async manageCharts() {
        // Adopted to my needs from https://stackoverflow.com/a/72737734 with help of Copilot
        const labelsPlugin = {
            id: 'labelsPlugin',
            afterDatasetsDraw(chart, args, options) {
                // Apparently these are redrawn anytype a user hovers over a chart :D
                const centerX = chart.chartArea.left + chart.chartArea.width / 2
                const centerY = chart.chartArea.top + chart.chartArea.height / 2

                chart.getDatasetMeta(0).data.forEach((arc, index) => {
                    // calculate percentage and combine with label
                    const sum = chart.data.datasets[0].data.reduce((a, b) => a + b, 0)
                    const percentage = ((chart.data.datasets[0].data[index] / sum) * 100).toFixed(1) + '%'
                    const text = chart.data.labels[index] + ' (' + percentage + ')'

                    const { x, y } = arc.tooltipPosition()
                    const extraLine = x >= centerX ? 20 : -20

                    // polar coordinates
                    const midAngle = (arc.startAngle + arc.endAngle) / 2
                    const endX = centerX + Math.cos(midAngle) * (arc.outerRadius + 20)
                    const endY = centerY + Math.sin(midAngle) * (arc.outerRadius + 20)

                    // draw arrow
                    chart.ctx.fillStyle = options.color
                    chart.ctx.beginPath()
                    chart.ctx.arc(x, y, 2, 0, 2 * Math.PI, true)
                    chart.ctx.fill()
                    chart.ctx.moveTo(x, y)
                    chart.ctx.lineTo(endX, endY)
                    chart.ctx.lineTo(endX + extraLine, endY)
                    chart.ctx.strokeStyle = options.color
                    chart.ctx.stroke()

                    // draw text
                    chart.ctx.font = '16px'
                    chart.ctx.textAlign = x >= centerX ? 'left' : 'right'
                    chart.ctx.textBaseline = 'middle'
                    chart.ctx.fillStyle = options.color
                    chart.ctx.fillText(text, endX, endY - 10)
                })
            }
        }

        const createChart = async (chart, tradeMode) => {
            const products = await this.fetchGet(`/api/data/${this.tradeModes[tradeMode]}/products/?country=${this.selectedCountry}`)
            return new Chart(chart, {
                type: 'doughnut',
                data: {
                    labels: products.data.map(item => item['HS4']),
                    datasets: [{
                        data: products.data.map(item => item['Trade Value']),
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: { padding: 50, },
                    plugins: {
                        legend: {
                            display: false,
                        },
                        title: {
                            display: true,
                            text: 'Top ' + this.tradeModes[tradeMode].slice(0,6) + 's by Value',
                            position: 'bottom',
                            font: {
                                size: 18
                            },
                            padding: {
                                top: 25,
                            }
                        },
                        labelsPlugin: {
                            color: 'black'
                        }
                    },
                },
                plugins: [labelsPlugin],
            })
        }

        this.refreshChart = async (chart, tradeMode) => {
            const color = this.darkModeOn ? '#d6bf9e' : 'black'
            chart.options.plugins.labelsPlugin.color = color
            chart.options.plugins.title.color = color
            const products = await this.fetchGet(`/api/data/${this.tradeModes[tradeMode]}/products/?country=${this.selectedCountry}`)
            chart.data.labels = products.data.map(item => item['HS4'])
            chart.data.datasets[0].data = products.data.map(item => item['Trade Value'])
            chart.update()
        }

        this.exportsChart = await createChart('exportsChart', 0)
        this.importsChart = await createChart('importsChart', 1)

        document.getElementById('downloadChartsButton').addEventListener('click', () => {
            const link = document.createElement('a')
            link.download = 'imports.png'
            link.href = this.importsChart.toBase64Image()
            link.click();
            link.download = 'exports.png'
            link.href = this.exportsChart.toBase64Image()
            link.click();
        });
    }

    /**
     * Simple darkmode switching logic
     */
    manageDarkmode() {
        document.getElementById('darkmodeSwitch').addEventListener('click', () => {
            document.body.classList.toggle('dark-theme')
            this.darkModeOn = !this.darkModeOn
            this.refreshChart(this.exportsChart, 0)
            this.refreshChart(this.importsChart, 1)
        })
    }

}

async function main(){
    new MainClass().run()
}

main()
