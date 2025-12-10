import { Router } from 'express'
import {
    getCountries,
    getExportTradeValueMap,
    getImportTradeValueMap,
    getExportProductsTop10,
    getImportProductsTop10
} from '../services/dataService.js'

const router = Router()

router.get('/export', async (req, res) => {
    try {
        const data = await getExportTradeValueMap(req.query.country)
        if (!data) return res.status(404).json({ error: 'Country not found' })
        res.send(Object.fromEntries(Object.entries(data).slice(0, req.query.limit)))
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch export trade data' })
    }
})

router.get('/import', async (req, res) => {
    try {
        const data = await getImportTradeValueMap(req.query.country)
        if (!data) return res.status(404).json({ error: 'Country not found' })
        res.send(Object.fromEntries(Object.entries(data).slice(0, req.query.limit)))
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch import trade data' })
    }
})

router.get('/export/products', async (req, res) => {
    try {
        const data = await getExportProductsTop10(req.query.country)
        if (!data) return res.status(404).json({ error: 'Country not found' })
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch export products data' })
    }
})

router.get('/import/products', async (req, res) => {
    try {
        const data = await getImportProductsTop10(req.query.country)
        if (!data) return res.status(404).json({ error: 'Country not found' })
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch import products data' })
    }
})

router.get('/countries', async (req, res) => {
    try {
        res.json(await getCountries())
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch countries' })
    }
})

export default router