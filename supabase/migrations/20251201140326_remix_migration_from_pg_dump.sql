CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'client'
);


--
-- Name: ensure_super_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.ensure_super_admin() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  admin_exists boolean;
BEGIN
  -- Vérifier si un admin existe déjà
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  ) INTO admin_exists;
  
  -- Si aucun admin n'existe, créer le super admin
  IF NOT admin_exists THEN
    -- Cette fonction sera appelée manuellement via l'edge function create-super-admin
    -- car nous ne pouvons pas créer d'utilisateurs directement depuis une fonction SQL
    RAISE NOTICE 'No admin found. Please use the create-super-admin edge function.';
  END IF;
END;
$$;


--
-- Name: generate_document_path(text, text, boolean, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_document_path(doc_type text, associate_name text, is_manager boolean, original_filename text) RETURNS text
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
DECLARE
  role_prefix text;
  extension text;
BEGIN
  -- Determine role prefix
  role_prefix := CASE WHEN is_manager THEN 'Gerant' ELSE 'Associe' END;
  
  -- Extract file extension
  extension := substring(original_filename from '\.([^.]+)$');
  
  -- Generate path: documents/company_id/doc_type_role_name.ext
  RETURN format('%s_%s.%s', doc_type, role_prefix || '_' || replace(associate_name, ' ', '_'), extension);
END;
$_$;


--
-- Name: generate_service_tracking_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_service_tracking_number() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.tracking_number = 'SRV-' || TO_CHAR(now(), 'YYYY') || '-' || LPAD(nextval('tracking_sequence')::TEXT, 4, '0');
  RETURN NEW;
END;
$$;


--
-- Name: generate_tracking_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_tracking_number() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.tracking_number = 'LF-' || TO_CHAR(now(), 'YYYY') || '-' || LPAD(nextval('tracking_sequence')::TEXT, 4, '0');
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    NEW.raw_user_meta_data->>'phone'
  );
  
  -- Assign client role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: log_admin_access(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_admin_access() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF has_role(auth.uid(), 'admin') THEN
    INSERT INTO public.admin_audit_log (
      admin_id,
      action_type,
      table_name,
      record_id,
      metadata
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'operation', TG_OP,
        'timestamp', now()
      )
    );
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;


--
-- Name: notify_admin_new_document(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_admin_new_document() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NEW.uploaded_by_role = 'client' THEN
    INSERT INTO public.admin_notifications (type, title, message, request_id, request_type)
    VALUES (
      'new_document',
      'Nouveau document client',
      'Un client a téléchargé un nouveau document',
      NEW.request_id,
      NEW.request_type
    );
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: notify_admin_new_message(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_admin_new_message() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NEW.sender_role = 'client' THEN
    INSERT INTO public.admin_notifications (type, title, message, request_id, request_type)
    VALUES (
      'new_message',
      'Nouveau message client',
      'Un client a envoyé un nouveau message',
      NEW.request_id,
      NEW.request_type
    );
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: admin_audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    admin_id uuid NOT NULL,
    action_type text NOT NULL,
    table_name text,
    record_id uuid,
    metadata jsonb,
    ip_address text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: admin_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    request_id uuid,
    request_type text,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text,
    content text NOT NULL,
    featured_image text,
    author_id uuid,
    category text NOT NULL,
    tags text[],
    published boolean DEFAULT false,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    seo_title text,
    seo_description text
);


--
-- Name: company_associates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_associates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_request_id uuid NOT NULL,
    full_name text NOT NULL,
    phone text,
    email text,
    id_number text,
    cash_contribution numeric(15,2) DEFAULT 0,
    nature_contribution_description text,
    nature_contribution_value numeric(15,2) DEFAULT 0,
    total_contribution numeric(15,2) GENERATED ALWAYS AS ((cash_contribution + nature_contribution_value)) STORED,
    percentage numeric(5,2),
    share_start integer,
    share_end integer,
    number_of_shares integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    birth_date date,
    birth_place text,
    marital_status text,
    marital_regime text,
    children_count integer,
    residence_address text,
    is_manager boolean DEFAULT false
);


