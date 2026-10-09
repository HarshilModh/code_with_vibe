"use client";
import { useFileExplorer } from "@/modules/playground/hooks/useFileExplorer";
import React, { useRef,useEffect,useCallback, act } from "react";
import Editor , { type Monaco} from "@monaco-editor/react";
import { registerCompletion } from "monacopilot";
import { configureMonaco, defaultEditorOptions, getEditorLanguage } from "@/modules/playground/lib/editor-config"
import type { TemplateFile } from "@/modules/playground/lib/path-to-json"
import { on } from "events";
import { access } from "fs";

interface PlaygroundEditorProps {
    activeFile: TemplateFile | null;
    content: string;
    onContentChange: (value: string) => void;
    isAIToggled?: boolean;
    onAILoadingChange?: (isLoading: boolean) => void;
}

const PlaygroundEditor=({
    activeFile,
    content,
    onContentChange,
    isAIToggled = false,
    onAILoadingChange
}:PlaygroundEditorProps) => {
    const monacoRef = useRef<Monaco | null>(null);
    const editorRef = useRef<any>(null);

    const handleEditorDidMount = (editor:any ,monaco:Monaco)=>{
         editorRef.current = editor
    monacoRef.current = monaco
    console.log("Editor instance mounted:", !!editorRef.current)

    editor.updateOptions({
        ...defaultEditorOptions
    });

    configureMonaco(monaco)

    updateEditorLanguage()
    }
     const updateEditorLanguage = ()=>{
         if (!activeFile || !monacoRef.current || !editorRef.current) return
    const model = editorRef.current.getModel()
    if (!model) return

    const language = getEditorLanguage(activeFile.fileExtension || "")
    try {
      monacoRef.current.editor.setModelLanguage(model, language)
    } catch (error) {
      console.warn("Failed to set editor language:", error)
    }
    }
    useEffect(()=>{
        updateEditorLanguage()
    },[activeFile, updateEditorLanguage])

    useEffect(() => {
        let registration: any = null;

        if (isAIToggled && editorRef.current && monacoRef.current && activeFile) {
            registration = registerCompletion(monacoRef.current, editorRef.current, {
                endpoint: '/api/code-completion',
                language: getEditorLanguage(activeFile.fileExtension || ""),
                onCompletionRequested: () => onAILoadingChange?.(true),
                onCompletionRequestFinished: () => onAILoadingChange?.(false),
                requestHandler: async () => {
                    const editor = editorRef.current;
                    const position = editor.getPosition();
                    if (!position) return { completion: null };
                    
                    const fileContent = editor.getValue();
                    const fileName = activeFile.filename + (activeFile.fileExtension ? '.' + activeFile.fileExtension : '');

                    try {
                        const response = await fetch('/api/code-completion', {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                fileContent,
                                cursorLine: position.lineNumber - 1,
                                cursorColumn: position.column - 1,
                                suggestionType: "code completion",
                                fileName
                            }),
                        });
                        if (!response.ok) throw new Error("API failed");
                        const data = await response.json();
                        return { completion: data.suggestion || null };
                    } catch (error) {
                        console.error("AI code completion error:", error);
                        return { completion: null, error: "Failed to load" };
                    }
                }
            });
        }

        return () => {
            if (registration) {
                registration.deregister();
            }
        };
    }, [isAIToggled, activeFile, onAILoadingChange]);

    return (
    <div className='h-full relative'>
        <Editor 
        height={"100%"}
        value={content}
        onChange={(value)=>onContentChange(value || "")}
        onMount={handleEditorDidMount}
        language={activeFile ? getEditorLanguage(activeFile.fileExtension || "") : "plaintext"}
        // @ts-ignore
        options={defaultEditorOptions}
        />
    </div>
  )
}

export default PlaygroundEditor