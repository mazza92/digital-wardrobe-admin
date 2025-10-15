'use client'

import { useState, useEffect } from 'react'

interface InfluencerProfile {
  name: string
  brand: string
  bio: string
  heroImage: string
  socialMedia: {
    instagram?: string
    tiktok?: string
    youtube?: string
    pinterest?: string
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<InfluencerProfile>({
    name: '',
    brand: '',
    bio: '',
    heroImage: '',
    socialMedia: {}
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else {
        // Load default data if no profile exists
        setProfile({
          name: 'Emmanuelle K',
          brand: 'EMMANUELLE K',
          bio: 'Luxury fashion & lifestyle content creator. Sharing elegant, sophisticated style for the modern woman.',
          heroImage: 'https://www.na-kd.com/cdn-cgi/image/quality=80,sharpen=0.3,width=984/globalassets/oversized_belted_trenchcoat_1858-000002-0765_3_campaign.jpg',
          socialMedia: {
            instagram: 'https://instagram.com/emmanuellek',
            tiktok: 'https://tiktok.com/@emmanuellek',
            youtube: 'https://youtube.com/@emmanuellek',
            pinterest: 'https://pinterest.com/emmanuellek'
          }
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      alert('Erreur lors du chargement du profil')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })

      if (response.ok) {
        alert('Profil mis à jour avec succès!')
      } else {
        throw new Error('Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Erreur lors de la sauvegarde du profil')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfile(prev => ({
          ...prev,
          heroImage: e.target?.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSocialMediaChange = (platform: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Profil de l'Influenceur</h1>
            <p className="text-gray-300 mt-1">Gérez les informations de votre profil public</p>
          </div>

          <div className="p-8">
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-8">
              {/* Profile Image */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Photo de Profil
                </label>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <img
                      src={profile.heroImage}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <span className="text-white opacity-0 hover:opacity-100 transition-opacity duration-200 text-sm font-medium">
                        Changer
                      </span>
                    </div>
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="profile-image"
                    />
                    <label
                      htmlFor="profile-image"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                    >
                      📷 Changer la photo
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG ou GIF. Taille max: 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Nom de l'Influenceur *
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Votre nom"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Marque *
                  </label>
                  <input
                    type="text"
                    value={profile.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Nom de votre marque"
                    required
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Bio *
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Décrivez-vous et votre style..."
                  required
                />
                <p className="text-xs text-gray-500">
                  {profile.bio.length}/500 caractères
                </p>
              </div>

              {/* Social Media */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Réseaux Sociaux</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={profile.socialMedia.instagram || ''}
                      onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="https://instagram.com/votrecompte"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      TikTok
                    </label>
                    <input
                      type="url"
                      value={profile.socialMedia.tiktok || ''}
                      onChange={(e) => handleSocialMediaChange('tiktok', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="https://tiktok.com/@votrecompte"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      YouTube
                    </label>
                    <input
                      type="url"
                      value={profile.socialMedia.youtube || ''}
                      onChange={(e) => handleSocialMediaChange('youtube', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="https://youtube.com/@votrecompte"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Pinterest
                    </label>
                    <input
                      type="url"
                      value={profile.socialMedia.pinterest || ''}
                      onChange={(e) => handleSocialMediaChange('pinterest', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="https://pinterest.com/votrecompte"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Aperçu du Profil</h3>
                <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl p-8 text-white">
                  <div className="text-center">
                    <img
                      src={profile.heroImage}
                      alt="Profile Preview"
                      className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-white/20"
                    />
                    <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
                    <p className="text-white/80 text-sm uppercase tracking-wider mb-4">{profile.brand}</p>
                    <p className="text-white/90 leading-relaxed max-w-md mx-auto">{profile.bio}</p>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sauvegarde...</span>
                    </>
                  ) : (
                    <span>Sauvegarder le Profil</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
