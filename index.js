import {DB} from './connect.js';
import {bancoPets} from './connect.js';
import jwt from 'jsonwebtoken';
import express from 'express';
import bodyParser from "body-parser";
import cors from 'cors';
import dotenv from 'dotenv'
import {checkAdmin} from './middlewares/checkadmin.js';



const app = express();
const router = express.Router();
//const corsOptions = {
  //origin: 'http://127.0.0.1:5500', 
  //methods: ['GET','POST','DELETE','PUT','OPTIONS'],
  //allowedHeaders: ['Content-Type', 'Authorization'],
  //credentials: true
//};

app.use(bodyParser.json());
app.use(cors());
dotenv.config();
app.get('/',(req,res)=>{
    res.status(200);
    res.send('Serviço de usuários está online');
});

app.get('/pets',(req,res)=>{
    res.status(200);
    res.send('Serviço de pets está online')
})


app.get('/pets/listagem',(req,res)=>{
  res.set('content-type', 'application/json');
  
  const sql ='SELECT * from pets';
  let data={ pets: []};
  bancoPets.all(sql,[],(err,rows)=>{
    if(err){
      console.error(err.message);
      res.status(500).json({code:500,status:err.message});
      return
    }
    rows.forEach(row=>{
      data.pets.push({
        id:row.pet_id,
        nome:row.pet_nome,
        idade:row.pet_idade,
        saude:row.pet_saude,
        vacinas:row.pet_vacinas,
        caracteristicas:row.pet_caracteristicas,
        descricao:row.pet_descricao
      })
    })
    res.status(200).json(data);

  })

})
app.post('/pets/registrar',checkAdmin,(req,res)=>{
  res.set('content-type','application/json')
  const {nome,idade,saude,vacinas,caracteristicas,descricao} = req.body;
  console.log("Dados recebidos: ",req.body)
  if(!nome || !idade || !saude || !vacinas || !caracteristicas || !descricao){
    console.log("Dados incompletos")
    return res.status(400).json({message: "Dados incompletos"});
  }

  const insertSql = 'INSERT INTO pets(pet_nome,pet_idade,pet_saude,pet_vacinas,pet_caracteristicas,pet_descricao) VALUES (?,?,?,?,?,?)'
  bancoPets.run(insertSql,[nome,idade,saude,vacinas,caracteristicas,descricao],function(err){
    if(err){
      console.log("Erro ao inserir usuario")
      return res.status(500).json({message:"Erro ao cadastrar usuário"});
    }
    const newId= this.lastID;
    return res.status(201).json({
      status:201,
      sucess:true,
      message:`Pet ${newId} cadastrado`
    })
  })
})

app.put('/pets/editar/:id',checkAdmin,(req,res)=>{
  res.set('content-type','application/json');
  const petId=req.params.id;
  const {nome,idade,saude,vacinas,caracteristicas,descricao} = req.body;
  console.log("Dados recebidos:",req.body);

  if(!nome || !saude || !vacinas || !caracteristicas || !descricao){
    console.log("Dados incompletos");
    return res.status(400).json({message:"dados incompletos"});
  }
  const checkSql='SELECT * from pets WHERE pet_id = ?';
  bancoPets.get(checkSql,[petId],(err,row)=>{
    if(err){
      console.error(err);
      return res.status(500).json({message: 'Erro no servidor'}); 
    }
    if(!row){
      return res.status(404).json({messsage:'Usuário não encontrado'});

    }
    const editSql='UPDATE pets SET pet_nome = ?, pet_idade = ?, pet_saude = ?, pet_vacinas = ?, pet_caracteristicas = ?, pet_descricao = ? WHERE pet_id=? '
    bancoPets.run(editSql,[nome,idade,saude,vacinas,caracteristicas,descricao,petId],function(err){
      if(err){
        console.error(err);
        return res.status(500).json({message:'Erro ao editar pet'});
      }
      
      res.status(200).json({
        message:`Pet ${petId} foi editado`
        
      })
    })
  })
})

app.delete('/pets/deletar/:id',checkAdmin,(req,res)=>{
  res.set('content-type','application/json');
  const petId=req.params.id;

  const deletesql='DELETE FROM PETS WHERE pet_id=?'
  try{
    bancoPets.run(deletesql,[petId],function(err){
      if(err){
         console.log("Erro ao remover pet")
      return res.status(500).json({message:"Erro ao deletar pet"});
      }
      if(this.changes === 1){
        res.status(200);
        res.send({message:`Pet ${petId} foi removido com sucesso`});
      }else{
        res.status(200);
        res.send({"message":"Sem operação necessária"})
      }
    })
  }
  catch(err){
    console.log(err.message);
    res.status(468);
    res.send({code:468, status:`${err.message}`});
  }
})

app.get('/api/:type',checkAdmin, (req, res) => {
  const type = req.params.type;

  res.set('content-type', 'application/json');
  if (type === "user") {
    const sql = 'SELECT * from users';
    let data = { users: [] };

    DB.all(sql, [], (err, rows) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({ code: 500, status: err.message });
        return;
      }
      rows.forEach(row => {
        data.users.push({
          id: row.user_id,
          nome: row.user_nome,
          email: row.user_email,
          telefone: row.user_telefone,
          isAdmin: row.is_admin === 0

        });
      });
      res.status(200).json(data);
    });
  } else {
    res.status(400).json({ message: "Tipo inválido" });
  }
});

