"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAction } from "next-safe-action/hooks";
import { updateCompetenceNiveauAction } from "@/actions/competence-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Module {
    id: string;
    nom: string;
    code: string;
    annee: number;
    isCie: boolean;
    note: number;
}

interface Competence {
    id: string;
    nom: string;
    description: string;
    domaine: {
        id: string;
        nom: string;
    };
    niveau: number | null;
    modules: Module[];
}

interface CompetencesListProps {
    competences: Competence[];
}

export function CompetencesList({ competences }: CompetencesListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDomaine, setSelectedDomaine] = useState<string>("all");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const router = useRouter();

    const { execute: updateNiveau, isPending } = useAction(updateCompetenceNiveauAction, {
        onSuccess: () => {
            toast.success("Niveau d'acquisition mis à jour");
            // Rafraîchir la page pour mettre à jour les données
            setIsRefreshing(true);
            router.refresh();
        },
        onError: (error) => {
            toast.error(error.error?.serverError?.message || "Erreur lors de la mise à jour");
        },
    });

    // Filtrer les compétences par recherche et domaine
    const filteredCompetences = competences.filter((comp) => {
        const matchesSearch = comp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comp.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDomaine = selectedDomaine === "all" || comp.domaine.nom === selectedDomaine;
        return matchesSearch && matchesDomaine;
    });

    // Obtenir la liste unique des domaines
    const domaines = Array.from(new Set(competences.map(c => c.domaine.nom))).sort();

    // Grouper les compétences par domaine
    const competencesByDomaine = filteredCompetences.reduce((acc, comp) => {
        if (!acc[comp.domaine.nom]) {
            acc[comp.domaine.nom] = [];
        }
        acc[comp.domaine.nom].push(comp);
        return acc;
    }, {} as Record<string, Competence[]>);

    const handleNiveauChange = (competenceId: string, niveau: string) => {
        if (niveau === "none") return;
        updateNiveau({
            competenceId,
            niveau: parseInt(niveau),
        });
    };

    return (
        <div className="space-y-6">
            {/* Filtres */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <Input
                        placeholder="Rechercher une compétence..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <Select value={selectedDomaine} onValueChange={setSelectedDomaine}>
                        <SelectTrigger>
                            <SelectValue placeholder="Tous les domaines" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les domaines</SelectItem>
                            {domaines.map((domaine) => (
                                <SelectItem key={domaine} value={domaine}>
                                    {domaine}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{competences.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Niveau 1-2</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {competences.filter(c => c.niveau && c.niveau <= 2).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Niveau 3-4</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {competences.filter(c => c.niveau && c.niveau >= 3 && c.niveau <= 4).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Niveau 5</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {competences.filter(c => c.niveau === 5).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Liste des compétences par domaine */}
            <div className="space-y-6">
                {Object.entries(competencesByDomaine).map(([domaineNom, competencesDomaine]) => (
                    <div key={domaineNom} className="space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2">{domaineNom}</h2>
                        <div className="grid gap-4">
                            {competencesDomaine.map((comp) => (
                                <Card key={comp.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-lg">{comp.nom}</CardTitle>
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    {comp.description}
                                                </p>

                                                {/* Modules rattachés */}
                                                {comp.modules.length > 0 && (
                                                    <div className="mt-4">
                                                        <h4 className="text-sm font-medium mb-2">Modules rattachés :</h4>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                                            {comp.modules.map((module) => (
                                                                <div key={module.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium truncate">
                                                                            {module.code} - {module.nom}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            Année {module.annee} {module.isCie && "(CIE)"}
                                                                        </p>
                                                                    </div>
                                                                    <div className="ml-2 flex items-center gap-1">
                                                                        <Badge variant={module.note >= 4 ? "default" : module.note >= 2 ? "secondary" : "outline"}>
                                                                            {module.note.toFixed(1)}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4 flex-shrink-0 flex items-center gap-2">
                                                <Select
                                                    value={comp.niveau?.toString() || "none"}
                                                    onValueChange={(value) => handleNiveauChange(comp.id, value)}
                                                    disabled={isPending}
                                                >
                                                    <SelectTrigger className="w-24">
                                                        <SelectValue placeholder="-" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">-</SelectItem>
                                                        <SelectItem value="1">1</SelectItem>
                                                        <SelectItem value="2">2</SelectItem>
                                                        <SelectItem value="3">3</SelectItem>
                                                        <SelectItem value="4">4</SelectItem>
                                                        <SelectItem value="5">5</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {comp.niveau && (
                                                    <Badge variant={comp.niveau >= 4 ? "default" : comp.niveau >= 2 ? "secondary" : "outline"}>
                                                        Niveau {comp.niveau}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {Object.keys(competencesByDomaine).length === 0 && (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucune compétence trouvée</p>
                </div>
            )}
        </div>
    );
} 