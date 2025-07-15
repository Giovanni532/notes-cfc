import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ModulesList } from "@/components/modules/modules-list";
import { headers } from "next/headers";
import { db } from "@/lib/drizzle";
import { module, userModuleNote } from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function getModules(userId: string) {
    try {
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

        return modulesByYear;
    } catch (error) {
        console.error('Erreur lors de la récupération des modules:', error);
        return {};
    }
}

export default async function ModulesPage() {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect('/login');
    }

    // Récupérer les modules directement depuis la base de données
    const modules = await getModules(session.user.id);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Mes Modules
                </h1>
                <p className="text-muted-foreground">
                    Consulte et modifie tes notes de modules par année
                </p>
            </div>

            <ModulesList modules={modules} />
        </div>
    );
} 