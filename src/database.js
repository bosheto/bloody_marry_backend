
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

const update_user_credentials = (user) => {
    return new Promise ((resolve, reject) => {
       if(user.email && !user.password) {
            pool.query(
                `UPDATE users SET email = '${user.email}' WHERE id =  ${user.id}`,
                (error, results) => {
                    if (error) {
                        return reject(error)
                    }
                    resolve(results)
                }
            )
       } else if (!user.email && user.password) {
            pool.query(
                `UPDATE users SET password = '${user.password}' WHERE id = ${user.id}`,
                (error, results) => {
                        if (error) {
                            return reject(error)
                        }
                        resolve(results)
                    }
            )
       } else {
            pool.query(
                `UPDATE users SET email = '${user.email}', password = '${user.password}' WHERE id = ${user.id}`,
                (error, results) => {
                        if (error) {
                            return reject(error)
                        }
                        resolve(results)
                }
            )
       }
    })
}

const delete_donor = (donor) => {
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

module.exports = {
    get_all_users,
    get_user_by_uuid,
    // create_donor,
    // update_user_new,
    delete_donor,
    create_user,
    get_user_by_email,
    delete_user,
    get_role_name,
    update_user_credentials,
}