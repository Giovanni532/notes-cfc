import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: integer('email_verified', { mode: 'boolean' }).$defaultFn(() => false).notNull(),
    image: text('image'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});

export const session = sqliteTable("session", {
    id: text('id').primaryKey(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = sqliteTable("account", {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
    scope: text('scope'),
    password: text('password'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const verification = sqliteTable("verification", {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => /* @__PURE__ */ new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => /* @__PURE__ */ new Date())
});

// Tables pour les compétences et modules
export const domaine = sqliteTable("domaine", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    nom: text('nom').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

export const competence = sqliteTable("competence", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    nom: text('nom').notNull(),
    description: text('description').notNull(),
    domaineId: text('domaine_id').notNull().references(() => domaine.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

export const module = sqliteTable("module", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    nom: text('nom').notNull(),
    code: text('code').notNull().unique(), // ex: "431", "306"
    annee: integer('annee').notNull(), // 1, 2, 3, 4
    isCie: integer('is_cie', { mode: 'boolean' }).$defaultFn(() => false).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

export const competenceModule = sqliteTable("competence_module", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    competenceId: text('competence_id').notNull().references(() => competence.id, { onDelete: 'cascade' }),
    moduleId: text('module_id').notNull().references(() => module.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

export const userModuleNote = sqliteTable("user_module_note", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    moduleId: text('module_id').notNull().references(() => module.id, { onDelete: 'cascade' }),
    note: integer('note', { mode: 'number' }).notNull(), // Note sur 6 avec décimales (4.5, 5.0, etc.)
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

export const userCompetenceNiveau = sqliteTable("user_competence_niveau", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    competenceId: text('competence_id').notNull().references(() => competence.id, { onDelete: 'cascade' }),
    niveau: integer('niveau').notNull(), // Niveau d'acquisition de 1 à 5
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

// Export du schéma complet pour Better Auth et Drizzle
export const schema = {
    user,
    session,
    account,
    verification,
    domaine,
    competence,
    module,
    competenceModule,
    userModuleNote,
    userCompetenceNiveau,
};
