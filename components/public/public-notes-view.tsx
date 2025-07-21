"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

interface Module {
    id: string;
    nom: string;
    code: string;
    annee: number;
    isCie: boolean;
    note: number;
}

interface PublicNotesViewProps {
    modules: Record<number, Module[]>;
    userName: string;
}

export function PublicNotesView({ modules, userName }: PublicNotesViewProps) {
    const [isExporting, setIsExporting] = useState(false);
    const { theme, setTheme } = useTheme();

    // Calculer les statistiques
    const allModules = Object.values(modules).flat();
    const totalModules = allModules.length;
    const modulesWithNotes = allModules.filter(m => m.note > 0);
    const averageNote = modulesWithNotes.length > 0
        ? (modulesWithNotes.reduce((sum, m) => sum + m.note, 0) / modulesWithNotes.length).toFixed(2)
        : "0.00";

    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            // Créer le contenu HTML pour le PDF
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Notes de ${userName}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #333; text-align: center; }
                        h2 { color: #666; border-bottom: 2px solid #eee; padding-bottom: 5px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f5f5f5; font-weight: bold; }
                        .note { font-weight: bold; }
                        .cie { background-color: #fff3cd; }
                        .stats { margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <h1>Notes de ${userName}</h1>
                    <p style="text-align: center; color: #666;">Formation CFC en informatique</p>
                    
                    <div class="stats">
                        <h3>Statistiques</h3>
                        <p><strong>Total des modules :</strong> ${totalModules}</p>
                        <p><strong>Modules notés :</strong> ${modulesWithNotes.length}</p>
                        <p><strong>Moyenne générale :</strong> ${averageNote}/6</p>
                    </div>

                    ${Object.entries(modules).map(([year, yearModules]) => `
                        <h2>${year}ème année</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Module</th>
                                    <th>Note</th>
                                    <th>CIE</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${yearModules.map(module => `
                                    <tr class="${module.isCie ? 'cie' : ''}">
                                        <td>${module.code}</td>
                                        <td>${module.nom}</td>
                                        <td class="note">${module.note}/6</td>
                                        <td>${module.isCie ? 'Oui' : 'Non'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `).join('')}
                    
                    <p style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
                        Généré le ${new Date().toLocaleDateString('fr-FR')}
                    </p>
                </body>
                </html>
            `;

            // Créer un blob avec le contenu HTML
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = window.URL.createObjectURL(blob);

            // Ouvrir dans un nouvel onglet pour impression PDF
            const newWindow = window.open(url, '_blank');
            if (newWindow) {
                newWindow.print();
            }

            toast.success("PDF généré avec succès");
        } catch (error) {
            console.error('Erreur lors de l\'export PDF:', error);
            toast.error("Erreur lors de l'export PDF");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total des modules</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalModules}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Modules notés</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{modulesWithNotes.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Moyenne générale</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{averageNote}/6</div>
                    </CardContent>
                </Card>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-center gap-4">
                <Button onClick={handleExportPDF} disabled={isExporting} size="lg">
                    <FileText className="size-4 mr-2" />
                    {isExporting ? "Génération..." : "Exporter en PDF"}
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    {theme === "dark" ? (
                        <Sun className="size-4 mr-2" />
                    ) : (
                        <Moon className="size-4 mr-2" />
                    )}
                    {theme === "dark" ? "Mode clair" : "Mode sombre"}
                </Button>
            </div>

            {/* Liste des modules par année */}
            <div className="space-y-6">
                {Object.entries(modules)
                    .filter(([year, yearModules]) => yearModules.some(module => module.note > 0))
                    .map(([year, yearModules]) => (
                        <div key={year} className="space-y-4">
                            <h2 className="text-2xl font-semibold border-b border-border pb-2 text-foreground">
                                {year}ème année
                            </h2>
                            <div className="grid gap-4">
                                {yearModules
                                    .filter(module => module.note > 0)
                                    .map((module) => (
                                        <Card key={module.id} className={module.isCie ? "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20" : ""}>
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <CardTitle className="text-lg">{module.code}</CardTitle>
                                                            {module.isCie && (
                                                                <Badge variant="secondary">CIE</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {module.nom}
                                                        </p>
                                                    </div>
                                                    <div className="ml-4">
                                                        <Badge
                                                            variant={module.note >= 4 ? "default" : module.note >= 2 ? "secondary" : "outline"}
                                                            className="text-lg px-3 py-1 font-semibold"
                                                        >
                                                            {module.note}/6
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    ))}
                            </div>
                        </div>
                    ))}
            </div>

            {Object.keys(modules).length === 0 && (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucun module trouvé</p>
                </div>
            )}
        </div>
    );
} 