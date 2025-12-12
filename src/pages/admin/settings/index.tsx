import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Globe, Phone, Share2, Search, Save, Loader2, RefreshCw, Bell, Send, Languages, Check, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/interactive/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Switch } from '@/components/ui/forms/switch';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { toast } from 'sonner';
import ImageUpload from '@/components/ui/forms/ImageUpload';
import { testTelegramConnection } from '@/lib/telegram';
import { testEmailConnection } from '@/lib/email';
import type { SettingKey } from '@/supabase';
import { useLanguage, languages } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

// French translations (default)
const fr = {
  title: 'Paramètres du site',
  subtitle: 'Gérer le logo, les informations de contact et les paramètres SEO',
  refresh: 'Actualiser',
  refreshShort: 'Sync',
  save: 'Enregistrer',
  tabs: {
    general: 'Général',
    contact: 'Contact',
    notifications: 'Notifs',
    social: 'Social',
    seo: 'SEO'
  },
  general: {
    logo: {
      title: 'Logo',
      description: 'Logo affiché dans la barre de navigation'
    },
    favicon: {
      title: 'Favicon',
      description: "Icône affichée dans l'onglet du navigateur"
    },
    siteInfo: {
      title: 'Informations du site',
      description: 'Nom, titre et slogan affichés sur le site',
      siteName: 'Nom du site',
      siteNamePlaceholder: 'MAMI PUB',
      tagline: 'Slogan',
      taglinePlaceholder: 'Qualité Premium',
      browserTitle: 'Titre du navigateur',
      browserTitlePlaceholder: 'MAMI PUB - Impression & Publicité',
      browserTitleHint: "Ce titre apparaît dans l'onglet du navigateur"
    },
    language: {
      title: 'Langue',
      description: "Choisir la langue de l'interface"
    },
    preview: 'Aperçu :'
  },
  contact: {
    title: 'Informations de contact',
    description: 'Coordonnées affichées dans la barre de navigation',
    phone: 'Téléphone',
    phonePlaceholder: '0557 91 45 44',
    email: 'Email',
    emailPlaceholder: 'contact@example.com',
    address: 'Adresse',
    addressPlaceholder: 'Ets Mahamid Mami, El Eulma',
    mapsLink: 'Lien Google Maps',
    mapsLinkPlaceholder: 'https://maps.google.com/...',
    businessHours: "Horaires d'ouverture",
    businessHoursPlaceholder: 'Lun-Sam: 9h-18h'
  },
  notifications: {
    telegram: {
      title: 'Notifications Telegram',
      description: 'Recevez des notifications instantanées sur Telegram pour chaque nouvelle commande',
      enable: 'Activer les notifications',
      enableDesc: 'Recevoir une notification Telegram pour chaque commande',
      botToken: 'Token du Bot',
      botTokenPlaceholder: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz',
      botTokenHint: 'Obtenez-le via @BotFather sur Telegram',
      chatId: 'Chat ID',
      chatIdPlaceholder: '5112845316',
      chatIdHint: 'Votre ID utilisateur Telegram (via @userinfobot)',
      testButton: 'Envoyer un message test',
      howTo: {
        title: 'Comment configurer ?',
        step1: 'Ouvrez Telegram et recherchez @BotFather',
        step2: 'Envoyez /newbot et suivez les instructions',
        step3: "Copiez le token API fourni",
        step4: 'Recherchez @userinfobot pour obtenir votre Chat ID',
        step5: 'Collez les deux valeurs ci-dessus et testez'
      }
    },
    email: {
      title: 'Notifications Email',
      description: 'Recevez les commandes par email',
      enable: 'Activer les notifications email',
      enableDesc: 'Recevoir un email pour chaque nouvelle commande',
      recipient: 'Votre email',
      recipientPlaceholder: 'votre-email@example.com',
      recipientHint: "L'adresse email où vous recevrez les notifications de commande",
      testButton: 'Envoyer un email test'
    }
  },
  social: {
    title: 'Réseaux sociaux',
    description: 'Liens vers vos profils sociaux',
    facebook: 'Facebook',
    facebookPlaceholder: 'https://facebook.com/...',
    instagram: 'Instagram',
    instagramPlaceholder: 'https://instagram.com/...',
    tiktok: 'TikTok',
    tiktokPlaceholder: 'https://tiktok.com/@...',
    whatsapp: 'WhatsApp',
    whatsappPlaceholder: '557 91 45 44',
    whatsappHint: 'Numéro algérien pour le lien WhatsApp (sans 0)'
  },
  seo: {
    title: 'SEO (Référencement)',
    description: 'Optimisez votre visibilité sur les moteurs de recherche',
    siteDescription: 'Description du site',
    siteDescriptionPlaceholder: 'Description de votre activité...',
    siteDescriptionHint: 'Cette description apparaît dans les résultats de recherche Google',
    keywords: 'Mots-clés',
    keywordsPlaceholder: 'impression, publicité, Béjaïa, Algérie...',
    keywordsHint: 'Séparez les mots-clés par des virgules',
    ogImage: {
      title: 'Image de partage social',
      description: 'Image affichée lors du partage sur les réseaux sociaux',
      hint: 'Taille recommandée : 1200x630 pixels'
    }
  },
  security: {
    title: 'Sécurité',
    description: 'Modifier votre mot de passe administrateur',
    currentPassword: 'Mot de passe actuel',
    currentPasswordPlaceholder: 'Entrez votre mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    newPasswordPlaceholder: 'Entrez le nouveau mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    confirmPasswordPlaceholder: 'Confirmez le nouveau mot de passe',
    passwordHint: 'Minimum 8 caractères',
    changePassword: 'Modifier le mot de passe',
    changing: 'Modification...',
    allFieldsRequired: 'Tous les champs sont requis',
    passwordMismatch: 'Les mots de passe ne correspondent pas',
    passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères',
    notLoggedIn: 'Utilisateur non connecté',
    passwordChanged: 'Mot de passe modifié avec succès',
    error: 'Erreur',
    passwordChangeFailed: 'Impossible de modifier le mot de passe',
    unexpectedError: 'Une erreur est survenue'
  },
  toast: {
    saved: 'Paramètres enregistrés',
    savedDesc: '{count} paramètre(s) mis à jour',
    saveError: "Erreur d'enregistrement",
    saveErrorDesc: 'Veuillez réessayer',
    telegramIncomplete: 'Configuration incomplète',
    telegramIncompleteDesc: 'Veuillez remplir le Token du Bot et le Chat ID',
    telegramSuccess: 'Test réussi !',
    telegramSuccessDesc: 'Vérifiez votre Telegram pour le message test',
    telegramFailed: 'Test échoué',
    telegramFailedDesc: 'Vérifiez vos identifiants',
    telegramError: 'Erreur de connexion',
    telegramErrorDesc: 'Impossible de contacter Telegram',
    emailRequired: 'Email requis',
    emailRequiredDesc: 'Veuillez remplir votre adresse email',
    emailSuccess: 'Test réussi !',
    emailSuccessDesc: 'Vérifiez votre boîte de réception',
    emailFailed: 'Test échoué',
    emailFailedDesc: "Erreur lors de l'envoi de l'email",
    emailError: 'Erreur de connexion',
    emailErrorDesc: "Impossible d'envoyer l'email"
  }
};

