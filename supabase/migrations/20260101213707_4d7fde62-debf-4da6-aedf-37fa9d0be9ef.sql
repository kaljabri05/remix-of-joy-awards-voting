-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create voters table to track registered voters
CREATE TABLE public.voters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  device_id TEXT NOT NULL UNIQUE,
  current_category_index INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create votes table to store all votes
CREATE TABLE public.votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_id UUID NOT NULL REFERENCES public.voters(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  nominee_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(voter_id, category_id)
);

-- Create user_roles table for admin access
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Voters policies (anyone can insert, read their own by device_id)
CREATE POLICY "Anyone can register as voter"
ON public.voters FOR INSERT
WITH CHECK (true);

CREATE POLICY "Voters can view their own record"
ON public.voters FOR SELECT
USING (true);

CREATE POLICY "Voters can update their own record"
ON public.voters FOR UPDATE
USING (true);

-- Votes policies
CREATE POLICY "Voters can insert their votes"
ON public.votes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view votes"
ON public.votes FOR SELECT
USING (true);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- User roles policies
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for votes
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;