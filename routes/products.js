var express = require('express');
var router = express.Router();
let { RandomToken } = require('../utils/GenToken')
let { data } = require('../utils/data')
let slugify = require('slugify')
let { IncrementalId } = require('../utils/IncrementalIdHandler')

/* GET users listing. */
///api/v1/products
router.get('/', function (req, res, next) {
  let titleQ = req.query.title ? req.query.title : '';
  let maxPrice = req.query.maxPrice ? req.query.maxPrice : 1E4;
  let minPrice = req.query.minPrice ? req.query.minPrice : 0;
  let categoryName = req.query.category ? req.query.category : '';
  let result = data.filter(function (e) {
    return (!e.isDeleted) &&
      e.title.toLowerCase().includes(titleQ.toLowerCase())
      && e.price > minPrice
      && e.price < maxPrice
      && e.category.name.toLowerCase().includes(categoryName.toLowerCase())
  })
  res.send(result);
});
router.get('/slug/:slug', function (req, res, next) {
  let slug = req.params.slug;
  let result = data.find(
    function (e) {
      return (!e.isDeleted) && e.slug == slug;
    }
  )
  if (result) {
    res.status(200).send(result)
  } else {
    res.status(404).send({
      message: "SLUG NOT FOUND"
    })
  }
});
///api/v1/products/1
router.get('/:id', function (req, res, next) {
  let result = data.find(
    function (e) {
      return (!e.isDeleted) && e.id == req.params.id
    }
  );
  if (result) {
    res.status(200).send(result)
  } else {
    res.status(404).send({
      message: "ID NOT FOUND"
    })
  }
});
router.post('/', function (req, res, next) {
  let newObj = {
    id: IncrementalId(data),
    title: req.body.title,
    slug: slugify(req.body.title, {
      replacement: '-', lower: true, locale: 'vi',
    }),
    price: req.body.price,
    description: req.body.description,
    category: req.body.categoryId,
    images: req.body.images,
    creationAt: new Date(Date.now()),
    updatedAt: new Date(Date.now())
  }
  res.send(newObj);
})
router.put('/:id', function (req, res, next) {
  let result = data.find(
    function (e) {
      return e.id == req.params.id
    }
  );
  if (result) {
    //res.status(200).send(result)
    let body = req.body;
    let keys = Object.keys(body);
    for (const key of keys) {
      if (result[key]) {
        result[key] = body[key];
      }
    }
    res.send(result)
  } else {
    res.status(404).send({
      message: "ID NOT FOUND"
    })
  }
})
router.delete('/:id', function (req, res, next) {
  let result = data.find(
    function (e) {
      return e.id == req.params.id
    }
  );
  if (result) {
    //res.status(200).send(result)
    result.isDeleted = true;
    res.send(result)
  } else {
    res.status(404).send({
      message: "ID NOT FOUND"
    })
  }
})

module.exports = router;
