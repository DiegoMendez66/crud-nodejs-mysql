require('dotenv').config()
//const mysql = require('mysql2')
//const connection = mysql.createConnection(process.env.DATABASE_URL)
const mysql = require('mysql');
const connection = mysql.createConnection({
  host    : 'localhost',
  user    : 'root',
  password: '',
  database: 'crudnodejs'
})

connection.connect((error)=>{
    if (error) {
      console.error('El error de conexión es: ' + error);
      return;
    }
    console.log('¡Conectado a la Base de Datos!');
});

module.exports = connection;