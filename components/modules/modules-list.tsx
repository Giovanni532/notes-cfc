"use client"

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditNoteDialog } from "./edit-note-dialog";
import { ModulesHeader } from "./modules-header";
import { BookOpen, Edit } from "lucide-react";

interface Module {
    id: string;
    nom: string;
    code: string;
    annee: number;
    isCie: boolean;
    note: number;
    noteId?: string;
}

interface ModulesListProps {
    modules: Record<number, Module[]>;
}

export function ModulesList({ modules }: ModulesListProps) {
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Filtrer les modules selon la recherche
    const filteredModules = useMemo(() => {
        if (!searchTerm) return modules;

        const filtered: Record<number, Module[]> = {};

        Object.entries(modules).forEach(([year, yearModules]) => {
            const filteredYearModules = yearModules.filter(module =>
                module.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                module.code.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (filteredYearModules.length > 0) {
                filtered[parseInt(year)] = filteredYearModules;
            }
        });

        return filtered;
    }, [modules, searchTerm]);

    const handleEdit = (module: Module) => {
        setEditingModule(module);
        setDialogOpen(true);
    };

    const handleDialogSuccess = () => {
        // Recharger la page pour mettre à jour les données
        window.location.reload();
    };

    const getNoteColor = (note: number) => {
        if (note >= 5) return "bg-green-100 text-green-800";
        if (note >= 4) return "bg-yellow-100 text-yellow-800";
        if (note >= 3) return "bg-orange-100 text-orange-800";
        return "bg-red-100 text-red-800";
    };

    const getNoteText = (note: number) => {
        if (note === 0) return "Non noté";
        return `${note}/6`;
    };

    return (
        <div className="space-y-6">
            {/* Header avec recherche et statistiques */}
            <ModulesHeader
                modules={modules}
                onSearchChange={setSearchTerm}
            />

            {/* Liste des modules */}
            {Object.entries(filteredModules).map(([year, yearModules]) => (
                <div key={year} className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight">
                        {year}ème année
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {yearModules.map((module) => (
                            <Card key={module.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-2">
                                            <BookOpen className="h-5 w-5 text-muted-foreground" />
                                            <Badge variant="outline" className="text-xs">
                                                {module.code}
                                            </Badge>
                                            {module.isCie && (
                                                <Badge variant="secondary" className="text-xs">
                                                    CIE
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <CardTitle className="text-lg">{module.nom}</CardTitle>
                                    <CardDescription>
                                        Module de {year}ème année
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Note actuelle:</p>
                                            <Badge className={getNoteColor(module.note)}>
                                                {getNoteText(module.note)}
                                            </Badge>
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEdit(module)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Modifier
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}

            {/* Message si aucun module trouvé */}
            {Object.keys(filteredModules).length === 0 && searchTerm && (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">
                        Aucun module trouvé pour "{searchTerm}"
                    </p>
                </div>
            )}

            {/* Dialog de modification */}
            <EditNoteDialog
                module={editingModule}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={handleDialogSuccess}
            />
        </div>
    );
} 