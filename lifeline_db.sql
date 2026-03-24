--
-- PostgreSQL database dump
--

\restrict uMrs4UN7QNhqDheBwxCgyh4tQvvQE9b4JKd8HgdNzEUCqIUcLpdPD2hLgfa2vkL

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

-- Started on 2026-03-23 13:30:40

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
-- TOC entry 2 (class 3079 OID 18780)
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- TOC entry 6080 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- TOC entry 1662 (class 1247 OID 19888)
-- Name: assignment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.assignment_status AS ENUM (
    'accepted',
    'in_progress',
    'completed',
    'cancelled'
);


ALTER TYPE public.assignment_status OWNER TO postgres;

--
-- TOC entry 1665 (class 1247 OID 19898)
-- Name: otp_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.otp_type AS ENUM (
    'register',
    'forgot_password'
);


ALTER TYPE public.otp_type OWNER TO postgres;

--
-- TOC entry 1659 (class 1247 OID 19876)
-- Name: request_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.request_status AS ENUM (
    'pending',
    'assigned',
    'in_progress',
    'completed',
    'cancelled'
);


ALTER TYPE public.request_status OWNER TO postgres;

--
-- TOC entry 1656 (class 1247 OID 19869)
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'victim',
    'rescuer',
    'admin'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- TOC entry 922 (class 1255 OID 20093)
-- Name: mark_messages_read(integer, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.mark_messages_read(IN p_conversation_id integer, IN p_user_id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE messages
  SET is_read = TRUE
  WHERE conversation_id = p_conversation_id
    AND sender_id != p_user_id   -- chỉ đánh dấu tin nhắn của người kia
    AND is_read = FALSE;

  COMMIT;
END;
$$;


ALTER PROCEDURE public.mark_messages_read(IN p_conversation_id integer, IN p_user_id integer) OWNER TO postgres;

--
-- TOC entry 437 (class 1255 OID 20091)
-- Name: send_image_message(integer, integer, text); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.send_image_message(IN p_conversation_id integer, IN p_sender_id integer, IN p_image_url text)
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_message_id INT;
BEGIN
  -- Tạo message với type = image
  INSERT INTO messages (conversation_id, sender_id, isText)
  VALUES (p_conversation_id, p_sender_id, false)
  RETURNING id INTO v_message_id;

  -- Lưu ảnh vào message_images
  INSERT INTO message_images (message_id, image_url)
  VALUES (v_message_id, p_image_url);

  COMMIT;
END;
$$;


ALTER PROCEDURE public.send_image_message(IN p_conversation_id integer, IN p_sender_id integer, IN p_image_url text) OWNER TO postgres;

--
-- TOC entry 697 (class 1255 OID 20090)
-- Name: update_location(integer, integer, numeric, numeric); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.update_location(IN p_user_id integer, IN p_request_id integer, IN p_lat numeric, IN p_lng numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Cập nhật vị trí hiện tại trong users
  UPDATE users
  SET current_location = ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)
  WHERE id = p_user_id;

  -- Lưu vào lịch sử
  INSERT INTO location_history (user_id, request_id, location)
  VALUES (
    p_user_id, p_request_id,
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)
  );

  COMMIT;
END;
$$;


ALTER PROCEDURE public.update_location(IN p_user_id integer, IN p_request_id integer, IN p_lat numeric, IN p_lng numeric) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 236 (class 1259 OID 20007)
-- Name: conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversations (
    id integer NOT NULL,
    request_id integer,
    victim_id integer,
    rescuer_id integer,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.conversations OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 20006)
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conversations_id_seq OWNER TO postgres;

--
-- TOC entry 6081 (class 0 OID 0)
-- Dependencies: 235
-- Name: conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;


--
-- TOC entry 234 (class 1259 OID 19986)
-- Name: location_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.location_history (
    id integer NOT NULL,
    rescuer_id integer,
    request_id integer,
    location public.geometry(Point,4326),
    recorded_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.location_history OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 19985)
-- Name: location_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.location_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.location_history_id_seq OWNER TO postgres;

--
-- TOC entry 6082 (class 0 OID 0)
-- Dependencies: 233
-- Name: location_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.location_history_id_seq OWNED BY public.location_history.id;


--
-- TOC entry 242 (class 1259 OID 20074)
-- Name: message_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.message_images (
    id integer NOT NULL,
    message_id integer,
    image_url text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.message_images OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 20073)
-- Name: message_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.message_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.message_images_id_seq OWNER TO postgres;

--
-- TOC entry 6083 (class 0 OID 0)
-- Dependencies: 241
-- Name: message_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.message_images_id_seq OWNED BY public.message_images.id;


--
-- TOC entry 238 (class 1259 OID 20033)
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    conversation_id integer,
    sender_id integer,
    content text,
    is_read boolean DEFAULT false,
    sent_at timestamp without time zone DEFAULT now(),
    istext boolean DEFAULT true
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 20032)
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO postgres;

