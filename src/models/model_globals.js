const connection_data = {
    host: process.env.USE_LOCAL_DB ? process.env.DB_LOCAL_ADDRESS : process.env.DB_ADDRESS,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
}

module.exports = {
    connection_data
}