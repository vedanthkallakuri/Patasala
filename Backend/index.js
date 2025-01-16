import 'dotenv/config'
import jwt from 'jsonwebtoken';

import express from 'express';
import mysql from 'mysql2'
import cors from'cors'
import validator from "email-validator";
import nodemailer from "nodemailer"
import handlebars from "handlebars"
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import cryptoRandomString from 'crypto-random-string';
import fs from "fs";
import multer from 'multer'
import { getUserPresignedUrls, uploadToS3 } from './s3.mjs'

import bcrypt from 'bcrypt'
import { verify } from 'crypto';
const saltRounds = 10;

const storage = multer.memoryStorage()
const upload = multer({ storage })

const app = express()

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "sql_patasala"
})

app.use(express.json())
app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true
}));
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(session({
    key: "ACCOUNT_CHOOSER",
    secret: "",
    resave: true,
    rolling: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000,
        expires: 3600000
    }
}))



app.get('/', (req, res) => {
    res.json("On home /");
})

app.get('/user', (req, res) => {
    const q = "SELECT * FROM user";
    db.query(q, (err, data)=>{
        if(err) return res.json(err);
        return res.json(data);
    })
})


app.post('/register', (req,res)=>{

    const checkq = "SELECT * FROM user WHERE username = ?"

    const q = "INSERT INTO user (`username`, `password`) VALUES (?, ?)";

    const email = req.body.email;
    const password = req.body.password;
        
    db.query(checkq, email, (err, data) =>{
        if(data.length > 0) {
            res.sendStatus(409);
        }
        else{
            bcrypt.hash(password, saltRounds, (err, hash) => {
                if(err){
                    res.json(err)
                }
                db.query(q,[email, hash], (err)=>{
                    if(err) return res.json(err)
                    res.json("User has been creaeted")
                })
            })
        }
    })
})

const verifyJwt = (req, res, next) => {
    const token = req.headers["access-token"];
    if(!token){
        return res.json("No token provided");
    }
    else {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if(err){
                res.json("Not Authenticated");
            }
            else {
                req.user_id = decoded.user_id;
                next();
            }
        })
    }
}

app.get('/checkauth', verifyJwt, (req, res) => {
    return res.json("Authenticated");
})


app.post('/login', (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;

    const q = "SELECT * FROM user WHERE username = ?";

    db.query(q, [username], (err, data) => {
        if(err) return res.json(err);
        if(data.length > 0){
            bcrypt.compare(password, data[0].password, (error, response) => {
                if(response) {
                    const user_id = data[0].user_id
                    const accessToken = jwt.sign({user_id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: 300})
                    const refreshToken = jwt.sign(user_id, process.env.REFRESH_TOKEN_SECRET)
                    
                
                    console.log("access token: " + accessToken)

                    req.session.user = data
                    return res.json({token: accessToken, data});
                }
                
            })
        }
        else return res.sendStatus(401);
    })
})

app.get('/login', (req,res)=>{
    if(req.session.user){
        return res.json({loggedIn: true, user: req.session.user})
    }
    else{
        return res.json({loggedIn: false})
    }
})

app.post('/login-google', (req,res) => {

    const firstname = req.body.name;
    //const lastname = req.body.family_name;
    const profileImg = req.body.picture;
    const email = req.body.email;

    //console.log(firstname + " " + profileImg + " " + email)

    const qCheck = "SELECT * FROM user WHERE username = ?";
    db.query(qCheck, email, (err, data) => {
        if(data.length > 0){
            req.session.user = data;
            return res.json(data)
        }
        else{
            const qInsert = "INSERT INTO user (`firstname`, `username`, `profile_img`) VALUES (?, ?, ?);"
            db.query(qInsert, [firstname, email, profileImg], (err,data) => {
                if(err) return res.json(err);
                else{
                    const qData = "SELECT * FROM user WHERE user_id = LAST_INSERT_ID();";
                    db.query(qData, (err, data) => {
                        req.session.user = data;
                        return res.json(data)
                    })
                }
            })
        }
    })

    
})

app.get('/login-google', (req,res) => {

})

app.get('/logout',(req,res) => {
    req.session.destroy();
    res.redirect('/');
});

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.email',
    secure: false,
    service: 'gmail',
    auth: {
        user:  "patasalamusic@gmail.com",
        pass: "cmqvwgvscjzjtxju"
    }
})

