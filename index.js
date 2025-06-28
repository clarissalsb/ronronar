import {DB} from './connect.js';

import express from 'express'
import bodyParser from "body-parser";
import cors from 'cors';
const app = express();

//const corsOptions = {
  //origin: 'http://127.0.0.1:5500', 
  //methods: ['GET','POST','DELETE','PUT','OPTIONS'],
  //allowedHeaders: ['Content-Type', 'Authorization'],
  //credentials: true
//};

app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500'); // igual ao seu corsOptions
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});
app.get('/',(req,res)=>{
    res.status(200);
    res.send('Serviço de usuários está online');
});

app.get('/api/:type',(req,res)=>{
    const type = req.params.type
    
    res.set('content-type','application/json');
    if(type==="user"){
    const sql= 'SELECT * from users';
    let data= {users:[]};
    try{
    DB.all(sql,[],(err,rows)=>{
        if(err){
            throw err;
        }
        rows.forEach(row=>{
            data.users.push({id: row.user_id, nome:row.user_nome, email:row.
                user_email,telefone:row.user_telefone,senha:row.user_senha});
        });
        let content= JSON.stringify(data);
        res.send(content);
    }  )
    }catch(err){
        console.log(err.message);
        res.status(467);
        res.send(`{"code":467, "status":"${err.message}"}`);
    }
}
});


app.post('/register/:type',(req,res)=>{
    const type = req.params.type
    if(type==="user"){
    console.log(req.body);

    res.set('content-type','application/json');
    const { nome, email, telefone, senha } = req.body;

        
    if (!nome || !email || !telefone || !senha) {
            return res.status(400).send(JSON.stringify({ message: "Dados incompletos" }));
    }

    
    
   
    const checkSql = 'SELECT * FROM users WHERE user_email = ?';

    DB.get(checkSql, [email], (err, row) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send(JSON.stringify({ message: "Erro no banco de dados" }));
            }
            if (row) {
                // E-mail já existe, não deixa inserir
                return res.status(409).send(JSON.stringify({ message: "E-mail já cadastrado" }));
            }

    const sql= 'INSERT INTO users(user_nome,user_email,user_telefone,user_senha) VALUES(?,?,?,?)';
    let newId;
    try{
        DB.run(sql,[req.body.nome,req.body.email,req.body.telefone,req.body.senha], function(err){
            if(err) throw err;
            newId=this.lastID;
            res.status(201);
            let data={status:201,success:true,message: `Usuario ${newId} salvo.`};
            let content = JSON.stringify(data);
            res.send(content);
        })
    }catch(err){
        console.log(err.message);
        res.status(468);
         res.send(`{"code":468, "status":"${err.message}"}`);
    }
    });
    }
}
);
app.delete('/api/:type',(req,res)=>{
    const type = req.params.type
  
    res.set('content-type','application/json');
    if(type==="user"){
    const sql= 'DELETE FROM users WHERE user_id=?';
    try{
        DB.run(sql, [req.query.id],function(err){
            if(err) throw err;
            if(this.changes === 1){
                res.status(200);
                res.send(`{"message":"Usuario ${req.query.id} foi removido da lista."}`); 
            }else{
               res.status(200);
               res.send(`{"message":"Sem operação necesária."}`); 
            }
        })
    }
    catch(err){
        console.log(err.message);
        res.status(468);
        res.send(`{"code":468, "status":"${err.message}"}`);
    }
}
});
const PORT = process.env.PORT || 3001;
app.listen(PORT,(err)=>{
    if(err){
        console.log('ERROR:',err.message);
    }
        console.log(`LISTENING on port ${PORT}`)
})