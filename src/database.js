
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

// INSERT INTO `donors`(`user_id`, `age`, `city`, `gender`) VALUES ('1','29','Sofia','Male')
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


module.exports = {
    get_all_users,
    get_user_by_email,
    create_donor,
    update_user,
}