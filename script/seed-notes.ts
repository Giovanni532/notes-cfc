import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { userModuleNote, module, user } from '../db/schema';
import dbData from '../data/db.json';
import { eq } from 'drizzle-orm';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
});
const db = drizzle(client);

async function seedNotes() {
    console.log('📝 Début du seeding des notes...');

    try {
        // 1. Récupérer l'utilisateur existant ou en créer un
        console.log('👤 Vérification de l\'utilisateur...');
        const users = await db.select().from(user);

        let currentUser;
        if (users.length === 0) {
            currentUser = {
                id: crypto.randomUUID(),
                name: 'Utilisateur CFC',
                email: 'user@cfc.local',
                emailVerified: true
            };

            await db.insert(user).values(currentUser);
            console.log('✅ Utilisateur par défaut créé');
        } else {
            currentUser = users[0];
            console.log('ℹ️ Utilisateur existant trouvé');
        }

        // 2. Récupérer tous les modules
        const modulesCrees = await db.select().from(module);
        console.log(`📖 ${modulesCrees.length} modules trouvés`);

        // 3. Supprimer les anciennes notes de l'utilisateur
        await db.delete(userModuleNote).where(eq(userModuleNote.userId, currentUser.id));
        console.log('🗑️ Anciennes notes supprimées');

        // 4. Ajouter les nouvelles notes
        console.log('📝 Ajout des notes utilisateur...');
        const notesInserts = dbData.flatMap((annee) =>
            annee.modules
                .filter(mod => mod.note > 0) // Seulement les modules avec une note
                .map((mod) => {
                    const codeModule = mod.nom.split(' ')[0];
                    const moduleCree = modulesCrees.find(m => m.code === codeModule);
                    return moduleCree ? {
                        userId: currentUser.id,
                        moduleId: moduleCree.id,
                        note: mod.note // Stocker directement la note (4.5, 5.0, etc.)
                    } : null;
                })
                .filter((note): note is NonNullable<typeof note> => note !== null)
        );

        if (notesInserts.length > 0) {
            await db.insert(userModuleNote).values(notesInserts);
            console.log(`✅ ${notesInserts.length} notes utilisateur ajoutées`);
        } else {
            console.log('ℹ️ Aucune note à ajouter');
        }

        console.log('🎉 Seeding des notes terminé avec succès!');

    } catch (error) {
        console.error('❌ Erreur lors du seeding des notes:', error);
        throw error;
    } finally {
        await client.close();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    seedNotes().catch(console.error);
}

export { seedNotes }; 