--
-- Name: company_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_request_id uuid NOT NULL,
    associate_id uuid,
    document_type text NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL,
    uploaded_by uuid,
    original_name text
);


--
-- Name: company_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    structure_type text NOT NULL,
    company_name text,
    region text NOT NULL,
    city text,
    address text NOT NULL,
    activity text,
    capital text,
    associates_count text,
    contact_name text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    additional_services text[] DEFAULT '{}'::text[],
    status text DEFAULT 'pending'::text,
    tracking_number text,
    estimated_price integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid NOT NULL,
    client_rating integer,
    client_review text,
    closed_at timestamp with time zone,
    closed_by uuid,
    CONSTRAINT company_requests_client_rating_check CHECK (((client_rating >= 1) AND (client_rating <= 5))),
    CONSTRAINT company_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text])))
);


--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    subject text,
    message text NOT NULL,
    status text DEFAULT 'new'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT contact_messages_status_check CHECK ((status = ANY (ARRAY['new'::text, 'in_progress'::text, 'resolved'::text])))
);


--
-- Name: created_companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.created_companies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    region text NOT NULL,
    district text,
    founder_name text NOT NULL,
    rating integer DEFAULT 5,
    testimonial text,
    show_publicly boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT created_companies_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: ebook_downloads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ebook_downloads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ebook_id uuid,
    name text,
    contact text,
    downloaded_at timestamp with time zone DEFAULT now()
);


--
-- Name: ebooks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ebooks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    file_path text NOT NULL,
    cover_image text,
    category text NOT NULL,
    requires_form boolean DEFAULT true,
    download_count integer DEFAULT 0,
    published boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text NOT NULL,
    phone text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: public_tracking; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.public_tracking (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    phone text NOT NULL,
    request_id uuid NOT NULL,
    request_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: public_tracking_rate_limit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.public_tracking_rate_limit (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ip_address text NOT NULL,
    phone text NOT NULL,
    attempt_count integer DEFAULT 1,
    first_attempt_at timestamp with time zone DEFAULT now(),
    last_attempt_at timestamp with time zone DEFAULT now(),
    blocked_until timestamp with time zone
);


--
-- Name: request_documents_exchange; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.request_documents_exchange (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid NOT NULL,
    request_type text NOT NULL,
    document_name text NOT NULL,
    document_type text NOT NULL,
    file_path text NOT NULL,
    uploaded_by uuid NOT NULL,
    uploaded_by_role text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT request_documents_exchange_request_type_check CHECK ((request_type = ANY (ARRAY['company'::text, 'service'::text]))),
    CONSTRAINT request_documents_exchange_uploaded_by_role_check CHECK ((uploaded_by_role = ANY (ARRAY['admin'::text, 'client'::text])))
);


--
-- Name: request_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.request_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid NOT NULL,
    request_type text NOT NULL,
    sender_id uuid NOT NULL,
    sender_role text NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    is_read boolean DEFAULT false,
    CONSTRAINT request_messages_request_type_check CHECK ((request_type = ANY (ARRAY['company'::text, 'service'::text]))),
    CONSTRAINT request_messages_sender_role_check CHECK ((sender_role = ANY (ARRAY['admin'::text, 'client'::text])))
);


--
-- Name: service_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    service_type text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    contact_name text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    company_name text,
    service_details jsonb,
    documents text[],
    estimated_price integer,
    payment_status text DEFAULT 'pending'::text,
    tracking_number text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    client_rating integer,
    client_review text,
    closed_at timestamp with time zone,
    closed_by uuid,
    CONSTRAINT service_requests_client_rating_check CHECK (((client_rating >= 1) AND (client_rating <= 5)))
);


--
-- Name: tracking_sequence; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tracking_sequence
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL
);


--
-- Name: admin_audit_log admin_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_audit_log
    ADD CONSTRAINT admin_audit_log_pkey PRIMARY KEY (id);


--
-- Name: admin_notifications admin_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_notifications
    ADD CONSTRAINT admin_notifications_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);


--
-- Name: company_associates company_associates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_associates
    ADD CONSTRAINT company_associates_pkey PRIMARY KEY (id);


