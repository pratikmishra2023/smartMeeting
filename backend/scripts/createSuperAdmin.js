const { supabaseAdmin } = require('../config/supabase');
const bcrypt = require('bcrypt');

async function createSuperAdmin() {
    try {
        console.log('🔄 Creating super admin user...');

        // Generate password hashes
        const saltRounds = 10;
        const adminPasswordHash = await bcrypt.hash('admin', saltRounds);
        const answer1Hash = await bcrypt.hash('javascript', saltRounds);
        const answer2Hash = await bcrypt.hash('buddy', saltRounds);

        // Insert or update super admin user
        const { data, error } = await supabaseAdmin
            .from('users')
            .upsert([{
                name: 'Super Administrator',
                email: 'admin@smartmeeting.com',
                password_hash: adminPasswordHash,
                role: 'admin',
                date_of_birth: '1990-01-01',
                security_question_1: 'What is your favorite programming language?',
                security_answer_1: answer1Hash,
                security_question_2: 'What is the name of your first pet?',
                security_answer_2: answer2Hash,
                preferences: {
                    defaultPriority: 'high',
                    emailNotifications: true,
                    calendarIntegration: true
                },
                account_status: 'active',
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.error('❌ Error creating super admin:', error);
            return;
        }

        console.log('✅ Super admin user created successfully!');
        console.log('📧 Email: admin@smartmeeting.com');
        console.log('🔑 Password: admin');
        console.log('🛡️ Role: admin');
        console.log('\n🔐 Security Questions for Password Recovery:');
        console.log('Q1: What is your favorite programming language?');
        console.log('A1: javascript');
        console.log('Q2: What is the name of your first pet?');
        console.log('A2: buddy');
        console.log('📅 Date of Birth: 1990-01-01');

        // Verify the user was created
        const { data: verifyUser, error: verifyError } = await supabaseAdmin
            .from('users')
            .select('id, name, email, role, account_status')
            .eq('email', 'admin@smartmeeting.com')
            .single();

        if (verifyError) {
            console.error('❌ Error verifying user:', verifyError);
        } else {
            console.log('\n✅ Verification successful:');
            console.log('User ID:', verifyUser.id);
            console.log('Name:', verifyUser.name);
            console.log('Email:', verifyUser.email);
            console.log('Role:', verifyUser.role);
            console.log('Status:', verifyUser.account_status);
        }

    } catch (error) {
        console.error('❌ Error in createSuperAdmin:', error);
    }
}

// Run the seeder
createSuperAdmin()
    .then(() => {
        console.log('\n🎉 Super admin creation completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Failed to create super admin:', error);
        process.exit(1);
    });
