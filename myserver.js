const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");  
const Joi = require('joi');

const app = express();

// Configure bodyParser middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB database
mongoose.set("strictQuery",false)
mongoose.connect('mongodb://127.0.0.1:27017/CODES', { useNewUrlParser: true })
.then(()=> {
    console.log('connected to MongoDB')
}).catch((error) => {
    console.log(error) 
})

// Define a schema for the data to be stored in the database
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
  password: String
});

// Define a model based on the schema
const User = mongoose.model('User', userSchema);

// Define a Joi schema for user validation
const userValidationSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(0).max(120).required(),
  password: Joi.string().min(5).max(10).required()
});

// Define an API route for creating new users
app.post('/api/users', (req, res) => {
  const { error, value } = userValidationSchema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  const user = new User(value);
  user.save((err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(user);
    } 
  });
});

// Define an API route for retrieving all users
app.get('/api/users', (req, res) => {
  User.find({}, (err, users) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(users);
    }
  });
});

// Define an API route for updating a user
app.put('/api/users/:id', (req, res) => {
  const { error, value } = userValidationSchema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  User.findByIdAndUpdate(
    req.params.id,
    value,
    { new: true },
    (err, user) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (!user) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json(user);
      }
    },
  );
});

// Define an API route for deleting a user
app.delete('/api/users/:id', (req, res) => {
  User.findByIdAndDelete(req.params.id, (err, user) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!user) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(user);
    }
  });
});

// Start the server
app.listen(2020, () => {
  console.log('Server listening on port 2020');
});
