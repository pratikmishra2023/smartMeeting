const { supabaseAdmin } = require('../config/supabase');

class Meeting {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.date = data.date;
        this.duration = data.duration || 0;
        this.participants = data.participants || [];
        this.transcript = data.transcript;
        this.processedData = data.processedData || {
            minutesOfMeeting: {
                keyPoints: [],
                decisions: [],
                discussions: []
            },
            actionItems: [],
            todos: []
        };
        this.reports = data.reports || {
            summaryGenerated: false,
            reportPath: null,
            generatedAt: null
        };
        this.calendarEvents = data.calendarEvents || [];
        this.createdAt = data.created_at || new Date().toISOString();
        this.updatedAt = data.updated_at || new Date().toISOString();
    }

    // Create a new meeting
    static async create(meetingData) {
        try {
            const { data, error } = await supabaseAdmin
                .from('meetings')
                .insert([{
                    title: meetingData.title,
                    date: meetingData.date,
                    duration: meetingData.duration || 0,
                    participants: meetingData.participants || [],
                    transcript: meetingData.transcript,
                    processed_data: meetingData.processedData || {
                        minutesOfMeeting: {
                            keyPoints: [],
                            decisions: [],
                            discussions: []
                        },
                        actionItems: [],
                        todos: []
                    },
                    reports: meetingData.reports || {
                        summaryGenerated: false,
                        reportPath: null,
                        generatedAt: null
                    },
                    calendar_events: meetingData.calendarEvents || [],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;
            return new Meeting(data);
        } catch (error) {
            console.error('Error creating meeting:', error);
            throw error;
        }
    }

    // Find meeting by ID
    static async findById(id) {
        try {
            const { data, error } = await supabaseAdmin
                .from('meetings')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw error;
            }

            return new Meeting(data);
        } catch (error) {
            console.error('Error finding meeting by ID:', error);
            throw error;
        }
    }

    // Find all meetings
    static async find(filters = {}) {
        try {
            let query = supabaseAdmin.from('meetings').select('*');

            // Apply filters
            if (filters.date) {
                query = query.gte('date', filters.date);
            }
            if (filters.participant) {
                query = query.contains('participants', [{ email: filters.participant }]);
            }

            // Order by creation date (newest first)
            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;
            return data.map(meeting => new Meeting(meeting));
        } catch (error) {
            console.error('Error finding meetings:', error);
            throw error;
        }
    }

    // Update meeting
    async save() {
        try {
            const updateData = {
                title: this.title,
                date: this.date,
                duration: this.duration,
                participants: this.participants,
                transcript: this.transcript,
                processed_data: this.processedData,
                reports: this.reports,
                calendar_events: this.calendarEvents,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabaseAdmin
                .from('meetings')
                .update(updateData)
                .eq('id', this.id)
                .select()
                .single();

            if (error) throw error;

            // Update current instance with returned data
            Object.assign(this, new Meeting(data));
            return this;
        } catch (error) {
            console.error('Error saving meeting:', error);
            throw error;
        }
    }

    // Delete meeting
    static async findByIdAndDelete(id) {
        try {
            const { data, error } = await supabaseAdmin
                .from('meetings')
                .delete()
                .eq('id', id)
                .select()
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw error;
            }

            return new Meeting(data);
        } catch (error) {
            console.error('Error deleting meeting:', error);
            throw error;
        }
    }

    // Convert to JSON for API responses
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            date: this.date,
            duration: this.duration,
            participants: this.participants,
            transcript: this.transcript,
            processedData: this.processedData,
            reports: this.reports,
            calendarEvents: this.calendarEvents,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Meeting;
