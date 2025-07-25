const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabase');

class AuthService {
    static async hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    static async comparePassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    static generateJWT(user) {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
    }

    static generateResetToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Login user
    static async login(email, password) {
        try {
            // Get user from database
            const { data: user, error } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('email', email.toLowerCase())
                .eq('account_status', 'active')
                .single();

            if (error || !user) {
                return { success: false, message: 'Invalid credentials' };
            }

            // Check if account is locked due to failed attempts
            if (user.failed_login_attempts >= 5) {
                const lastFailed = new Date(user.last_failed_login);
                const lockDuration = 30 * 60 * 1000; // 30 minutes
                if (Date.now() - lastFailed.getTime() < lockDuration) {
                    return { success: false, message: 'Account temporarily locked. Try again later.' };
                }
            }

            // Verify password
            const passwordMatch = await this.comparePassword(password, user.password_hash);

            if (!passwordMatch) {
                // Increment failed login attempts
                await supabaseAdmin
                    .from('users')
                    .update({
                        failed_login_attempts: user.failed_login_attempts + 1,
                        last_failed_login: new Date().toISOString()
                    })
                    .eq('id', user.id);

                return { success: false, message: 'Invalid credentials' };
            }

            // Reset failed login attempts on successful login
            await supabaseAdmin
                .from('users')
                .update({
                    failed_login_attempts: 0,
                    last_failed_login: null,
                    last_login: new Date().toISOString()
                })
                .eq('id', user.id);

            // Generate JWT token
            const token = this.generateJWT(user);

            return {
                success: true,
                user: {
                    id: user.id,
                    username: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Login failed' };
        }
    }

    // Register new user
    static async register(userData) {
        try {
            const { name, email, password, dateOfBirth, securityQuestion1, securityAnswer1, securityQuestion2, securityAnswer2 } = userData;

            // Check if user already exists
            const { data: existingUser } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('email', email.toLowerCase())
                .single();

            if (existingUser) {
                return { success: false, message: 'User already exists with this email' };
            }

            // Hash password and security answers
            const passwordHash = await this.hashPassword(password);
            const answer1Hash = await this.hashPassword(securityAnswer1.toLowerCase());
            const answer2Hash = await this.hashPassword(securityAnswer2.toLowerCase());

            // Create new user
            const { data: newUser, error } = await supabaseAdmin
                .from('users')
                .insert([{
                    name,
                    email: email.toLowerCase(),
                    password_hash: passwordHash,
                    date_of_birth: dateOfBirth,
                    security_question_1: securityQuestion1,
                    security_answer_1: answer1Hash,
                    security_question_2: securityQuestion2,
                    security_answer_2: answer2Hash,
                    role: 'member',
                    account_status: 'active',
                    created_at: new Date().toISOString(),
                    last_login: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) {
                console.error('Registration error:', error);
                return { success: false, message: 'Registration failed' };
            }

            return {
                success: true,
                message: 'User registered successfully',
                user: {
                    id: newUser.id,
                    username: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                }
            };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Registration failed' };
        }
    }

    // Verify security questions for password reset
    static async verifySecurityQuestions(email, dateOfBirth, answer1, answer2) {
        try {
            const { data: user, error } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('email', email.toLowerCase())
                .single();

            if (error || !user) {
                return { success: false, message: 'User not found' };
            }

            // Check date of birth
            const userDob = new Date(user.date_of_birth).toDateString();
            const providedDob = new Date(dateOfBirth).toDateString();

            if (userDob !== providedDob) {
                return { success: false, message: 'Security verification failed' };
            }

            // Verify security answers
            const answer1Match = await this.comparePassword(answer1.toLowerCase(), user.security_answer_1);
            const answer2Match = await this.comparePassword(answer2.toLowerCase(), user.security_answer_2);

            if (!answer1Match || !answer2Match) {
                return { success: false, message: 'Security verification failed' };
            }

            // Generate reset token
            const resetToken = this.generateResetToken();
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

            // Store reset token
            await supabaseAdmin
                .from('password_reset_tokens')
                .insert([{
                    user_id: user.id,
                    token: resetToken,
                    expires_at: expiresAt.toISOString()
                }]);

            return {
                success: true,
                resetToken,
                message: 'Security verification successful'
            };
        } catch (error) {
            console.error('Security verification error:', error);
            return { success: false, message: 'Security verification failed' };
        }
    }

    // Reset password
    static async resetPassword(resetToken, newPassword) {
        try {
            // Find valid reset token
            const { data: tokenData, error } = await supabaseAdmin
                .from('password_reset_tokens')
                .select('*, users(*)')
                .eq('token', resetToken)
                .eq('used', false)
                .gt('expires_at', new Date().toISOString())
                .single();

            if (error || !tokenData) {
                return { success: false, message: 'Invalid or expired reset token' };
            }

            // Hash new password
            const newPasswordHash = await this.hashPassword(newPassword);

            // Update user password
            await supabaseAdmin
                .from('users')
                .update({
                    password_hash: newPasswordHash,
                    failed_login_attempts: 0,
                    last_failed_login: null
                })
                .eq('id', tokenData.user_id);

            // Mark token as used
            await supabaseAdmin
                .from('password_reset_tokens')
                .update({ used: true })
                .eq('id', tokenData.id);

            return {
                success: true,
                message: 'Password reset successfully'
            };
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, message: 'Password reset failed' };
        }
    }

    // Get security questions for a user
    static async getSecurityQuestions(email) {
        try {
            const { data: user, error } = await supabaseAdmin
                .from('users')
                .select('security_question_1, security_question_2')
                .eq('email', email.toLowerCase())
                .single();

            if (error || !user) {
                return { success: false, message: 'User not found' };
            }

            return {
                success: true,
                questions: {
                    question1: user.security_question_1,
                    question2: user.security_question_2
                }
            };
        } catch (error) {
            console.error('Get security questions error:', error);
            return { success: false, message: 'Failed to get security questions' };
        }
    }
}

module.exports = AuthService;
