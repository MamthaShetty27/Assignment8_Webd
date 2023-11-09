const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./user'); // Import the User model

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/myDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// API Endpoint: Create User
app.post('/user/create', async (req, res) => {
  try {
    // Basic validation for email, full name, and password
    if (!req.body.fullName || !req.body.email || !req.body.password) {
      return res.status(400).json({ message: 'Please provide full name, email, and password' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(req.body.password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and contain at least one letter and one number',
      });
    }

    const newUser = new User({
      fullName: req.body.fullName,
      email: req.body.email,
      password: req.body.password,
    });

    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} and db Name is myDB`);
});

// API Endpoint: Delete User
app.delete('/user/delete', async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(400).json({ message: 'Please provide email for user deletion' });
    }

    const user = await User.findOneAndDelete({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// API Endpoint: Get All Users
app.get('/user/getAll', async (req, res) => {
  try {
    const users = await User.find({}, 'fullName email');

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API Endpoint: Update User
app.put('/user/edit', async (req, res) => {
  try {
    // Implement validation for full name and password here
    if (!req.body.email) {
      return res.status(400).json({ message: 'Please provide email for user update' });
    }

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update full name and password if provided
    if (req.body.fullName) {
      user.fullName = req.body.fullName;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();

    res.json({ message: 'User details updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});