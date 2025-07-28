import {DB} from './connect.js';
import {bancoPets} from './connect.js';
import {bancoImagensPets} from './connect.js';
import { bancoImagensUsers } from './connect.js';
import {apadrinhamentos2} from './connect.js';
import {planos} from './connect.js';
import { doacoes } from './connect.js';
import { relatorios } from './connect.js';
import jwt from 'jsonwebtoken';
import express from 'express';
import bodyParser from "body-parser";
import cors from 'cors';
import dotenv from 'dotenv'
import {checkAdmin} from './middlewares/checkadmin.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import xoauth2 from 'xoauth2';

const app = express();
const router = express.Router();
//const corsOptions = {
  //origin: 'http://127.0.0.1:5500', 
  //methods: ['GET','POST','DELETE','PUT','OPTIONS'],
  //allowedHeaders: ['Content-Type', 'Authorization'],
  //credentials: true
//};

const storage = multer.diskStorage({
  destination: function(req,file,cb){
    cb(null, 'Imagens');
  },
  filename: function(req,file,cb){
    const uniqueSuffix=Date.now()+ '-'+Math.round(Math.random()*1e9);
    const ext = path.extname(file.originalname); // .jpg, .png, etc
    const nomeSemExt = path.basename(file.originalname, ext);
        cb(null, nomeSemExt + '-' + uniqueSuffix + ext);
  }
  
})
const fileFilter= (req,file,cb)=>{
    if(file.mimetype == "image/png" || file.mimetype =="image/jpeg" || file.mimetype =="image/webp" || file.mimetype == "video/mp4" || file.mimetype == "video/webm" || file.mimetype == "video/ogg" ){
      cb(null,true);
    }
    else{
       cb(new Error('Formato de arquivo não suportado, favor, inserir apenas arquivos jpg, png ou webp'), false);
    }
  }
const maxSize=50*1024*1024;

const upload= multer({
  storage,
  fileFilter,
  limits:{fileSize:maxSize}
});
const tokenPorEmail ={}



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

//funçoes de pets, todas as funçoes de pets precisam ser admin com exceçao da listagem


//funçao para listar os pets
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

//funçao para listar as imagens de pet
app.get('/pets/imagem/:id', (req, res) => {
  const petId = req.params.id;
  const sql = 'SELECT imagem FROM imagens_pets WHERE pet_id = ? LIMIT 1';

  bancoImagensPets.get(sql, [petId], (err, row) => {
    if (err || !row) {
      return res.status(404).send('Imagem não encontrada');
    }
    res.sendFile(path.resolve(row.imagem));
  });
});

//funçao para lançar as imagens do pet, sera lançada pelo id do pet, id esse que deve estar no link ex: /pet/upload/4
app.post("/pet/upload/:id",checkAdmin,(req,res)=>{
  const petId=req.params.id;
  upload.array("imagempet",10)(req,res,(err)=>{
   if(err instanceof multer.MulterError){
     return res.status(500).json({message:err.message});
  }
  else if(err){
      console.error(err);
      return res.status(500).json({message: 'Erro ao inserir imagem'}); 
  }
  const arquivos= req.files;
  if(!arquivos || arquivos.length ===0){
    return res.status(500).json({message:"Nenhuma mensagem enviada"});
  }
  const insertSql = 'INSERT INTO imagens_pets(pet_id,imagem) values (?,?)'
  let insercoesConcluidas = 0;
  let erroOcorrido = [];
  
  for(const file of arquivos){
  
  bancoImagensPets.run(insertSql,[petId,file.path],function(err){
     if(err){
      console.log("Erro ao inserir imagem",err.message);
      erroOcorrido.push(file.originalname);
    }
    insercoesConcluidas++;
  if(insercoesConcluidas === arquivos.length){  
   console.log(req.files);
  if(erroOcorrido.length>0){
    console.log("Erros ocorreram nas seguintes imagens:");
    for(const nome of erroOcorrido){
      console.log("-"+nome);
    }
    
  }  
   res.status(201).json({
        status: 201,
        success: true,
        message: 'Multiplas imagens inseridas com sucesso'
      });
    }
  })
}
})
});



//funçao que deleta a imagem de um pet, nisso o nome da imagem deve estar no link ex: /pet/upload/gato.kjpg-21312312
app.delete("/pet/upload/delete/:imagem",checkAdmin,async (req,res)=>{

  const nomedaimagem=req.params.imagem
  const caminho = path.join('Imagens',nomedaimagem);
  try{
    fs.unlinkSync(caminho);

    await bancoImagensPets.run('DELETE FROM imagens_pets WHERE imagem = ?', [caminho])

    res.status(200).json({sucess:true,message:'Arquivo deletado com sucesso'});

  }catch(error){
    console.error(error);
    res.status(500).json({message: 'Erro ao deletar imagem ou registro no banco de dados'})
  }
  
})

