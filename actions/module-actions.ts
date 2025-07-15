"use server"

import { useMutation } from "@/lib/safe-action";
import { z } from "zod";
import { db } from "@/lib/drizzle";
import { module, userModuleNote } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Schéma pour modifier une note de module
const updateModuleNoteSchema = z.object({
    moduleId: z.string().min(1, "ID du module requis"),
    note: z.number().min(0).max(6, "La note doit être entre 0 et 6"),
});

// Action pour modifier la note d'un module
export const updateModuleNoteAction = useMutation(
    updateModuleNoteSchema,
    async (input, { userId }) => {
        // Vérifier si l'utilisateur a déjà une note pour ce module
        const existingNote = await db
            .select()
            .from(userModuleNote)
            .where(
                and(
                    eq(userModuleNote.userId, userId),
                    eq(userModuleNote.moduleId, input.moduleId)
                )
            )
            .limit(1);

        if (existingNote.length > 0) {
            // Mettre à jour la note existante
            const updatedNote = await db
                .update(userModuleNote)
                .set({
                    note: input.note,
                    updatedAt: new Date()
                })
                .where(
                    and(
                        eq(userModuleNote.userId, userId),
                        eq(userModuleNote.moduleId, input.moduleId)
                    )
                )
                .returning();

            return {
                success: true,
                message: "Note mise à jour avec succès",
                note: updatedNote[0]
            };
        } else {
            // Créer une nouvelle note
            const newNote = await db
                .insert(userModuleNote)
                .values({
                    userId,
                    moduleId: input.moduleId,
                    note: input.note,
                })
                .returning();

            return {
                success: true,
                message: "Note ajoutée avec succès",
                note: newNote[0]
            };
        }
    }
);

// Schéma pour récupérer les modules d'une année
const getModulesByYearSchema = z.object({
    annee: z.number().min(1).max(4, "L'année doit être entre 1 et 4"),
});

// Action pour récupérer les modules d'une année avec les notes
export const getModulesByYearAction = useMutation(
    getModulesByYearSchema,
    async (input, { userId }) => {
        const modulesWithNotes = await db
            .select({
                id: module.id,
                nom: module.nom,
                code: module.code,
                annee: module.annee,
                isCie: module.isCie,
                createdAt: module.createdAt,
                updatedAt: module.updatedAt,
                note: userModuleNote.note,
                noteId: userModuleNote.id,
            })
            .from(module)
            .leftJoin(
                userModuleNote,
                and(
                    eq(module.id, userModuleNote.moduleId),
                    eq(userModuleNote.userId, userId)
                )
            )
            .where(eq(module.annee, input.annee))
            .orderBy(module.code);

        return {
            success: true,
            modules: modulesWithNotes.map(mod => ({
                ...mod,
                note: mod.note || 0, // Note par défaut à 0 si pas de note
            }))
        };
    }
); 