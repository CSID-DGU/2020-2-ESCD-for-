const express = require('express');
const router = express.Router();
const CafeteriaService = require('../../service/cafeteriaService');

const cafeteriaService = new CafeteriaService();

router.get('/:id', async (req, res) => {
  try {
    const result = await cafeteriaService.findByCafeteriaId(req.params.id);

    res.status(200).json(result.cafeteria);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await cafeteriaService.findAllCafeteria();
    res.status(200).json(result.cafeteriaList);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

module.exports = router;
