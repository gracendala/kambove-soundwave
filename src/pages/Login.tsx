import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Cross, Loader2, AlertCircle } from 'lucide-react';
import { isDemoMode } from '@/lib/mockApi';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(username, password);
      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue sur Radio Kambove',
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Erreur de connexion',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Cross className="absolute top-10 left-10 w-12 h-12 text-primary/10 animate-float" />
        <Cross className="absolute bottom-20 right-20 w-16 h-16 text-primary/5 animate-float-delayed" />
        <Cross className="absolute top-1/3 right-1/4 w-8 h-8 text-primary/10 animate-float" />
      </div>

      <Card variant="glass" className="w-full max-w-md relative z-10 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 gradient-gold rounded-2xl flex items-center justify-center mb-4 animate-pulse-glow">
            <Cross className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-heading">Kambove Tabernacle</CardTitle>
          <CardDescription className="text-base">Gestion de la webradio</CardDescription>
        </CardHeader>

        <CardContent>
          {isDemoMode() && (
            <Alert className="mb-4 bg-primary/10 border-primary/20">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                <strong>Mode Démo</strong> - Vous testez l'interface sans backend. 
                Déployez sur votre serveur Ubuntu pour activer toutes les fonctionnalités.
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom d'utilisateur</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                disabled={loading}
                className="transition-all duration-300 focus:shadow-glow"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mot de passe</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="transition-all duration-300 focus:shadow-glow"
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Identifiants par défaut: admin / admin123
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
