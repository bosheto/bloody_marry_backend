
const mysql = require('mysql2/promise')
const { connection_data } = require('./model_globals') 


const create = async (user) => {
    let connection
    try {
        connection = await mysql.createConnection(connection_data)
        await connection.query(
            `INSERT INTO users (email, password, role) VALUES ('${user.email}', '${user.password}', '${user.role}')`,
        )
    }catch (e) {
        throw e
    } finally {
        if(connection) connection.end()
    }
}
 
const get_by_email = async (email) => {
    let connection
    try {
        connection = await mysql.createConnection(connection_data)
        let [results] = await connection.query(
            `SELECT * FROM users WHERE email = ?`,
            [email]
        )
        return results[0]
    } catch (e) {
        throw e
    } finally {
        if(connection) connection.end()
    }
}


const get_role_name = async (id) => {
    let connection
    try {
        connection = await mysql.createConnection(connection_data)
        let [results] = await connection.query(
            `SELECT role_name FROM roles WHERE id = ?`,
            [id]
        )

        return results[0]
    } catch (e) {
        throw e
    } finally {
        if(connection) connection.end()
    }
}

//TODO Move the logic for checking if password or email is not present to controller
const update_credentials = async (user) => {
    let connection
    try {
        connection = await mysql.createConnection(connection_data)

        if(user.email && !user.password){
            await connection.query(
                `UPDATE users SET email = ? WHERE id = ?`,
                [user.email, user.id]
            )
        } else if(!user.email && user.password) {
            await connection.query(
                `UPDATE users SET password = ? WHERE id = ?`,
                [user.password, user.id]
            )
        } else {
            await connection.query(
                `UPDATE users SET email = ?, password = ? WHERE id = ?`,
                [user.email, user.password, user.id]
            )
        }

    } catch (e) {
        throw e
    } finally {
        if(connection) connection.end()
    }
} 


const remove_donor = async(user) => {
    let connection
    try {
        connection = await mysql.createConnection(connection_data)

        await connection.beginTransaction()
        
        connection.query(
            `DELETE FROM donors WHERE user_id = ?`,
            [user.id]
        )

        connection.query(
            `DELETE FROM users WHERE id = ?`,
            [user.id]
        )
        
        connection.commit()
    } catch (e) {
        await connection.rollback()
        throw e
    } finally {
        if(connection) connection.end()
    }
}

const update_login_date = async (user_id, login_timestamp) => {
    let connection 
    try {
        connection = await mysql.createConnection(connection_data)

        connection.query(
            'UPDATE users SET last_login = ? WHERE id = ?',
            [login_timestamp, user_id]
        )
        return 
    } catch (e) {
        throw e
    } finally {
        if (connection) connection.end
    }
}

module.exports = {
    get_by_email,
    create,
    get_role_name,
    update_credentials,
    remove_donor,
    update_login_date
}