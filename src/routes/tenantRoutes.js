const express = require('express');
const router = express.Router();
const tenantsController = require('../controllers/tenantsController');

router.post('/', tenantsController.createTenant);

module.exports = router;