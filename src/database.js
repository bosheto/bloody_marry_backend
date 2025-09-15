
const mysql = require('mysql2')

const pool = mysql.createPool({
    host: process.env.DB_ADDRESS,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

const get_all_users = () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM users', (error, results) => {
            if (error) {
                return reject(error)
            }
            resolve(results)
        })
    })
}

const get_user_by_uuid = (uuid) => {
    return new Promise ((resolve, reject) => {
        pool.query(`SELECT * FROM users WHERE uuid = '${uuid}'`, (error, results) => {
            if (error) {
                return reject(error)
            }
            if (results.length < 1) {
                return reject()
            }
            resolve(results[0])
        })
    })
}

const get_user_by_email = (email) => {
    return new Promise ((resolve, reject) => {
        pool.query(`SELECT * FROM users WHERE email = '${email}'`, (error, results) => {
            if (error) {
                return reject(error)
            }
            resolve(results[0])
        })
    })
}

const get_donor_by_user_id = (user_id) => {
    return new Promise ((resolve, reject) => {
        pool.query(
            `SELECT * FROM donors WHERE user_id = ${user_id}`,
            (error, results) => {
                if (error) {
                    return reject(error)
                }
                resolve(results[0])
            }
        )
    })
}


// Update user 
const update_user = (user) => {
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

const create_donor = (donor) => {
    return new Promise ((resolve, reject) => {
        pool.query(
            `INSERT INTO donors (user_id, age, city, gender) 
            VALUES (${donor.user_id}, ${donor.age}, '${donor.city}', '${donor.gender}')`, (error, results) => {
                if (error) {
                    return reject(error)
                }
                resolve({message: 'Donor created'})
            })
    })
}

const create_user = (user) => {
    return new Promise ((resolve, reject) => {
        pool.query(
            `INSERT INTO users (uuid, email, password, role) VALUES ('${user.uuid}', '${user.email}', '${user.password}', '${user.role}')`,
            (error, results) => {
                if (error) {
                    return reject(error)
                }
                resolve (results)
            }
        )
    })
}

const delete_user = (uuid) => {
    return new Promise ((resolve, reject) => {
        pool.query(
            `DELETE FROM users WHERE uuid = '${uuid}'`,
            (error, results) => {
                if (error) {
                    return reject(error)
                }
                resolve('user deleted')
            }
        )
    })
}

const delete_donor = (user_id) => {
    return new Promise ((resolve, reject) => {
        pool.query(
            `DELETE FROM donors WHERE user_id = ${user_id}`,
            (error, results) => {
                if (error) {
                    return reject(error)
                }
                resolve({message: "donor deleted"})
            }
        )
    })
}

const get_role_name = (id) => {
    return new Promise ((resolve, reject) => {
        pool.query(
            `SELECT role_name FROM roles WHERE id = ${id}`,
        (error, results) => {
            if(error){
                return reject(error)
            }
            resolve(results[0])
        })
    })
}

module.exports = {
    get_all_users,
    get_user_by_uuid,
    create_donor,
    update_user,
    create_user,
    get_user_by_email,
    delete_user,
    delete_donor,
    get_donor_by_user_id,
    get_role_name,
}