import { notFound } from "next/navigation";
import { db } from "@/lib/drizzle";
import { user, module, userModuleNote } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { PublicNotesView } from "@/components/public/public-notes-view";

async function getPublicNotes() {
    try {
        // Récupérer l'utilisateur Salcuni Giovanni spécifiquement
        const userData = await db
            .select({ id: user.id, name: user.name })
            .from(user)
            .where(eq(user.name, "Salcuni Giovanni"))
            .limit(1);

        let targetUser = userData[0];

        if (userData.length === 0) {
            // Si l'utilisateur n'existe pas, récupérer le premier utilisateur avec des notes
            const userWithNotes = await db
                .select({ id: user.id, name: user.name })
                .from(user)
                .innerJoin(userModuleNote, eq(user.id, userModuleNote.userId))
                .limit(1);

            if (userWithNotes.length === 0) {
                return null;
            }
            targetUser = userWithNotes[0];
        }

        const userId = targetUser.id;

        // Récupérer tous les modules avec les notes de l'utilisateur
        const modulesWithNotes = await db
            .select({
                id: module.id,
                nom: module.nom,
                code: module.code,
                annee: module.annee,
                isCie: module.isCie,
                note: userModuleNote.note,
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

        console.log('Debug - User ID:', userId);
        console.log('Debug - Modules found:', modulesWithNotes.length);
        console.log('Debug - Sample module:', modulesWithNotes[0]);

        // Grouper les modules par année
        const modulesByYear = modulesWithNotes.reduce((acc, mod) => {
            const year = mod.annee;
            if (!acc[year]) {
                acc[year] = [];
            }
            acc[year].push({
                ...mod,
                note: mod.note || 0,
            });
            return acc;
        }, {} as Record<number, any[]>);

        return {
            user: targetUser,
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
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
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