import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/drizzle";
import { module, userModuleNote, competence, domaine, userCompetenceNiveau, competenceModule } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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

        // Récupérer tous les domaines
        const domaines = await db
            .select({
                id: domaine.id,
                nom: domaine.nom,
            })
            .from(domaine)
            .orderBy(domaine.nom);

        // Récupérer toutes les compétences avec leurs domaines
        const competences = await db
            .select({
                id: competence.id,
                nom: competence.nom,
                description: competence.description,
                domaineId: competence.domaineId,
                domaine: domaine.nom,
            })
            .from(competence)
            .leftJoin(domaine, eq(competence.domaineId, domaine.id))
            .orderBy(domaine.nom, competence.nom);

        // Récupérer tous les modules
        const modules = await db
            .select({
                id: module.id,
                nom: module.nom,
                code: module.code,
                annee: module.annee,
                isCie: module.isCie,
            })
            .from(module)
            .orderBy(module.annee, module.code);

        // Récupérer les liens compétences-modules
        const liensCompetenceModule = await db
            .select({
                competenceId: competenceModule.competenceId,
                moduleId: competenceModule.moduleId,
            })
            .from(competenceModule);

        // Récupérer les notes de l'utilisateur
        const notesUtilisateur = await db
            .select({
                moduleId: userModuleNote.moduleId,
                note: userModuleNote.note,
            })
            .from(userModuleNote)
            .where(eq(userModuleNote.userId, userId));

        // Récupérer les niveaux de compétences de l'utilisateur
        const niveauxCompetences = await db
            .select({
                competenceId: userCompetenceNiveau.competenceId,
                niveau: userCompetenceNiveau.niveau,
            })
            .from(userCompetenceNiveau)
            .where(eq(userCompetenceNiveau.userId, userId));

        // Structurer les données pour le seeding
        const seedData = {
            domaines: domaines.map(d => ({
                id: d.id,
                nom: d.nom,
            })),
            competences: competences.map(c => ({
                id: c.id,
                nom: c.nom,
                description: c.description,
                domaineId: c.domaineId,
                domaine: c.domaine,
            })),
            modules: modules.map(m => ({
                id: m.id,
                nom: m.nom,
                code: m.code,
                annee: m.annee,
                isCie: m.isCie,
            })),
            liensCompetenceModule: liensCompetenceModule.map(l => ({
                competenceId: l.competenceId,
                moduleId: l.moduleId,
            })),
            notesUtilisateur: notesUtilisateur.map(n => ({
                moduleId: n.moduleId,
                note: n.note,
            })),
            niveauxCompetences: niveauxCompetences.map(n => ({
                competenceId: n.competenceId,
                niveau: n.niveau,
            })),
            metadata: {
                exportDate: new Date().toISOString(),
                userId: userId,
                totalDomaines: domaines.length,
                totalCompetences: competences.length,
                totalModules: modules.length,
                totalNotes: notesUtilisateur.length,
                totalNiveaux: niveauxCompetences.length,
            }
        };

        // Créer la réponse avec les headers appropriés
        const response = NextResponse.json(seedData, { status: 200 });
        response.headers.set('Content-Disposition', `attachment; filename="seed-data-${new Date().toISOString().split('T')[0]}.json"`);

        return response;
    } catch (error) {
        console.error("Erreur lors de l'export JSON:", error);
        return NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        );
    }
} 