const express = require('express');
const router = express.Router();

let visitors = [];
let locations = [];
let permissionDenials = [];

function isUniqueVisitor(ip) {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    return !visitors.find(v => v.ip === ip && new Date(v.timestamp) > thirtyMinutesAgo);
}

router.get('/images', (req, res) => {
    const referer = req.headers.referer || '';
    const ip = req.ip;

    if (!referer.includes('/admin') && isUniqueVisitor(ip)) {
        visitors.push({ ip, timestamp: new Date().toISOString() });
    }

    res.json([
        // Your image URLs
    ]);
});

router.post('/location', (req, res) => {
    const { latitude, longitude } = req.body;
    locations.push({ ip: req.ip, latitude, longitude, timestamp: new Date().toISOString() });
    res.json({ success: true });
});

router.post('/permission-denial', (req, res) => {
    permissionDenials.push({ ip: req.ip, timestamp: new Date().toISOString() });
    res.json({ success: true });
});

router.get('/visitors', (req, res) => res.json(visitors));
router.get('/locations', (req, res) => res.json(locations));
router.get('/permission-denials', (req, res) => res.json(permissionDenials));

module.exports = router;