//funçao para registrar pets, aguarda a resposta: nome,idade,saude,vacinas,caracteristicas e descricao,precisa ser admin
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
//funçao para editar pets, vai editar pelo id que deve ser inserido no link, precisa ser admin
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


//funçao para editar pet, vai ser deletado pelo id no link
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


//funçao para listar usuarios, deve ser admin e o type é user ou seja /api/user
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
          genero: row.user_genero,
          nascimento: row.user_nascimento,
          endereco: row.user_endereco,
          isAdmin: row.is_admin === 1

        });
      });
      res.status(200).json(data);
    });
  } else {
    res.status(400).json({ message: "Tipo inválido" });
  }
});

//funçao para verificar se o usuario está autenticado
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

//funçao para login, novamente tipo user, e recebe email e senha
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


//funçao para registrar, type user novamente, e espera como resposta o nome,email,telefone e senha
app.post('/register/:type', (req, res) => {
  const type = req.params.type;
  res.set('content-type', 'application/json');

  if (type !== "user") {
    console.log("Tipo inválido:", type);
    return res.status(400).json({ message: "Tipo inválido de registro" });
  }

  const { nome, email, telefone, senha, genero, nascimento, endereco } = req.body;
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

    const insertSql = `
      INSERT INTO users(user_nome, user_email, user_telefone, user_senha, is_admin, user_genero, user_nascimento, user_endereco)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
      DB.run(insertSql, [nome, email, telefone, senha, 0, genero, nascimento, endereco], function (err) {
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
//aqui inicia o processo de recuperaçao de senha, o processo possui 3 etapas

//primeira etapa, lança o email para o usuario com o link com o token para resetar a senha
//espera como resposta o email
app.post('/auth/esqueci-minha-senha',(req,res)=>{
  res.set('content-type','application/json');
  const {email}= req.body;
  if(!email){
      return res.status(500).json({message :"Dados incompletos"})
  }

  const loginSql= 'SELECT * FROM users WHERE user_email = ?';
  DB.get(loginSql,[email],(err,row)=>{
    if(err){
      console.error(err.message);
      return res.status(500).json({message:"Erro no servidor"});
    }
    if(!row){
        return res.status(500).json({message:"Usuario não encontrado"});
    }
  
   const tokenReset =jwt.sign({email,id:row.user_id},process.env.JWT_SECRET,{expiresIn:'1h'});
   tokenPorEmail[email]=tokenReset;
   const transporter = nodemailer.createTransport({
    service: 'gmail',
     auth: {
      type: 'OAuth2',
      user: 'ronronar.suporte@gmail.com',
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret:process.env.GOOGLE_CLIENT_SECRET,
      refreshToken:process.env.GOOGLE_REFRESH_TOKEN
           },
      tls:{
        rejectUnauthorized:false
      },     
      secure:true
        })

  const mailOptions = {
    from: 'Ronronar <ronronar.suporte@gmail.com>',
    to: email,
    subject: 'Mudança de senha',
    html: `  
      <p>Clique no link abaixo para redefinir sua senha (expira em 1h):</p>
      <a href="https://seusite.com/reset-password?token=${tokenReset}">
      Redefinir senha
      </a> `
}

transporter.sendMail(mailOptions, function(err,response){
  if(err){
      console.error('Erro ao enviar e-mail:', err);
        return res.status(500).json({ 
          success: false,
          message: "Falha ao enviar e-mail"
        });
  }
  res.json({
    sucess:true,
    message:"Email enviado com sucesso!",
    token:tokenReset
  })

})
   
  
  })
})

//2 etapa, funçao para checar se o token pra resetar a senha é valido
app.get('/auth/validar-reset-token',(req,res)=>{
    const authHeader=req.headers.authorization

    if(!authHeader || !authHeader.startsWith("Bearer")){
      return res.status(401).json({msg:"No token provided"})
    }
    const token = authHeader.split(' ')[1];
    try{
      const decoded=jwt.verify(token,process.env.JWT_SECRET);
      const {email} = decoded;
      res.status(200).json({msg:email})
    }
    catch(err){
      return res.status(401).json({msg:"Authentication Failed!"})
    }
})

//terceira etapa, apos tudo isso recebe o token e muda a senha
//espera o auth bearer padrao de token, e como resposta espera o novasenha
app.patch('/auth/editarsenha',(req,res)=>{
  res.set('content-type','application/json');
  const authHeader=req.headers.authorization;

  if(!authHeader || !authHeader.startsWith("Bearer")){
    return res.status(401).json({msg:"No token provided"})
  }
  const token = authHeader.split(' ')[1];
  let email;
    try{
      const decoded=jwt.verify(token,process.env.JWT_SECRET);
      email = decoded.email;
      
    }
    catch(err){
      return res.status(401).json({msg:"Authentication Failed!"})
    }
  const {novasenha}= req.body;
  if(!novasenha){
return res.status(400).send(JSON.stringify({ message: "Dados incompletos" }));
  }  

  const sql = 'SELECT * FROM users WHERE user_email = ?';

  DB.get(sql, [email], (err,row)=>{
    if(err){
      console.error(err.message);
      return res.status(500).send({message:"Erro no servidor"})
    }
   if(!row){
    return res.status(401).send({message: "Usuario nao encontradfo"})
   }
  if(row.user_senha == novasenha){
    return res.status(401).send({message:"Mesma senha que a anterior, por favor mude"});

  }
  const editsql= 'UPDATE users SET user_senha = ? WHERE user_email = ?';
  DB.run(editsql, [novasenha, email],function(err){
    if(err){
      console.error(err);
      return res.status(500).json({message: 'Erro ao atualizar senha'});

    }
  res.status(200).json({
    sucess:true,
    message: 'Senha alterada com sucesso'
  })
  })
  })

})
 
//funçao para promover a admin, espera o id do usuario
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



//funçao para editar usuario, tem que colocar o id do usuario no link e espera como resposta o nome,email,telefone e senha
app.put('/editarUsuario/:id',(req,res)=>{
  res.set('content-type','application/json');
  const userId=req.params.id;
  const{nome,email,telefone,senha, genero, nascimento, endereco}= req.body;
  console.log("Dados recebidos:",req.body);

  if(!nome || !email|| !telefone || !senha){
    console.log("Dados incompletos");
    return res.status(400).json({message:"Dados incompletos"});
  }

  const sql= 'SELECT user_id from users WHERE user_email = ? AND user_id !=? ';
  DB.get(sql,[email,userId],(err,row)=>{
    if(err){
      console.error(err);
      return res.status(500).json({message:'Erro no servidor'});
    }
    if(row){
      return res.status(404).json({message:'Email já em uso por outro usuário'})

    }
    const editSql = `
      UPDATE users
      SET user_nome = ?, user_email = ?, user_telefone = ?, user_senha = ?,
          user_genero = ?, user_nascimento = ?, user_endereco = ?
      WHERE user_id = ?
    `;
    DB.run(editSql, [nome, email, telefone, senha, genero, nascimento, endereco, userId], function (err) {

      if(err){
        console.error(err);
        return res.status(500).json({message:'Erro ao editar usuario'})
      }
      res.status(200).json({
        message:'Usuario foi editado',
        sucess:true
      })
    })

  })
})


//funçao para colocar a imagem do usuario, colocar id do usuario no link
app.post("/user/upload/:id",(req,res)=>{
  const userId=req.params.id;
  upload.single("imagemuser")(req,res,(err)=>{
    if(err instanceof multer.MulterError){
      return res.status(500).json({message:err.message});
    }
    else if(err){
      console.error(err);
      return res.status(500).json({message:'Erro ao inserir imagem'})
    }
    const arquivo = req.file;
    if(!arquivo){
      return res.status(500).json({message:"Nenhuma imagem foi inserida"});

    }
    const insertsql= 'INSERT INTO imagens_users(user_id,imagem) values (?,?)'
    bancoImagensUsers.run(insertsql,[userId,arquivo.path],function(err){
      if(err){
        console.log("Erro ao inserir imagem",err.message);

      }
      res.status(201).json({
        status:201,
        sucess:true,
        message: 'Imagem inserida com sucesso'
      })
    })
  })
})

//funçao para editar imagem do usuario, espera o id tambem
app.patch("/user/upload/edit/:id",(req,res)=>{
  const userId=req.params.id;
  upload.single("imagemuser")(req,res,(err)=>{
    if(err instanceof multer.MulterError){
      return res.status(500).json({message:err.message});
    }
    else if(err){
      console.error(err);
      return res.status(500).json({message:'Erro ao inserir imagem'})
    }
    const arquivo = req.file;
    if(!arquivo){
      return res.status(500).json({message:"Nenhuma imagem foi inserida"});

    }
   const selectSQL = "SELECT imagem FROM imagens_users WHERE user_id = ?";
    bancoImagensUsers.get(selectSQL, [userId], (err, row) => {
      if (err) {
        console.log("Erro ao buscar imagem antiga:", err.message);
        return res.status(500).json({ message: "Erro ao buscar imagem antiga" });
      }

  
      if (row && row.imagem) {
        const caminhoAntigo = row.imagem;
        fs.unlink(caminhoAntigo, (err) => {
          if (err) {
            console.warn("Não foi possível remover imagem antiga (talvez já não exista):", err.message);
          } else {
            console.log("Imagem antiga removida com sucesso.");
          }
        });
      }
   
    const insertsql= 'UPDATE imagens_users SET imagem = ? WHERE user_id = ? ';
    bancoImagensUsers.run(insertsql,[arquivo.path,userId],function(err){
      if(err){
        console.log("Erro ao editar imagem de perfil",err.message);

      }
      res.status(201).json({
        status:201,
        sucess:true,
        message: 'Imagem de perfil editada com sucesso'
      })
    })
  })
})
})

//funçao para deletar usuario, espera o id do usuario no link, precisa ser admin
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
//funçao para apadrinhar, precisa do id do usuario, do id do ped e do id do plano que ele vai desejar, 1,2 e 3 sendo o id dos 3 respectivos planos
app.post('/apadrinhar',(req,res)=>{
res.set('content-type','application/json')
const {user_id,pet_id,plano_id}=req.body

if(!user_id || !pet_id || !plano_id ){
  return res.status(400).json({error:'Dados Obrigatórios faltando'})
}


const insertSql= 'INSERT INTO apadrinhamentos (user_id, pet_id, plano_id, data_inicio, ativo) VALUES (?, ?, ?, CURRENT_TIMESTAMP, 1);'

apadrinhamentos2.run(insertSql,[user_id,pet_id,plano_id],function(err){
  if(err){
    console.log("Erro ao inserir imagem", err.message);
  }
  res.status(201).json({
    sucess:true,
    message:'Apadrinhamento bem sucedido',
    apadrinhamento_id: this.lastID
  })
})
})
//funçao para desativar o apadrinhamento, precisa do id do apadrinhamento e ser admin
app.patch('/apadrinhar/desativar/:id',checkAdmin,(req,res)=>{
  const Id=req.params.id;
  const selectSQL= "SELECT * FROM apadrinhamentos WHERE id = ? "
  apadrinhamentos2.get(selectSQL,[Id],(err,row)=>{
    if(err){
      console.error(err);
      return res.status(500).json({message:'Erro no servidor'})
    }
    if(!row){
      return res.status(404).json({message:'Apadrinhamento nao encontrado'})
    }
    const sql = 'UPDATE apadrinhamentos SET ativo = ? WHERE id = ?';
    apadrinhamentos2.run(sql,[0,Id],function(err){
      if(err){
        console.error(err);
        return res.status(500).json({message: 'Erro ao desativar'})
      }
      res.status(200).json({
        message: `Apadrinhamento ${Id} foi desativado `
      })
    })
  })
})
//funçao para visualizar o historico de apadrinhamentos de um padrinho, precisa ser admin e precisa do id de usuario no link /padrinhos/1/apadrinhamentos

app.get('/padrinhos/:id/apadrinhamentos', checkAdmin, (req, res) => {
  const userId = req.params.id;

  const sqlApadrinhamentos = `
    SELECT 
      id AS apadrinhamento_id,
      pet_id,
      plano_id,
      data_inicio,
      ativo
    FROM apadrinhamentos
    WHERE user_id = ?
    ORDER BY data_inicio DESC
  `;

  apadrinhamentos2.all(sqlApadrinhamentos, [userId], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Erro ao buscar apadrinhamentos' });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Nenhum apadrinhamento encontrado para esse padrinho' });
    }

    const results = [];
    let pending = rows.length;

    rows.forEach(apad => {
      bancoPets.get('SELECT * FROM pets WHERE pet_id = ?', [apad.pet_id], (errPet, pet) => {
        if (errPet || !pet) {
          pet = { error: 'Pet não encontrado' };
        }

        planos.get('SELECT * FROM planos WHERE id = ?', [apad.plano_id], (errPlano, plano) => {
          if (errPlano || !plano) {
            plano = { error: 'Plano não encontrado' };
          }

          results.push({
            ...apad,
            pet,
            plano
          });

          pending--;
          if (pending === 0) {
            res.status(200).json({
              user_id: userId,
              historico: results
            });
          }
        });
      });
    });
  });
});

//funçao para registrar doaçao, precisa do valor, data, forma e doador e ser admin
app.post('/registrardoacao',checkAdmin,(req,res)=>{
  res.set('content-type','application/json')
  const {valor,data,forma,doador} = req.body;
  console.log("Dados recebidos:",req.body);
  if(!valor|| !data || !forma || !doador){
    console.log("Dados incompletos");
    return res.status(404).json({message:"Dados ncompeltos"})
  }
  const insertSql ='INSERT INTO doacoes(doacao_valor,doacao_data,doacao_forma,doacao_doador)VALUES(?,?,?,?)'
  doacoes.run(insertSql,[valor,data,forma,doador],function(err){
    if(err){
      console.error("Erro ao registrar doacao",err.message)
      return res.status(500).json({ message: "Erro ao salvar usuário" });

    }
    return res.status(201).json({
        status: 201,
        success: true,
        message: 'Doaçao registrada'
      });
  })
})

//funçao para registrar relatorios, precisa ser admin, e espera o id do apadrinhamento, titulo, e a mensagem
app.post('/relatorios', checkAdmin, (req, res) => {
  upload.array('imagens', 5)(req, res, (err) => {
    if (err) {
      console.error('Erro no upload de arquivos:', err);
      return res.status(400).json({ message: 'Erro no upload de arquivos', error: err.message });
    }

    const { apadrinhamento_id, titulo, mensagem } = req.body;
    const imagens = req.files || [];

    const sqlGetUserId = 'SELECT user_id FROM apadrinhamentos WHERE id = ?';
    apadrinhamentos2.get(sqlGetUserId, [apadrinhamento_id], (err, apad) => {
      if (err) return res.status(500).json({ message: 'Erro ao buscar apadrinhamento', error: err.message });
      if (!apad) return res.status(404).json({ message: 'Apadrinhamento não encontrado', error: err.message });

      const userId = apad.user_id;

      const sqlGetEmail = 'SELECT user_email FROM users WHERE user_id = ?';
      DB.get(sqlGetEmail, [userId], (err, user) => {
        if (err) return res.status(500).json({ message: 'Erro ao buscar email do padrinho', error: err.message });
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado', error: err.message });

        const email = user.user_email;

        const sqlInsertRelatorio = `
          INSERT INTO relatorios (apadrinhamento_id, titulo, mensagem)
          VALUES (?, ?, ?)
        `;
        relatorios.run(sqlInsertRelatorio, [apadrinhamento_id, titulo, mensagem], function (err) {
          if (err) return res.status(500).json({ message: 'Erro ao registrar relatório', error: err.message });

          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              type: 'OAuth2',
              user: 'ronronar.suporte@gmail.com',
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            },
            tls: { rejectUnauthorized: false },
            secure: true,
          });

          let html = `<p>${mensagem}</p><br>`;
          const attachments = imagens.map((img, index) => {
            const cid = `img${index}`;
            html += `<img src="cid:${cid}" style="max-width:300px; margin-bottom:10px;" /><br>`;
            return {
              filename: img.originalname,
              path: img.path,
              cid: cid,
            };
          });

          const mailOptions = {
            from: 'Ronronar <ronronar.suporte@gmail.com>',
            to: email,
            subject: `Relatório sobre o pet - ${titulo}`,
            html: html,
            attachments: attachments,
          };

          transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
              console.error('Erro ao enviar e-mail:', err);
              return res.status(500).json({ success: false, message: 'Falha ao enviar e-mail', err: err.message });
            }

            res.json({
              success: true,
              message: 'Email enviado com sucesso!',
            });
          });
        });
      });
    });
  });
});

//funçao para visualizar doaçoes registradas, precisa ser admin 
app.get('/visualizardoacoes',checkAdmin,(req,res)=>{
  res.set('content-type', 'application/json');
  const sql = 'SELECT * FROM doacoes';
  let data = {doacoes:[]}
  doacoes.all(sql,[],(err,rows)=>{
    if(err){
      console.error(err.message);
      res.status(500).json({code:500,status:err.message})
      return;
    }
    rows.forEach(row=>{
      data.doacoes.push({
        id:row.user_id,
        valor:row.doacao_valor,
        data:row.doacao_data,
        forma:row.doacao_forma,
        doador:row.doacao_doador
      })
    })
    res.status(200).json(data);
  })
})

//funçao para iniciar o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT,(err)=>{
    if(err){
        console.log('ERROR:',err.message);
    }
        console.log(`LISTENING on port ${PORT}`)
})  


