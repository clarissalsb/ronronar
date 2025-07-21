
import sqlite3 from "sqlite3";
const sql3 = sqlite3.verbose();

const DB = new sql3.Database('./mydata.db', sqlite3.OPEN_READWRITE, connected);


function connected(err) {
    if (err) {
        return new Error();
    }
    console.log("Conectado ao DB ou DB Sqlite3 já existe")
}

let sql = `CREATE TABLE IF NOT EXISTS users(
    user_id INTEGER PRIMARY KEY,
    user_nome TEXT NOT NULL,
    user_email TEXT UNIQUE NOT NULL,
    user_telefone TEXT NOT NULL,
    user_senha TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0

) `;
DB.run(sql, [], (err) => {
    //callback function
    if (err) {
        console.log(`erro criando tabela de inimigos`);
        return;
    }
    console.log('TABELA CRIADA')
});

function connected2(err) {
    if (err) {
        return new Error();
    }
    console.log("Conectado ao bancoPets ou bancoPets já existe")
}


const bancoPets = new sql3.Database('./mydataPets.db', sqlite3.OPEN_READWRITE, connected2);


let sqlPets = `CREATE TABLE IF NOT EXISTS pets(
    pet_id INTEGER PRIMARY KEY,
    pet_nome TEXT NOT NULL,
    pet_idade TEXT NOT NULL,
    pet_saude TEXT NOT NULL,
    pet_vacinas TEXT NOT NULL,
    pet_caracteristicas TEXT NOT NULL,
    pet_descricao TEXT NOT NULL
)`;

bancoPets.run(sqlPets, [], (err) => {
    if (err) {
        { console.log(`erro criando tabela de pets`) };
        return
    }
    console.log('TABELA DE PETS CRIADA');
})

const bancoImagensPets = new sql3.Database('./mydataUploadsPets.db', sqlite3.OPEN_READWRITE, connected3)

let sqlUploads = `CREATE TABLE IF NOT EXISTS imagens_pets(
    imagem_id INTEGER PRIMARY KEY AUTOINCREMENT,
    pet_id INTEGER,
    imagem TEXT,
    FOREIGN KEY (pet_id) REFERENCES pets(pet_id)
)`;

bancoImagensPets.run(sqlUploads, [], (err) => {
    if (err) {
        { console.log(`erro criando tabela de imagens de pets`) };
        return
    }
    console.log('TABELA DE IMAGENS DE PETS CRIADA')
})
function connected3(err) {
    if (err) {
        return new Error();
    }
    console.log("Conectado ao bancoImagensPets ou bancoImagensPets já existe")
}

const bancoImagensUsers = new sql3.Database('./mydataUploadsUsers.db', sqlite3.OPEN_READWRITE, connected4)
let sqlUploads2 = `CREATE TABLE IF NOT EXISTS imagens_users(
    imagem_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    imagem TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
)`;

bancoImagensUsers.run(sqlUploads2, [], (err) => {
    if (err) {
        { console.log(`erro criando tabela de imagens de usuarios`) };
        return
    }
    console.log('TABELA DE IMAGENS DE USUARIOS CRIADA')
})
function connected4(err) {
    if (err) {
        return new Error();
    }
    console.log("Conectado ao bancoImagensUsers ou bancoImagensUsers já existe")
}

const planos = new sql3.Database('./mydataPlanos.db', sqlite3.OPEN_READWRITE, connected6)

let sqlplanos = `CREATE TABLE IF NOT EXISTS planos(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    valor_mensal REAL NOT NULL,
    duracao_meses INTEGER NOT NULL,
    descricao TEXT DEFAULT ' ',
    ativo INTEGER DEFAULT 1
 ) `

planos.run(sqlplanos, [], (err) => {
    if (err) {
        return new Error();
    }
    console.log('TABELA DE PLANOS CRIADA')
})



function connected6(err) {
    if (err) {
        return new Error();
    }
    console.log("Conectado aos planos ou planos já existe")
}


const apadrinhamentos2 = new sql3.Database('./mydataApadrinhamentos.db', sqlite3.OPEN_READWRITE, connected5)

let sqlapadrinhamentos = `CREATE TABLE IF NOT EXISTS apadrinhamentos(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    pet_id INTEGER NOT NULL,
    plano_id INTEGER NOT NULL,
    data_inicio TEXT DEFAULT CURRENT_TIMESTAMP,
    ATIVO INTEGER DEFAULT 1,

    FOREIGN KEY(user_id)REFERENCES users(user_id),
    FOREIGN KEY(pet_id)REFERENCES pets(pet_id),
    FOREIGN KEY(plano_id)REFERENCES planos(id)
) `
apadrinhamentos2.run(sqlapadrinhamentos, [], (err) => {
    if (err) {
        return new Error();
    }
    console.log('TABELA DE APADRINHAMNETOS CRIADA')

})
function connected5(err) {
    if (err) {
        return new Error();
    }
    console.log("Conectado ao apadrinhamentos ou apadrinhamentos já existe")
}

const doacoes = new sql3.Database('./mydatadoacoes.db', sqlite3.OPEN_READWRITE, connected7)

let sqldoacoes = `CREATE TABLE IF NOT EXISTS doacoes(
    doacao_id INTEGER PRIMARY KEY AUTOINCREMENT,
    doacao_valor TEXT NOT NULL,
    doacao_data TEXT NOT NULL,
    doacao_forma TEXT NOT NULL,
    doacao_doador TEXT NOT NULL
)`

doacoes.run(sqldoacoes, [], (err) => {
    if (err) {
        return new Error();
    }
    console.log('TABELA DE DOAÇOES CRIADA')


})
function connected7(err) {
    if (err) {
        return new Error();
    }
    console.log("Conectado ao doacoes ou doacoes já existe")
}
const relatorios = new sql3.Database('./mydataRelatorios.db', sqlite3.OPEN_READWRITE, connected8)

let sqlrelatorios = `CREATE TABLE IF NOT EXISTS relatorios(
    relatorio_id INTEGER PRIMARY KEY AUTOINCREMENT,
  apadrinhamento_id INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  data_envio TEXT DEFAULT CURRENT_TIMESTAMP,
  enviado_por_sistema INTEGER DEFAULT 1,
  FOREIGN KEY (apadrinhamento_id) REFERENCES apadrinhamentos(id)
)`

relatorios.run(sqlrelatorios, [], (err) => {
    if (err) {
        return new Error();
    }
    console.log('TABELA DE RELATORIOS CRIADA')


})
function connected8(err) {
    if (err) {
        return new Error();
    }
    console.log("Conectado ao relatorios ou relatorios já existe")
}



export { DB };
export { bancoPets };
export { bancoImagensPets };
export { bancoImagensUsers };
export { apadrinhamentos2 };
export { planos };
export { doacoes };
export { relatorios };