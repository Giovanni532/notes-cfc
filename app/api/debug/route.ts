import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/drizzle";
import { user, module, userModuleNote, competence, domaine, userCompetenceNiveau } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        // Test 1: Vérifier l'authentification
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        // Test 2: Récupérer les données de base
        const users = await db.select().from(user);
        const modules = await db.select().from(module);
        const notes = await db.select().from(userModuleNote);
        const competences = await db.select().from(competence);
        const domaines = await db.select().from(domaine);
        const niveaux = await db.select().from(userCompetenceNiveau);

        // Test 3: Si utilisateur connecté, récupérer ses données spécifiques
        let userNotes = [];
        let userNiveaux = [];

        if (session?.user?.id) {
            userNotes = await db
                .select()
                .from(userModuleNote)
                .where(eq(userModuleNote.userId, session.user.id));

            userNiveaux = await db
                .select()
                .from(userCompetenceNiveau)
                .where(eq(userCompetenceNiveau.userId, session.user.id));
        }

        return NextResponse.json({
            success: true,
            debug: {
                session: {
                    exists: !!session,
                    userId: session?.user?.id,
                    userEmail: session?.user?.email,
                },
                database: {
                    users: users.length,
                    modules: modules.length,
                    notes: notes.length,
                    competences: competences.length,
                    domaines: domaines.length,
                    niveaux: niveaux.length,
                },
                userData: {
                    notes: userNotes.length,
                    niveaux: userNiveaux.length,
                },
                sample: {
                    firstUser: users[0] || null,
                    firstModule: modules[0] || null,
                    firstNote: notes[0] || null,
                }
            }
        });
    } catch (error) {
        console.error('Debug error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
} 