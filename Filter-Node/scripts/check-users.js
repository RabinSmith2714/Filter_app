const pool = require('../db_connect');

async function checkUsers() {
    try {
        // Check all users
        const [users] = await pool.execute('SELECT * FROM users');
        console.log('All users in database:', users);

        // Test specific user
        const [rabin] = await pool.execute('SELECT * FROM users WHERE username = ?', ['Rabin']);
        console.log('Rabin user details:', rabin);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkUsers(); 