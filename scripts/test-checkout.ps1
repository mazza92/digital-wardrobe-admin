# Script de test rapide pour le checkout Stripe (PowerShell)
# Usage: .\scripts\test-checkout.ps1

$API_URL = if ($env:API_URL) { $env:API_URL } else { "http://localhost:3000/api" }
$FRONTEND_URL = if ($env:FRONTEND_URL) { $env:FRONTEND_URL } else { "http://localhost:5173" }

Write-Host "🧪 Test du Checkout Stripe" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier que les produits existent
Write-Host "📦 Vérification des produits..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/shop/products/public" -Method Get
    $productCount = $response.products.Count
    
    if ($productCount -eq 0) {
        Write-Host "❌ Aucun produit trouvé. Créez d'abord un produit via l'admin dashboard." -ForegroundColor Red
        Write-Host "   → $FRONTEND_URL/dashboard/shop" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "✅ $productCount produit(s) trouvé(s)" -ForegroundColor Green
    Write-Host ""
    
    # 2. Afficher les produits disponibles
    Write-Host "📋 Produits disponibles:" -ForegroundColor Yellow
    foreach ($product in $response.products) {
        Write-Host "  - $($product.name) (ID: $($product.id)) - $($product.price)€ - Stock: $($product.stock)" -ForegroundColor White
    }
    Write-Host ""
    
} catch {
    Write-Host "❌ Erreur lors de la récupération des produits: $_" -ForegroundColor Red
    exit 1
}

# 3. Instructions
Write-Host "📝 Instructions pour tester:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Aller sur: $FRONTEND_URL/shop" -ForegroundColor White
Write-Host "2. Ajouter un produit au panier" -ForegroundColor White
Write-Host "3. Cliquer sur l'icône panier → 'Passer la commande'" -ForegroundColor White
Write-Host "4. Remplir le formulaire avec:" -ForegroundColor White
Write-Host "   - Nom: Test User" -ForegroundColor Gray
Write-Host "   - Email: test@example.com" -ForegroundColor Gray
Write-Host "   - Adresse: 123 Rue de Test" -ForegroundColor Gray
Write-Host "   - Ville: Paris" -ForegroundColor Gray
Write-Host "   - Code postal: 75001" -ForegroundColor Gray
Write-Host "   - Pays: France" -ForegroundColor Gray
Write-Host "5. Cliquer sur 'Payer'" -ForegroundColor White
Write-Host ""
Write-Host "💳 Cartes de test Stripe:" -ForegroundColor Yellow
Write-Host "  ✅ Succès: 4242 4242 4242 4242" -ForegroundColor Green
Write-Host "  ❌ Refusée: 4000 0000 0000 0002" -ForegroundColor Red
Write-Host "  🔐 3D Secure: 4000 0025 0000 3155" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔔 Pour tester les webhooks en local:" -ForegroundColor Yellow
Write-Host "  stripe listen --forward-to localhost:3000/api/shop/webhook" -ForegroundColor White
Write-Host ""