app.post('/resetPassword', async (req, res) => {
    const email = req.body.email;
    

    const token = cryptoRandomString({length: 7, type: 'alphanumeric'});
    const token_expiration = Date.now() + 3600000;
    const addTokenQuery = "UPDATE user SET `reset_token` =  ?, `reset_token_expiration` = ? WHERE username = ?;"
    db.query(addTokenQuery, [token, token_expiration, email], (err, data) => {
        if(err) return res.status(400).send(err)
    })

    const source = fs.readFileSync('reset_password.html', 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
        code: token
    }
    const htmlToSend = template(replacements)
    const info =  transporter.sendMail({
        from: "patasalamusic@gmail.com",
        to: email,
        subject: "Here is your Password Reset Code",
        text: "",
        html: htmlToSend
    })

    
   
    
})


app.get('/songs', (req,res) =>{
    const student_id = req.query.student_id;
    const q = `SELECT S.id, S.name, S.raga_id, R.name as raga_name, S.tala_id, T.name as tala_name, lyricist, composer, audio, script, DATE_FORMAT(date_learned,'%m/%d/%Y') AS date_learned
                FROM songs S 
                left outer join ragas R 
                on S.raga_id = R.id 
                left outer join talas T 
                on S.tala_id = T.id 
                WHERE student_id = ?`;
    db.query(q, [student_id], (err,data)=>{
        if(err) {
            console.log(err);
            return res.json(err);
        }
        else{
            return res.json(data);
        }
    })
})

app.delete('/songs', (req,res)=>{
    var ids = req.query.ids;
    const q = "DELETE FROM songs WHERE id IN (?)";
    db.query(q, [ids], (err, data) => {
        if(err){
            console.log(err);
            return res.json(err)
        } 
        return res.json("Song deleted successfully")
    })
})

app.post('/songs', (req,res) => {
    var date_learned = req.body.date_learned;

    const q = "INSERT INTO songs (`student_id`, `name`, `raga_id`, `tala_id`, `lyricist`, `composer`, `audio`, `script`, `date_learned`) VALUES (?)"

    if(date_learned){
        const indexOfT = date_learned.indexOf('T');
        if(indexOfT == -1){
            date_learned = date_learned?.split("/").reverse().join("-");
        }
        else{
            date_learned = date_learned.substring(0, indexOfT);
        }
    }
    const values = [
        req.body.student_id,
        req.body.name,
        req.body.raga_id,
        req.body.tala_id,
        req.body.lyricist,
        req.body.composer,
        req.body.audio,
        req.body.script,
        date_learned
    ]

    db.query(q, [values], (err, data) => {
        if(err) {
            console.log(err);
            return res.json(err);
        }
        else return res.json("Song successfully created");
    })
})

app.put("/songs", (req, res) => {
    const id = req.body.id;
    const q = "UPDATE songs SET `name` = ?, `raga_id` = ?, `tala_id` = ?, `lyricist` = ?, `composer` = ?, `audio` = ?, `script` = ?, `date_learned` = ? WHERE id = ?"

    var date_learned = req.body.date_learned;

    if(date_learned){
        const indexOfT = date_learned.indexOf('T');

        if(indexOfT == -1){
            date_learned = date_learned.replace(/(\d\d)\/(\d\d)\/(\d{4})/, "$3-$1-$2");
        }
        else{
            date_learned = date_learned.substring(0, indexOfT);
        }
    }

    const values = [
        req.body.name,
        req.body.raga_id,
        req.body.tala_id,
        req.body.lyricist,
        req.body.composer,
        req.body.audio,
        req.body.script,
        date_learned
    ]


    db.query(q, [...values, id], (err, data) => {
        if(err){
            console.log(err);
            return res.json(err);
        } 
        else{
            console.log("success")
            return res.json("Song has been updated successfully");
        }
    })
})

app.get("/ragas", (req, res) => {
    const q = `SELECT R.id, R.name, arohanam, avarohanam, custom_flag, custom_student_id 
                FROM ragas AS R
                WHERE custom_flag = 0
                UNION
                SELECT R.id, R.name, arohanam, avarohanam, custom_flag, custom_student_id 
                FROM ragas as R 
                WHERE custom_flag = 1 
                AND custom_student_id = ?`;
                
    var student_id = req.query.student_id;

    db.query(q, [student_id], (err,data) => {
        if(err) {
            console.log(err);
            return res.json(err);
        }
        return res.json(data);
    })
})