const SettingsPage = () => {
  const { settings, isLoading, updateSettingValue, uploadAsset, refreshSettings } = useSiteSettings();
  const { language, setLanguage, currentLanguage, t: translate } = useLanguage();
  const { user } = useAuth();
  
  // Translation helper - French hardcoded, others from JSON
  const getFrenchText = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = fr;
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    return typeof value === 'string' ? value : key;
  };
  
  const getText = (key: string): string => {
    if (language === 'fr') {
      return getFrenchText(key);
    }
    const translated = translate(key, 'admin_settings');
    return translated === key ? getFrenchText(key) : translated;
  };
  
  const t = getText;
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<Record<string, File[]>>({});
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Local form state
  const [formData, setFormData] = useState<Record<SettingKey, string | null>>({} as any);

  // Initialize form data from settings
  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  // Test Telegram connection
  const handleTestTelegram = async () => {
    const botToken = formData.telegram_bot_token;
    const chatId = formData.telegram_chat_id;
    
    if (!botToken || !chatId) {
      toast.error(t('toast.telegramIncomplete'), {
        description: t('toast.telegramIncompleteDesc'),
      });
      return;
    }
    
    setIsTesting(true);
    try {
      const result = await testTelegramConnection({ botToken, chatId });
      if (result.success) {
        toast.success(t('toast.telegramSuccess'), {
          description: t('toast.telegramSuccessDesc'),
        });
      } else {
        toast.error(t('toast.telegramFailed'), {
          description: result.error || t('toast.telegramFailedDesc'),
        });
      }
    } catch (error) {
      toast.error(t('toast.telegramError'), {
        description: t('toast.telegramErrorDesc'),
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Test Email connection
  const handleTestEmail = async () => {
    const recipientEmail = formData.email_recipient;
    
    if (!recipientEmail) {
      toast.error(t('toast.emailRequired'), {
        description: t('toast.emailRequiredDesc'),
      });
      return;
    }
    
    setIsTestingEmail(true);
    try {
      const result = await testEmailConnection(recipientEmail);
      if (result.success) {
        toast.success(t('toast.emailSuccess'), {
          description: t('toast.emailSuccessDesc'),
        });
      } else {
        toast.error(t('toast.emailFailed'), {
          description: result.error || t('toast.emailFailedDesc'),
        });
      }
    } catch (error) {
      toast.error(t('toast.emailError'), {
        description: t('toast.emailErrorDesc'),
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(t('security.allFieldsRequired'));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t('security.passwordMismatch'));
      return;
    }

    if (newPassword.length < 8) {
      toast.error(t('security.passwordTooShort'));
      return;
    }

    if (!user?.id) {
      toast.error(t('security.notLoggedIn'));
      return;
    }

    setIsChangingPassword(true);
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${SUPABASE_URL}/functions/v1/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          userId: user.id,
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(t('security.passwordChanged'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(t('security.error'), {
          description: data.error || t('security.passwordChangeFailed'),
        });
      }
    } catch (error) {
      toast.error(t('security.error'), {
        description: t('security.unexpectedError'),
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleInputChange = useCallback((key: SettingKey, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value || null }));
  }, []);

  const handleImageChange = useCallback((key: SettingKey, urls: string[]) => {
    setFormData(prev => ({ ...prev, [key]: urls[0] || null }));
  }, []);

  const handleFilesChange = useCallback((key: string, files: File[]) => {
    setPendingFiles(prev => ({ ...prev, [key]: files }));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Upload pending images first and track URLs separately
      const uploadedUrls: Record<string, string> = {};
      
      for (const [key, files] of Object.entries(pendingFiles)) {
        if (files.length > 0) {
          const assetType = key === 'logo_url' ? 'logo' : key === 'favicon_url' ? 'favicon' : 'og_image';
          const url = await uploadAsset(files[0], assetType);
          uploadedUrls[key] = url;
        }
      }
      
      // Merge uploaded URLs with current form data
      const finalData = { ...formData, ...uploadedUrls };
      
      // Save all changed settings
      const changedKeys = Object.keys(finalData).filter(
        key => finalData[key as SettingKey] !== settings[key as SettingKey]
      );
      
      for (const key of changedKeys) {
        await updateSettingValue(key as SettingKey, finalData[key as SettingKey]);
      }
      
      setPendingFiles({});
      toast.success(t('toast.saved'), {
        description: t('toast.savedDesc').replace('{count}', String(changedKeys.length)),
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error(t('toast.saveError'), {
        description: t('toast.saveErrorDesc'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshSettings} disabled={isSaving} className="text-xs sm:text-sm">
            <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">{t('refresh')}</span>
            <span className="sm:hidden">{t('refreshShort')}</span>
          </Button>
          <Button onClick={handleSave} disabled={isSaving} size="sm" className="text-xs sm:text-sm">
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            )}
            {t('save')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid h-auto">
          <TabsTrigger value="general" className="gap-1.5 sm:gap-2 text-xs sm:text-sm py-2">
            <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t('tabs.general')}</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-1.5 sm:gap-2 text-xs sm:text-sm py-2">
            <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t('tabs.contact')}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 sm:gap-2 text-xs sm:text-sm py-2">
            <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t('tabs.notifications')}</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-1.5 sm:gap-2 text-xs sm:text-sm py-2">
            <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t('tabs.social')}</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-1.5 sm:gap-2 text-xs sm:text-sm py-2">
            <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t('tabs.seo')}</span>
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {/* Logo */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base">{t('general.logo.title')}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{t('general.logo.description')}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <ImageUpload
                  value={formData.logo_url ? [formData.logo_url] : []}
                  onChange={(urls) => handleImageChange('logo_url', urls)}
                  onFilesChange={(files) => handleFilesChange('logo_url', files)}
                  maxImages={1}
                />
                {formData.logo_url && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">{t('general.preview')}</p>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <img 
                        src={formData.logo_url} 
                        alt="Logo preview" 
                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl object-cover"
                      />
                      <span className="font-bold text-sm sm:text-base">{formData.site_name || 'MAMI PUB'}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Favicon */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base">{t('general.favicon.title')}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{t('general.favicon.description')}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <ImageUpload
                  value={formData.favicon_url ? [formData.favicon_url] : []}
                  onChange={(urls) => handleImageChange('favicon_url', urls)}
                  onFilesChange={(files) => handleFilesChange('favicon_url', files)}
                  maxImages={1}
                />
              </CardContent>
            </Card>
          </div>

          {/* Site Info */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-base">{t('general.siteInfo.title')}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t('general.siteInfo.description')}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="site_name" className="text-xs sm:text-sm">{t('general.siteInfo.siteName')}</Label>
                  <Input
                    id="site_name"
                    value={formData.site_name || ''}
                    onChange={(e) => handleInputChange('site_name', e.target.value)}
                    placeholder={t('general.siteInfo.siteNamePlaceholder')}
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="site_tagline" className="text-xs sm:text-sm">{t('general.siteInfo.tagline')}</Label>
                  <Input
                    id="site_tagline"
                    value={formData.site_tagline || ''}
                    onChange={(e) => handleInputChange('site_tagline', e.target.value)}
                    placeholder={t('general.siteInfo.taglinePlaceholder')}
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="site_title" className="text-xs sm:text-sm">{t('general.siteInfo.browserTitle')}</Label>
                <Input
                  id="site_title"
                  value={formData.site_title || ''}
                  onChange={(e) => handleInputChange('site_title', e.target.value)}
                  placeholder={t('general.siteInfo.browserTitlePlaceholder')}
                  className="h-9 sm:h-10 text-sm"
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {t('general.siteInfo.browserTitleHint')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Language Selector */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Languages className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                {t('general.language.title')}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t('general.language.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`relative flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                      language === lang.code
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl">{lang.flag}</span>
                    <div className="text-center">
                      <div className="font-medium text-xs sm:text-sm">{lang.nativeName}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">{lang.name}</div>
                    </div>
                    {language === lang.code && (
                      <div className="absolute top-2 right-2 w-4 h-4 sm:w-5 sm:h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security - Password Change */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                {t('security.title')}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t('security.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="current_password" className="text-xs sm:text-sm">
                  {t('security.currentPassword')}
                </Label>
                <div className="relative">
                  <Input
                    id="current_password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t('security.currentPasswordPlaceholder')}
                    className="h-9 sm:h-10 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="new_password" className="text-xs sm:text-sm">
                  {t('security.newPassword')}
                </Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('security.newPasswordPlaceholder')}
                    className="h-9 sm:h-10 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {t('security.passwordHint')}
                </p>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="confirm_password" className="text-xs sm:text-sm">
                  {t('security.confirmPassword')}
                </Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('security.confirmPasswordPlaceholder')}
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="w-full sm:w-auto"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('security.changing')}
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    {t('security.changePassword')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-base">{t('contact.title')}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t('contact.description')}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="contact_phone" className="text-xs sm:text-sm">{t('contact.phone')}</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone || ''}
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                    placeholder={t('contact.phonePlaceholder')}
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="contact_email" className="text-xs sm:text-sm">{t('contact.email')}</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email || ''}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    placeholder={t('contact.emailPlaceholder')}
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="contact_address" className="text-xs sm:text-sm">{t('contact.address')}</Label>
                <Input
                  id="contact_address"
                  value={formData.contact_address || ''}
                  onChange={(e) => handleInputChange('contact_address', e.target.value)}
                  placeholder={t('contact.addressPlaceholder')}
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="business_hours" className="text-xs sm:text-sm">{t('contact.businessHours')}</Label>
                <Input
                  id="business_hours"
                  value={formData.business_hours || ''}
                  onChange={(e) => handleInputChange('business_hours', e.target.value)}
                  placeholder={t('contact.businessHoursPlaceholder')}
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                {t('notifications.telegram.title')}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t('notifications.telegram.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg gap-3">
                <div>
                  <p className="font-medium text-sm sm:text-base">{t('notifications.telegram.enable')}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t('notifications.telegram.enableDesc')}
                  </p>
                </div>
                <Switch
                  checked={formData.telegram_enabled === 'true'}
                  onCheckedChange={(checked) => 
                    handleInputChange('telegram_enabled', checked ? 'true' : 'false')
                  }
                />
              </div>

              {/* Settings Form */}
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="telegram_bot_token" className="text-xs sm:text-sm">{t('notifications.telegram.botToken')}</Label>
                  <Input
                    id="telegram_bot_token"
                    type="password"
                    value={formData.telegram_bot_token || ''}
                    onChange={(e) => handleInputChange('telegram_bot_token', e.target.value)}
                    placeholder={t('notifications.telegram.botTokenPlaceholder')}
                    className="h-9 sm:h-10 text-sm"
                  />
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {t('notifications.telegram.botTokenHint')}
                  </p>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="telegram_chat_id" className="text-xs sm:text-sm">{t('notifications.telegram.chatId')}</Label>
                  <Input
                    id="telegram_chat_id"
                    value={formData.telegram_chat_id || ''}
                    onChange={(e) => handleInputChange('telegram_chat_id', e.target.value)}
                    placeholder={t('notifications.telegram.chatIdPlaceholder')}
                    className="h-9 sm:h-10 text-sm"
                  />
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {t('notifications.telegram.chatIdHint')}
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={handleTestTelegram}
                  disabled={isTesting || !formData.telegram_bot_token || !formData.telegram_chat_id}
                  className="w-full h-9 sm:h-10 text-xs sm:text-sm"
                >
                  {isTesting ? (
                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                  )}
                  {t('notifications.telegram.testButton')}
                </Button>

                <div className="p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="font-medium text-blue-600 mb-2 text-xs sm:text-sm">{t('notifications.telegram.howTo.title')}</h4>
                  <ol className="text-[10px] sm:text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>{t('notifications.telegram.howTo.step1')}</li>
                    <li>{t('notifications.telegram.howTo.step2')}</li>
                    <li>{t('notifications.telegram.howTo.step3')}</li>
                    <li>{t('notifications.telegram.howTo.step4')}</li>
                    <li>{t('notifications.telegram.howTo.step5')}</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Notifications */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Send className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                {t('notifications.email.title')}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t('notifications.email.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg gap-3">
                <div>
                  <p className="font-medium text-sm sm:text-base">{t('notifications.email.enable')}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t('notifications.email.enableDesc')}
                  </p>
                </div>
                <Switch
                  checked={formData.email_enabled === 'true'}
                  onCheckedChange={(checked) => 
                    handleInputChange('email_enabled', checked ? 'true' : 'false')
                  }
                />
              </div>

              {/* Email Settings */}
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="email_recipient" className="text-xs sm:text-sm">{t('notifications.email.recipient')}</Label>
                  <Input
                    id="email_recipient"
                    type="email"
                    value={formData.email_recipient || ''}
                    onChange={(e) => handleInputChange('email_recipient', e.target.value)}
                    placeholder={t('notifications.email.recipientPlaceholder')}
                    className="h-9 sm:h-10 text-sm"
                  />
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {t('notifications.email.recipientHint')}
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={handleTestEmail}
                  disabled={isTestingEmail || !formData.email_recipient}
                  className="w-full h-9 sm:h-10 text-xs sm:text-sm"
                >
                  {isTestingEmail ? (
                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {t('notifications.email.testButton')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-base">{t('social.title')}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t('social.description')}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="social_facebook" className="text-xs sm:text-sm">{t('social.facebook')}</Label>
                  <Input
                    id="social_facebook"
                    type="url"
                    value={formData.social_facebook || ''}
                    onChange={(e) => handleInputChange('social_facebook', e.target.value)}
                    placeholder={t('social.facebookPlaceholder')}
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="social_instagram" className="text-xs sm:text-sm">{t('social.instagram')}</Label>
                  <Input
                    id="social_instagram"
                    type="url"
                    value={formData.social_instagram || ''}
                    onChange={(e) => handleInputChange('social_instagram', e.target.value)}
                    placeholder={t('social.instagramPlaceholder')}
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="social_tiktok" className="text-xs sm:text-sm">{t('social.tiktok')}</Label>
                  <Input
                    id="social_tiktok"
                    type="url"
                    value={formData.social_tiktok || ''}
                    onChange={(e) => handleInputChange('social_tiktok', e.target.value)}
                    placeholder={t('social.tiktokPlaceholder')}
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="social_whatsapp" className="text-xs sm:text-sm">{t('social.whatsapp')}</Label>
                  <div className="flex">
                    <div className="flex items-center px-2 sm:px-3 bg-muted border border-r-0 rounded-l-md text-xs sm:text-sm text-muted-foreground">
                      +213
                    </div>
                    <Input
                      id="social_whatsapp"
                      value={formData.social_whatsapp?.replace(/^\+213\s?/, '') || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d\s]/g, '');
                        handleInputChange('social_whatsapp', value ? `+213 ${value}` : '');
                      }}
                      placeholder={t('social.whatsappPlaceholder')}
                      className="rounded-l-none h-9 sm:h-10 text-sm"
                    />
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {t('social.whatsappHint')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-base">{t('seo.title')}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t('seo.description')}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="site_description" className="text-xs sm:text-sm">{t('seo.siteDescription')}</Label>
                <textarea
                  id="site_description"
                  value={formData.site_description || ''}
                  onChange={(e) => handleInputChange('site_description', e.target.value)}
                  placeholder={t('seo.siteDescriptionPlaceholder')}
                  className="w-full min-h-[80px] sm:min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {t('seo.siteDescriptionHint')}
                </p>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="keywords" className="text-xs sm:text-sm">{t('seo.keywords')}</Label>
                <Input
                  id="keywords"
                  value={formData.keywords || ''}
                  onChange={(e) => handleInputChange('keywords', e.target.value)}
                  placeholder={t('seo.keywordsPlaceholder')}
                  className="h-9 sm:h-10 text-sm"
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {t('seo.keywordsHint')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-base">{t('seo.ogImage.title')}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t('seo.ogImage.description')}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <ImageUpload
                value={formData.og_image ? [formData.og_image] : []}
                onChange={(urls) => handleImageChange('og_image', urls)}
                onFilesChange={(files) => handleFilesChange('og_image', files)}
                maxImages={1}
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
                {t('seo.ogImage.hint')}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
