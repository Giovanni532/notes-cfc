import { notFound } from "next/navigation";
import { db } from "@/lib/drizzle";
import { user, module, userModuleNote } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { PublicNotesView } from "@/components/public/public-notes-view";

async function getPublicNotes() {
    try {
        // Récupérer le premier utilisateur (ou vous pouvez spécifier un ID particulier)
        const userData = await db
            .select({ id: user.id, name: user.name })
            .from(user)
            .limit(1);

        if (userData.length === 0) {
            return null;
        }

        const userId = userData[0].id;

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

        // Grouper les modules par année
        const modulesByYear = modulesWithNotes.reduce((acc, mod) => {
            const year = mod.annee;
            if (!acc[year]) {
                acc[year] = [];
            }
            acc[year].push({
                id: mod.id,
                nom: mod.nom,
                code: mod.code,
                annee: mod.annee,
                isCie: mod.isCie,
                note: mod.note || 0,
            });
            return acc;
        }, {} as Record<number, any[]>);

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