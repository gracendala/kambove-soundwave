-- Modifier le trigger pour attribuer automatiquement le rôle 'operator' aux nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Créer le profil
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email
  );
  
  -- Attribuer automatiquement le rôle 'operator' au nouvel utilisateur
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'operator');
  
  RETURN NEW;
END;
$$;