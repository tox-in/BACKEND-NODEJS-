const express = require("express")
const bcryptjs = require("bcrypt")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const { string } = require("joi")

const app = express( )

app.use( bodyParser.urlencoded({extended:true}))
app.use(express.json( ))
app.use(cookieParser())
app.use(express.urlencoded({extended:false}))

mongoose.set("strictQuery",false)
mongoose.connect("mongodb://127.0.0.1:27017/hash")
.then(( )=>{
    console.log("mongodb connected")
})
.catch(( )=>{
    console.log("error db")
});

const schema = new mongoose.Schema({
    email: {

        type:String,
        required: true
    },
    name: {
        type:String,
        required:true
    },
    password: {
        type:String,
        required: true
    },
    token:{
        type: String,
        required: true
    }
})

const User = new mongoose.model("User",schema);

async function hashPass(password) {
    const res=await bcryptjs.hash(password,10)
    return res
    console.log(res)
    
}

async function compare(userPassword,hashPass) {
    const res=await bcryptjs.compare(userPassword,hashPass)
    return res
}

app.post("/signup",async(req,res)=>{
    try{
         const check=await User.findOne({name:req.body.name})

         if(check){
            res.send("user already exist")
         }
         else{
                
            const token=jwt.sign({email:req.body.email},"welcometututefricesiwirindecomeagain");
            console.log(token); 
            
            
            const data={
                email:req.body.email,
                name:req.body.name,
                password:await hashPass(req.body.password),
                token:token
            }
            await User.insertMany([data])
            .then(( )=>{
                console.log("successfully")
            })
            .catch(( )=>{
                console.log("error ")
            });
         }
    }
    catch{
res.send("wrong details")
    }
})

app.post("/login",async(req,res)=>{
    try{
         const check=await User.findOne({email:req.body.email})
         const passCheck = await compare(req.body.password,check.password)


         if(check && passCheck){

            res.send({password: hashPass(req.body.password)})
         }

         else{
            res.send("wrong details")
         }
    }
    catch{
res.send("wrong details")
    }
})

app.listen(0004,()=> {
    console.log("port connected")
})