import jwt from 'jsonwebtoken';

export function checkAdmin(req,res,next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
     if(!token) return res.status(401).json({message: 'Token não fornecido'});

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
       
        if(!decoded.isAdmin){
            return res.status(403).json({message: 'Acesso negado: apenas administradores'})
        }

        req.user = decoded;
        next();
    }
    catch(err){
        return res.status(403).json({message:'token invalido'});
        
    }
}