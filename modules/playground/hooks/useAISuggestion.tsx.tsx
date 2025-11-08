import { useState,useCallback } from "react";
import { isLastDayOfMonth } from "date-fns";
import { log } from "node:console";

interface AISuggestionsState {
    suggestion: string | null;
    isLoading: boolean;
    position: { line: number; column: number } | null;
    decoration: string[];
    isEnabled: boolean;
}
interface UseAISuggestionsReturn extends AISuggestionsState {
    toggleEnabled: () => void;
    fetchSuggestion: (type: string, editor: any) => Promise<void>;
    acceptSuggestion: (editor: any, monaco: any) => void;
    rejectSuggestion: (editor: any) => void;
    clearSuggestion: (editor: any) => void;
}
// @ts-ignore
export const useAISuggestions = (): UseAISuggestionsReturn => {
    const [state, setState] = useState<AISuggestionsState>({
        suggestion: null,
        isLoading: false,
        position: null,
        decoration: [],
        isEnabled: true,
    });

    const toggleEnabled = useCallback(() => {
        setState((prev) => ({ ...prev, isEnabled: !prev.isEnabled }))
    }, [])

    const fetchSuggestion = useCallback(async (type: string, editor: any) => {
        setState((currentState) => {

            if (!currentState.isEnabled) {
                return currentState
            }

            if (!editor) {
                return currentState
            }

            const model = editor.getModel();
            const cursorPosition = editor.getPosition()

            if (!model || !cursorPosition) {
                return currentState
            }

            const newState = { ...currentState, isLoading: true };

            (async () => {
                try {
                    const payload = {
                        fileContent: model.getValue(),
                        cursorLine: cursorPosition.lineNumber - 1,
                        cursorColumn: cursorPosition.column - 1,
                        suggestionType: type
                    }

                    const response = await fetch("/api/code-suggestions", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    })
                    if (!response.ok) {
                        throw new Error(`API responded with status ${response.status}`);
                    }

                    const data = await response.json()

                    if (data.suggestion) {
                        const suggestionText = data.suggestion.trim();
                        setState((prev) => ({
                            ...prev,
                            suggestion: suggestionText,
                            position: {
                                line: cursorPosition.lineNumber,
                                column: cursorPosition.column
                            },
                            isLoading: false
                        }))
                    }
                    else {
                        console.warn("No suggestion received from API.");
                        setState((prev) => ({ ...prev, isLoading: false }));
                    }
                } catch (error) {
                    console.error("Error fetching code suggestion:", error);
                    setState((prev) => ({ ...prev, isLoading: false }));
                }
            })();

            return newState
        })
    }, [])
}