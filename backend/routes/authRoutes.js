const express = require('express');
const AuthService = require('../services/authService');

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const result = await AuthService.login(email, password);

        if (result.success) {
            res.json(result);
        } else {
            res.status(401).json(result);
        }
    } catch (error) {
        console.error('Login route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            dateOfBirth,
            securityQuestion1,
            securityAnswer1,
            securityQuestion2,
            securityAnswer2,
            captchaToken
        } = req.body;

        // Validate required fields
        if (!name || !email || !password || !dateOfBirth ||
            !securityQuestion1 || !securityAnswer1 ||
            !securityQuestion2 || !securityAnswer2) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // In a real implementation, verify captchaToken here
        if (!captchaToken) {
            return res.status(400).json({
                success: false,
                message: 'Captcha verification required'
            });
        }

        const result = await AuthService.register({
            name,
            email,
            password,
            dateOfBirth,
            securityQuestion1,
            securityAnswer1,
            securityQuestion2,
            securityAnswer2
        });

        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Register route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get security questions endpoint
router.post('/security-questions', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const result = await AuthService.getSecurityQuestions(email);
        res.json(result);
    } catch (error) {
        console.error('Security questions route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Verify security questions endpoint
router.post('/verify-security', async (req, res) => {
    try {
        const { email, dateOfBirth, answer1, answer2, captchaToken } = req.body;

        if (!email || !dateOfBirth || !answer1 || !answer2) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // In a real implementation, verify captchaToken here
        if (!captchaToken) {
            return res.status(400).json({
                success: false,
                message: 'Captcha verification required'
            });
        }

        const result = await AuthService.verifySecurityQuestions(email, dateOfBirth, answer1, answer2);
        res.json(result);
    } catch (error) {
        console.error('Verify security route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Reset token and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        const result = await AuthService.resetPassword(resetToken, newPassword);
        res.json(result);
    } catch (error) {
        console.error('Reset password route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
