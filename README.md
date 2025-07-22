# Notes CFC - Application de Gestion des Notes et Compétences

Application Next.js pour la gestion des notes de modules et du suivi des compétences dans le cadre d'une formation CFC en informatique.

## 🎯 Fonctionnalités

### 📚 Gestion des Modules
- **Notes par module** : Saisie et modification des notes sur 6 pour chaque module
- **Organisation par année** : Modules regroupés par année de formation (1, 2, 3, 4)
- **Modules CIE** : Distinction des modules d'entreprise (CIE) des modules d'école
- **Interface intuitive** : Modification des notes directement dans l'interface

### 🎯 Suivi des Compétences
- **Compétences CFC** : Base de données complète des compétences du référentiel CFC
- **Niveaux d'acquisition** : Évaluation des compétences de 1 à 5
- **Organisation par domaines** : Compétences regroupées par domaines de compétences
- **Progression visuelle** : Suivi de l'évolution des compétences

### 📊 Visualisation Publique
- **Page publique** : Affichage public des notes pour partage
- **Export des données** : Export en JSON et Excel
- **Interface responsive** : Consultation sur tous les appareils

### 🔐 Authentification
- **Système de connexion** : Authentification sécurisée avec Better Auth
- **Protection des routes** : Accès restreint aux utilisateurs connectés
- **Gestion des sessions** : Sessions persistantes et sécurisées

## 🛠️ Technologies Utilisées

