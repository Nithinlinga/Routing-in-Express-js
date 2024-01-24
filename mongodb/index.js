const express=require('express');
const jwt=require('jsonwebtoken');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');

const app=express();
app.use(express.json());
const SECRET='secrEt';

//create Schema
const userSchema=new mongoose.Schema({
    username:String,
    password:String,
    purchasedCourses:[{type: mongoose.Schema.Types.ObjectId, ref:'Course'}]
});
const adminSchema=new mongoose.Schema({
    username: String, 
    password: String
});
const courseSchema=new mongoose.Schema({
    title : String,
    description: String,
    price: Number,
    image: String,
    published: Boolean
})

//create models
const User=new mongoose.model('User',userSchema)
const Admin=new mongoose.model('Admin',adminSchema);
const Course=new mongoose.model('Course',courseSchema)

const authenticateJwt = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      jwt.verify(token, SECRET, (err, user) => {
        if (err) {
          return res.sendStatus(403);
        }
        req.user = user;
        next(); 
      });
    } else {
      res.sendStatus(401); 
    }
  };
  mongoose.connect('mongodb://nithinlinga2:GIomF33qB0K0QvJB@ac-rpkoumj-shard-00-00.rala7ic.mongodb.net:27017,ac-rpkoumj-shard-00-01.rala7ic.mongodb.net:27017,ac-rpkoumj-shard-00-02.rala7ic.mongodb.net:27017/?replicaSet=atlas-nru2xu-shard-0&ssl=true&authSource=admin',{dbName:"Courses"});
app.post('/admin/signup',async (req,res)=>{
    const {username,password}=req.body;
    const admin=await Admin.findOne({username});
    if(admin){
        res.status(403).json({message:"Admin already exists"})
    }
    else{
        const newAdmin=new Admin({username,password});
        await newAdmin.save();
        const token=jwt.sign({username,role:'admin'},SECRET,{expiresIn:'1hr'});
        res.json({message:"Admin created successfully",token});
    }

})   
app.post('/admin/login',async (req,res)=>{
    const {username,password}=req.headers;
    const admin=await Admin.findOne({username,password});
    if(admin){
        const token=jwt.sign({username,role:'admin'},SECRET,{expiresIn:'1hr'});
        res.json({message:"Login successful",token});
    }
    else{
        res.status(403).json({message:"Invalid Admin Credentials"});
    }

})  
app.post('/admin/courses',authenticateJwt,async (req,res)=>{
    const title=req.body.title
    const isExist=await Course.findOne({title});
    if(isExist){
        res.status(403).json({message:"Course ALready Exists"})
    } 
    else{ 
    const course=new Course(req.body);
    await course.save();
    res.json({message:"Course created succesfully",courseId:course.id});
    }

})
app.put('/admin/courses/:courseId',authenticateJwt,async(req,res)=>{
    const course=await Course.findByIdAndUpdate(req.params.courseId,req.body,{new:true});
    if(course){
        res.json({message:` Updated Successfully`});
    }
    else{
        res.status(403).json({message:"Courses doesnot exist"})
    }
})
app.get('/admin/courses',authenticateJwt,async(req,res)=>{
        const courses=await Course.find({});
        
            res.json({courses});
        
})
app.post('/user/signup',async(req,res)=>{
    const {username,password}=req.body;
    const user=await User.findOne({username});
    if(user){
        res.status(403).json({message:"User already exists"})
    }
    else{
        const newUser=new User({username,password})
        await newUser.save();
        const token=jwt.sign({username, role:'user'},SECRET,{expiresIn:'1hr'});
        res.json({message:"user created Successfully",token})
    }
})
app.post('/user/login',async(req,res)=>{
    const {username,password}=req.headers;
    const user=await User.findOne({username,password});
    if(user){
        const token=jwt.sign({username,role:'user'},SECRET,{expiresIn:'1hr'})
        res.json({message:"Login successfull",token})
    }else{
        res.status(403).json({message:"error"})
    }

})
app.get('/user/courses',async(req,res)=>{
    const courses=await Course.find({published:true});
    if(courses)
    res.json({courses})
})
app.post('/user/courses/:courseId', authenticateJwt, async (req, res) => {
    const course = await Course.findById(req.params.courseId);
    console.log(course);
    if (course) {
      const user = await User.findOne({ username: req.user.username });
      if (user) {
        user.purchasedCourses.push(course);
        await user.save();
        res.json({ message: 'Course purchased successfully' });
      } else {
        res.status(403).json({ message: 'User not found' });
      }
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  });
  
app.get('/user/purchasedCourses', authenticateJwt, async (req, res) => {
    const user = await User.findOne({ username: req.user.username }).populate('purchasedCourses');
    if (user) {
      res.json({ purchasedCourses: user.purchasedCourses || [] });
    } else {
      res.status(403).json({ message: 'User not found' });
    }
  });
app.delete('/user/delete',authenticateJwt,async(req,res)=>{
    const user=await User.findOneAndDelete({ username: req.user.username });
    if(user){
        res.json({message:"User deleted succesfully"})
    }
    else{
        res.status.json({message:"User doesnot exists"})
    }
})
app.listen(3000,()=>{
    console.log("App listening on port 3000")
}) 
