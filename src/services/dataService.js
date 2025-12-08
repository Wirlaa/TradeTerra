// variables
/**
 * countryName: {
 *     cached: bool,
 *     countryID: string,
 *     exportTradeValueMap: {},
 *     importTradeValueMap: {},
 *     exportProductsTop10: {},
 *     importProductsTop10: {},
 * }
 */
const countryCache = {}
const tradeModes = ['Exporter', 'Importer']

// functions
/**
 * TBA
 * - missing error handling
 */
const fetchGet = async(url) => {
    const response = await fetch(url)
    return response.json()
}

/**
 * Maps country names to their BACI string ID
 * - technically fetches exporter countries, but conveniently importer countries are the same
 */
const initializeCountryCache = async () => {
    const countryData = await fetchGet('https://api-v2.oec.world/tesseract/data.jsonrecords?cube=trade_i_baci_a_22&drilldowns=Exporter+Country&measures=&include=Year:2023')
    countryData.data.forEach(entry => {
        countryCache[entry['Exporter Country']] = {
            countryID: entry['Exporter Country ID'],
        }
    })
    countryCache["countries"] = countryData.data.map(entry => entry['Exporter Country']);
}

/**
 * Fetches top 10 HS4 product categories for country specified by countryID
 * - switches based on trade mode (Import/Export)
 */
const getTop10Products = async (countryID, tradeMode) => {
    return fetchGet(`https://api-v2.oec.world/tesseract/data.jsonrecords?cube=trade_i_baci_a_22&drilldowns=HS4&measures=Trade+Value&include=${tradeModes[tradeMode]}+Country:${countryID},Year:2023&sort=Trade+Value.desc&limit=10,0`)
}

/**
 * Maps country names to their BACI export Trade Value for country specified by countryID
 * - switches based on trade mode (Import/Export)
 * - fetches for:
 * --- desc sorted values
 */
const getTradeValueMap = async (countryID, tradeMode) => {
    const tradeValueUrl = `https://api-v2.oec.world/tesseract/data.jsonrecords?cube=trade_i_baci_a_22&drilldowns=Exporter+Country,Importer+Country&measures=Trade+Value
            &include=${tradeModes[tradeMode]}+Country:${countryID},Year:2023&sort=Trade+Value.desc`
    const tradeValueData = await fetchGet(tradeValueUrl)
    return tradeValueData.data.reduce((map, entry) => {
        map[entry[tradeModes[1 - tradeMode] + ' Country']] = entry['Trade Value']
        return map
    }, {})
}

//code
const init = initializeCountryCache()

export const getExportTradeValueMap = async (country) => {
    await init
    const countryData = countryCache[country]

    if (countryData.exportTradeValueMap) {
        console.log("cache hit ex", country)
        return countryData.exportTradeValueMap
    }
    try {
        countryData.exportTradeValueMap = await getTradeValueMap(countryData.countryID, 0)
        return countryData.exportTradeValueMap
    } catch (err) {
        console.log(err)
        throw new Error(`API request failed`);
    }
}

export const getImportTradeValueMap = async (country) => {
    await init
    const countryData = countryCache[country]

    if (countryData.importTradeValueMap) {
        console.log("cache hit im", country)
        return countryData.importTradeValueMap
    }
    try {
        countryData.importTradeValueMap = await getTradeValueMap(countryData.countryID, 1)
        return countryData.importTradeValueMap
    } catch (err) {
        console.log(err)
        throw new Error(`API request failed`);
    }
}

export const getExportProductsTop10 = async (country) => {
    await init
    const countryData = countryCache[country]

    if (countryData.exportProductsTop10) {
        console.log("cache hit ex p", country, countryData.countryID)
        return countryData.exportProductsTop10
    }
    try {
        countryData.exportProductsTop10 = await getTop10Products(countryData.countryID, 0)
        return countryData.exportProductsTop10
    } catch (err) {
        console.log(err)
        throw new Error(`API request failed`);
    }
}

export const getImportProductsTop10 = async (country) => {
    await init
    const countryData = countryCache[country]

    if (countryData.importProductsTop10) {
        console.log("cache hit im p", country)
        return countryData.importProductsTop10
    }
    try {
        countryData.importProductsTop10 = await getTop10Products(countryData.countryID, 1)
        return countryData.importProductsTop10
    } catch (err) {
        console.log(err)
        throw new Error(`API request failed`);
    }
}

export const getCountries = async () => {
    return countryCache['countries']
}
