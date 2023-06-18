#!/bin/bash

# If we can't run sudo without a password, complain and exit
if ! (sudo -n true 2> /dev/null)
then
       echo "please run as root" >&2
       echo "You need to enter password" >&2
fi

# If EUID isn't zero, replace and re-run this script as root using sudo.
if [ "$EUID" -ne 0 ]
then
        exec sudo bash "$0" "$@"
        echo "exec failed" >&2
        exit 1
fi

echo "Installing PostgresSQL"
sudo apt install postgresql -y

echo "Setting password of postgres user"
echo "=== $BASH_SOURCE on $(hostname -f) at $(date)" >&2
sudo passwd postgres

echo "Creating postgres user root"
sudo -u postgres createuser pi -P --interactive

echo "Starting Postgres"
sudo /etc/init.d/postgresql start

echo "Running psql and creating schema..."

sudo su - postgres -c \
"psql <<__END__

CREATE DATABASE pi;
CREATE DATABASE vocabdb;
\connect vocabdb;

--
-- PostgreSQL database dump
--

-- Dumped from database version 13.11 (Raspbian 13.11-0+deb11u1)
-- Dumped by pg_dump version 13.11 (Raspbian 13.11-0+deb11u1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category (
    name character varying(80) NOT NULL,
    category_order integer NOT NULL
);


ALTER TABLE public.category OWNER TO postgres;

--
-- Name: lesson; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lesson (
    id integer NOT NULL,
    person character varying(8) NOT NULL,
    lesson_date date NOT NULL,
    notes character varying(1000) NOT NULL,
    lesson_title character varying(264)
);


ALTER TABLE public.lesson OWNER TO postgres;

--
-- Name: lesson_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lesson_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lesson_id_seq OWNER TO postgres;

--
-- Name: lesson_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lesson_id_seq OWNED BY public.lesson.id;


--
-- Name: vocabulary; Type: TABLE; Schema: public; Owner: pi
--

CREATE TABLE public.vocabulary (
    dutch text,
    english text,
    notes text,
    pronunciationlink text,
    seen boolean DEFAULT false,
    mastered boolean DEFAULT false,
    id integer NOT NULL,
    set_name character varying(80)
);


ALTER TABLE public.vocabulary OWNER TO pi;

--
-- Name: vocabulary_id_seq; Type: SEQUENCE; Schema: public; Owner: pi
--

CREATE SEQUENCE public.vocabulary_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.vocabulary_id_seq OWNER TO pi;

--
-- Name: vocabulary_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pi
--

ALTER SEQUENCE public.vocabulary_id_seq OWNED BY public.vocabulary.id;


--
-- Name: lesson id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson ALTER COLUMN id SET DEFAULT nextval('public.lesson_id_seq'::regclass);


--
-- Name: vocabulary id; Type: DEFAULT; Schema: public; Owner: pi
--

ALTER TABLE ONLY public.vocabulary ALTER COLUMN id SET DEFAULT nextval('public.vocabulary_id_seq'::regclass);


--
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (name);


--
-- Name: lesson lesson_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson
    ADD CONSTRAINT lesson_pkey PRIMARY KEY (id);


--
-- Name: vocabulary vocabulary_pkey; Type: CONSTRAINT; Schema: public; Owner: pi
--

ALTER TABLE ONLY public.vocabulary
    ADD CONSTRAINT vocabulary_pkey PRIMARY KEY (id);

__END__
"

sudo /etc/init.d/postgresql status
sudo netstat -tulntp | grep -i postgres