- **[Next.js 15](https://nextjs.org)** - Framework React avec App Router
- **[Drizzle ORM](https://orm.drizzle.team)** - ORM TypeScript moderne
- **[Better Auth](https://www.better-auth.com)** - Solution d'authentification complète
- **[SQLite](https://www.sqlite.org)** - Base de données embarquée
- **[Tailwind CSS](https://tailwindcss.com)** - Framework CSS utilitaire
- **[Shadcn/ui](https://ui.shadcn.com)** - Composants UI modernes
- **[TypeScript](https://www.typescriptlang.org)** - JavaScript avec typage statique
- **[Safe Actions](https://next-safe-action.com)** - Actions serveur sécurisées

## 📋 Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
DB_FILE_NAME=local.db
BETTER_AUTH_SECRET=your-secret-key-here-change-this-in-production
BETTER_AUTH_URL=http://localhost:3000
EMAIL_BDD=email@example.com
```

**Important :** 
- `DB_FILE_NAME` : Chemin vers le fichier SQLite (sans le préfixe `file:`)
- `BETTER_AUTH_SECRET` : Clé secrète pour l'authentification (changez en production)
- `BETTER_AUTH_URL` : URL de l'application pour le client React
- `EMAIL_BDD` : Email de l'utilisateur pour la page publique des notes

## 🚀 Installation et configuration

1. **Installer les dépendances** :
   ```bash
   npm install
   # ou
   pnpm install
   ```

2. **Créer le fichier .env** avec les variables ci-dessus

3. **Initialiser la base de données** :
   ```bash
   npm run db:push
   ```

4. **Seeder les données** :
   ```bash
   # Seeder les utilisateurs de base
   npm run db:seed
   
   # Seeder les modules et compétences CFC
   npm run db:seed-notes
   ```

5. **Lancer le projet** :
   ```bash
   npm run dev
   ```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure de l'application

```
├── app/
│   ├── api/
│   │   ├── [auth]/[...all]/route.ts    # Routes API Better Auth
│   │   └── export/                     # Export des données
│   ├── competences/page.tsx            # Page de gestion des compétences
│   ├── modules/page.tsx                # Page de gestion des modules
│   ├── notes-public/page.tsx           # Page publique des notes
│   └── login/page.tsx                  # Page de connexion
├── components/
│   ├── auth/                           # Composants d'authentification
│   ├── competences/                    # Composants de gestion des compétences
│   ├── modules/                        # Composants de gestion des modules
│   ├── public/                         # Composants de la page publique
│   └── ui/                             # Composants UI Shadcn
├── actions/
│   ├── competence-actions.ts           # Actions pour les compétences
│   └── module-actions.ts               # Actions pour les modules
├── db/
│   └── schema.ts                       # Schéma de base de données
├── data/
│   ├── competence.json                 # Données des compétences CFC
│   └── CFC Notes Seed Data July 2025.json  # Données de seed
└── lib/
    ├── auth.ts                         # Configuration Better Auth
    ├── auth-client.ts                  # Client Better Auth
    ├── drizzle.ts                      # Configuration Drizzle
    └── safe-action.ts                  # Configuration Safe Actions
```

## 🗄️ Base de données

### Tables principales
- **user** : Utilisateurs de l'application
- **module** : Modules de formation (431, 306, etc.)
- **competence** : Compétences du référentiel CFC
- **domaine** : Domaines de compétences
- **userModuleNote** : Notes des utilisateurs par module
- **userCompetenceNiveau** : Niveaux d'acquisition des compétences

### Relations
- Un utilisateur peut avoir plusieurs notes de modules
- Un utilisateur peut avoir plusieurs niveaux de compétences
- Les compétences sont liées aux domaines
- Les compétences peuvent être liées à plusieurs modules

## 📊 Fonctionnalités détaillées

### Gestion des Modules
- **Saisie des notes** : Interface intuitive pour modifier les notes
- **Validation** : Notes sur 6 avec décimales autorisées
- **Organisation** : Groupement par année de formation
- **Distinction CIE** : Identification des modules d'entreprise

### Suivi des Compétences
- **Référentiel complet** : Toutes les compétences CFC incluses
- **Évaluation progressive** : Niveaux de 1 à 5
- **Objectifs évaluateurs** : Critères d'évaluation détaillés
- **Liaison modules** : Association compétences-modules

### Export et Partage
- **Export JSON** : Données structurées pour traitement externe
- **Export Excel** : Format tabulaire pour analyse
- **Page publique** : Affichage public des notes
- **URL partageable** : Accès direct aux résultats

## 🔧 Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Construit l'application pour la production
- `npm run start` - Lance le serveur de production
- `npm run lint` - Lance le linter ESLint
- `npm run db:generate` - Génère les fichiers de migration
- `npm run db:migrate` - Applique les migrations
- `npm run db:push` - Pousse directement les changements de schéma
- `npm run db:studio` - Lance Drizzle Studio pour visualiser la DB
- `npm run db:seed` - Seeder les utilisateurs de base
- `npm run db:seed-notes` - Seeder les modules et compétences
- `npm run db:reset` - Reset complet de la base de données

## 🎨 Interface utilisateur

### Design System
- **Shadcn/ui** : Composants modernes et accessibles
- **Tailwind CSS** : Styling utilitaire et responsive
- **Thème sombre/clair** : Support des thèmes
- **Animations** : Transitions fluides avec Framer Motion

### Responsive Design
- **Mobile-first** : Optimisé pour tous les écrans
- **Navigation intuitive** : Sidebar et breadcrumbs
- **Formulaires optimisés** : Validation en temps réel
- **Feedback utilisateur** : Notifications et états de chargement

## 🔒 Sécurité

- ✅ Authentification sécurisée avec Better Auth
- ✅ Protection CSRF intégrée
- ✅ Validation des données avec Zod
- ✅ Actions serveur sécurisées avec Safe Actions
- ✅ Middleware de protection des routes
- ✅ Sessions sécurisées et persistantes

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📋 Attribution

**Important :** Si vous utilisez cette application ou vous en inspirez pour vos propres projets, vous devez obligatoirement mentionner l'auteur original :

- **Auteur :** Salcuni Giovanni
- **Application :** Notes CFC - Application de Gestion des Notes et Compétences
- **GitHub :** [https://github.com/Giovanni532/notes-cfc]

Cette attribution peut être faite dans :
- Le README de votre projet
- Les commentaires de code
- La documentation
- Les crédits de l'application

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation des technologies utilisées
- Contactez l'équipe de développement

---

**Développé avec ❤️ pour la formation CFC en informatique**
