import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Mail, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const profileSchema = z.object({
  username: z.string().min(3, "Minimum 3 caractères").max(50),
  email: z.string().email("Email invalide").max(255)
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, "Minimum 6 caractères").max(100),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

export const AccountSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState({ username: '', email: '' });
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, email')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile(data);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de charger le profil"
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Validation
      profileSchema.parse(profile);

      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          email: profile.email
        })
        .eq('id', user.id);

      if (error) throw error;

      // Mettre à jour l'email dans auth si changé
      if (profile.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profile.email
        });
        if (emailError) throw emailError;
      }

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées"
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Erreur de validation",
          description: error.issues[0].message
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error.message || "Impossible de mettre à jour le profil"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      
      // Validation
      passwordSchema.parse(passwords);

      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });

      if (error) throw error;

      toast({
        title: "Mot de passe changé",
        description: "Votre mot de passe a été mis à jour avec succès"
      });

      setPasswords({ newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Erreur de validation",
          description: error.issues[0].message
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error.message || "Impossible de changer le mot de passe"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Mon Compte</h3>
        <p className="text-muted-foreground">Gérez vos informations personnelles</p>
      </div>

      {/* Informations du Profil */}
      <Card className="gradient-divine border-accent/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-accent" />
            <CardTitle>Informations du Profil</CardTitle>
          </div>
          <CardDescription>Modifiez votre nom d'utilisateur et email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Nom d'utilisateur</Label>
            <Input
              id="username"
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              placeholder="Votre nom d'utilisateur"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </div>
            </Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="votre@email.com"
            />
          </div>
          <Button onClick={handleUpdateProfile} disabled={loading} className="w-full sm:w-auto gap-2">
            <Save className="h-4 w-4" />
            Sauvegarder le Profil
          </Button>
        </CardContent>
      </Card>

      {/* Changer le Mot de Passe */}
      <Card className="transition-smooth hover:shadow-divine hover:border-accent/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-accent" />
            <CardTitle>Changer le Mot de Passe</CardTitle>
          </div>
          <CardDescription>Modifiez votre mot de passe de connexion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau Mot de Passe</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              placeholder="Minimum 6 caractères"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le Mot de Passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              placeholder="Retapez le mot de passe"
            />
          </div>
          <Button onClick={handleChangePassword} disabled={loading} className="w-full sm:w-auto gap-2">
            <Lock className="h-4 w-4" />
            Changer le Mot de Passe
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
