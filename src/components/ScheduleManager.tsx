import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Plus, Trash2, Loader2 } from "lucide-react";
import { AudioLibrary } from "./AudioLibrary";
import { ScheduledBroadcasts } from "./ScheduledBroadcasts";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface ScheduledEvent {
  id: string;
  playlist_id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: string;
}

export const ScheduleManager = () => {
  const [events, setEvents] = useState<ScheduledEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newEvent, setNewEvent] = useState({
    dayOfWeek: "",
    startTime: "",
    endTime: ""
  });

  const days = [
    { label: "Dimanche", value: 0 },
    { label: "Lundi", value: 1 },
    { label: "Mardi", value: 2 },
    { label: "Mercredi", value: 3 },
    { label: "Jeudi", value: 4 },
    { label: "Vendredi", value: 5 },
    { label: "Samedi", value: 6 }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const { data: eventsData, error: eventsError } = await supabase
        .from('scheduled_events')
        .select('*')
        .eq('event_type', 'recurring')
        .order('day_of_week');

      if (eventsError) throw eventsError;

      setEvents(eventsData || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.dayOfWeek || !newEvent.startTime || !newEvent.endTime) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('scheduled_events')
        .insert([{
          event_type: 'recurring',
          day_of_week: parseInt(newEvent.dayOfWeek),
          start_time: newEvent.startTime,
          end_time: newEvent.endTime,
          created_by: user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Événement programmé ajouté"
      });

      setIsDialogOpen(false);
      setNewEvent({ dayOfWeek: "", startTime: "", endTime: "" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter l'événement",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Événement supprimé"
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'événement",
        variant: "destructive"
      });
    }
  };

  const getDayLabel = (dayValue: number) => {
    return days.find(d => d.value === dayValue)?.label || dayValue.toString();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AudioLibrary />
      
      <ScheduledBroadcasts />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Programmation Hebdomadaire</h2>
          <p className="text-muted-foreground">
            Programmez des plages horaires récurrentes pour votre grille
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Programmer un Créneau
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Programmer un Créneau</DialogTitle>
              <DialogDescription>
                Définissez une plage horaire pour votre programmation
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="day">Jour de la Semaine</Label>
                <Select
                  value={newEvent.dayOfWeek}
                  onValueChange={(value) => setNewEvent({ ...newEvent, dayOfWeek: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un jour" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map(day => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Heure de Début</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">Heure de Fin</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                />
              </div>

              <Button onClick={handleAddEvent} className="w-full">
                Programmer le Créneau
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="gradient-divine border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Créneaux Programmés
          </CardTitle>
          <CardDescription>
            Ces créneaux définissent votre grille de programmation hebdomadaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune programmation automatique. Ajoutez-en une pour commencer.
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <Card 
                  key={event.id} 
                  className="transition-smooth hover:shadow-divine hover:border-accent/30"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-semibold">{getDayLabel(event.day_of_week)}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.start_time} - {event.end_time}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
