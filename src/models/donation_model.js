const mysql = require('mysql2/promise')
const { connection_data } = require('./model_globals')

const get_all = async () => {
    let connection
    try {
        connection = await mysql.createConnection(connection_data)
        const results = await connection.query(
            `SELECT * FROM donation_requests WHERE open = 1`
        )
        return results[0]
    } catch (e) {
        throw e
    } finally {
        if(connection) connection.end()
    }
}

const get_by_id = async (donation_id) => {
    let connection
    try{
        connection = await mysql.createConnection(connection_data)
        const results = await connection.query(
            `SELECT * FROM donation_requests WHERE id = ?`,
            [donation_id]
        )
        return results[0]
    } catch (e) {
        throw e
    } finally {
        if (connection) connection.end()
    }
}

const create = async (donation) => {
    let connection 
    try {
        connection = await mysql.createConnection(connection_data)
        await connection.query(
            `INSERT INTO donation_requests (message, hospital, donation_point, amount, patient, creator) VALUES (?, ?, ?, ?, ?, ? )`,
            [donation.message, donation.hospital, donation.donation_point, donation.amount, donation.patient, donation.creator]
        )
    }catch (e) {
        throw e
    } finally {
        if(connection) connection.end()
    }
}

const set_donations = async (donation_id) => {

}

const update = async (donation) => {
    let connection
    try {
        connection = await mysql.createConnection(connection_data)
        await connection.query(
            `UPDATE donation_requests SET message = ?, hospital = ?, donation_point = ?, amount = ?, patient = ? WHERE id = ?`,
            [donation.message, donation.hospital, donation.donation_point, donation.amount, donation.patient, donation.id]
        )
    } catch (e) {
        throw e
    } finally {
        if(connection) connection.end()
    }
}

const mark_closed = async (donation_id) => {
    let connection 
    try {
        connection = await mysql.createConnection(connection_data)
        await connection.query(
            `UPDATE donation_requests SET open=0 WHERE id = ?`,
            [donation_id]
        )
    } catch (e) {
        throw e
    } finally {
        if(connection) connection.end()
    }
}

const remove = async (donation_id) => {
    let connection 
    try {
        connection = await mysql.createConnection(connection_data)
        await connection.query(
            `DELETE FROM donation_request WHERE id = ?`,
            [donation_id]
        )

    } catch (e) {
        throw e
    } finally {
        if (connection) connection.end()
    }
}

const add_to_donation = async (donation_id, count) => {
    let connection
    try {
        connection = await mysql.createConnection(connection_data)
        await connection.query(
            `UPDATE donation_requests SET donations = ? WHERE id = ?`,
            [count, donation_id]
        )
    } catch (e) {
        throw e
    } finally {
        if (connection) connection.end()
    }
}

module.exports = {
    get_all,
    get_by_id,
    create,
    update,
    mark_closed,
    remove,
    add_to_donation
}