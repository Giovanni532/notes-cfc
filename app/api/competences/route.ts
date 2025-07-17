import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/drizzle";
import { competence, domaine, userCompetenceNiveau } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
    try {
        // Vérifier l'authentification
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Récupérer toutes les compétences avec leurs domaines et niveaux d'acquisition
        const competences = await db
            .select({
                id: competence.id,
                nom: competence.nom,
                description: competence.description,
                domaine: {
                    id: domaine.id,
                    nom: domaine.nom,
                },
                niveau: userCompetenceNiveau.niveau,
            })
            .from(competence)
            .leftJoin(domaine, eq(competence.domaineId, domaine.id))
            .leftJoin(
                userCompetenceNiveau,
                and(
                    eq(userCompetenceNiveau.competenceId, competence.id),
                    eq(userCompetenceNiveau.userId, userId)
                )
            )
            .orderBy(domaine.nom, competence.nom);

        return NextResponse.json({ competences });
    } catch (error) {
        console.error("Erreur lors de la récupération des compétences:", error);
        return NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        );
    }
} 