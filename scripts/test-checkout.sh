#!/bin/bash

# Script de test rapide pour le checkout Stripe
# Usage: ./scripts/test-checkout.sh

API_URL="${API_URL:-http://localhost:3000/api}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"

echo "🧪 Test du Checkout Stripe"
echo "=========================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Vérifier que les produits existent
echo "📦 Vérification des produits..."
PRODUCTS=$(curl -s "$API_URL/shop/products/public" | jq '.products | length')

if [ "$PRODUCTS" -eq 0 ]; then
    echo -e "${RED}❌ Aucun produit trouvé. Créez d'abord un produit via l'admin dashboard.${NC}"
    echo "   → $FRONTEND_URL/dashboard/shop"
    exit 1
fi

echo -e "${GREEN}✅ $PRODUCTS produit(s) trouvé(s)${NC}"
echo ""

# 2. Afficher les produits disponibles
echo "📋 Produits disponibles:"
curl -s "$API_URL/shop/products/public" | jq -r '.products[] | "  - \(.name) (ID: \(.id)) - \(.price)€ - Stock: \(.stock)"'
echo ""

# 3. Instructions
echo -e "${YELLOW}📝 Instructions pour tester:${NC}"
echo ""
echo "1. Aller sur: $FRONTEND_URL/shop"
echo "2. Ajouter un produit au panier"
echo "3. Cliquer sur l'icône panier → 'Passer la commande'"
echo "4. Remplir le formulaire avec:"
echo "   - Nom: Test User"
echo "   - Email: test@example.com"
echo "   - Adresse: 123 Rue de Test"
echo "   - Ville: Paris"
echo "   - Code postal: 75001"
echo "   - Pays: France"
echo "5. Cliquer sur 'Payer'"
echo ""
echo -e "${YELLOW}💳 Cartes de test Stripe:${NC}"
echo "  ✅ Succès: 4242 4242 4242 4242"
echo "  ❌ Refusée: 4000 0000 0000 0002"
echo "  🔐 3D Secure: 4000 0025 0000 3155"
echo ""
echo -e "${YELLOW}🔔 Pour tester les webhooks en local:${NC}"
echo "  stripe listen --forward-to localhost:3000/api/shop/webhook"
echo ""

