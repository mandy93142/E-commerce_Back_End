const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    const productData = await Product.findAll({
      include: [Category, {
        model: Tag,
        through: ProductTag
      }]
    });
    if(!productData) {
      res.status(400).json({ message: "no products" })
      return
    }
    res.status(200).json(productData);
  } catch(err) {
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    const newproductData = await Product.findOne({
      where: {
        id: req.params.id
      },
      include: [Category, {
        model: Tag,
        through: ProductTag
      }]
    });
    if(!productData) {
      res.status(400).json({ message: "no product with that id" })
      return
    }
    res.status(200).json(productData);
  } catch(err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
  try {
    const newproductData = await Product.create(req.body);
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArray = req.body.tagIds.map((tag_id) =>{
        return {
          product_id: newproductData.id,
          tag_id
        }
      });
      const productTagData = await ProductTag.bulkCreate(productTagIdArray);
      res.status(200).json({ tags: productTagData})
    };
    res.status(200).json(newproductData);
  } catch(err) {
    res.status(400).json(err);
  };

  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {

        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
            .filter((tag_id) => !productTagIds.includes(tag_id))
            .map((tag_id) => {
              return {
                product_id: req.params.id,
                tag_id,
              };
            });

          // figure out which ones to remove
          const productTagsToRemove = productTags
            .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
            .map(({ id }) => id);
          // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id',async (req, res) => {
  try {
    const categoryData = await Product.destroy({
      where: {
        id: req.params.id
      }
    });
    if(productData) {
      res.status(200).json({ status: `deleted product id = ${req.params.id}`})
    } else {
      res.status(400).json({ status: `no product of id = ${req.params.id}`})
    }

  } catch(err) {
    res.status(400).json(err);
  };
});

module.exports = router;
