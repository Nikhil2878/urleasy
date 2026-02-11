import {createServer} from "http";
import express from "express";
import router from "./routes/shortener.routes.js"
import dotenv from "dotenv";
import { authRoutes } from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import {verifyAuthentication} from "./middlewares/verify-auth-middleware.js";

dotenv.config();
const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));




app.use(express.json());
app.use(cookieParser());

//After cookieParser use this session middleware
app.use(session({
  secret: "my-secret",
  resave: true,
  saveUninitialized: false
}))
app.use(flash());


app.use(verifyAuthentication);

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  return next();
});


//Express router
app.use(authRoutes);
app.use(router);


//EJS template engine for dynamic content
app.set("view engine","ejs");
app.set("views","./views");



            const PORT =  3000;
app.listen(PORT,()=>{
    console.log(`Server running at http://localhost:${PORT}`);

})