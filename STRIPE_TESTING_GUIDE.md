# 🧪 Guide de Test Stripe Checkout

Ce guide vous explique comment tester le système de checkout Stripe en local et en production.

---

## 📋 Prérequis

1. **Compte Stripe** (gratuit) : https://dashboard.stripe.com/register
2. **Stripe CLI** (pour tester les webhooks en local) : https://stripe.com/docs/stripe-cli
3. **Produits de test** dans votre base de données

---

## 🔧 Configuration

### 1. Variables d'Environnement

Dans votre fichier `.env` (ou Vercel Environment Variables) :

```env
# Stripe Test Keys (pour développement)
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Live Keys (pour production)
# STRIPE_SECRET_KEY=sk_live_51...
# STRIPE_WEBHOOK_SECRET=whsec_...
```

**Où trouver ces clés :**
- **Dashboard Stripe** → **Developers** → **API keys**
  - `STRIPE_SECRET_KEY` = "Secret key" (commence par `sk_test_` ou `sk_live_`)
  - `STRIPE_WEBHOOK_SECRET` = Voir section "Webhooks" ci-dessous

---

## 🛍️ Étape 1 : Créer des Produits de Test

### Option A : Via l'Admin Dashboard

1. Aller sur `http://localhost:3000/dashboard/shop` (ou votre URL admin)
2. Cliquer sur "Ajouter un produit"
3. Remplir les champs :
   - **Nom** : "Sac à main premium"
   - **Prix** : 49.90
   - **Stock** : 10
   - **Image URL** : URL d'une image de test
   - **Description** : "Un magnifique sac à main..."
4. Cliquer sur "Publier"

### Option B : Via l'API (cURL)

```bash
curl -X POST http://localhost:3000/api/shop/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sac à main premium",
    "nameEn": "Premium Handbag",
    "description": "Un magnifique sac à main en cuir",
    "descriptionEn": "A beautiful leather handbag",
    "price": 49.90,
    "stock": 10,
    "imageUrl": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7",
    "category": "accessory",
    "isActive": true,
    "isFeatured": true
  }'
```

---

## 🧪 Étape 2 : Tester le Checkout en Local

### 2.1 Démarrer les serveurs

```bash
# Terminal 1 : Backend Admin
cd digital-wardrobe-admin
npm run dev
# → http://localhost:3000

# Terminal 2 : Frontend
cd digital-wardrobe
npm run dev
# → http://localhost:5173
```

### 2.2 Tester le flux complet

1. **Aller sur la boutique** : `http://localhost:5173/shop`
2. **Ajouter un produit au panier** : Cliquer sur "Ajouter au panier"
3. **Ouvrir le panier** : Cliquer sur l'icône panier (en haut à droite)
4. **Aller au checkout** : Cliquer sur "Passer la commande"
5. **Remplir le formulaire** :
   - Nom : "Test User"
   - Email : `test@example.com`
   - Adresse : "123 Rue de Test"
   - Ville : "Paris"
   - Code postal : "75001"
   - Pays : "France"
6. **Cliquer sur "Payer"** → Redirection vers Stripe Checkout

### 2.3 Utiliser les Cartes de Test Stripe

Dans la page Stripe Checkout, utilisez ces cartes de test :

| Carte | Numéro | CVV | Date | Résultat |
|-------|--------|-----|------|----------|
| ✅ **Succès** | `4242 4242 4242 4242` | N'importe | Future | Paiement réussi |
| ❌ **Refusée** | `4000 0000 0000 0002` | N'importe | Future | Carte refusée |
| ⚠️ **3D Secure** | `4000 0025 0000 3155` | N'importe | Future | Requiert authentification |
| 💳 **PayPal** | - | - | - | Sélectionner "PayPal" dans les options |

**Autres cartes de test :**
- `4000 0000 0000 9995` → Fond insuffisants
- `4000 0000 0000 3220` → 3D Secure (authentification requise)
- `4000 0027 6000 3184` → 3D Secure (authentification échouée)

**Pour 3D Secure :**
- Utiliser le code : `1234` ou `any 4 digits`

---

## 🔔 Étape 3 : Tester les Webhooks (Local)

Les webhooks permettent à Stripe de notifier votre backend quand un paiement est complété.

### 3.1 Installer Stripe CLI

```bash
# Windows (via Scoop)
scoop install stripe

# macOS
brew install stripe/stripe-cli/stripe

# Linux
# Voir : https://stripe.com/docs/stripe-cli
```

### 3.2 Se connecter à Stripe

```bash
stripe login
# → Ouvre le navigateur pour authentification
```

### 3.3 Écouter les webhooks en local

```bash
# Terminal 3 : Stripe CLI
stripe listen --forward-to localhost:3000/api/shop/webhook
```

**Résultat attendu :**
```
> Ready! Your webhook signing secret is whsec_xxxxx
```

**⚠️ IMPORTANT :** Copier ce `whsec_xxxxx` et l'ajouter à votre `.env` :
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