--
-- Name: company_documents company_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_documents
    ADD CONSTRAINT company_documents_pkey PRIMARY KEY (id);


--
-- Name: company_requests company_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_requests
    ADD CONSTRAINT company_requests_pkey PRIMARY KEY (id);


--
-- Name: company_requests company_requests_tracking_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_requests
    ADD CONSTRAINT company_requests_tracking_number_key UNIQUE (tracking_number);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: created_companies created_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.created_companies
    ADD CONSTRAINT created_companies_pkey PRIMARY KEY (id);


--
-- Name: ebook_downloads ebook_downloads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ebook_downloads
    ADD CONSTRAINT ebook_downloads_pkey PRIMARY KEY (id);


--
-- Name: ebooks ebooks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ebooks
    ADD CONSTRAINT ebooks_pkey PRIMARY KEY (id);


--
-- Name: ebooks ebooks_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ebooks
    ADD CONSTRAINT ebooks_slug_key UNIQUE (slug);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: public_tracking public_tracking_phone_request_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_tracking
    ADD CONSTRAINT public_tracking_phone_request_id_key UNIQUE (phone, request_id);


--
-- Name: public_tracking public_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_tracking
    ADD CONSTRAINT public_tracking_pkey PRIMARY KEY (id);


--
-- Name: public_tracking_rate_limit public_tracking_rate_limit_ip_address_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_tracking_rate_limit
    ADD CONSTRAINT public_tracking_rate_limit_ip_address_phone_key UNIQUE (ip_address, phone);


--
-- Name: public_tracking_rate_limit public_tracking_rate_limit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_tracking_rate_limit
    ADD CONSTRAINT public_tracking_rate_limit_pkey PRIMARY KEY (id);


--
-- Name: request_documents_exchange request_documents_exchange_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_documents_exchange
    ADD CONSTRAINT request_documents_exchange_pkey PRIMARY KEY (id);


--
-- Name: request_messages request_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_messages
    ADD CONSTRAINT request_messages_pkey PRIMARY KEY (id);


--
-- Name: service_requests service_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_admin_notifications_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_notifications_unread ON public.admin_notifications USING btree (is_read) WHERE (is_read = false);


--
-- Name: idx_blog_posts_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_posts_published ON public.blog_posts USING btree (published);


--
-- Name: idx_blog_posts_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_posts_slug ON public.blog_posts USING btree (slug);


--
-- Name: idx_ebooks_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ebooks_slug ON public.ebooks USING btree (slug);


--
-- Name: idx_public_tracking_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_public_tracking_phone ON public.public_tracking USING btree (phone);


--
-- Name: idx_request_documents_exchange_request; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_request_documents_exchange_request ON public.request_documents_exchange USING btree (request_id, request_type);


--
-- Name: idx_request_messages_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_request_messages_created ON public.request_messages USING btree (created_at DESC);


--
-- Name: idx_request_messages_request; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_request_messages_request ON public.request_messages USING btree (request_id, request_type);


--
-- Name: company_requests audit_company_requests; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_company_requests AFTER DELETE OR UPDATE ON public.company_requests FOR EACH ROW EXECUTE FUNCTION public.log_admin_access();


--
-- Name: service_requests audit_service_requests; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_service_requests AFTER DELETE OR UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.log_admin_access();


--
-- Name: service_requests generate_service_tracking_number_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER generate_service_tracking_number_trigger BEFORE INSERT ON public.service_requests FOR EACH ROW WHEN ((new.tracking_number IS NULL)) EXECUTE FUNCTION public.generate_service_tracking_number();


--
-- Name: company_requests set_tracking_number; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_tracking_number BEFORE INSERT ON public.company_requests FOR EACH ROW EXECUTE FUNCTION public.generate_tracking_number();


--
-- Name: request_documents_exchange trigger_notify_admin_document; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_notify_admin_document AFTER INSERT ON public.request_documents_exchange FOR EACH ROW EXECUTE FUNCTION public.notify_admin_new_document();


--
-- Name: request_messages trigger_notify_admin_message; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_notify_admin_message AFTER INSERT ON public.request_messages FOR EACH ROW EXECUTE FUNCTION public.notify_admin_new_message();


