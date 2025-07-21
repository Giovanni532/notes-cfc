"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAction } from "next-safe-action/hooks";
import { updateModuleNoteAction } from "@/actions/module-actions";
import { toast } from "sonner";

interface Module {
    id: string;
    nom: string;
    code: string;
    annee: number;
    isCie: boolean;
    note: number;
    noteId?: string;
}

interface EditNoteDialogProps {
    module: Module | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EditNoteDialog({ module, open, onOpenChange, onSuccess }: EditNoteDialogProps) {
    const [note, setNote] = useState<number>(0);

    const { execute: updateNote, isPending } = useAction(updateModuleNoteAction, {
        onSuccess: (data) => {
            if (data.data?.success) {
                toast.success(data.data.message);
                onOpenChange(false);
                onSuccess();
            }
        },
        onError: (error) => {
            toast.error("Erreur lors de la mise à jour de la note");
        },
    });

    // Mettre à jour la note quand le module change
    useEffect(() => {
        if (module) {
            setNote(module.note);
        }
    }, [module]);

    const handleSave = () => {
        if (module) {
            updateNote({
                moduleId: module.id,
                note: note,
            });
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        }
    };

    const handleCancel = () => {
        onOpenChange(false);
        if (module) {
            setNote(module.note);
        }
    };

    if (!module) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Modifier la note</DialogTitle>
                    <DialogDescription>
                        Modifie la note pour le module {module.code} - {module.nom}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="note" className="text-right">
                            Note
                        </Label>
                        <Input
                            id="note"
                            type="number"
                            min="0"
                            max="6"
                            step="0.5"
                            value={note}
                            onChange={(e) => setNote(parseFloat(e.target.value) || 0)}
                            onKeyPress={handleKeyPress}
                            className="col-span-3"
                        />
                    </div>
                    <div className="text-sm text-muted-foreground">
                        <p>Note actuelle: {module.note}/6</p>
                        {module.isCie && (
                            <p className="text-blue-600">⚠️ Module CIE - compte pour 1/5 de la moyenne finale</p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        Annuler
                    </Button>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending ? "Sauvegarde..." : "Sauvegarder"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 