--
-- TOC entry 6084 (class 0 OID 0)
-- Dependencies: 237
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- TOC entry 240 (class 1259 OID 20056)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    type character varying(50) NOT NULL,
    title character varying(200),
    content text,
    ref_id integer,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 20055)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- TOC entry 6085 (class 0 OID 0)
-- Dependencies: 239
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 230 (class 1259 OID 19947)
-- Name: request_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.request_images (
    id integer NOT NULL,
    request_id integer,
    image_url text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.request_images OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 19946)
-- Name: request_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.request_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.request_images_id_seq OWNER TO postgres;

--
-- TOC entry 6086 (class 0 OID 0)
-- Dependencies: 229
-- Name: request_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.request_images_id_seq OWNED BY public.request_images.id;


--
-- TOC entry 232 (class 1259 OID 19964)
-- Name: rescue_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rescue_assignments (
    id integer NOT NULL,
    request_id integer,
    rescuer_id integer,
    assigned_at timestamp without time zone DEFAULT now(),
    status public.assignment_status DEFAULT 'accepted'::public.assignment_status
);


ALTER TABLE public.rescue_assignments OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 19963)
-- Name: rescue_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rescue_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rescue_assignments_id_seq OWNER TO postgres;

--
-- TOC entry 6087 (class 0 OID 0)
-- Dependencies: 231
-- Name: rescue_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rescue_assignments_id_seq OWNED BY public.rescue_assignments.id;


--
-- TOC entry 228 (class 1259 OID 19925)
-- Name: rescue_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rescue_requests (
    id integer NOT NULL,
    user_id integer,
    title character varying(200) NOT NULL,
    description text,
    urgency_level integer DEFAULT 3,
    location public.geometry(Point,4326) NOT NULL,
    address text,
    status public.request_status DEFAULT 'pending'::public.request_status,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT rescue_requests_urgency_level_check CHECK (((urgency_level >= 1) AND (urgency_level <= 5)))
);


ALTER TABLE public.rescue_requests OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 19924)
-- Name: rescue_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rescue_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rescue_requests_id_seq OWNER TO postgres;

--
-- TOC entry 6088 (class 0 OID 0)
-- Dependencies: 227
-- Name: rescue_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rescue_requests_id_seq OWNED BY public.rescue_requests.id;


--
-- TOC entry 226 (class 1259 OID 19904)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password text NOT NULL,
    phone character varying(15) NOT NULL,
    full_name character varying(100) NOT NULL,
    role public.user_role NOT NULL,
    avatar_url text,
    is_active boolean DEFAULT false,
    current_location public.geometry(Point,4326),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 19903)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 6089 (class 0 OID 0)
-- Dependencies: 225
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 5839 (class 2604 OID 20010)
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);


--
-- TOC entry 5837 (class 2604 OID 19989)
-- Name: location_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_history ALTER COLUMN id SET DEFAULT nextval('public.location_history_id_seq'::regclass);


--
-- TOC entry 5848 (class 2604 OID 20077)
-- Name: message_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_images ALTER COLUMN id SET DEFAULT nextval('public.message_images_id_seq'::regclass);


--
-- TOC entry 5841 (class 2604 OID 20036)
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- TOC entry 5845 (class 2604 OID 20059)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 5832 (class 2604 OID 19950)
-- Name: request_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_images ALTER COLUMN id SET DEFAULT nextval('public.request_images_id_seq'::regclass);


--
-- TOC entry 5834 (class 2604 OID 19967)
-- Name: rescue_assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments ALTER COLUMN id SET DEFAULT nextval('public.rescue_assignments_id_seq'::regclass);