app.get('/dashboard',(req,res)=>{
    const authHeader=req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer")){
        return res.status(401).json({msg:"No token provided"})

    }
    const token = authHeader.split(' ')[1];
    try{
       const decoded = jwt.verify(token,process.env.JWT_SECRET);
       const {email} = decoded;
       res.status(200).json({msg: email})
    } catch(err){
        return res.status(401).json({msg:"Authentication Failed"})
    }
})
app.post('/login/:type',(req,res)=>{
    const type=  req.params.type
    if(type ==="user"){
    console.log(req.body);
    res.set('content-type','application/json');
    const {email, senha} = req.body;
    if(!email || !senha ){
          return res.status(400).send(JSON.stringify({ message: "Dados incompletos" }));
    }
   
    
    const loginSql = 'SELECT * FROM users WHERE user_email = ?';

    DB.get(loginSql,[email],(err,row)=>{
        if(err){
            console.error(err.message);
            return res.status(500).send({message:"Erro no servidor"});
        
        }
        if(!row){
            return res.status(401).send({message: "Usuario nao encontrado"});

        }
       
        if(row.user_senha !== senha){
            return res.status(401).send({ message: "Senha incorreta" });
        }
        const isAdmin = row.is_admin ===1;
        const token = jwt.sign({email,id:row.user_id,isAdmin}, process.env.JWT_SECRET, {expiresIn: '30d'})
        res.status(200).send({ message: "Login bem-sucedido", success:true, token,isAdmin, nome:row.user_nome});
    })
    }
})

app.post('/register/:type', (req, res) => {
  const type = req.params.type;
  res.set('content-type', 'application/json');

  if (type !== "user") {
    console.log("Tipo inválido:", type);
    return res.status(400).json({ message: "Tipo inválido de registro" });
  }

  const { nome, email, telefone, senha } = req.body;
  console.log("Dados recebidos:", req.body);

  if (!nome || !email || !telefone || !senha) {
    console.log("Dados incompletos");
    return res.status(400).json({ message: "Dados incompletos" });
  }

  const checkSql = 'SELECT * FROM users WHERE user_email = ?';
  DB.get(checkSql, [email], (err, row) => {
    if (err) {
      console.error("Erro ao verificar e-mail:", err.message);
      return res.status(500).json({ message: "Erro no banco de dados" });
    }

    if (row) {
      console.log("E-mail já cadastrado:", email);
      return res.status(409).json({ message: "E-mail já cadastrado" });
    }

    const insertSql = 'INSERT INTO users(user_nome, user_email, user_telefone, user_senha, is_admin) VALUES (?, ?, ?, ?, ?)';
    DB.run(insertSql, [nome, email, telefone, senha, 0], function (err) {
      if (err) {
        console.error("Erro ao inserir usuário:", err.message);
        return res.status(500).json({ message: "Erro ao salvar usuário" });
      }

      const newId = this.lastID;
      console.log("Usuário criado com ID:", newId);
      return res.status(201).json({
        status: 201,
        success: true,
        message: `Usuário ${newId} salvo.`
      });
    });
  });
});


 
app.patch('/promoveradmin/:id', checkAdmin, (req, res) => {
  res.set('content-type', 'application/json');

  const id = req.params.id;
  const { isAdmin } = req.body;

  if (typeof isAdmin !== 'boolean') {
    return res.status(400).json({ message: 'isAdmin deve ser true ou false' });
  }

  const checkSql = 'SELECT * FROM users WHERE user_id = ?';
  DB.get(checkSql, [id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erro no servidor' });
    }

    if (!row) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const sql = 'UPDATE users SET is_admin = ? WHERE user_id = ?';
    DB.run(sql, [isAdmin ? 1 : 0, id], function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao atualizar usuário' });
      }

      res.status(200).json({
        message:` Usuário ${id} foi ${isAdmin ? 'promovido a admin' : 'rebaixado para comum'}`
      });
    });
  });
});


app.delete('/user/:id',checkAdmin,(req,res)=>{
  
    res.set('content-type','application/json');
    const userId = req.params.id;

    const sql= 'DELETE FROM users WHERE user_id=?';
    try{
        DB.run(sql, [userId],function(err){
            if(err) throw err;
            if(this.changes === 1){
                res.status(200);
                res.send({message:`Usuario ${userId} foi removido da lista.`}); 
            }else{
               res.status(200);
               res.send({"message":"Sem operação necessária."}); 
            }
        })
    }
    catch(err){
        console.log(err.message);
        res.status(468);
        res.send({code:468, status:`${err.message}`});
    }
}
);
const PORT = process.env.PORT || 3001;
app.listen(PORT,(err)=>{
    if(err){
        console.log('ERROR:',err.message);
    }
        console.log(`LISTENING on port ${PORT}`)
})  


