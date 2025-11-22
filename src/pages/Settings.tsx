import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, User, Settings as SettingsIcon, Radio } from "lucide-react";
import { UsersManagement } from "@/components/settings/UsersManagement";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { StreamSettings } from "@/components/StreamSettings";

const Settings = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Paramètres</h2>
        <p className="text-muted-foreground">Gérez votre compte, les utilisateurs et la configuration</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-auto">
          <TabsTrigger value="account" className="gap-2">
            <User className="h-4 w-4" />
            Mon Compte
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            Général
          </TabsTrigger>
          <TabsTrigger value="streaming" className="gap-2">
            <Radio className="h-4 w-4" />
            Streaming
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <AccountSettings />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UsersManagement />
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="streaming" className="space-y-6">
          <StreamSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
