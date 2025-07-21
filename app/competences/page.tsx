import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CompetencesList } from "@/components/competences/competences-list";
import { headers } from "next/headers";
import { getAllCompetences } from "@/actions/competence-actions";

export default async function CompetencesPage() {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect('/login');
    }

    // Récupérer les compétences via la fonction dans competence-actions
    const competences = await getAllCompetences(session.user.id);

    return (
        <div className="space-y-6 max-w-6xl px-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Compétences
                </h1>
                <p className="text-muted-foreground">
                    Gérez vos niveaux d&apos;acquisition des compétences
                </p>
            </div>

            <CompetencesList competences={competences as any} />
        </div>
    );
} 