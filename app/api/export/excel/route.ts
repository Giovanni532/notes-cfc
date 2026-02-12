import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/drizzle";
import { module, userModuleNote } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        // Vérifier l'authentification
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Récupérer les notes utilisateur avec les modules, triées par mise à jour la plus récente
        const notesWithModules = await db
            .select({
                id: module.id,
                nom: module.nom,
                code: module.code,
                annee: module.annee,
                isCie: module.isCie,
                note: userModuleNote.note,
            })
            .from(userModuleNote)
            .innerJoin(
                module,
                and(
                    eq(userModuleNote.moduleId, module.id),
                    eq(userModuleNote.userId, userId),
                )
            )
            .orderBy(module.annee, module.code, desc(userModuleNote.updatedAt));

        // Dédupliquer par module et exclure les notes à 0
        const modulesWithNotes = new Map<string, { nom: string; note: number }>();
        for (const row of notesWithModules) {
            if (row.note <= 0) continue;
            if (!modulesWithNotes.has(row.id)) {
                modulesWithNotes.set(row.id, {
                    nom: row.nom,
                    note: row.note,
                });
            }
        }

        // Créer le contenu CSV avec séparateur point-virgule pour Excel
        let csvContent = "Module;Note\n";

        // Ajouter seulement les modules avec leurs notes
        modulesWithNotes.forEach((mod) => {
            // Nettoyer le nom du module et utiliser le point-virgule comme séparateur
            const moduleName = mod.nom.replace(/"/g, '').replace(/;/g, ','); // Supprimer les guillemets et remplacer les points-virgules
            // Convertir la note pour utiliser la virgule comme séparateur décimal
            const noteFormatted = mod.note.toString().replace('.', ',');
            csvContent += `"${moduleName}";${noteFormatted}\n`;
        });

        // Créer la réponse avec les headers appropriés
        const response = new NextResponse(csvContent);
        response.headers.set('Content-Type', 'text/csv; charset=utf-8; sep=;');
        response.headers.set('Content-Disposition', `attachment; filename="notes-cfc-${new Date().toISOString().split('T')[0]}.csv"`);

        return response;
    } catch (error) {
        console.error("Erreur lors de l'export Excel:", error);
        return NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        );
    }
} 