app.post("/ragas", (req, res) => {
    const q = "INSERT INTO ragas (`name`, `arohanam`, `avarohanam`, `custom_flag`, `custom_student_id`) VALUES (?)";
    
    const values = [
        req.body.name,
        req.body.arohanam,
        req.body.avarohanam,
        req.body.custom_flag,
        req.body.custom_student_id
    ];

    db.query(q, [values], (err,data) => {
        if(err) {
            console.log(err);
            return res.json(err);
        }
        return res.json(data);
    })
})

app.put("/ragas", (req, res) => {
    const raga_id = req.body.id;
    const q = "UPDATE ragas SET `name` = ?, `arohanam` = ?, `avarohanam` = ? WHERE id = ?"

    const values = [
        req.body.name,
        req.body.arohanam,
        req.body.avarohanam,
    ]
    db.query(q, [...values, raga_id], (err, data) => {
        if(err){
            console.log(err);
            return res.json(err);
        } 
        else{
            return res.json("Raga has been updated successfully");
        }
    })
})

app.delete('/ragas', (req,res)=>{
    // const raga_id = req.params.id;
    // const q = "DELETE FROM ragas WHERE id = ?";
    // db.query(q, [raga_id], (err, data) => {
    //     if(err) {
    //         console.log(err);
    //         return res.json(err);
    //     }
    //     return res.json("Raga deleted successfully")
    // })

    var ids = req.query.ids;
    const q = "DELETE FROM ragas WHERE id IN (?)";
    db.query(q, [ids], (err, data) => {
        if(err){
            console.log(err);
            return res.json(err)
        } 
        return res.json("Raga deleted successfully")
    })
})


app.get("/talas", (req, res) => {
    const q = `SELECT T.id, T.name, description, custom_flag, custom_student_id 
                FROM talas AS T
                WHERE custom_flag = 0
                UNION
                SELECT T.id, T.name, description, custom_flag, custom_student_id 
                FROM talas as T 
                WHERE custom_flag = 1 
                AND custom_student_id = ?`;

    var student_id = req.query.student_id;

    db.query(q, [student_id], (err,data) => {
        if(err) {
            console.log(err);
            return res.json(err);
        }
        else{
            console.log(err);
            return res.json(data);

        }
    })
})

app.post("/talas", (req, res) => {
    const q = "INSERT INTO talas (`name`, `description`, `custom_flag`, `custom_student_id`) VALUES (?)";
    
    const values = [
        req.body.name,
        req.body.description,
        req.body.custom_flag,
        req.body.custom_student_id
    ];

    db.query(q, [values], (err,data) => {
        if(err) {
            console.log(err);
            return res.json(err);
        }
        else {
            return res.json(data);
        }
    })
})

app.put("/talas", (req, res) => {
    const tala_id = req.body.id;
    const q = "UPDATE talas SET `name` = ?, `description` = ? WHERE id = ?"

    const values = [
        req.body.name,
        req.body.description,
    ]

    db.query(q, [...values, tala_id], (err, data) => {
        if(err){
            console.log(err);
            return res.json(err);
        } 
        else{
            return res.json("Tala has been updated successfully");
        }
    })
})

app.delete('/talas', (req,res)=>{
    // const tala_id = req.params.id;
    // const q = "DELETE FROM talas WHERE id = ?";
    // db.query(q, [tala_id], (err, data) => {
    //     if(err) {
    //         console.log(err);
    //         return res.json(err);
    //     }
    //     return res.json("Tala deleted successfully")
    // })


    var ids = req.query.ids;
    const q = "DELETE FROM talas WHERE id IN (?)";
    db.query(q, [ids], (err, data) => {
        if(err){
            console.log(err);
            return res.json(err)
        } 
        return res.json("Tala deleted successfully")
    })
})

app.get("/dashboard-stats", (req, res) => {
    const q = `SELECT  count(DISTINCT(id)) AS song_count, 
		        count(DISTINCT(raga_id)) AS raga_count, 
                count(DISTINCT(tala_id)) AS tala_count, 
                count(DISTINCT(composer)) AS composer_count 
                FROM songs 
                WHERE student_id = ?`;

    var student_id = req.query.student_id;

    db.query(q, [student_id], (err,data) => {
        if(err){
            console.log(err);
            return res.json(err);
        }
        else{
            return res.json(data);
        }
    })
})

app.get("/dashboard-linechart", (req,res) => {
    const q = `Select count(*) AS count, date_learned from songs
                Where (curdate()-date_learned) <= 30 AND student_id = ?
                Group by date_learned 
                Order by 2`;
    
    var student_id = req.query.student_id;

    db.query(q, [student_id], (err,data) => {
        if(err){
            console.log(err);
            return res.json(err);
        }
        else{
            return res.json(data);
        }
    })

})

