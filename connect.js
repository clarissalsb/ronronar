
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
    user_nome TEXT NOT NULL,
    user_email TEXT UNIQUE NOT NULL,
    user_telefone TEXT NOT NULL,
    user_senha TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0

) `;
DB.run(sql,[],(err)=>{
    //callback function
    if(err){ console.log(`erro criando tabela de inimigos`);
    return;
    }
    console.log('TABELA CRIADA')
});

function connected2(err){
    if(err){
        return new Error();
    }
    console.log("Conectado ao bancoPets ou bancoPets já existe")
    }


const bancoPets = new sql3.Database('./mydataPets.db',sqlite3.OPEN_READWRITE,connected2);


let sqlPets = `CREATE TABLE IF NOT EXISTS pets(
    pet_id INTEGER PRIMARY KEY,
    pet_nome TEXT NOT NULL,
    pet_idade TEXT NOT NULL,
    pet_saude TEXT NOT NULL,
    pet_vacinas TEXT NOT NULL,
    pet_caracteristicas TEXT NOT NULL,
    pet_descricao TEXT NOT NULL
)`;

bancoPets.run(sqlPets,[],(err)=>{
    if(err){
      {console.log(`erro criando tabela de pets`)};
      return
    }
    console.log('TABELA DE PETS CRIADA');
})


export {DB};
export {bancoPets};