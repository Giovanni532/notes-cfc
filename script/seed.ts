import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import {
    domaine,
    competence,
    module,
    competenceModule,
    userModuleNote,
    user
} from '../db/schema';
import competenceData from '../data/competence.json';
import dbData from '../data/db.json';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
});
const db = drizzle(client);

async function seed() {
    console.log('🌱 Début du seeding...');

    try {
        // 1. Créer les domaines
        console.log('📚 Création des domaines...');
        const domainesInserts = competenceData.map((dom) => ({
            nom: dom.domaine
        }));

        await db.insert(domaine).values(domainesInserts);
        console.log(`✅ ${domainesInserts.length} domaines créés`);

        // 2. Récupérer les domaines créés
        const domainesCrees = await db.select().from(domaine);
        const domaineMap = new Map(domainesCrees.map(d => [d.nom, d.id]));

        // 3. Créer les compétences
        console.log('🎯 Création des compétences...');
        const competencesInserts = competenceData.flatMap((dom) =>
            dom.competences.map((comp) => ({
                nom: comp.nom,
                description: comp.description,
                domaineId: domaineMap.get(dom.domaine)!
            }))
        );

        await db.insert(competence).values(competencesInserts);
        console.log(`✅ ${competencesInserts.length} compétences créées`);

        // 4. Créer les modules
        console.log('📖 Création des modules...');
        const modulesInserts = dbData.flatMap((annee) =>
            annee.modules.map((mod) => ({
                nom: mod.nom,
                code: mod.nom.split(' ')[0], // Extraire le code (ex: "431" de "431 Exécuter...")
                annee: annee.id,
                isCie: mod.isCie
            }))
        );

        await db.insert(module).values(modulesInserts);
        console.log(`✅ ${modulesInserts.length} modules créés`);

        // 5. Récupérer les compétences et modules créés
        const competencesCrees = await db.select().from(competence);
        const modulesCrees = await db.select().from(module);

        // 6. Créer les liens compétences-modules
        console.log('🔗 Création des liens compétences-modules...');
        const liensInserts: Array<{ competenceId: string; moduleId: string }> = [];

        competenceData.forEach((dom) => {
            dom.competences.forEach((comp) => {
                const competenceCreee = competencesCrees.find(c => c.nom === comp.nom);
                if (competenceCreee) {
                    comp.modules.forEach((moduleNom) => {
                        const codeModule = moduleNom.split(' ')[0]; // "431 - Exécuter..." -> "431"
                        const moduleCree = modulesCrees.find(m => m.code === codeModule);
                        if (moduleCree) {
                            liensInserts.push({
                                competenceId: competenceCreee.id,
                                moduleId: moduleCree.id
                            });
                        }
                    });
                }
            });
        });

        if (liensInserts.length > 0) {
            await db.insert(competenceModule).values(liensInserts);
            console.log(`✅ ${liensInserts.length} liens compétences-modules créés`);
        }

        // 7. Créer un utilisateur par défaut si aucun n'existe
        console.log('👤 Vérification de l\'utilisateur...');
        const users = await db.select().from(user);

        if (users.length === 0) {
            const defaultUser = {
                id: crypto.randomUUID(),
                name: 'Utilisateur CFC',
                email: 'user@cfc.local',
                emailVerified: true
            };

            await db.insert(user).values(defaultUser);
            console.log('✅ Utilisateur par défaut créé');

            // 8. Ajouter les notes de l'utilisateur
            console.log('📝 Ajout des notes utilisateur...');
            const notesInserts = dbData.flatMap((annee) =>
                annee.modules
                    .filter(mod => mod.note > 0) // Seulement les modules avec une note
                    .map((mod) => {
                        const codeModule = mod.nom.split(' ')[0];
                        const moduleCree = modulesCrees.find(m => m.code === codeModule);
                        return moduleCree ? {
                            userId: defaultUser.id,
                            moduleId: moduleCree.id,
                            note: mod.note // Stocker directement la note (4.5, 5.0, etc.)
                        } : null;
                    })
                    .filter((note): note is NonNullable<typeof note> => note !== null)
            );

            if (notesInserts.length > 0) {
                await db.insert(userModuleNote).values(notesInserts);
                console.log(`✅ ${notesInserts.length} notes utilisateur ajoutées`);
            }
        } else {
            console.log('ℹ️ Utilisateur existant trouvé, pas de création');
        }

        console.log('🎉 Seeding terminé avec succès!');

    } catch (error) {
        console.error('❌ Erreur lors du seeding:', error);
        throw error;
    } finally {
        await client.close();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    seed().catch(console.error);
}

export { seed }; 