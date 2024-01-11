const express=require('express');
const fs=require('fs');
const bodyParser=require('body-parser');
const app=express();
const port=3000;
// const cors=require('cors')
const path=require('path');
app.use(bodyParser.json());

function findIndex(arr,id){
    for(let i=0;i<arr.length;i++){
        if(arr[i].id===id){
            return i;
        } 
    }
    return -1;
}
function removeIndex(arr,index){
    let newArray=[];
    for(let i=0;i<arr.length;i++){
        if(i!==index){
            newArray.push(arr[i]);

        }

    }
    return newArray;
}
// app.use(cors());
app.get('/todos',(req,res)=>{
    fs.readFile('todos.json','utf8',(err,data)=>{
        if(err) throw err;
        res.json(JSON.parse(data))
    });
})
app.get('/todos/:id',(req,res)=>{
    fs.readFile('todos.json','utf8',(err,data)=>{
        if(err) throw err;
        const todos=JSON.parse(data);
        const index=findIndex(todos,parseInt(req.params.id));
        res.json(todos[index]);
    })
})
app.post('/todos',(req,res)=>{
    const newTodo={
        id:Math.floor(Math.random()*100000),
        title:req.body.title,
        description:req.body.description,
        
    };
    fs.readFile('todos.json','utf8',(err,data)=>{
        if(err) throw err;
        const todos=JSON.parse(data);
    todos.push(newTodo);
    fs.writeFile('todos.json',JSON.stringify(todos),(err)=>{
        if(err) throw err;
        res.status(200).json(newTodo);
    })
    })
    

});

app.put('/todos/:id',(req,res)=>{
    fs.readFile('todos.json','utf8',(err,data)=>{
        if(err) throw err;
        const todos=JSON.parse(data);
        const index=findIndex(todos,parseInt(req.params.id));
        if(index===-1){
            res.status(404).send();
        }
        else{
            const UpdatedTodo={
                id:todos[index].id,
                title:req.body.title,
                description:req.body.description
            }
            todos[index]=UpdatedTodo;
            fs.writeFile('todos.json',JSON.stringify(todos),(err)=>{
                if(err) throw err;
                res.status(200).json(UpdatedTodo)
            })
        }
        
    })
})
app.delete('/todos/:id',(req,res)=>{
    fs.readFile('todos.json','utf8',(err,data)=>{
        if(err) throw err;
        var todos=JSON.parse(data);
        const index=findIndex(todos,parseInt(req.params.id));
        if(index===-1){
            res.status(404).send();
        }
        else{
            todos=removeIndex(todos,index);
            fs.writeFile('todos.json',JSON.stringify(todos),(err)=>{
                if(err) throw err;
                res.status(200).send();
            })
        }
    })
}) 
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'index.html'))
})
app.listen(port)