--
-- Name: blog_posts update_blog_posts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: company_requests update_company_requests_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_company_requests_updated_at BEFORE UPDATE ON public.company_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ebooks update_ebooks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ebooks_updated_at BEFORE UPDATE ON public.ebooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: service_requests update_service_requests_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: admin_audit_log admin_audit_log_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_audit_log
    ADD CONSTRAINT admin_audit_log_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES auth.users(id);


--
-- Name: company_associates company_associates_company_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_associates
    ADD CONSTRAINT company_associates_company_request_id_fkey FOREIGN KEY (company_request_id) REFERENCES public.company_requests(id) ON DELETE CASCADE;


--
-- Name: company_documents company_documents_associate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_documents
    ADD CONSTRAINT company_documents_associate_id_fkey FOREIGN KEY (associate_id) REFERENCES public.company_associates(id) ON DELETE CASCADE;


--
-- Name: company_documents company_documents_company_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_documents
    ADD CONSTRAINT company_documents_company_request_id_fkey FOREIGN KEY (company_request_id) REFERENCES public.company_requests(id) ON DELETE CASCADE;


--
-- Name: company_documents company_documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_documents
    ADD CONSTRAINT company_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id);


--
-- Name: company_requests company_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_requests
    ADD CONSTRAINT company_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: ebook_downloads ebook_downloads_ebook_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ebook_downloads
    ADD CONSTRAINT ebook_downloads_ebook_id_fkey FOREIGN KEY (ebook_id) REFERENCES public.ebooks(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: blog_posts Admins can manage all posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all posts" ON public.blog_posts USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: ebooks Admins can manage ebooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage ebooks" ON public.ebooks USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: company_requests Admins can update all requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update all requests" ON public.company_requests FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: service_requests Admins can update all service requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update all service requests" ON public.service_requests FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: request_messages Admins can update message read status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update message read status" ON public.request_messages FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: admin_notifications Admins can update notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update notifications" ON public.admin_notifications FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: company_requests Admins can view all requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all requests" ON public.company_requests FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: contact_messages Admins can view contact messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view contact messages" ON public.contact_messages FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: ebook_downloads Admins can view downloads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view downloads" ON public.ebook_downloads FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: admin_notifications Admins can view notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view notifications" ON public.admin_notifications FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: ebook_downloads Anyone can record downloads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can record downloads" ON public.ebook_downloads FOR INSERT WITH CHECK (true);


--
-- Name: contact_messages Anyone can send contact message; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can send contact message" ON public.contact_messages FOR INSERT WITH CHECK (true);


--
-- Name: ebooks Anyone can view published ebooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view published ebooks" ON public.ebooks FOR SELECT USING ((published = true));


--
-- Name: blog_posts Anyone can view published posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view published posts" ON public.blog_posts FOR SELECT USING ((published = true));


--
-- Name: company_requests Authenticated users can create company request; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create company request" ON public.company_requests FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: service_requests Authenticated users can create service requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create service requests" ON public.service_requests FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: admin_notifications Deny all direct insertions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Deny all direct insertions" ON public.admin_notifications FOR INSERT TO authenticated WITH CHECK (false);


--
-- Name: public_tracking_rate_limit No direct access to rate limit table; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "No direct access to rate limit table" ON public.public_tracking_rate_limit TO authenticated USING (false);


--
-- Name: admin_audit_log Only admins can view audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can view audit logs" ON public.admin_audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: created_companies Public companies are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public companies are viewable by everyone" ON public.created_companies FOR SELECT USING ((show_publicly = true));


--
-- Name: public_tracking Public tracking lookup allowed; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public tracking lookup allowed" ON public.public_tracking FOR SELECT USING (true);


--
-- Name: company_associates Users can insert associates for their requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert associates for their requests" ON public.company_associates FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.company_requests
  WHERE ((company_requests.id = company_associates.company_request_id) AND (company_requests.user_id = auth.uid())))));


--
-- Name: company_documents Users can insert documents for their requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert documents for their requests" ON public.company_documents FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.company_requests
  WHERE ((company_requests.id = company_documents.company_request_id) AND (company_requests.user_id = auth.uid())))));


