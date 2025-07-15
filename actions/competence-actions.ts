"use server"
import { useMutation } from "@/lib/safe-action";
import { z } from "zod";
import { db } from "@/lib/drizzle";
import { userCompetenceNiveau, competence, domaine } from "@/db/schema";
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