const pool = require('../db_connect');

class User {
    static async findByUsername(username) {
        try {
            console.log('Finding user with username:', username);
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );
            console.log('Query result:', rows);
            return rows[0];
        } catch (error) {
            console.error('Error finding user:', error);
            throw error;
        }
    }

    static async create(username, password) {
        try {
            const [result] = await pool.execute(
                'INSERT INTO users (username, password) VALUES (?, ?)',
                [username, password]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    static comparePassword(storedPassword, candidatePassword) {
        console.log('Comparing passwords:');
        console.log('Stored:', storedPassword);
        console.log('Candidate:', candidatePassword);
        return storedPassword === candidatePassword;
    }
}

module.exports = User; 