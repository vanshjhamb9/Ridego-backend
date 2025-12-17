const mysql = require("mysql2");
const fs = require('fs');


var connection = mysql.createPool({
    host: 'ridego.cl42iocok2df.ap-south-1.rds.amazonaws.com',
    port: 3306,
    user: 'admin',
    password: 'Z6H9R6d^t0Tx',
    database: 'ridego_db',
    connectionLimit: 1000,
    charset: 'utf8mb4'
});

// var connection = mysql.createPool({
//     host: 'localhost',
//     port: 3306,
//     user: 'root',
//     password: 'Shekhar@2024',
//     database: 'RiderAppDB',
//     connectionLimit: 100,
//     charset: 'utf8mb4',
//     // ssl: {
//     //     ca: fs.readFileSync('ca.pem')
//     // }
// });


const mySqlQury = (qry) => {
    return new Promise((resolve, reject) => {
        connection.query(qry, (err, row) => {
            if (err) return reject(err);
            resolve(row)
        })
    })
}




module.exports = { connection, mySqlQury } 