import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CompetencesList } from "@/components/competences/competences-list";
import { headers } from "next/headers";
import { db } from "@/lib/drizzle";
import { competence, domaine, userCompetenceNiveau, module as moduleTable, competenceModule, userModuleNote } from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function getCompetences(userId: string) {
    try {
        // Récupérer toutes les compétences avec leurs domaines et niveaux d'acquisition
        const competencesData = await db
            .select({
                id: competence.id,
                nom: competence.nom,
                description: competence.description,
                domaine: {
                    id: domaine.id,
                    nom: domaine.nom,
                },
                niveau: userCompetenceNiveau.niveau,
            })
            .from(competence)
            .leftJoin(domaine, eq(competence.domaineId, domaine.id))
            .leftJoin(
                userCompetenceNiveau,
                and(
                    eq(userCompetenceNiveau.competenceId, competence.id),
                    eq(userCompetenceNiveau.userId, userId)
                )
            )
            .orderBy(domaine.nom, competence.nom);

        // Récupérer les modules pour chaque compétence
        const competencesWithModules = await Promise.all(
            competencesData
                .filter(comp => comp.domaine !== null)
                .map(async (comp) => {
                    const modules = await db
                        .select({
                            id: moduleTable.id,
                            nom: moduleTable.nom,
                            code: moduleTable.code,
                            annee: moduleTable.annee,
                            isCie: moduleTable.isCie,
                            note: userModuleNote.note,
                        })
                        .from(competenceModule)
                        .leftJoin(moduleTable, eq(competenceModule.moduleId, moduleTable.id))
                        .leftJoin(
                            userModuleNote,
                            and(
                                eq(moduleTable.id, userModuleNote.moduleId),
                                eq(userModuleNote.userId, userId)
                            )
                        )
                        .where(eq(competenceModule.competenceId, comp.id));

                    return {
                        ...comp,
                        domaine: comp.domaine!,
                        modules: modules.map(m => ({
                            ...m,
                            note: m.note || 0
                        }))
                    };
                })
        );

        return competencesWithModules;
    } catch (error) {
        console.error('Erreur lors de la récupération des compétences:', error);
        return [];
    }
}

export default async function CompetencesPage() {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect('/login');
    }

    // Récupérer les compétences directement depuis la base de données
    const competences = await getCompetences(session.user.id);

    return (
        <div className="space-y-6 max-w-6xl px-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Compétences
                </h1>
                <p className="text-muted-foreground">
                    Gérez vos niveaux d'acquisition des compétences
                </p>
            </div>

            <CompetencesList competences={competences as any} />
        </div>
    );
} 