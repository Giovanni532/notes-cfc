"use server"

import { useMutation } from "@/lib/safe-action";
import { z } from "zod";
import { db } from "@/lib/drizzle";
import { module, userModuleNote } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { user } from "@/db/schema";

// Schéma pour modifier une note de module
const updateModuleNoteSchema = z.object({
    moduleId: z.string().min(1, "ID du module requis"),
    note: z.number().min(0).max(6, "La note doit être entre 0 et 6"),
});

// Action pour modifier la note d'un module
export const updateModuleNoteAction = useMutation(
    updateModuleNoteSchema,
    async (input, { userId }) => {
        // Vérifier que l'userId est bien défini
        if (!userId) {
            throw new Error("userId non défini");
        }

        // Utiliser directement l'ID du module fourni
        const actualModuleId = input.moduleId;

        // Validation stricte des valeurs
        if (!actualModuleId) {
            throw new Error("ID du module non trouvé");
        }

        if (!userId) {
            throw new Error("ID de l'utilisateur non défini");
        }

        // Validation de la note
        const noteValue = Number(input.note);
        if (isNaN(noteValue)) {
            throw new Error("La note doit être un nombre valide");
        }

        // Vérifier si l'utilisateur a déjà une note pour ce module
        const existingNote = await db
            .select()
            .from(userModuleNote)
            .where(
                and(
                    eq(userModuleNote.userId, userId),
                    eq(userModuleNote.moduleId, actualModuleId)
                )
            )
            .limit(1);

        if (existingNote.length > 0) {
            // Mettre à jour la note existante
            const updatedNote = await db
                .update(userModuleNote)
                .set({
                    note: noteValue,
                    updatedAt: new Date()
                })
                .where(
                    and(
                        eq(userModuleNote.userId, userId),
                        eq(userModuleNote.moduleId, actualModuleId)
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
                    moduleId: actualModuleId,
                    note: noteValue,
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

// Fonction pour récupérer tous les modules groupés par année
export async function getAllModulesByYear(userId: string) {
    try {
        // 1. Récupérer tous les modules
        const allModules = await db
            .select()
            .from(module)
            .orderBy(module.annee, module.code);

        // 2. Récupérer toutes les notes de l'utilisateur
        const userNotes = await db
            .select({
                moduleId: userModuleNote.moduleId,
                note: userModuleNote.note,
                noteId: userModuleNote.id,
            })
            .from(userModuleNote)
            .where(eq(userModuleNote.userId, userId));

        // 3. Créer un map des notes par moduleId
        const notesMap = new Map();
        for (const note of userNotes) {
            notesMap.set(note.moduleId, { note: note.note, noteId: note.noteId });
        }

        // 4. Combiner les données
        const modulesByYear: Record<number, Array<{
            id: string;
            nom: string;
            code: string;
            annee: number;
            isCie: boolean;
            note: number;
            noteId?: string;
        }>> = {};

        for (const mod of allModules) {
            const year = mod.annee;
            if (!modulesByYear[year]) {
                modulesByYear[year] = [];
            }

            const userNote = notesMap.get(mod.id);

            const moduleData = {
                id: String(mod.id),
                nom: String(mod.nom),
                code: String(mod.code),
                annee: Number(mod.annee),
                isCie: Boolean(mod.isCie),
                note: userNote ? Number(userNote.note) : 0,
                noteId: userNote ? String(userNote.noteId) : undefined,
            };

            modulesByYear[year].push(moduleData);
        }

        return modulesByYear;
    } catch (error) {
        console.error('Erreur lors de la récupération des modules:', error);
        return {};
    }
}

