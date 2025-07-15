"use client"

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Calculator, BookOpen } from "lucide-react";

interface Module {
    id: string;
    nom: string;
    code: string;
    annee: number;
    isCie: boolean;
    note: number;
    noteId?: string;
}

interface ModulesHeaderProps {
    modules: Record<number, Module[]>;
    onSearchChange: (searchTerm: string) => void;
}

export function ModulesHeader({ modules, onSearchChange }: ModulesHeaderProps) {
    const [searchTerm, setSearchTerm] = useState("");

    // Calculer la moyenne totale
    const averageStats = useMemo(() => {
        const allModules = Object.values(modules).flat();
        const modulesWithNotes = allModules.filter(module => module.note > 0);

        if (modulesWithNotes.length === 0) {
            return {
                totalModules: allModules.length,
                modulesWithNotes: 0,
                average: 0,
                cieAverage: 0,
                totalAverage: 0
            };
        }

        // Calculer la moyenne des modules normaux
        const normalModules = modulesWithNotes.filter(module => !module.isCie);
        const normalAverage = normalModules.length > 0
            ? normalModules.reduce((sum, module) => sum + module.note, 0) / normalModules.length
            : 0;

        // Calculer la moyenne des modules CIE
        const cieModules = modulesWithNotes.filter(module => module.isCie);
        const cieAverage = cieModules.length > 0
            ? cieModules.reduce((sum, module) => sum + module.note, 0) / cieModules.length
            : 0;

        // Calculer la moyenne totale (CIE compte pour 1/5)
        const totalAverage = normalAverage * 0.8 + cieAverage * 0.2;

        return {
            totalModules: allModules.length,
            modulesWithNotes: modulesWithNotes.length,
            average: normalAverage,
            cieAverage: cieAverage,
            totalAverage: totalAverage
        };
    }, [modules]);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        onSearchChange(value);
    };

    return (
        <div className="space-y-6">
            {/* Barre de recherche */}
            <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Rechercher un module par nom ou code..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Statistiques de moyenne */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Modules
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{averageStats.totalModules}</div>
                        <p className="text-xs text-muted-foreground">
                            {averageStats.modulesWithNotes} avec notes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Moyenne Normale
                        </CardTitle>
                        <Calculator className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {averageStats.average.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Modules non-CIE
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Moyenne CIE
                        </CardTitle>
                        <Calculator className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {averageStats.cieAverage.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Modules CIE (1/5)
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-primary text-primary-foreground">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Moyenne Totale
                        </CardTitle>
                        <Calculator className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {averageStats.totalAverage.toFixed(2)}
                        </div>
                        <p className="text-xs opacity-80">
                            Moyenne finale
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 