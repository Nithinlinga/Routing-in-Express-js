const express=require('express');
const port=3000;
const path=require('path');
const fs=require('fs');
const bodyParser=require('body-parser');
const { checkPrime } = require('crypto');
const app=express();
app.use(bodyParser.json())


app.get('/users',(req,res)=>{
    fs.readFile('data.json','utf8',(err,data)=>{
        if(err) throw err;
        const users=JSON.parse(data);
        for(let i=0;i<users.length;i++){
            console.log(users[i].email);
        }
        res.json(users)
        
    })
})

app.post('/auth',(req,res)=>{
    newUser={
        email:req.body.email,
        password:req.body.password
    }

    fs.readFile('data.json','utf8',(err,data)=>{
        if(err) throw err;
        const users=JSON.parse(data);
        const userExists = users.some(user => user.email === newUser.email);
        if(userExists){
            res.status(401).json("User already exists. Please login.");
        }
        else{

        
        users.push(newUser);    
        fs.writeFile('data.json',JSON.stringify(users),(err)=>{
            if(err) throw err;
            res.status(200).json(newUser); 
        })
    }
    })
})

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'authenticate.html'));
})
app.listen(port)
