const express = require("express");
const bookModel = require("./book.model");
const app = express.Router();
const jwt = require("jsonwebtoken");
const AWS = require('aws-sdk')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


AWS.config.update({
    secretAccessKey: process.env.ACCESS_SECRET,
    accessKeyId: process.env.ACCESS_KEY,
    region: process.env.REGION,

});

const BUCKET = process.env.BUCKET
const s3 = new AWS.S3();

app.post('/', upload.single('image'), (req, res) => {
  const { name, author, price, genre } = req.body;
  const image = req.file;

  // Upload the image to AWS S3
  const params = {
    Bucket: BUCKET,
    Key: `${Date.now()}_${image.originalname}`,
    Body: require('fs').createReadStream(image.path),
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.error('Error uploading to S3:', err);
      return res.status(500).json({ error: 'Failed to upload image to S3' });
    }

    // Now, save book data (including the S3 image URL) to your database
    // Replace this with your database logic

    // Respond with a success message or book ID
    res.json({ message: 'Book posted successfully', imageUrl: data.Location });
  });
});

app.delete('/', (req, res) => {
  const imageUrl = req.query.imageUrl; // Get the image URL from the query parameters

  // Extract the object key from the image URL
  //.split(`${BUCKET}/`)[1];
  const objectKey = imageUrl

  // Define parameters to delete the object
  const params = {
    Bucket: BUCKET,
    Key: objectKey
  };

  // Delete the object from S3
  s3.deleteObject(params, (err, data) => {
    if (err) {
      console.error('Error deleting image from S3:', err);
      return res.status(500).json({ error: 'Failed to delete image from S3' });
    }

    // Image was deleted successfully
    res.json({ message: 'Image deleted from S3 successfully' });
  });
});


// Search, filter, and paginate books
// api----- /book?title=Harry%20Potter&page=2&perPage=20
app.get('/', async (req, res) => {
    try {
      const { title, sortBy, sortOrder, page, perPage } = req.query;
  
      const query = {};
      if (title) {
        query.title = { $regex: title, $options: 'i' };
      }
  
      const sortOptions = {};
      if (sortBy) {
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
      }
  
      const options = {
        sort: sortOptions,
        page: parseInt(page) || 1,
        limit: parseInt(perPage) || 10, // Default to 10 items per page
      };
  
      const books = await bookModel.paginate(query, options);
      res.json(books);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  

app.delete("/:id", async (req, res) => {
  console.log(req)
  try {
    let exists = await bookModel.findOneAndDelete({
      _id: req.params.id,
    });

    console.log(exists, req.params.id);

    res.status(200).send("book deleted successfully");
  } catch (e) {
    res.send(e.massage);
  }
});

app.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(403).send("MISSING ENTITES");
  }
  try {
    let singlData = await bookModel.findOne({ _id: id });
    if (!singlData) {
      return res.status(403).send("data not found");
    }
    return res.status(200).send(singlData);
  } catch (er) {
    return res.status(404).send(er.message);
  }
});

module.exports = app;