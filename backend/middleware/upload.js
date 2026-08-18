const multer = require('multer');
const path = require('path');

// Store uploaded files in memory temporarily
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;

  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(
      new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = {
  uploadSingle: upload.single('image'),

  uploadPayment: upload.single('paymentQr'),

  uploadMultiple: upload.array('images', 10),

  uploadFields: upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'profileImage', maxCount: 1 },
    { name: 'paymentQR', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),

  uploadAny: upload.any(),
};