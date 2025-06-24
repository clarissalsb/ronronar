
import sqlite3 from "sqlite3";
const sql3 = sqlite3.verbose();

const DB = new sql3.Database('./mydata.db',sqlite3.OPEN_READWRITE,connected);


function connected(err){   
    if(err){
        return new Error();
    }
    console.log("Conectado ao DB ou DB Sqlite3 já existe")
}

let sql= `CREATE TABLE IF NOT EXISTS users(
    user_id INTEGER PRIMARY KEY,
    user_name TEXT NOT NULL,
    user_email TEXT UNIQUE NOT NULL,
    user_telefone TEXT NOT NULL,
    user_password TEXT NOT NULL

) `;
DB.run(sql,[],(err)=>{
    //callback function
    if(err){ console.log(`erro criando tabela de inimigos`);
    return;
    }
    console.log('TABELA CRIADA')
});

export {DB};