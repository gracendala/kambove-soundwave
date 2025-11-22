import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Radio, Download, Smartphone, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast({
        title: 'Installation',
        description: 'Utilisez le menu de votre navigateur pour installer l\'application',
      });
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast({
        title: 'Installation réussie !',
        description: 'L\'application a été installée sur votre appareil',
      });
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 gradient-gold rounded-2xl flex items-center justify-center mb-4 animate-pulse-glow">
            <Radio className="w-10 h-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl">
            {isInstalled ? 'Application Installée !' : 'Installer Radio Kambove'}
          </CardTitle>
          <CardDescription className="text-base">
            {isInstalled
              ? 'L\'application est déjà installée sur votre appareil'
              : 'Installez l\'application pour une expérience optimale'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isInstalled && (
            <>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Accès Rapide</p>
                    <p className="text-sm text-muted-foreground">
                      Lancez l'application directement depuis votre écran d'accueil
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Mode Hors Ligne</p>
                    <p className="text-sm text-muted-foreground">
                      Fonctionne même sans connexion internet stable
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Recevez les mises à jour importantes en temps réel
                    </p>
                  </div>
                </div>
              </div>

              {deferredPrompt && (
                <Button
                  onClick={handleInstallClick}
                  size="lg"
                  className="w-full gap-2"
                >
                  <Download className="h-5 w-5" />
                  Installer l'Application
                </Button>
              )}

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-accent" />
                  Installation Manuelle
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground mb-1">Sur iPhone/iPad :</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Ouvrez Safari et visitez le site</li>
                      <li>Appuyez sur l'icône Partager (en bas)</li>
                      <li>Sélectionnez "Sur l'écran d'accueil"</li>
                      <li>Appuyez sur "Ajouter"</li>
                    </ol>
                  </div>

                  <div>
                    <p className="font-medium text-foreground mb-1">Sur Android :</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Ouvrez Chrome et visitez le site</li>
                      <li>Appuyez sur le menu (⋮) en haut à droite</li>
                      <li>Sélectionnez "Installer l'application" ou "Ajouter à l'écran d'accueil"</li>
                      <li>Confirmez l'installation</li>
                    </ol>
                  </div>
                </div>
              </div>
            </>
          )}

          {isInstalled && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-accent" />
              </div>
              <p className="text-muted-foreground">
                Vous pouvez maintenant fermer cette fenêtre et utiliser l'application installée
              </p>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full"
          >
            Retour à l'Accueil
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Install;
