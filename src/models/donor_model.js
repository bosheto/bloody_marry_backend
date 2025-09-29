
const mysql = require('mysql2/promise')
const { connection_data } = require('./model_globals') 


const get_all = async () => {
    let connection
    try {
        connection = await mysql.createConnection(connection_data)

        let [results] = connection.query(
            `SELECT * FROM donors`
        )

        return results
    }catch (e) {
        throw e
    } finally {
        connection.end()
    }
}


const get_by_email = async (email) => {

    let connection
    try {
        connection = await mysql.createConnection(connection_data)
        let [results] = await connection.query(
            `SELECT d.* FROM donors d JOIN users u ON d.user_id = u.id WHERE u.email = '${email}'`
        )

        return results[0]
    } catch (e) {
        throw e
    } finally {
        if (connection) await connection.end()
    }   

}


const get_by_user_id = async (user_id) => {
    let connection
    try {
        connection = await mysql.createConnection(connection_data)
        let [results] = await connection.query(
            `SELECT * FROM donors WHERE user_id = ${user_id}`
        )

        return results[0]
    }catch (e) {
        throw e
    }finally {
        if (connection) await connection.end()
    }
}


const create = async (donor) => {

    let connection
    try{
        connection = await mysql.createConnection(connection_data)
        await connection.beginTransaction()

        await connection.query( 
            `INSERT INTO donors (user_id, dob, city, gender) 
            VALUES (${donor.user_id}, '${donor.dob}', '${donor.city}', '${donor.gender}')`)

        await connection.query(
            `UPDATE users SET new = 0 WHERE id = ?`, [donor.user_id]
        )

        await connection.commit()
        return {message: 'Donor created'}
    }catch (e) {
        if (connection) await connection.rollback()
        throw e
    }finally {
        if (connection) await connection.end()
    }

}


const remove = async (user_id) => {

    let connection
    try {
        connection = await mysql.createConnection(connection_data)
        connection.query(
            `DELETE FROM donors WHERE user_id = ${user_id}`
        )

    } catch (e) {
        throw e
    } finally {
        connection.end()
    }

}


const change_city = async (email, city) => {  
    let connection
    try {
        connection = await mysql.createConnection(connection_data)
        await connection.query(
             `UPDATE donors d JOIN users u ON d.user_id = u.id SET d.city = '${city}' WHERE u.email = '${email}'`
        )
    }catch (e) {
        throw e
    } finally {
        if (connection) connection.end()
    }
}



module.exports = {
    get_all,
    get_by_email,
    get_by_user_id,
    change_city,
    create,
    remove,
}