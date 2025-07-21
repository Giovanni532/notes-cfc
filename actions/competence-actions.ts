"use server"
import { useMutation } from "@/lib/safe-action";
import { z } from "zod";
import { db } from "@/lib/drizzle";
import { userCompetenceNiveau, competence, domaine, module as moduleTable, competenceModule, userModuleNote } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Schéma de validation pour la mise à jour du niveau d'acquisition
const updateCompetenceNiveauSchema = z.object({
    competenceId: z.string().min(1, "ID de compétence requis"),
    niveau: z.number().min(1, "Niveau minimum: 1").max(5, "Niveau maximum: 5"),
});

// Action pour mettre à jour le niveau d'acquisition d'une compétence
export const updateCompetenceNiveauAction = useMutation(
    updateCompetenceNiveauSchema,
    async (input, { userId }) => {
        // Vérifier si l'utilisateur existe
        if (!userId) {
            throw new Error("Utilisateur non authentifié");
        }

        // Vérifier si la compétence existe
        const competenceExists = await db
            .select()
            .from(competence)
            .where(eq(competence.id, input.competenceId))
            .limit(1);

        if (competenceExists.length === 0) {
            throw new Error("Compétence non trouvée");
        }

        // Vérifier si un niveau existe déjà pour cette compétence et cet utilisateur
        const existingNiveau = await db
            .select()
            .from(userCompetenceNiveau)
            .where(
                and(
                    eq(userCompetenceNiveau.userId, userId),
                    eq(userCompetenceNiveau.competenceId, input.competenceId)
                )
            )
            .limit(1);

        if (existingNiveau.length > 0) {
            // Mettre à jour le niveau existant
            const updated = await db
                .update(userCompetenceNiveau)
                .set({
                    niveau: input.niveau,
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(userCompetenceNiveau.userId, userId),
                        eq(userCompetenceNiveau.competenceId, input.competenceId)
                    )
                )
                .returning();

            return { success: true, niveau: updated[0] };
        } else {
            // Créer un nouveau niveau
            const created = await db
                .insert(userCompetenceNiveau)
                .values({
                    userId,
                    competenceId: input.competenceId,
                    niveau: input.niveau,
                })
                .returning();

            return { success: true, niveau: created[0] };
        }
    }
);

// Fonction pour récupérer toutes les compétences avec leurs domaines, niveaux et modules
export async function getAllCompetences(userId: string) {
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
                        id: String(comp.id),
                        nom: String(comp.nom),
                        description: String(comp.description),
                        domaine: {
                            id: String(comp.domaine!.id),
                            nom: String(comp.domaine!.nom),
                        },
                        niveau: comp.niveau ? Number(comp.niveau) : 0,
                        modules: modules.map(m => ({
                            id: String(m.id),
                            nom: String(m.nom),
                            code: String(m.code),
                            annee: Number(m.annee),
                            isCie: Boolean(m.isCie),
                            note: m.note ? Number(m.note) : 0
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