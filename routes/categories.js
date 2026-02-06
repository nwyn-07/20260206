var express = require('express');
var router = express.Router();
let { data, categories: exportedCategories } = require('../utils/data')
let slugify = require('slugify')

// initialize categories list from exported `categories` if present,
// otherwise derive from products' category objects
let categories = (function () {
  if (Array.isArray(exportedCategories)) return exportedCategories;
  const map = new Map();
  data.forEach(p => {
    if (p.category && !p.category.isDeleted) map.set(p.category.id, p.category);
  });
  return Array.from(map.values());
})();

function nextCategoryId() {
  if (!categories.length) return 1;
  return Math.max(...categories.map(c => c.id)) + 1;
}

// GET /api/v1/categories/:id/products
// Optional query: ?name=searchText  (filters product title)
router.get('/:id/products', function (req, res, next) {
  const catId = Number(req.params.id);
  const nameQ = req.query.name ? req.query.name.toLowerCase() : '';
  const result = data.filter(function (e) {
    return (!e.isDeleted) && e.category && e.category.id === catId
      && e.title.toLowerCase().includes(nameQ);
  });
  res.send(result);
});

// GET /api/v1/categories  (optional ?name=)
router.get('/', function (req, res, next) {
  const nameQ = req.query.name ? req.query.name.toLowerCase() : '';
  const result = categories.filter(c => !c.isDeleted && c.name.toLowerCase().includes(nameQ));
  res.send(result);
});

// GET /api/v1/categories/:id
router.get('/:id', function (req, res, next) {
  const id = Number(req.params.id);
  const cat = categories.find(c => c.id === id && !c.isDeleted);
  if (cat) return res.status(200).send(cat);
  return res.status(404).send({ message: 'CATEGORY NOT FOUND' });
});

// GET /api/v1/categories/slug/:slug
router.get('/slug/:slug', function (req, res, next) {
  const slug = req.params.slug;
  const cat = categories.find(c => c.slug === slug && !c.isDeleted);
  if (cat) return res.status(200).send(cat);
  return res.status(404).send({ message: 'SLUG NOT FOUND' });
});

// CREATE category
router.post('/', function (req, res, next) {
  const body = req.body;
  const newCat = {
    id: nextCategoryId(),
    name: body.name,
    slug: slugify(body.name || '', { replacement: '-', lower: true, locale: 'vi' }),
    image: body.image || '',
    creationAt: new Date(),
    updatedAt: new Date()
  };
  categories.push(newCat);
  res.status(201).send(newCat);
});

// UPDATE category
router.put('/:id', function (req, res, next) {
  const id = Number(req.params.id);
  const cat = categories.find(c => c.id === id && !c.isDeleted);
  if (!cat) return res.status(404).send({ message: 'CATEGORY NOT FOUND' });
  const body = req.body;
  const keys = Object.keys(body);
  for (const key of keys) {
    if (key === 'name' && body.name) {
      cat.name = body.name;
      cat.slug = slugify(body.name, { replacement: '-', lower: true, locale: 'vi' });
    } else if (key in cat) {
      cat[key] = body[key];
    }
  }
  cat.updatedAt = new Date();
  res.send(cat);
});

// DELETE category (soft delete)
router.delete('/:id', function (req, res, next) {
  const id = Number(req.params.id);
  const cat = categories.find(c => c.id === id && !c.isDeleted);
  if (!cat) return res.status(404).send({ message: 'CATEGORY NOT FOUND' });
  cat.isDeleted = true;
  cat.updatedAt = new Date();
  res.send(cat);
});

module.exports = router;