Puis **redémarrer le serveur backend**.

### 3.4 Tester un événement webhook

```bash
# Dans un autre terminal
stripe trigger checkout.session.completed
```

Cela simule un paiement réussi et vous devriez voir dans les logs :
- ✅ Order status mis à jour à `PAID`
- ✅ Stock décrémenté
- ✅ Logs dans la console backend

---

## 🌐 Étape 4 : Tester en Production (Vercel)

### 4.1 Configurer les Variables d'Environnement Vercel

1. Aller sur **Vercel Dashboard** → **digital-wardrobe-admin** → **Settings** → **Environment Variables**
2. Ajouter :
   - `STRIPE_SECRET_KEY` = `sk_test_...` (ou `sk_live_...` pour production)
   - `STRIPE_WEBHOOK_SECRET` = `whsec_...` (voir ci-dessous)

### 4.2 Configurer le Webhook Stripe (Production)

1. Aller sur **Stripe Dashboard** → **Developers** → **Webhooks**
2. Cliquer sur **"Add endpoint"**
3. **Endpoint URL** : `https://digital-wardrobe-admin.vercel.app/api/shop/webhook`
4. **Events to send** :
   - ✅ `checkout.session.completed`
   - ✅ `checkout.session.expired`
   - ✅ `payment_intent.payment_failed`
5. Cliquer sur **"Add endpoint"**
6. **Copier le "Signing secret"** (commence par `whsec_`)
7. **Ajouter à Vercel** comme `STRIPE_WEBHOOK_SECRET`

### 4.3 Tester en Production

1. Aller sur `https://digital-wardrobe-puce.vercel.app/shop`
2. Suivre le même flux que pour le test local
3. Utiliser les mêmes cartes de test Stripe

---

## ✅ Checklist de Vérification

Après un test de checkout réussi, vérifier :

### Backend (Base de Données)
- [ ] Order créé avec status `PENDING` initialement
- [ ] Order mis à jour à `PAID` après webhook
- [ ] Stock du produit décrémenté
- [ ] `stripeSessionId` enregistré dans l'order

### Frontend
- [ ] Redirection vers Stripe Checkout fonctionne
- [ ] Redirection vers `/checkout/success` après paiement
- [ ] Panier vidé après succès
- [ ] Numéro de commande affiché

### Stripe Dashboard
- [ ] Payment visible dans **Payments**
- [ ] Checkout Session visible dans **Checkout Sessions**
- [ ] Webhook events visibles dans **Webhooks** → **Events**

---

## 🐛 Dépannage

### Erreur : "Payment system not configured"
- ✅ Vérifier que `STRIPE_SECRET_KEY` est défini dans `.env`
- ✅ Redémarrer le serveur backend

### Erreur : "Webhook signature verification failed"
- ✅ Vérifier que `STRIPE_WEBHOOK_SECRET` correspond au secret du webhook
- ✅ En local : Utiliser le secret retourné par `stripe listen`
- ✅ En production : Utiliser le secret du webhook Stripe Dashboard

### Le webhook ne se déclenche pas
- ✅ Vérifier que l'endpoint est accessible (pas de 404)
- ✅ Vérifier les logs Stripe Dashboard → Webhooks → Events
- ✅ En local : Vérifier que `stripe listen` est actif

### Le stock n'est pas décrémenté
- ✅ Vérifier les logs backend pour voir si le webhook est reçu
- ✅ Vérifier que `handleCheckoutComplete` est appelé
- ✅ Vérifier les logs de la base de données

### Redirection après paiement ne fonctionne pas
- ✅ Vérifier que `successUrl` et `cancelUrl` sont corrects
- ✅ Vérifier que les URLs sont accessibles (pas de 404)

---

## 📊 Vérifier les Commandes

### Via l'Admin Dashboard
1. Aller sur `http://localhost:3000/dashboard/orders`
2. Voir toutes les commandes avec leur statut

### Via l'API
```bash
# Lister toutes les commandes
curl http://localhost:3000/api/shop/orders

# Voir une commande spécifique
curl http://localhost:3000/api/shop/orders/{orderId}
```

---

## 🎯 Prochaines Étapes

Une fois les tests réussis :

1. ✅ **Passer en mode Live** : Remplacer `sk_test_` par `sk_live_` dans Vercel
2. ✅ **Configurer les emails** : Ajouter l'envoi d'emails de confirmation
3. ✅ **Ajouter des notifications** : Notifier l'influenceur des nouvelles commandes
4. ✅ **Tester avec de vrais paiements** : Faire un test avec un petit montant réel

---

## 📚 Ressources

- **Stripe Test Cards** : https://stripe.com/docs/testing
- **Stripe CLI Docs** : https://stripe.com/docs/stripe-cli
- **Webhooks Guide** : https://stripe.com/docs/webhooks
- **Checkout Sessions** : https://stripe.com/docs/payments/checkout

---

**Bon test ! 🚀**

