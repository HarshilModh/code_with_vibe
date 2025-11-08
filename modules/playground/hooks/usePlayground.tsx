import { useState,useEffect,useCallback } from "react";
import { toast } from "sonner";
import type { TemplateFolder } from "../lib/path-to-json";
import { getPlaygroundById, saveUpdatedCode } from "../actions";


interface PlaygroundData{
    id: string;
    title?: string;
    [key: string]: any;
}

interface UsePlaygroundReturn {
    playgroundData: PlaygroundData | null;
    templateData: TemplateFolder | null;
    isLoading: boolean;
    error: string | null;
    loadPlayground:()=>Promise<void>;
    saveTemplateData:(data:TemplateFolder)=>Promise<void>;
}
export const usePlayground=(id:string):UsePlaygroundReturn=>{
    console.log("usePlayground called with id:", id);
    
    const[playgroundData,setPlaygroundData]=useState<PlaygroundData | null>(null);
    const[templateData,setTemplateData]=useState<TemplateFolder | null>(null);
    const[isLoading,setIsLoading]=useState<boolean>(false);
    const[error,setError]=useState<string | null>(null);
    
    const loadPlayground = useCallback(async()=>{
        console.log("Loading playground...");
        
        if(!id) return;
        try{
            console.log("Loading playground with id:", id);
            
            setIsLoading(true);
            setError(null);
            const data=await getPlaygroundById(id);
            console.log("Fetched playground data:", data);
            
            // @ts-ignore
            setPlaygroundData(data);
            const rawContent=data?.templateFiles?.[0]?.content;
            if(typeof rawContent === 'string'){
                setTemplateData(JSON.parse(rawContent));
                console.log("Parsed template data:", JSON.parse(rawContent));
                toast.success("Playground Loaded successfully")
                return;
            }
            const res = await fetch(`/api/template/${id}`);
            console.log("API response:", res);
            
            if(!res.ok){
                throw new Error("Failed to fetch template data")
            }
            const templateRes = await res.json(); 
           console.log("Template response data:", templateRes);
            if(templateRes.templateJson && Array.isArray(templateRes.templateJson)){
                setTemplateData({
                    folderName: "Root",
                    items: templateRes.templateJson

                });
            } 
            else{
                setTemplateData(templateRes.templateJson||{
                    folderName: "Root",
                    items: []
                });
            }
            toast.success("Playground Loaded successfully")
        }catch(err:any){
            console.log(err);
            setError(err.message || "An error occurred while loading the playground");
            toast.error(err.message || "An error occurred while loading the playground")
        }finally{
            setIsLoading(false);
        }
    },[id]);
    const saveTemplateData=useCallback(async(data:TemplateFolder)=>{
        try{
            await saveUpdatedCode(id,data);
            setTemplateData(data);
            toast.success("Playground Updated successfully")
        }
        catch(err:any){
            console.log(err);
            toast.error(err.message || "An error occurred while saving the playground");
            throw err;
        }
    },[id]);
    
    useEffect(()=>{
        loadPlayground();
    },[loadPlayground]);
    return {
        playgroundData,
        templateData,
        isLoading,
        error,
        loadPlayground,
        saveTemplateData
    };
}