--
-- Name: request_messages Users can insert messages for their requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert messages for their requests" ON public.request_messages FOR INSERT WITH CHECK (((sender_id = auth.uid()) AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR ((request_type = 'company'::text) AND (EXISTS ( SELECT 1
   FROM public.company_requests
  WHERE ((company_requests.id = request_messages.request_id) AND (company_requests.user_id = auth.uid()))))) OR ((request_type = 'service'::text) AND (EXISTS ( SELECT 1
   FROM public.service_requests
  WHERE ((service_requests.id = request_messages.request_id) AND (service_requests.user_id = auth.uid()))))))));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: company_requests Users can update their own requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own requests" ON public.company_requests FOR UPDATE USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: service_requests Users can update their own service requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own service requests" ON public.service_requests FOR UPDATE USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: request_documents_exchange Users can upload documents for their requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can upload documents for their requests" ON public.request_documents_exchange FOR INSERT WITH CHECK (((uploaded_by = auth.uid()) AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR ((request_type = 'company'::text) AND (EXISTS ( SELECT 1
   FROM public.company_requests
  WHERE ((company_requests.id = request_documents_exchange.request_id) AND (company_requests.user_id = auth.uid()))))) OR ((request_type = 'service'::text) AND (EXISTS ( SELECT 1
   FROM public.service_requests
  WHERE ((service_requests.id = request_documents_exchange.request_id) AND (service_requests.user_id = auth.uid()))))))));


--
-- Name: company_associates Users can view associates of their requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view associates of their requests" ON public.company_associates FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.company_requests
  WHERE ((company_requests.id = company_associates.company_request_id) AND ((company_requests.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role))))));


--
-- Name: request_documents_exchange Users can view documents for their requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view documents for their requests" ON public.request_documents_exchange FOR SELECT USING (((uploaded_by = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR ((request_type = 'company'::text) AND (EXISTS ( SELECT 1
   FROM public.company_requests
  WHERE ((company_requests.id = request_documents_exchange.request_id) AND (company_requests.user_id = auth.uid()))))) OR ((request_type = 'service'::text) AND (EXISTS ( SELECT 1
   FROM public.service_requests
  WHERE ((service_requests.id = request_documents_exchange.request_id) AND (service_requests.user_id = auth.uid())))))));


--
-- Name: company_documents Users can view documents of their requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view documents of their requests" ON public.company_documents FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.company_requests
  WHERE ((company_requests.id = company_documents.company_request_id) AND ((company_requests.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role))))));


--
-- Name: request_messages Users can view messages for their requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view messages for their requests" ON public.request_messages FOR SELECT USING (((sender_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR ((request_type = 'company'::text) AND (EXISTS ( SELECT 1
   FROM public.company_requests
  WHERE ((company_requests.id = request_messages.request_id) AND (company_requests.user_id = auth.uid()))))) OR ((request_type = 'service'::text) AND (EXISTS ( SELECT 1
   FROM public.service_requests
  WHERE ((service_requests.id = request_messages.request_id) AND (service_requests.user_id = auth.uid())))))));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: company_requests Users can view their own requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own requests" ON public.company_requests FOR SELECT USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: service_requests Users can view their own service requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own service requests" ON public.service_requests FOR SELECT USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: admin_audit_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: blog_posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: company_associates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.company_associates ENABLE ROW LEVEL SECURITY;

--
-- Name: company_documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: company_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.company_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: contact_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: created_companies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.created_companies ENABLE ROW LEVEL SECURITY;

--
-- Name: ebook_downloads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ebook_downloads ENABLE ROW LEVEL SECURITY;

--
-- Name: ebooks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: public_tracking; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.public_tracking ENABLE ROW LEVEL SECURITY;

--
-- Name: public_tracking_rate_limit; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.public_tracking_rate_limit ENABLE ROW LEVEL SECURITY;

--
-- Name: request_documents_exchange; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.request_documents_exchange ENABLE ROW LEVEL SECURITY;

--
-- Name: request_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.request_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: service_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


