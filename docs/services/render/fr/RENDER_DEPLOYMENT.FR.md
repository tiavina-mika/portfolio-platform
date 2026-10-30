# Déployer sur Render, pas à pas

## Table des matières

- [Ce que vous allez déployer](#ce-que-vous-allez-déployer)
- [Avant de commencer](#avant-de-commencer)
- [Étape 1 : la base de données (MongoDB Atlas)](#étape-1--la-base-de-données-mongodb-atlas)
- [Étape 2 : générer les secrets](#étape-2--générer-les-secrets)
- [Étape 3 : déployer le serveur et le back-office](#étape-3--déployer-le-serveur-et-le-back-office)
- [Étape 4 : déployer le site web](#étape-4--déployer-le-site-web)
- [Étape 5 : boucler la configuration](#étape-5--boucler-la-configuration)
- [Étape 6 : vérifier que tout fonctionne](#étape-6--vérifier-que-tout-fonctionne)
- [Pré-production et production](#pré-production-et-production)
- [Mettre à jour et redéployer](#mettre-à-jour-et-redéployer)
- [Dépannage](#dépannage)

## Ce que vous allez déployer

Deux **Web Services** Render, créés depuis le même dépôt GitHub, plus une base MongoDB :

| Service Render | Contient | URL publique utilisée pour |
|---|---|---|
| `tiavina-mika-bo.preprod` | `apps/server` (API Parse, envois de fichiers) **et** `apps/bo` (le back-office est construit, copié dans le serveur et servi par Express) | l'API (`/parse`) et le back-office (`/`) |
| `tiavina-mika-preprod` | `apps/web` (site Next.js) | le site public |

Le back-office n'a **pas de service à lui** : il fait partie du service serveur. L'ordre compte : le serveur d'abord, car le build du site lit ses données dans l'API en ligne.

Cela se fait deux fois, une pour la **pré-production** (`develop`) et une pour la **production** (`main`). Les étapes ci-dessous utilisent les vrais services de pré-production, tous deux sur le même compte Render ; [Pré-production et production](#pré-production-et-production) liste ce qui change pour la production.

```text
Dépôt GitHub ──► tiavina-mika-bo.preprod (API + back-office) ──► MongoDB Atlas
             └─► tiavina-mika-preprod (site) ──► appelle tiavina-mika-bo.preprod
```

## Avant de commencer

- Un compte [Render](https://render.com), avec votre compte GitHub connecté (Account Settings → GitHub).
- Le dépôt poussé sur GitHub, sur la branche à déployer (`main` pour la production).
- Les comptes des services externes, clés en main (voir les [services](../../README.md)) : MongoDB Atlas, Cloudinary, Brevo, Google reCAPTCHA (clé de site et clé secrète), Google Maps.
- Les deux noms de service : `tiavina-mika-bo.preprod` (serveur + back-office) et `tiavina-mika-preprod` (site). Render déduit chaque URL publique `https://<slug>.onrender.com` du nom ; lisez toujours l'URL réelle sous le nom du service dans le tableau de bord. Ci-dessous, **URL du serveur** et **URL du site** désignent ces deux URL réelles.

## Étape 1 : la base de données (MongoDB Atlas)

1. Créez un cluster et un **utilisateur de base** (Database Access).
2. Network Access → **Add IP Address** → `0.0.0.0/0` (autoriser de partout). Les services gratuits de Render n'ont pas d'IP sortante fixe : une règle plus étroite ferait échouer le démarrage du serveur avec une erreur de connexion.
3. Connect → Drivers → copiez la chaîne de connexion et mettez-y le nom de la base :
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority`
4. Gardez-la pour l'étape 3 (`MONGO_URL`). Une base par environnement.

## Étape 2 : générer les secrets

Le serveur a besoin de secrets aléatoires. Générez-les un à un dans un terminal avec Node :

```bash
# PARSE_MASTER_KEY, REST_API_KEY, CRYPTO_FIXED_FULL_KEY : 32 caractères
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# CRYPTO_IV : exactement 16 caractères
node -e "console.log(require('crypto').randomBytes(8).toString('hex'))"

# CRYPTO_FIXED_PART_KEY : 22 caractères
# (complétée par un identifiant d'objet Parse de 10 caractères pour faire une clé AES-256 de 32 caractères)
node -e "console.log(require('crypto').randomBytes(11).toString('hex'))"
```

Règles :

- Une valeur **différente** par variable, et différente de vos valeurs locales.
- Rangez-les dans un gestionnaire de mots de passe. Changer les `CRYPTO_*` plus tard rend illisibles les données déjà chiffrées.
- `REST_API_KEY` est aussi envoyée par le back-office (`VITE_REST_API_KEY`) et donc visible dans le navigateur : c'est un identifiant, pas un secret.

## Étape 3 : déployer le serveur et le back-office

### 3.1 Créer le service

Tableau de bord Render → **New +** → **Web Service** → choisissez le dépôt → **Connect**.

| Champ | Valeur |
|---|---|
| Name | `tiavina-mika-bo.preprod` |
| Language | `Node` |
| Branch | `develop` |
| Root Directory | *laisser vide* (le build a besoin de tout le workspace : `libs/` et `apps/bo`) |
| Region | la plus proche de vos visiteurs et de votre cluster Atlas |
| Instance Type | `Free` pour tester (il s'endort), `Starter` ou plus pour un vrai site |

### 3.2 Commandes de build et de démarrage

**Build Command :**

```bash
mkdir -p "$HOME/.local/bin" && corepack enable --install-directory "$HOME/.local/bin" && export PATH="$HOME/.local/bin:$PATH" && pnpm install --frozen-lockfile --prod=false && pnpm --filter portfolio-bo exec vite build && pnpm --filter portfolio-server build && NODE_ENV=preProduction pnpm --filter portfolio-server copy
```

Ce qu'elle fait :

1. `corepack enable --install-directory "$HOME/.local/bin"` rend disponible la version de pnpm figée dans le `package.json` racine. Un simple `corepack enable` échoue sur Render (`EROFS: read-only file system, unlink '/usr/bin/pnpm'`) car il tente de remplacer `/usr/bin/pnpm` ; les liens vont dans un dossier inscriptible, ajouté ensuite au `PATH`.
2. `pnpm install --frozen-lockfile --prod=false` installe tout le workspace, dépendances de développement comprises (les outils de build). `--prod=false` est important : si `NODE_ENV=production` est défini, pnpm les ignorerait sinon.
3. `vite build` construit le back-office avec les variables `VITE_*` du service (étape 3.3). `pnpm build:prod` n'est pas utilisé ici car il lit un fichier `.env.prod`, qui n'existe pas sur Render.
4. `pnpm --filter portfolio-server build` vérifie les types et compile le serveur dans `dist`.
5. `copy` place le build du back-office dans `apps/server/clientBuild/bo/preprod`, le dossier que le serveur sert quand `NODE_ENV` n'est pas `production`.

**Start Command :**

```bash
pnpm --filter portfolio-server start:preprod
```

Cela lance `NODE_ENV=preProduction node --import tsx dist/index.js`.

**Version production** (service sur la branche `main`) :

```bash
# Build Command
mkdir -p "$HOME/.local/bin" && corepack enable --install-directory "$HOME/.local/bin" && export PATH="$HOME/.local/bin:$PATH" && pnpm install --frozen-lockfile --prod=false && pnpm --filter portfolio-bo exec vite build && pnpm --filter portfolio-server build && NODE_ENV=production pnpm --filter portfolio-server copy

# Start Command
pnpm --filter portfolio-server start
```

`copy` écrit alors dans `clientBuild/bo/prod`, et `start` lance `NODE_ENV=production node --import tsx dist/index.js`.

### 3.3 Variables d'environnement

Dans **Advanced → Environment Variables** (ou **Environment** une fois créé), ajoutez :

| Variable | Valeur |
|---|---|
| `NODE_VERSION` | `24` (la version du `.nvmrc`) |
| `MONGO_URL` | la chaîne de connexion Atlas (étape 1) |
| `PARSE_APP_ID` | un identifiant de votre choix, par ex. `portfolio` |
| `PARSE_MASTER_KEY` | générée (étape 2) |
| `REST_API_KEY` | générée (étape 2) |
| `SERVER_URL` | l'URL du serveur, telle qu'affichée dans le tableau de bord (`https://…`, sans `/` final) |
| `WEBSITE_URL` | l'URL du site |
| `CRYPTO_FIXED_PART_KEY`, `CRYPTO_FIXED_FULL_KEY`, `CRYPTO_IV` | générées (étape 2) |
| `BREVO_API_KEY` | depuis Brevo |
| `ADMIN_EMAIL_SENDER` | l'adresse d'expéditeur vérifiée dans Brevo |
| `OWNERS_EMAILS` | adresses séparées par des virgules qui reçoivent l'invitation Owner du back-office au démarrage |
| `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | depuis Cloudinary |

Ne définissez **pas** `PORT` : Render l'injecte (et le serveur l'exige).

Variables du back-office, lues **au moment du build** par `vite build` et inscrites dans le code du navigateur (aucun secret ici) :

| Variable | Valeur |
|---|---|
| `VITE_ENVIRONMENT` | `PREPROD` |
| `VITE_SERVER_URL` | la même valeur que `SERVER_URL` |
| `VITE_PARSE_APP_ID` | la même valeur que `PARSE_APP_ID` |
| `VITE_REST_API_KEY` | la même valeur que `REST_API_KEY` |
| `VITE_WEBSITE_URL` | la même valeur que `WEBSITE_URL` |
| `VITE_ADMIN_EMAIL_SENDER` | la même valeur que `ADMIN_EMAIL_SENDER` |

> Ne mettez jamais un vrai secret dans une variable `VITE_*` : la valeur serait lisible dans le JavaScript téléchargé. Sur Render, le contrôle de secrets de `pnpm copy` ne trouve aucun fichier `bo/.env.*` à comparer et s'ignore : rien ne vous protège à cet endroit.

### 3.4 Health check et déploiement

- Advanced → **Health Check Path** : `/ping`.
- Cliquez **Create Web Service**. Suivez les **Logs** : le build dure quelques minutes.
- Succès : un bloc de logs `[PREPROD]` suivi de l'URL du serveur et le statut **Live**.

### 3.5 Vérifier l'URL réelle

Render affiche l'URL du service sous son nom. Si elle diffère de celle saisie dans `SERVER_URL`, `VITE_SERVER_URL` et `WEBSITE_URL` (un nom déjà pris reçoit un suffixe), corrigez les variables puis faites **Manual Deploy → Clear build cache & deploy** : les valeurs `VITE_*` sont inscrites dans le bundle, un simple redémarrage ne suffit pas.

Test rapide : `<URL du serveur>/ping` répond `pong`, et `/` affiche la page de connexion du back-office.

## Étape 4 : déployer le site web

Le build du site appelle l'API en ligne pour pré-rendre les pages : **le serveur doit être Live d'abord**, et contenir du contenu pour que les pages se pré-rendent.

### 4.1 Créer le service

**New +** → **Web Service** → même dépôt.

| Champ | Valeur |
|---|---|
| Name | `tiavina-mika-preprod` |
| Language | `Node` |
| Branch | `develop` |
| Root Directory | *laisser vide* |
| Instance Type | `Free` pour tester, `Starter` ou plus pour un vrai site |

### 4.2 Commandes de build et de démarrage

**Build Command :**

```bash
mkdir -p "$HOME/.local/bin" && corepack enable --install-directory "$HOME/.local/bin" && export PATH="$HOME/.local/bin:$PATH" && pnpm install --frozen-lockfile --prod=false && pnpm --filter portfolio-web build:preprod
```

**Start Command :**

```bash
pnpm --filter portfolio-web start:preprod
```

Cela lance `APP_ENV=preProduction node server.js` (un serveur Express autour de Next.js, qui écoute sur le `PORT` fourni par Render).

**Version production** (service sur la branche `main`) :

```bash
# Build Command
mkdir -p "$HOME/.local/bin" && corepack enable --install-directory "$HOME/.local/bin" && export PATH="$HOME/.local/bin:$PATH" && pnpm install --frozen-lockfile --prod=false && pnpm --filter portfolio-web build:prod

# Start Command
pnpm --filter portfolio-web start
```

`start` lance `APP_ENV=production node server.js`.

### 4.3 Variables d'environnement

Toutes sont validées par `apps/web/env.ts` ; une variable manquante ou invalide arrête le build.

| Variable | Valeur |
|---|---|
| `NODE_VERSION` | `24` |
| `PARSE_APP_ID` | la même que le serveur |
| `SERVER_URL` | l'URL du serveur |
| `APP_URL` | l'URL du site |
| `SENDER_EMAIL` | l'adresse d'où partent les emails du formulaire de contact |
| `RECAPTCHA_SECRET_KEY` | clé **secrète** reCAPTCHA |
| `NEXT_PUBLIC_SERVER_URL` | la même que `SERVER_URL` |
| `NEXT_PUBLIC_APP_URL` | la même que `APP_URL` |
| `NEXT_PUBLIC_GOOGLE_MAP_KEY` | clé Google Maps (restreignez-la à votre domaine dans Google Cloud) |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | clé de **site** reCAPTCHA |

Les valeurs `NEXT_PUBLIC_*` sont inscrites au build et visibles dans le navigateur. `APP_ENV` est posée par les scripts `build:preprod` et `start:preprod` : ne la définissez pas.

### 4.4 Health check et déploiement

- Advanced → **Health Check Path** : `/api/ping`.
- **Create Web Service** et suivez les logs. Succès : `NextJs server` dans les logs et le statut **Live**.

## Étape 5 : boucler la configuration

1. **reCAPTCHA** : dans l'admin Google reCAPTCHA, ajoutez le domaine du site (et votre domaine personnalisé) aux domaines de la clé.
2. **Google Maps** : ajoutez le même domaine aux restrictions de référent HTTP de la clé.
3. **Brevo** : vérifiez que les adresses `ADMIN_EMAIL_SENDER` et `SENDER_EMAIL` sont des expéditeurs vérifiés.
4. **Première connexion au back-office** : au démarrage, le serveur crée une invitation Owner pour chaque adresse de `OWNERS_EMAILS`. Ouvrez l'email d'invitation, définissez le mot de passe, puis connectez-vous sur l'URL du serveur.
5. **Contenu** : créez vos premiers projets et articles dans le back-office, puis redéployez le site (Manual Deploy) si son build s'est fait sur une base vide.
6. **Domaine personnalisé** (facultatif) : Settings → Custom Domains sur chaque service, ajoutez l'enregistrement DNS indiqué par Render, attendez le certificat. Mettez ensuite à jour `SERVER_URL`, `VITE_SERVER_URL`, `WEBSITE_URL`, `VITE_WEBSITE_URL`, `APP_URL`, `NEXT_PUBLIC_SERVER_URL` et `NEXT_PUBLIC_APP_URL`, et redéployez les deux services en vidant le cache de build.

## Étape 6 : vérifier que tout fonctionne

| Contrôle | Attendu |
|---|---|
| `<serveur>/ping` | `pong` |
| `<serveur>/` | page de connexion du back-office, aucune erreur en console |
| Connexion au back-office | le tableau de bord s'ouvre, les listes se chargent |
| Envoi d'une image dans le back-office | l'image apparaît (Cloudinary) |
| `<web>/api/ping` | `{"message":"pong"}` |
| `<web>/` | page d'accueil avec le contenu créé dans le back-office |
| Formulaire de contact et newsletter | un message est enregistré et l'email part (Brevo, reCAPTCHA) |

## Pré-production et production

Le projet a deux environnements, chacun avec **sa propre paire de services Render et sa propre base**. Les étapes 1 à 6 ci-dessus décrivent la pré-production (services `tiavina-mika-bo.preprod` et `tiavina-mika-preprod`) ; pour monter la production, refaites-les avec la colonne Production ci-dessous. Le flux de livraison : `develop` → pré-production, puis `develop` est fusionnée dans `main` → production.

| | Pré-production | Production |
|---|---|---|
| Branche | `develop` | `main` |
| Noms des services | `tiavina-mika-bo.preprod` (serveur + build du back-office), `tiavina-mika-preprod` (web) | `portfolio-server`, `portfolio-web` (à remplacer par vos noms de production) |
| Base Atlas / Cloudinary | sa propre base, son propre dossier ou compte | sa propre base, son propre dossier ou compte |
| Build serveur : étape copy | `NODE_ENV=preProduction pnpm --filter portfolio-server copy` | `NODE_ENV=production pnpm --filter portfolio-server copy` |
| Commande de démarrage serveur | `pnpm --filter portfolio-server start:preprod` | `pnpm --filter portfolio-server start` |
| `NODE_ENV` du serveur à l'exécution | `preProduction` (posé par le script de démarrage) | `production` (posé par le script de démarrage) |
| Dossier du back-office servi | `clientBuild/bo/preprod` | `clientBuild/bo/prod` |
| `VITE_ENVIRONMENT` | `PREPROD` | `PROD` |
| Commande de build web | `… pnpm --filter portfolio-web build:preprod` | `… pnpm --filter portfolio-web build:prod` |
| Commande de démarrage web | `pnpm --filter portfolio-web start:preprod` | `pnpm --filter portfolio-web start` |
| `APP_ENV` du web | `preProduction` (posé par les scripts) | `production` (posé par les scripts) |
| URL dans les variables | les services de pré-production | les services de production |

Les deux services de pré-production sont sur le même compte Render. `tiavina-mika-bo.preprod` est le service serveur : il construit le back-office et le sert, le back-office n'a donc pas de service à lui. `tiavina-mika-preprod` est le site web. L'URL publique est déduite du nom par Render et peut différer de lui : copiez toujours l'URL réelle affichée sous chaque service dans le tableau de bord (`https://<slug>.onrender.com`) dans `SERVER_URL`, `VITE_SERVER_URL`, `WEBSITE_URL`, `VITE_WEBSITE_URL`, `APP_URL`, `NEXT_PUBLIC_SERVER_URL` et `NEXT_PUBLIC_APP_URL`.

Tout le reste (le reste de chaque commande de build, les health checks, les noms de variables) est identique. Gardez chaque secret différent entre les deux environnements, et ne faites jamais pointer un service de pré-production vers la base ou l'URL serveur de production.

## Mettre à jour et redéployer

- **Auto-Deploy** (Settings → Build & Deploy) est actif par défaut : chaque push sur la branche redéploie. Pour éviter de redéployer le site quand seul le back-office change, réglez **Build Filters → Included Paths** (par exemple `apps/web/**`, `libs/**`, `pnpm-lock.yaml` pour le web ; `apps/server/**`, `apps/bo/**`, `libs/**`, `pnpm-lock.yaml` pour le serveur).
- Changer une variable `VITE_*` ou `NEXT_PUBLIC_*` demande un nouveau **build** (Manual Deploy → Clear build cache & deploy), pas un redémarrage.
- Après un changement de contenu que le site pré-rend, redéployez le site.
- Un changement de commande de build ou de démarrage se fait dans le tableau de bord et n'est pas relu dans une pull request : le consigner dans [RENDER.FR.md](RENDER.FR.md) quand il change.

## Dépannage

| Symptôme | Cause et correction |
|---|---|
| Le build échoue avec `tsc: not found`, `swc: not found` ou `vite: not found` | les dépendances de développement ont été ignorées : gardez `--prod=false` dans la commande d'installation |
| Le build échoue avec `Invalid environment variables` (web) | une variable de l'étape 4.3 manque ou n'est pas une URL valide ; corrigez et redéployez |
| Le build du web échoue avec une erreur réseau vers l'API | le serveur n'est pas encore Live, ou `SERVER_URL` est faux (pas de `/` final, schéma `https`) |
| Le serveur s'arrête au démarrage avec `Missing environment variables` | le log les liste : ajoutez-les dans Environment (n'ajoutez pas `PORT`) |
| Le serveur s'arrête avec une erreur de connexion Mongo | Network Access d'Atlas n'autorise pas `0.0.0.0/0`, ou l'utilisateur ou le mot de passe de `MONGO_URL` est faux (les caractères spéciaux doivent être encodés en URL) |
| Le serveur est Live mais `/` répond une erreur ou une page blanche | le back-office n'a pas été copié : vérifiez l'étape `copy` dans le log de build et que `NODE_ENV=production` figure dans la commande de build |
| Le back-office appelle le mauvais serveur | `VITE_SERVER_URL` était faux au build : corrigez-la et videz le cache de build |
| La première requête après un moment prend 30 à 60 secondes | les instances gratuites s'endorment après environ 15 minutes ; le cron de maintien en éveil ne tourne que tant que le service est éveillé. Utilisez une instance payante pour un vrai site |
| Mémoire insuffisante pendant le build | l'instance gratuite (512 Mo) peut être trop petite pour `next build` ou `vite build` : passez à `Starter` ou plus |
