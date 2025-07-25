const { supabaseAdmin } = require('../config/supabase');

class User {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.role = data.role || 'member';
        this.preferences = data.preferences || {
            defaultPriority: 'medium',
            emailNotifications: true,
            calendarIntegration: false
        };
        this.meetings = data.meetings || [];
        this.createdAt = data.created_at || new Date().toISOString();
        this.lastLogin = data.last_login || new Date().toISOString();
    }

    // Create a new user
    static async create(userData) {
        try {
            const { data, error } = await supabaseAdmin
                .from('users')
                .insert([{
                    name: userData.name,
                    email: userData.email.toLowerCase(),
                    role: userData.role || 'member',
                    preferences: userData.preferences || {
                        defaultPriority: 'medium',
                        emailNotifications: true,
                        calendarIntegration: false
                    },
                    meetings: userData.meetings || [],
                    created_at: new Date().toISOString(),
                    last_login: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;
            return new User(data);
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    // Find user by ID
    static async findById(id) {
        try {
            const { data, error } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw error;
            }

            return new User(data);
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    // Find user by email
    static async findByEmail(email) {
        try {
            const { data, error } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('email', email.toLowerCase())
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw error;
            }

            return new User(data);
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    // Find all users
    static async find(filters = {}) {
        try {
            let query = supabaseAdmin.from('users').select('*');

            // Apply filters
            if (filters.role) {
                query = query.eq('role', filters.role);
            }

            // Order by creation date (newest first)
            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;
            return data.map(user => new User(user));
        } catch (error) {
            console.error('Error finding users:', error);
            throw error;
        }
    }

    // Update user
    async save() {
        try {
            const updateData = {
                name: this.name,
                email: this.email.toLowerCase(),
                role: this.role,
                preferences: this.preferences,
                meetings: this.meetings,
                last_login: this.lastLogin
            };

            const { data, error } = await supabaseAdmin
                .from('users')
                .update(updateData)
                .eq('id', this.id)
                .select()
                .single();

            if (error) throw error;

            // Update current instance with returned data
            Object.assign(this, new User(data));
            return this;
        } catch (error) {
            console.error('Error saving user:', error);
            throw error;
        }
    }

    // Update last login
    async updateLastLogin() {
        try {
            this.lastLogin = new Date().toISOString();

            const { data, error } = await supabaseAdmin
                .from('users')
                .update({ last_login: this.lastLogin })
                .eq('id', this.id)
                .select()
                .single();

            if (error) throw error;
            return this;
        } catch (error) {
            console.error('Error updating last login:', error);
            throw error;
        }
    }

    // Delete user
    static async findByIdAndDelete(id) {
        try {
            const { data, error } = await supabaseAdmin
                .from('users')
                .delete()
                .eq('id', id)
                .select()
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw error;
            }

            return new User(data);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    // Convert to JSON for API responses
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            role: this.role,
            preferences: this.preferences,
            meetings: this.meetings,
            createdAt: this.createdAt,
            lastLogin: this.lastLogin
        };
    }
}

module.exports = User;
