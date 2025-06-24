import {DB} from './connect.js';

import express from 'express'
import bodyParser from "body-parser";
const app = express();
app.use(bodyParser.json());

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
            data.users.push({id: row.user_id, name:row.user_name, email:row.
                user_email,telefone:row.user_telefone,password:row.user_password});
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
    const { name, email, telefone, password } = req.body;

        
    if (!name || !email || !telefone || !password) {
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

    const sql= 'INSERT INTO users(user_name,user_email,user_telefone,user_password) VALUES(?,?,?,?)';
    let newId;
    try{
        DB.run(sql,[req.body.name,req.body.email,req.body.telefone,req.body.password], function(err){
            if(err) throw err;
            newId=this.lastID;
            res.status(201);
            let data={status:201, message: `Usuario ${newId} salvo.`};
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

app.listen(3001,(err)=>{
    if(err){
        console.log('ERROR:',err.message);
    }
        console.log('LISTENING on port 3001')
})