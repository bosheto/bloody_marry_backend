
const mysql = require('mysql2/promise')

const connection_data = {
    host: process.env.DB_ADDRESS,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
}

const pool = mysql.createPool({
    host: process.env.DB_ADDRESS,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})



const get_by_email = async (email) => {
    let connection
    try {
        connection = await mysql.createConnection(connection_data)
        let [results] = await connection.query(
            `SELECT * FROM users WHERE email = ?`,
            [email]
        )
        return results
    } catch (e) {
        throw e
    } finally {
        connection.end()
    }
}

const update_new = (user) => {
     return new Promise ((resolve, reject) => {
        pool.query(`UPDATE users SET email = '${user.email}', new = ${user.new}  WHERE id = ${user.id}`, 
            (error, results) => {
                if (error) {
                    return reject(error)
                }
                resolve({message: "User updated"})
            }
        )
    })
}

module.exports = {
    get_by_email,
    update_new,
}