const pool = require('../db_connect');

async function createUsers() {
    try {
        // Create users array
        const users = [
            {
                username: 'Rabin',
                password: 'Rabin123'
            },
            {
                username: 'Sam',
                password: 'Sam123'
            }
        ];

        // Create users
        for (const user of users) {
            try {
                await pool.execute(
                    'INSERT INTO users (username, password) VALUES (?, ?)',
                    [user.username, user.password]
                );
                console.log(`User ${user.username} created successfully`);
            } catch (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    console.log(`User ${user.username} already exists`);
                } else {
                    console.error(`Error creating user ${user.username}:`, error);
                }
            }
        }

        console.log('All users created successfully');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close the connection pool
        await pool.end();
        console.log('Database connection closed');
    }
}

// Run the script
createUsers(); 