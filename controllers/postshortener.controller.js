import crypto from "crypto";
import { getAllShortLinks, getShortLinkByShortCode, insertShortLink } from "../services/shortener.services.js";
// import {loadLinks,getLinkByShortCode, insertShortLink} from "../models/shortener.model.js";
export const getShortenerPage = async(req,res)=>{
try {
                // const file = await readFile(path.join("views","index.html"));

                // const links = await loadLinks();
                const links = await getAllShortLinks();
                return res.render("index",{links,host:req.host})
} catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
}
}
export const postURLShortener = async(req,res)=>{
    try {
        const {url,shortCode} = req.body;
        const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");
        // const links = await loadLinks();
        const link = await getShortLinkByShortCode(finalShortCode);
        if(link){
            return res
            .status(400)
            .send("Short code already exists. Please choose another.");
        }
        // links[finalShortCode] = url;
        // await saveLinks(links);
        // await saveLinks({url,shortCode});
        await insertShortLink({url,finalShortCode});

            return res.redirect("/");
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
    }
}
export const redirectToShortLink = async(req,res)=>{
    try {
        const {shortCode} = req.params;
        // const links = await loadLinks();
          const link = await getShortLinkByShortCode(shortCode);


            // if(!links[shortCode]) return res.status(404).send("404 error occured");
            if(!link) return res.redirect("/404");

            return res.redirect(link.url);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error")
    }
}

