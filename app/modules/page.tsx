import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ModulesList } from "@/components/modules/modules-list";
import { headers } from "next/headers";
import { getAllModulesByYear } from "@/actions/module-actions";

export default async function ModulesPage() {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect('/login');
    }

    // Récupérer les modules via la fonction dans module-actions
    const modules = await getAllModulesByYear(session.user.id);

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