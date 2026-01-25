import {createServer} from "http";
import express from "express";
import router from "./routes/shortener.routes.js"
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
//Express router
app.use(router);
//EJS template engine for dynamic content
app.set("view engine","ejs");
app.set("views","./views");

            const PORT =  3000;
app.listen(PORT,()=>{
    console.log(`Server running at http://localhost:${PORT}`);

})