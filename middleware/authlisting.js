const { body, validationResult } = require('express-validator');

const listingauth = [
  // Basic Information

body('FullName').trim().isLength({ min: 1, max: 255 }),
body('Email').trim().isEmail(),
body('Phone').trim().isLength({ min: 1, max: 20 }),
body('PropertyAddress').trim().isLength({ min: 1, max: 255 }),
body('PropertyType').trim().isLength({ min: 1, max: 255 }),
body('Bedrooms').trim().isInt(),
body('Bathrooms').trim().isInt(),
body('SquareFootage').trim().isInt(),
body('AskingPrice').trim().isFloat(),
body('Description').trim().isLength({ min: 1, max: 255 }),
body('ReasonForSelling').trim().isLength({ min: 1, max: 255 }),
  // Middleware to handle validation errors
  (req, res, next) => {
    const referrer = req.get('Referer');
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      const errorMessages = errors.array().map(error => error.msg);
      const formData = req.body;
      const query = new URLSearchParams({
        errors: JSON.stringify(errorMessages),
        ...formData,
      }).toString();

      return res.redirect(`${referrer}?${query}`);
    }

    next();
  },
];

module.exports = listingauth;