app.get("/dashboard-piechart", (req,res) => {
    const q = `SELECT S.raga_id as id, count(*) AS value, R.name as label
	            FROM songs S
	            left outer join ragas R
                on S.raga_id = R.id
                WHERE student_id = ?
                GROUP by label, id
                Order by 1`;
    
    var student_id = req.query.student_id;

    db.query(q, [student_id], (err,data) => {
        if(err){
            console.log(err);
            return res.json(err);
        }
        else{
            return res.json(data);
        }
    })

})

app.get("/dashboard-stats-growth", (req, res) => {
    const q = 
        `SELECT CurrMonthSongs - LastMonthSongs AS growth,
            'songs'
        FROM
        (SELECT
            (SELECT count(DISTINCT ID)
            FROM Songs
            WHERE student_id = ? AND date_learned BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL DAYOFMONTH(CURRENT_DATE)-1 DAY) AND CURRENT_DATE)AS CurrMonthSongs,

            (SELECT count(DISTINCT ID)
            FROM Songs
            WHERE student_id = ? AND date_learned BETWEEN (last_day(curdate() - INTERVAL 2 MONTH) + INTERVAL 1 DAY) AND (last_day(curdate() - INTERVAL 1 MONTH))) AS LastMonthSongs) RESULT
        UNION
        SELECT CurrMonthRagas - LastMonthRagas,
            'ragas'
        FROM
        (SELECT
            (SELECT count(DISTINCT raga_id)
            FROM songs
            WHERE student_id = ? AND date_learned BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL DAYOFMONTH(CURRENT_DATE)-1 DAY) AND CURRENT_DATE)AS CurrMonthRagas,

            (SELECT count(DISTINCT raga_id)
            FROM songs
            WHERE student_id = ? AND date_learned BETWEEN (last_day(curdate() - INTERVAL 2 MONTH) + INTERVAL 1 DAY) AND (last_day(curdate() - INTERVAL 1 MONTH))) AS LastMonthRagas) RESULT
        UNION
        SELECT CurrMonthTalas - LastMonthTalas,
            'talas'
        FROM
        (SELECT
            (SELECT count(DISTINCT tala_id)
            FROM songs
            WHERE student_id = ? AND date_learned BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL DAYOFMONTH(CURRENT_DATE)-1 DAY) AND CURRENT_DATE)AS CurrMonthTalas,

            (SELECT count(DISTINCT tala_id)
            FROM songs
            WHERE student_id = ? AND date_learned BETWEEN (last_day(curdate() - INTERVAL 2 MONTH) + INTERVAL 1 DAY) AND (last_day(curdate() - INTERVAL 1 MONTH))) AS LastMonthTalas) RESULT
        UNION
        SELECT CurrMonthLyricist - LastMonthLyricist,
            'lyricist'
        FROM
        (SELECT
            (SELECT count(DISTINCT lyricist)
            FROM songs
            WHERE student_id = ? AND date_learned BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL DAYOFMONTH(CURRENT_DATE)-1 DAY) AND CURRENT_DATE)AS CurrMonthLyricist,

            (SELECT count(DISTINCT lyricist)
            FROM songs
            WHERE student_id = ? AND date_learned BETWEEN (last_day(curdate() - INTERVAL 2 MONTH) + INTERVAL 1 DAY) AND (last_day(curdate() - INTERVAL 1 MONTH))) AS LastMonthLyricist) RESULT`;
    
    var student_id = req.query.student_id;

    db.query(q, [student_id,student_id,student_id,student_id,student_id,student_id,student_id,student_id], (err,data) => {
        if(err){
            console.log(err);
            return res.json(err);
        }
        else{
            return res.json(data);
        }
    })
})


app.post("/documents", upload.single("document"), (req,res) => {
    const { body, file } = req;
    const userId = body.userId;


    if(!file || !userId) return res.status(400).json({message: "Bad request"});
    
    const {error, key} = uploadToS3({file, userId });
    if(error) return res.status(500).json({message: error.message});

    return res.status(201).json({key});
})

app.get("/documents", async (req, res) => {
    const userId = 23;


    if(!userId) return res.status(400).json({message: "Bad request"});
    
    const {err, presignedUrls} = await getUserPresignedUrls(userId);
    if(err) return res.status(400).json({message: error.message})
    
    return res.json(presignedUrls)
})

app.listen(3000, ()=>{
    console.log("Server running on port 3000")
})
