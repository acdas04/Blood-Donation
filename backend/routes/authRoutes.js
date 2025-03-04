// authRoutes.js contains all the routes related to authentication, such as login, registration, and email checks.
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Email availability check route
router.get('/check-email', async (req, res) => {
    const { email } = req.query;
    
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    
    try {
        // Check if email exists in the database
        const [rows] = await db.execute(
            'SELECT * FROM donors WHERE email = ?',
            [email]
        );
        
        // Return if email is available (true if no matching records)
        return res.json({ available: rows.length === 0 });
    } catch (error) {
        console.error('Error checking email availability:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Find user by email
        const [users] = await db.execute(
            'SELECT * FROM donors WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        const user = users[0];
        
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Create a user object without the password
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            bloodGroup: user.blood_group,
            phone: user.phone,
            location: user.location
        };
        
        // In a real application, you would generate a JWT token here
        const token = generateToken(user);
        
        res.json({
            message: 'Login successful',
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

// Registration route
router.post('/register', async (req, res) => {
    const { name, email, password, bloodGroup, phone, location } = req.body;
    
    try {
        // First check if email already exists
        const [existingUsers] = await db.execute(
            'SELECT * FROM donors WHERE email = ?',
            [email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(409).json({ 
                message: 'Email already registered',
                code: 'EMAIL_EXISTS'
            });
        }
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert the new donor into the database
        const [result] = await db.execute(
            'INSERT INTO donors (name, email, password, blood_group, phone, location, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [name, email, hashedPassword, bloodGroup, phone, location]
        );
        
        res.status(201).json({ 
            message: 'Registration successful',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

// Helper function to generate a token
function generateToken(user) {
    // In a production app, use JWT or another secure token method
    // This is a simple implementation for demonstration
    return Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64');
}

module.exports = router;