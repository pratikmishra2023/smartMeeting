const bcrypt = require('bcrypt');

async function generatePasswordHashes() {
    const saltRounds = 10;

    try {
        // Generate hash for admin password
        const adminPasswordHash = await bcrypt.hash('admin', saltRounds);
        console.log('Admin password hash:', adminPasswordHash);

        // Generate hash for security answers
        const answer1Hash = await bcrypt.hash('javascript', saltRounds);
        console.log('Security answer 1 hash (javascript):', answer1Hash);

        const answer2Hash = await bcrypt.hash('buddy', saltRounds);
        console.log('Security answer 2 hash (buddy):', answer2Hash);

        // Test the hashes
        console.log('\n--- Testing hashes ---');
        console.log('Admin password test:', await bcrypt.compare('admin', adminPasswordHash));
        console.log('Answer 1 test:', await bcrypt.compare('javascript', answer1Hash));
        console.log('Answer 2 test:', await bcrypt.compare('buddy', answer2Hash));

    } catch (error) {
        console.error('Error generating hashes:', error);
    }
}

generatePasswordHashes();