--
-- TOC entry 5827 (class 2604 OID 19928)
-- Name: rescue_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_requests ALTER COLUMN id SET DEFAULT nextval('public.rescue_requests_id_seq'::regclass);


--
-- TOC entry 5824 (class 2604 OID 19907)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 6068 (class 0 OID 20007)
-- Dependencies: 236
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversations (id, request_id, victim_id, rescuer_id, created_at) FROM stdin;
\.


--
-- TOC entry 6066 (class 0 OID 19986)
-- Dependencies: 234
-- Data for Name: location_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.location_history (id, rescuer_id, request_id, location, recorded_at) FROM stdin;
\.


--
-- TOC entry 6074 (class 0 OID 20074)
-- Dependencies: 242
-- Data for Name: message_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.message_images (id, message_id, image_url, created_at) FROM stdin;
\.


--
-- TOC entry 6070 (class 0 OID 20033)
-- Dependencies: 238
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, conversation_id, sender_id, content, is_read, sent_at, istext) FROM stdin;
\.


--
-- TOC entry 6072 (class 0 OID 20056)
-- Dependencies: 240
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, title, content, ref_id, is_read, created_at) FROM stdin;
\.


--
-- TOC entry 6062 (class 0 OID 19947)
-- Dependencies: 230
-- Data for Name: request_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.request_images (id, request_id, image_url, created_at) FROM stdin;
\.


--
-- TOC entry 6064 (class 0 OID 19964)
-- Dependencies: 232
-- Data for Name: rescue_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rescue_assignments (id, request_id, rescuer_id, assigned_at, status) FROM stdin;
\.


--
-- TOC entry 6060 (class 0 OID 19925)
-- Dependencies: 228
-- Data for Name: rescue_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rescue_requests (id, user_id, title, description, urgency_level, location, address, status, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5823 (class 0 OID 19099)
-- Dependencies: 221
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- TOC entry 6058 (class 0 OID 19904)
-- Dependencies: 226
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, phone, full_name, role, avatar_url, is_active, current_location, created_at) FROM stdin;
\.


--
-- TOC entry 6090 (class 0 OID 0)
-- Dependencies: 235
-- Name: conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conversations_id_seq', 1, false);


--
-- TOC entry 6091 (class 0 OID 0)
-- Dependencies: 233
-- Name: location_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.location_history_id_seq', 1, false);


--
-- TOC entry 6092 (class 0 OID 0)
-- Dependencies: 241
-- Name: message_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.message_images_id_seq', 1, false);


--
-- TOC entry 6093 (class 0 OID 0)
-- Dependencies: 237
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- TOC entry 6094 (class 0 OID 0)
-- Dependencies: 239
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- TOC entry 6095 (class 0 OID 0)
-- Dependencies: 229
-- Name: request_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.request_images_id_seq', 1, false);


--
-- TOC entry 6096 (class 0 OID 0)
-- Dependencies: 231
-- Name: rescue_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rescue_assignments_id_seq', 1, false);


--
-- TOC entry 6097 (class 0 OID 0)
-- Dependencies: 227
-- Name: rescue_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rescue_requests_id_seq', 1, false);


--
-- TOC entry 6098 (class 0 OID 0)
-- Dependencies: 225
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- TOC entry 5880 (class 2606 OID 20014)
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- TOC entry 5882 (class 2606 OID 20016)
-- Name: conversations conversations_request_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_request_id_key UNIQUE (request_id);


--
-- TOC entry 5878 (class 2606 OID 19995)
-- Name: location_history location_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_history
    ADD CONSTRAINT location_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5891 (class 2606 OID 20084)
-- Name: message_images message_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_images
    ADD CONSTRAINT message_images_pkey PRIMARY KEY (id);


--
-- TOC entry 5885 (class 2606 OID 20043)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 5889 (class 2606 OID 20067)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5870 (class 2606 OID 19957)
-- Name: request_images request_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_images
    ADD CONSTRAINT request_images_pkey PRIMARY KEY (id);


--
-- TOC entry 5873 (class 2606 OID 19972)
-- Name: rescue_assignments rescue_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments
    ADD CONSTRAINT rescue_assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 5875 (class 2606 OID 19974)
-- Name: rescue_assignments rescue_assignments_request_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments
    ADD CONSTRAINT rescue_assignments_request_id_key UNIQUE (request_id);


