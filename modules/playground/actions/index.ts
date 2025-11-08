"use server";
import { db } from "@/lib/db";
import { TemplateFolder } from "../lib/path-to-json";
import { currentUser } from "@/modules/auth/actions";

export const getPlaygroundById = async (id: string) => {
    try{
        const playground= await db.playground.findUnique({
            where: {id},
           select:{
                title:true,
                templateFiles:{
                    select:{
                        content: true
                    }
                }
            }
        });
        return playground;
    }catch(err){
        console.log(err)
    }
}

export const saveUpdatedCode = async (playgroundId: string, data: TemplateFolder) => {
    const user = await currentUser();
    if(!user) {
        return null;
    }
    try{
        const playground= await db.templateFile.upsert({
            where: {
                id: playgroundId
            },
            update:{
                content: JSON.stringify(data)
            },
            create:{
                playgroundId,
                content: JSON.stringify(data)
            }
        });
        return playground;
    }catch(err){
        console.log(err)
    }
}