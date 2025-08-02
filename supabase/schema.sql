-- Custom ENUM types for status fields
CREATE TYPE public.role AS ENUM ('Super Admin', 'Project Manager', 'Site Engineer', 'Store Keeper', 'Accountant', 'Client', 'Vendor');
CREATE TYPE public.task_status AS ENUM ('To Do', 'In Progress', 'Done', 'Blocked');
CREATE TYPE public.order_status AS ENUM ('Pending', 'Approved', 'Sent', 'Received', 'Rejected');
CREATE TYPE public.project_status AS ENUM ('Active', 'Archived', 'Completed');

-- Profiles table to store public user information, linked to auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role public.role DEFAULT 'Site Engineer'::public.role
);

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  client TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  budget NUMERIC,
  status public.project_status DEFAULT 'Active'::public.project_status,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Junction table for team members in a project
CREATE TABLE public.project_members (
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_role TEXT,
  daily_wage NUMERIC,
  PRIMARY KEY (project_id, user_id)
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status public.task_status DEFAULT 'To Do'::public.task_status,
  start_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Inventory table
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT,
  threshold NUMERIC,
  UNIQUE(project_id, name)
);

-- Orders and Order Items tables
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  status public.order_status DEFAULT 'Pending'::public.order_status,
  requested_by UUID NOT NULL REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  received_at TIMESTAMPTZ,
  invoice_url TEXT
);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT
);

-- Expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT, -- Using TEXT for simplicity, can be an ENUM
  date TIMESTAMPTZ NOT NULL,
  submitted_by UUID NOT NULL REFERENCES public.profiles(id),
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Documents table
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT,
    version INT DEFAULT 1,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);
