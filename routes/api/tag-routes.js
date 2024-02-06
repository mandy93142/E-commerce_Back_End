const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  try {
    const tagData = await Tag.findAll({
      include: [{
        model: Product,
        through: ProductTag
      }]
    });
    if(!tagData) {
      res.status(400).json({ message: "no tags" })
      return
    }
    res.status(200).json(tagData);
  } catch(err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tagData = await Tag.findOne({
      where: {
        id: req.params.id
      },
      include: [{
        model: Product,
        through: ProductTag
      }]
    });
    if(!tagData) {
      res.status(400).json({ message: "no tag with that id" })
      return
    }
    res.status(200).json(tagData);
  } catch(err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  try {
    const newtagData = await Tag.create(req.body);

    res.status(200).json(tagData)
  } catch(err) {
    res.status(500).json(err);
  }
})

router.put('/:id', async (req, res) => {
  try {
    const tagData = await Tag.update(req.body, {
      where: {
        id: req.params.id
      }
    });
    res.status(200).json(tagData);
  } catch(err) {
    res.status(400).json(err);
  };
});

router.delete('/:id', async (req, res) => {
  try {
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id
      }
    });
    if(tagData) {
      res.status(200).json({ status: `deleted tag id = ${req.params.id}`})
    } else {
      res.status(400).json({ status: `no tag of id = ${req.params.id}`})
    }

  } catch(err) {
    res.status(400).json(err);
  };
});

module.exports = router;
