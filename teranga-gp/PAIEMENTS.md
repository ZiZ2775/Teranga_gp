# Paiements et clients : mode d'emploi

Ce document couvre trois sujets : prévenir les clients d'un GP, encaisser un revenu pour Teranga GP avec Wave, et choisir un agrégateur pour des paiements entre utilisateurs.

## 1. Prévenir les clients d'un GP

**Ce qui existe.** Sur l'annonce d'un GP, un utilisateur connecté clique sur **Suivre ce GP**, indique son prénom et son numéro WhatsApp, et coche l'accord pour être contacté. Quand le GP publie un voyage, un encadré **Prévenir vos clients** s'ouvre avec un message prérempli (modifiable) et un bouton WhatsApp par client. Le GP y accède aussi à tout moment avec **Voir mes clients et les prévenir**.

**Vie privée.** Les abonnés sont dans la table `abonnes`. Seuls le GP suivi et la personne qui suit peuvent lire une ligne, grâce aux règles de `supabase.sql`. Chacun peut se désabonner (**Ne plus suivre ce GP**).

**Limite.** L'envoi se fait par un clic par client sur WhatsApp. Un envoi automatique à tous en une fois demande l'API WhatsApp Business : compte Meta vérifié, messages modèles approuvés, tarification par conversation et accord explicite des destinataires. C'est possible plus tard, avec un coût.

## 2. Revenu pour Teranga GP : mise en avant payante via Wave

**Ce qui existe.** Un GP peut payer pour mettre une annonce « À la une » pendant 7 jours. L'annonce passe en tête de liste avec un badge. Le prix par défaut est de 1 000 FCFA, à modifier.

**Comment ça marche.**
1. Le GP clique sur **Mettre en avant**. Le site appelle la fonction `wave-checkout`, qui crée une session de paiement Wave et renvoie l'adresse de paiement.
2. Le GP paie dans Wave et revient sur le site.
3. Le site appelle `wave-confirm`, qui demande à Wave directement si le paiement a réussi, puis enregistre la mise en avant.

La clé Wave reste sur le serveur (fonctions Netlify). Elle n'est jamais envoyée au navigateur.

**Pré-requis.**
- Un compte **Wave Business** pour une entreprise déclarée (Wave applique des limites selon la vérification de l'entreprise). Un administrateur crée la clé dans le portail Business, section développeur.
- Le site hébergé sur Netlify, car les fonctions sont des fonctions Netlify.

**Activation.**
1. Dans Netlify, **Site configuration > Environment variables**, ajoutez :

| Variable | Valeur |
|---|---|
| `WAVE_API_KEY` | la clé Wave Business |
| `SUPABASE_URL` | l'URL du projet Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | la clé « service_role » de Supabase (secrète, jamais dans `config.js`) |
| `SITE_URL` | `https://teranga-gp.com` (en https) |
| `FEATURE_PRICE_XOF` | prix en FCFA, par exemple `1000` |
| `FEATURE_DAYS` | durée en jours, par exemple `7` |

2. Dans `config.js`, passez `payments: true` et adaptez `featurePriceLabel`.
3. Redéployez le site.

**Ce qui n'est pas fait ni vérifié.**
- **Ce code n'a pas été testé avec un vrai compte Wave.** Faites un premier essai avec le montant minimum et vérifiez que l'annonce passe bien à la une, avant d'ouvrir au public.
- Le paiement est confirmé quand le GP revient sur le site. S'il ferme l'onglet avant, l'annonce ne passe pas à la une toute seule. Il faut alors ajouter la réception des notifications Wave (webhooks), dont la vérification de signature n'est pas décrite dans la page de documentation que j'ai lue : lisez d'abord la page webhook de Wave.
- Orange Money n'est pas branché : il demande un contrat marchand avec Orange Sénégal.
- Pas de remboursement automatique ni de facture. Prévoyez un contact pour les réclamations.

## 3. Paiements entre expéditeur et GP : choisir un agrégateur

Pour que de l'argent circule entre utilisateurs via le site, il faut un prestataire autorisé à encaisser et à reverser pour le compte de tiers. Ne le faites pas vous-même avec une clé Wave ou Orange classique : elles encaissent sur votre propre compte, et l'API de Wave réservée aux plateformes est limitée à des [partenaires sélectionnés](https://docs.wave.com/aggregated-merchants).

**Ce que j'ai pu vérifier.**
- PayDunya est un agrégateur sénégalais qui s'est [étendu au Togo](https://techcabal.com/2022/03/02/paydunya-expands-to-togo/) et qui a été [racheté par Peach Payments en 2025](https://fr.allafrica.com/stories/202504070435.html).
- Pour CinetPay et PayTech, je n'ai trouvé que des articles de blogs commerciaux, que je ne considère pas comme fiables pour des frais ou des règles. Rien n'est vérifié.

**Fiche à remplir avant de choisir.** Posez ces questions à chaque prestataire (par écrit, avec leur réponse datée) :

| Question | PayDunya | CinetPay | PayTech |
|---|---|---|---|
| Wave et Orange Money acceptés au Sénégal ? | | | |
| Peut-on encaisser pour des tiers et reverser (répartition entre utilisateurs) ? | | | |
| Agrément ou licence qui couvre ce service ? | | | |
| Frais par transaction, par moyen de paiement | | | |
| Délai de versement et frais de retrait | | | |
| Vérifications demandées à la plateforme et aux vendeurs (GP) | | | |
| Remboursements et litiges : qui décide, sous quel délai ? | | | |
| Paiement par carte depuis l'Europe, l'Amérique du Nord (le payeur de la diaspora) | | | |
| Notifications de paiement (webhooks) : signature documentée ? | | | |
| Test sans argent réel (bac à sable) | | | |

**Avant de lancer un paiement entre utilisateurs**, faites valider avec un juriste ou le prestataire que la plateforme n'a pas elle-même besoin d'une autorisation de services de paiement, et décidez qui supporte les litiges (colis perdu, GP absent, paiement contesté).