--
-- TOC entry 5868 (class 2606 OID 19940)
-- Name: rescue_requests rescue_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_requests
    ADD CONSTRAINT rescue_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 5859 (class 2606 OID 19923)
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- TOC entry 5861 (class 2606 OID 19919)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5863 (class 2606 OID 19921)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5871 (class 1259 OID 20102)
-- Name: idx_assignments_rescuer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignments_rescuer ON public.rescue_assignments USING btree (rescuer_id);


--
-- TOC entry 5876 (class 1259 OID 20099)
-- Name: idx_location_history; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_location_history ON public.location_history USING gist (location);


--
-- TOC entry 5883 (class 1259 OID 20103)
-- Name: idx_messages_conversation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_conversation ON public.messages USING btree (conversation_id);


--
-- TOC entry 5886 (class 1259 OID 20105)
-- Name: idx_notifications_unread; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_unread ON public.notifications USING btree (user_id, is_read);


--
-- TOC entry 5887 (class 1259 OID 20104)
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);


--
-- TOC entry 5864 (class 1259 OID 20098)
-- Name: idx_requests_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requests_location ON public.rescue_requests USING gist (location);


--
-- TOC entry 5865 (class 1259 OID 20100)
-- Name: idx_requests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requests_status ON public.rescue_requests USING btree (status);


--
-- TOC entry 5866 (class 1259 OID 20101)
-- Name: idx_requests_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requests_user_id ON public.rescue_requests USING btree (user_id);


--
-- TOC entry 5854 (class 1259 OID 20097)
-- Name: idx_users_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_location ON public.users USING gist (current_location);


--
-- TOC entry 5855 (class 1259 OID 20094)
-- Name: idx_users_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_phone ON public.users USING btree (phone);


--
-- TOC entry 5856 (class 1259 OID 20096)
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- TOC entry 5857 (class 1259 OID 20095)
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- TOC entry 5898 (class 2606 OID 20017)
-- Name: conversations conversations_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.rescue_requests(id) ON DELETE CASCADE;


--
-- TOC entry 5899 (class 2606 OID 20027)
-- Name: conversations conversations_rescuer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_rescuer_id_fkey FOREIGN KEY (rescuer_id) REFERENCES public.users(id);


--
-- TOC entry 5900 (class 2606 OID 20022)
-- Name: conversations conversations_victim_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_victim_id_fkey FOREIGN KEY (victim_id) REFERENCES public.users(id);


--
-- TOC entry 5896 (class 2606 OID 20001)
-- Name: location_history location_history_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_history
    ADD CONSTRAINT location_history_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.rescue_requests(id);


--
-- TOC entry 5897 (class 2606 OID 19996)
-- Name: location_history location_history_rescuer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_history
    ADD CONSTRAINT location_history_rescuer_id_fkey FOREIGN KEY (rescuer_id) REFERENCES public.users(id);


--
-- TOC entry 5904 (class 2606 OID 20085)
-- Name: message_images message_images_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_images
    ADD CONSTRAINT message_images_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- TOC entry 5901 (class 2606 OID 20044)
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- TOC entry 5902 (class 2606 OID 20049)
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- TOC entry 5903 (class 2606 OID 20068)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5893 (class 2606 OID 19958)
-- Name: request_images request_images_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_images
    ADD CONSTRAINT request_images_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.rescue_requests(id) ON DELETE CASCADE;


--
-- TOC entry 5894 (class 2606 OID 19975)
-- Name: rescue_assignments rescue_assignments_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments
    ADD CONSTRAINT rescue_assignments_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.rescue_requests(id);


--
-- TOC entry 5895 (class 2606 OID 19980)
-- Name: rescue_assignments rescue_assignments_rescuer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments
    ADD CONSTRAINT rescue_assignments_rescuer_id_fkey FOREIGN KEY (rescuer_id) REFERENCES public.users(id);


--
-- TOC entry 5892 (class 2606 OID 19941)
-- Name: rescue_requests rescue_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_requests
    ADD CONSTRAINT rescue_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


-- Completed on 2026-03-23 13:30:41

--
-- PostgreSQL database dump complete
--

\unrestrict uMrs4UN7QNhqDheBwxCgyh4tQvvQE9b4JKd8HgdNzEUCqIUcLpdPD2hLgfa2vkL

