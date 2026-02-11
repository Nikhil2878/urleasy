import { ConsoleLogWriter } from "drizzle-orm";
import { comparePassword, createUser,generateToken,getUserByEmail, hashPassword } from "../services/auth.services.js";
import { loginUserSchema, registerUserSchema } from "../validators/auth-validator.js";
export const getRegisterPage = (req,res) => {
    return res.render("auth/register",{errors: req.flash('errors')});
}

export const postRegister = async(req,res) => {
    // console.log(req.body);
    if(req.user) return res.redirect("/");

    // const{name,email,password} = req.body;
    const {data,error} = registerUserSchema.safeParse(req.body);
    console.log("data hai",data);
    if(error){
        const errors = error.issues[0].message;
        req.flash("errors",errors);
        // console.log("error hai ",error);
        res.redirect("/register");
    }
    const{name,email,password} = data;

    const userExists = await getUserByEmail(email);
    console.log("userExists : ",userExists);

    // if(userExists) return res.redirect("/register");
    if(userExists){
        req.flash("errors", "User already exists");
        res.redirect("/register");
    }
    //we will do hashing
    const hashedPassword = await hashPassword(password);

    const [user] = await createUser({name,email,password: hashedPassword});
    console.log(user);
    res.redirect("/login");
}

export const getLoginPage = (req,res) => {
    if(req.user) return res.redirect("/");

    return res.render("auth/login",{errors: req.flash('errors')});
}
export const postLogin = async(req,res) => {

    if(req.user) return res.redirect("/");

    // res.cookie("isLoggedIn",true);
    // res.cookie("isLoggedIn",true);
    // res.redirect("/");
    const {data,error} = loginUserSchema.safeParse(req.body);
     if(error){
        const errors = error.issues[0].message;
        req.flash("errors",errors);
        // console.log("error hai ",error);
        res.redirect("/login");
    }

    const{email,password} = req.body;

    const user= await getUserByEmail(email);

    // if(!user) return res.redirect("login");
    if(!user){
        req.flash("errors", "Invalid Email or password");
        return res.redirect("login")
    }

    //we will compare hashed password 
    const isPasswordValid = await comparePassword(password,user.password);

    //Simple compare with real passwords
    // if(user.password !== password) return res.redirect("login")

    //Compare hashed password in this
    // if(!isPasswordValid) return res.redirect("/login");
    if(!isPasswordValid){
        req.flash("errors", "Invalid Email or password");                      
            return res.redirect("/login");
        }


    // res.setHeader("Set-Cookie","isLoggedIn=true; path=/;")
    // res.cookie("isLoggedIn",true);
    

    // JWT
    const token = generateToken({
        id: user.id,
        name: user.name,
        email: user.email,
    });

    res.cookie("access_token",token);
res.redirect("/");

}

export const getMe = (req,res) => {
if(!req.user) return res.send("Not logged in");
return res.send(`<h1>Hey ${req.user.name} - ${req.user.email}</h1> `)
}

export const logoutUser = (req,res) => {
    res.clearCookie("access_token");
    res.redirect("/login");
} 