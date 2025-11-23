import LiveStreamPlayer from "@/components/LiveStreamPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio, Music, Headphones } from "lucide-react";

const Listen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 animate-in fade-in duration-700">
            <div className="inline-flex h-20 w-20 rounded-2xl bg-gradient-divine items-center justify-center shadow-divine mx-auto">
              <Radio className="h-10 w-10 text-background" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-divine bg-clip-text text-transparent">
              Radio Kambove Tabernacle
            </h1>
            <p className="text-xl text-muted-foreground">
              Écoutez notre diffusion en direct
            </p>
          </div>

          {/* Player */}
          <div className="animate-in fade-in duration-700 delay-150">
            <LiveStreamPlayer />
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 animate-in fade-in duration-700 delay-300">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Radio className="h-5 w-5 text-accent" />
                  Diffusion 24/7
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Profitez d'une diffusion continue de qualité, accessible partout
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Music className="h-5 w-5 text-accent" />
                  Contenu Varié
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Musique, prédications et programmes spirituels enrichissants
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Headphones className="h-5 w-5 text-accent" />
                  Qualité Audio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Stream haute qualité optimisé pour tous les appareils
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Footer Info */}
          <Card className="bg-muted/30 animate-in fade-in duration-700 delay-500">
            <CardContent className="py-6 text-center">
              <p className="text-sm text-muted-foreground">
                Pour plus d'informations sur Radio Kambove Tabernacle,
                contactez-nous ou visitez notre plateforme de gestion
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Listen;
