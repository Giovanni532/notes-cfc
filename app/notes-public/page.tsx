import { notFound } from "next/navigation";
import { db } from "@/lib/drizzle";
import { user, module, userModuleNote } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { PublicNotesView } from "@/components/public/public-notes-view";

async function getPublicNotes() {
    try {
        const userData = await db
            .select({ id: user.id, name: user.name })
            .from(user)
            .where(eq(user.email, process.env.EMAIL_BDD as string))
            .limit(1);

        if (userData.length === 0) {
            return null;
        }

        const userId = userData[0].id;

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
            })
            .from(userModuleNote)
            .where(eq(userModuleNote.userId, userId));

        // 3. Créer un map des notes par moduleId
        const notesMap = new Map();
        for (const note of userNotes) {
            notesMap.set(note.moduleId, note.note);
        }

        // 4. Combiner les données et grouper par année
        const modulesByYear: Record<number, any[]> = {};

        for (const mod of allModules) {
            const year = mod.annee;
            if (!modulesByYear[year]) {
                modulesByYear[year] = [];
            }

            const userNote = notesMap.get(mod.id);

            modulesByYear[year].push({
                id: mod.id,
                nom: mod.nom,
                code: mod.code,
                annee: mod.annee,
                isCie: mod.isCie,
                note: userNote || 0,
            });
        }



        return {
            user: {
                id: userData[0].id,
                name: userData[0].name,
            },
            modules: modulesByYear,
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des notes:', error);
        return null;
    }
}

export default async function PublicNotesPage() {
    const data = await getPublicNotes();

    if (!data) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">
                        Notes de formation CFC
                    </h1>
                    <p className="text-muted-foreground">
                        Formation CFC en tant qu&apos;informaticien en développement d&apos;applications - Élève Salcuni Giovanni
                    </p>
                </div>

                <PublicNotesView modules={data.modules} userName="Élève Salcuni Giovanni" />
            </div>
        </div>
    );
} 