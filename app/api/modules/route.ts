import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { module, userModuleNote } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
    try {
        // Récupérer la session utilisateur
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Récupérer tous les modules avec les notes de l'utilisateur
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
            .orderBy(module.annee, module.code);

        // Grouper les modules par année
        const modulesByYear = modulesWithNotes.reduce((acc, mod) => {
            const year = mod.annee;
            if (!acc[year]) {
                acc[year] = [];
            }
            acc[year].push({
                ...mod,
                note: mod.note || 0, // Note par défaut à 0 si pas de note
            });
            return acc;
        }, {} as Record<number, any[]>);

        return NextResponse.json({
            success: true,
            modules: modulesByYear,
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des modules:", error);
        return NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        );
    }
} 