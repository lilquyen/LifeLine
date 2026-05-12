--
-- PostgreSQL database dump
--

\restrict BQwfqdaf18ohYFMfKurqZM4Mp9bnsPfoytyttQGQZ9sWdvjbKcEYtpfXpsApwAZ

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

-- Started on 2026-05-12 23:41:49

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
-- TOC entry 6081 (class 0 OID 0)
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
    created_at timestamp without time zone DEFAULT now(),
    is_active boolean DEFAULT true
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
-- TOC entry 6082 (class 0 OID 0)
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
-- TOC entry 6083 (class 0 OID 0)
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
-- TOC entry 6084 (class 0 OID 0)
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
-- TOC entry 6085 (class 0 OID 0)
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
-- TOC entry 6086 (class 0 OID 0)
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
-- TOC entry 6087 (class 0 OID 0)
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
    status public.assignment_status DEFAULT 'accepted'::public.assignment_status,
    finished_at timestamp without time zone
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
-- TOC entry 6088 (class 0 OID 0)
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
-- TOC entry 6089 (class 0 OID 0)
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
-- TOC entry 6090 (class 0 OID 0)
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
-- TOC entry 5849 (class 2604 OID 20077)
-- Name: message_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_images ALTER COLUMN id SET DEFAULT nextval('public.message_images_id_seq'::regclass);


--
-- TOC entry 5842 (class 2604 OID 20036)
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- TOC entry 5846 (class 2604 OID 20059)
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
-- TOC entry 6069 (class 0 OID 20007)
-- Dependencies: 236
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversations (id, request_id, victim_id, rescuer_id, created_at, is_active) FROM stdin;
3	47	12	11	2026-05-11 23:05:46.424627	t
4	48	13	11	2026-05-11 23:59:59.654029	t
5	49	14	11	2026-05-12 00:00:02.803265	t
6	50	15	11	2026-05-12 00:00:06.064359	t
7	51	12	11	2026-05-12 00:03:33.152378	t
8	54	14	11	2026-05-12 22:40:03.461328	t
\.


--
-- TOC entry 6067 (class 0 OID 19986)
-- Dependencies: 234
-- Data for Name: location_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.location_history (id, rescuer_id, request_id, location, recorded_at) FROM stdin;
\.


--
-- TOC entry 6075 (class 0 OID 20074)
-- Dependencies: 242
-- Data for Name: message_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.message_images (id, message_id, image_url, created_at) FROM stdin;
5	17	https://res.cloudinary.com/drgq2349s/image/upload/v1778524993/lifeline/jrs6qvjzr7druvgla7bf.jpg	2026-05-12 01:43:14.056929
6	18	https://res.cloudinary.com/drgq2349s/image/upload/v1778525014/lifeline/zej3ojy2yp3wil4zuora.jpg	2026-05-12 01:43:34.920309
7	20	https://res.cloudinary.com/drgq2349s/image/upload/v1778531623/lifeline/ezv2whdhcahtke40yh1y.png	2026-05-12 03:33:44.440545
8	23	https://res.cloudinary.com/drgq2349s/image/upload/v1778532151/lifeline/euventozhw2hz6nffhpp.png	2026-05-12 03:42:32.372142
9	24	https://res.cloudinary.com/drgq2349s/image/upload/v1778532389/lifeline/ijulsbnmbftxvi97uiai.jpg	2026-05-12 03:46:30.03655
10	25	https://res.cloudinary.com/drgq2349s/image/upload/v1778532821/lifeline/prdlwjhztzyd2xydbxh6.jpg	2026-05-12 03:53:42.318828
11	26	https://res.cloudinary.com/drgq2349s/image/upload/v1778533014/lifeline/ycyjopdpusuawsz5reeu.jpg	2026-05-12 03:56:55.800766
12	27	https://res.cloudinary.com/drgq2349s/image/upload/v1778533123/lifeline/e7kihprqzwriijcteu55.jpg	2026-05-12 03:58:43.957853
13	28	https://res.cloudinary.com/drgq2349s/image/upload/v1778533752/lifeline/xpepxqtgsjefjnwzyw39.jpg	2026-05-12 04:09:12.849239
14	29	https://res.cloudinary.com/drgq2349s/image/upload/v1778533998/lifeline/iaijsexzaon1fg1rz2cb.jpg	2026-05-12 04:13:18.802387
15	31	https://res.cloudinary.com/drgq2349s/image/upload/v1778534091/lifeline/x4ijc1ac91ctlowwrejp.jpg	2026-05-12 04:14:52.931347
16	31	https://res.cloudinary.com/drgq2349s/image/upload/v1778534092/lifeline/gza82ihli7m8yuvqz4px.jpg	2026-05-12 04:14:52.93515
17	32	https://res.cloudinary.com/drgq2349s/image/upload/v1778534376/lifeline/rjfewc3nj4gk3ijpc56t.jpg	2026-05-12 04:19:38.134853
18	32	https://res.cloudinary.com/drgq2349s/image/upload/v1778534377/lifeline/c3r7saed0awwkun6uwmm.jpg	2026-05-12 04:19:38.137051
19	33	https://res.cloudinary.com/drgq2349s/image/upload/v1778536424/lifeline/q1tb4ufalshpicbpnwse.png	2026-05-12 04:53:45.482734
20	33	https://res.cloudinary.com/drgq2349s/image/upload/v1778536424/lifeline/wz56y8inahjwdrz16amu.png	2026-05-12 04:53:45.486758
21	33	https://res.cloudinary.com/drgq2349s/image/upload/v1778536424/lifeline/rv5bpbo4ajifrkfoj26q.png	2026-05-12 04:53:45.488215
22	52	https://res.cloudinary.com/drgq2349s/image/upload/v1778567683/lifeline/jcn7ynssczp7cemi2d1n.png	2026-05-12 13:34:44.650038
23	55	https://res.cloudinary.com/drgq2349s/image/upload/v1778568289/lifeline/xjhcdtssyf7zj6opxjfz.png	2026-05-12 13:44:50.064556
24	56	https://res.cloudinary.com/drgq2349s/image/upload/v1778568717/lifeline/ujcebfq9atn6atye7eon.jpg	2026-05-12 13:51:58.911377
25	56	https://res.cloudinary.com/drgq2349s/image/upload/v1778568718/lifeline/hyfpbevby87anzq0vk2m.png	2026-05-12 13:51:58.913807
\.


--
-- TOC entry 6071 (class 0 OID 20033)
-- Dependencies: 238
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, conversation_id, sender_id, content, is_read, sent_at, istext) FROM stdin;
16	7	11	hello	t	2026-05-12 01:42:04.86903	t
18	7	11		t	2026-05-12 01:43:34.91006	f
29	7	11		t	2026-05-12 04:13:18.79088	f
30	7	11	hehe	t	2026-05-12 04:13:29.497407	t
32	7	11		t	2026-05-12 04:19:38.127544	f
17	7	12		t	2026-05-12 01:43:14.049442	f
20	7	12		t	2026-05-12 03:33:44.419804	f
21	7	12	hihi	t	2026-05-12 03:33:48.406575	t
22	7	12	j z tr	t	2026-05-12 03:41:57.95174	t
23	7	12		t	2026-05-12 03:42:32.362918	f
33	7	12		t	2026-05-12 04:53:45.471792	f
19	3	12	heloooooooo	t	2026-05-12 01:45:37.677835	t
34	7	11	tớ chào cậu	t	2026-05-12 05:17:03.851026	t
35	7	12	hi cậu	t	2026-05-12 05:24:58.628128	t
36	7	11	hi	t	2026-05-12 12:45:42.895281	t
37	7	12	helo	t	2026-05-12 12:55:26.283793	t
38	7	11	kkk	t	2026-05-12 12:56:16.584478	t
39	7	12	hej hej	t	2026-05-12 12:56:34.710274	t
40	7	11	kkk	t	2026-05-12 12:56:45.456477	t
41	7	11	đ	t	2026-05-12 12:58:41.429199	t
42	7	11	kkk	t	2026-05-12 13:01:31.93246	t
43	7	12	hehe	t	2026-05-12 13:01:57.048738	t
44	7	11	được r	t	2026-05-12 13:04:27.255642	t
45	7	12	thật không	t	2026-05-12 13:16:56.340829	t
46	7	12	alo	t	2026-05-12 13:17:06.403662	t
47	7	12	r u ok	t	2026-05-12 13:17:11.879252	t
48	7	12	test xem nào	t	2026-05-12 13:19:57.744875	t
49	7	12	test	t	2026-05-12 13:20:06.888039	t
50	7	12	test	t	2026-05-12 13:22:37.830056	t
51	7	12	đây r	t	2026-05-12 13:28:31.947737	t
52	7	11		t	2026-05-12 13:34:44.635917	f
53	7	11	tại sao	t	2026-05-12 13:34:55.82316	t
54	7	11	ủa	t	2026-05-12 13:35:00.996373	t
55	7	11		t	2026-05-12 13:44:50.055246	f
56	7	12		t	2026-05-12 13:51:58.898613	f
57	7	12	hello	f	2026-05-12 16:13:37.501117	t
24	5	11		t	2026-05-12 03:46:30.024384	f
25	5	11		t	2026-05-12 03:53:42.307368	f
26	5	11		t	2026-05-12 03:56:55.788415	f
27	5	11		t	2026-05-12 03:58:43.940546	f
28	5	11		t	2026-05-12 04:09:12.83437	f
31	5	11		t	2026-05-12 04:14:52.914982	f
58	8	11	xin loi, minh phai huy	t	2026-05-12 23:05:10.72558	t
\.


--
-- TOC entry 6073 (class 0 OID 20056)
-- Dependencies: 240
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, title, content, ref_id, is_read, created_at) FROM stdin;
\.


--
-- TOC entry 6063 (class 0 OID 19947)
-- Dependencies: 230
-- Data for Name: request_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.request_images (id, request_id, image_url, created_at) FROM stdin;
5	51	https://res.cloudinary.com/drgq2349s/image/upload/v1778508614/lifeline/zutbnvcmcsworvdm4wen.jpg	2026-05-11 21:10:16.354406
6	51	https://res.cloudinary.com/drgq2349s/image/upload/v1778508615/lifeline/oz1n1qjpsykyn2koocqc.jpg	2026-05-11 21:10:16.354406
7	51	https://res.cloudinary.com/drgq2349s/image/upload/v1778508615/lifeline/evgnsz4epdqzdizdm9hk.jpg	2026-05-11 21:10:16.354406
8	53	https://res.cloudinary.com/drgq2349s/image/upload/v1778599888/lifeline/blexssg4veoxnjwea0go.jpg	2026-05-12 22:31:30.732184
9	53	https://res.cloudinary.com/drgq2349s/image/upload/v1778599888/lifeline/risk7bbnexb91nqpigyq.jpg	2026-05-12 22:31:30.732184
10	53	https://res.cloudinary.com/drgq2349s/image/upload/v1778599889/lifeline/gspqanuytywevteehiqk.jpg	2026-05-12 22:31:30.732184
11	54	https://res.cloudinary.com/drgq2349s/image/upload/v1778600389/lifeline/leews7ujvt7di2ng843n.jpg	2026-05-12 22:39:51.029851
12	54	https://res.cloudinary.com/drgq2349s/image/upload/v1778600390/lifeline/htxlsaqd5l55chximvtd.png	2026-05-12 22:39:51.029851
\.


--
-- TOC entry 6065 (class 0 OID 19964)
-- Dependencies: 232
-- Data for Name: rescue_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rescue_assignments (id, request_id, rescuer_id, assigned_at, status, finished_at) FROM stdin;
13	47	11	2026-05-11 23:05:46.394325	accepted	\N
14	48	11	2026-05-11 23:59:59.630491	accepted	\N
16	50	11	2026-05-12 00:00:06.05973	accepted	\N
17	51	11	2026-05-12 00:03:33.135169	accepted	\N
18	53	11	2026-05-12 22:35:36.062399	accepted	\N
19	54	11	2026-05-12 22:40:03.429445	cancelled	\N
15	49	11	2026-05-12 00:00:02.79541	completed	2026-05-12 23:21:44.251676
\.


--
-- TOC entry 6061 (class 0 OID 19925)
-- Dependencies: 228
-- Data for Name: rescue_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rescue_requests (id, user_id, title, description, urgency_level, location, address, status, created_at, updated_at) FROM stdin;
53	14	mới nè	abc	2	0101000020E6100000CC35F266FA725A40483B5B2D9DF83440	đường chiến thắng	assigned	2026-05-12 22:31:30.732184	2026-05-12 22:31:30.732184
51	12	Ngập tại đường Yên Xá	Mưa to gây ngập lụt 	2	0101000020E610000039454772F9725A40A25D85949FF83440	Đường Yên Xá, Thanh Trì, Hà Nội	assigned	2026-05-11 21:10:16.354406	2026-05-11 21:10:16.354406
54	14	đây nhé	đây	1	0101000020E610000081F10C1AFA725A402E95B7239CF83440	đường chiến thắng	pending	2026-05-12 22:39:51.029851	2026-05-12 22:39:51.029851
49	14	Ngập lụt - mức nước nguy hiểm	Khu vực này đang ngập nước sâu khoảng 1.5m do mưa lớn kéo dài. Có người mắc kẹt trên nóc nhà. Cần sơ tán gấp.	5	0101000020E6100000431CEBE236765A40E02D90A0F8013540	789 Đường Trần Hưng Đạo, Hoàn Kiếm, Hà Nội	completed	2026-05-11 21:07:07.501417	2026-05-11 21:07:07.501417
52	12	test	\N	4	0101000020E610000081F10C1AFA725A402E95B7239CF83440	Đường Yên Xá, Thanh Trì, Hà Nội	pending	2026-05-11 21:12:26.77763	2026-05-11 21:12:26.77763
47	12	Cháy nhà dân cư	Nhà số 123 bốc cháy, lửa lớn, khói đen. Có người bị mắc kẹt bên trong. Cần sơ tán gấp các hộ dân xung quanh.	5	0101000020E6100000910F7A36AB765A409EEFA7C64B073540	123 Đường Nguyễn Huệ, Hoàn Kiếm, Hà Nội	assigned	2026-05-11 21:06:08.99996	2026-05-11 21:06:08.99996
48	13	Tai nạn giao thông - xe máy	Có 2 xe máy va chạm giao nhau, 1 người bị thương nặng, máu chảy rất nhiều. Xe tải cũng gây cổ chai giao thông.	5	0101000020E61000000B24287E8C755A40ECC039234A0B3540	456 Đường Lý Thường Kiệt, Hai Bà Trưng, Hà Nội	assigned	2026-05-11 21:06:33.304849	2026-05-11 21:06:33.304849
50	15	Sạt lở đất - nguy hiểm	Bờ sông bắt đầu sạt lở, nhiều nhà dân có nguy cơ rơi xuống. Cần sơ tán dân trong vùng ngay lập tức.	4	0101000020E6100000BE9F1A2FDD745A402B1895D409083540	321 Đường Bà Triệu, Hoàn Kiếm, Hà Nội	assigned	2026-05-11 21:07:07.501417	2026-05-11 21:07:07.501417
\.


--
-- TOC entry 5823 (class 0 OID 19099)
-- Dependencies: 221
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- TOC entry 6059 (class 0 OID 19904)
-- Dependencies: 226
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, phone, full_name, role, avatar_url, is_active, current_location, created_at) FROM stdin;
11	rescuer	$2b$10$OwW1QNQbmetriak93FYw6.hoRDqt0GERqKm1QxpLLRq6Fdiazf3qK	0964399302	Nguười cứu hộ	rescuer	\N	t	\N	2026-05-11 20:44:28.323928
13	victim1	$2b$10$BS8wnXS5kDXlxsdIMd.2iOvnhYonYcDWwm1h.9f68q2MKCpqg3tqe	0964399308	Trần Văn C	victim	\N	t	\N	2026-05-11 20:47:05.409207
15	victim3	$2b$10$BfyNyHqqM7XxenkKAxSgfOe4EnEjc.BvUewtbpEQ5Vfay3ZRcXBnG	0964399304	Đỗ Thị D	victim	\N	t	\N	2026-05-11 20:47:51.553477
14	victim2	$2b$10$VPjn3uMZh.bHU8QFX7OccOwzX/0IeAkrsfw7CjV0QGv39JYyPbez6	0964399300	Nguyễn Văn A	victim	https://res.cloudinary.com/drgq2349s/image/upload/v1778531623/lifeline/ezv2whdhcahtke40yh1y.png	t	\N	2026-05-11 20:47:26.170039
16	rescuer1	$2b$10$BU.r.gMg.S9nmbc6idW2duHvBSbF9SKIotWygOhwSm76ZU8ZaBuF.	01234556	Phạm Thế Quyền	rescuer	\N	t	\N	2026-05-12 19:26:17.179307
12	victim	$2b$10$Kbzkqk1Lie7eE9NM1AwiE.GVTrgHDjHlll7SpRyYtwVW.CSjg2kiC	0964399307	Nguười cần cứu hộ	victim	\N	t	0101000020E610000000000000000024400000000000002440	2026-05-11 20:45:49.334173
\.


--
-- TOC entry 6091 (class 0 OID 0)
-- Dependencies: 235
-- Name: conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conversations_id_seq', 8, true);


--
-- TOC entry 6092 (class 0 OID 0)
-- Dependencies: 233
-- Name: location_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.location_history_id_seq', 4, true);


--
-- TOC entry 6093 (class 0 OID 0)
-- Dependencies: 241
-- Name: message_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.message_images_id_seq', 25, true);


--
-- TOC entry 6094 (class 0 OID 0)
-- Dependencies: 237
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 58, true);


--
-- TOC entry 6095 (class 0 OID 0)
-- Dependencies: 239
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- TOC entry 6096 (class 0 OID 0)
-- Dependencies: 229
-- Name: request_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.request_images_id_seq', 12, true);


--
-- TOC entry 6097 (class 0 OID 0)
-- Dependencies: 231
-- Name: rescue_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rescue_assignments_id_seq', 19, true);


--
-- TOC entry 6098 (class 0 OID 0)
-- Dependencies: 227
-- Name: rescue_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rescue_requests_id_seq', 54, true);


--
-- TOC entry 6099 (class 0 OID 0)
-- Dependencies: 225
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 16, true);


--
-- TOC entry 5881 (class 2606 OID 20014)
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- TOC entry 5879 (class 2606 OID 19995)
-- Name: location_history location_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_history
    ADD CONSTRAINT location_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5892 (class 2606 OID 20084)
-- Name: message_images message_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_images
    ADD CONSTRAINT message_images_pkey PRIMARY KEY (id);


--
-- TOC entry 5886 (class 2606 OID 20043)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 5890 (class 2606 OID 20067)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5871 (class 2606 OID 19957)
-- Name: request_images request_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_images
    ADD CONSTRAINT request_images_pkey PRIMARY KEY (id);


--
-- TOC entry 5874 (class 2606 OID 19972)
-- Name: rescue_assignments rescue_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments
    ADD CONSTRAINT rescue_assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 5876 (class 2606 OID 19974)
-- Name: rescue_assignments rescue_assignments_request_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments
    ADD CONSTRAINT rescue_assignments_request_id_key UNIQUE (request_id);


--
-- TOC entry 5869 (class 2606 OID 19940)
-- Name: rescue_requests rescue_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_requests
    ADD CONSTRAINT rescue_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 5860 (class 2606 OID 19923)
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- TOC entry 5862 (class 2606 OID 19919)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5864 (class 2606 OID 19921)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5872 (class 1259 OID 20102)
-- Name: idx_assignments_rescuer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignments_rescuer ON public.rescue_assignments USING btree (rescuer_id);


--
-- TOC entry 5877 (class 1259 OID 20099)
-- Name: idx_location_history; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_location_history ON public.location_history USING gist (location);


--
-- TOC entry 5883 (class 1259 OID 20103)
-- Name: idx_messages_conversation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_conversation ON public.messages USING btree (conversation_id);


--
-- TOC entry 5884 (class 1259 OID 20106)
-- Name: idx_messages_sender; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_sender ON public.messages USING btree (sender_id);


--
-- TOC entry 5887 (class 1259 OID 20105)
-- Name: idx_notifications_unread; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_unread ON public.notifications USING btree (user_id, is_read);


--
-- TOC entry 5888 (class 1259 OID 20104)
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);


--
-- TOC entry 5865 (class 1259 OID 20098)
-- Name: idx_requests_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requests_location ON public.rescue_requests USING gist (location);


--
-- TOC entry 5866 (class 1259 OID 20100)
-- Name: idx_requests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requests_status ON public.rescue_requests USING btree (status);


--
-- TOC entry 5867 (class 1259 OID 20101)
-- Name: idx_requests_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requests_user_id ON public.rescue_requests USING btree (user_id);


--
-- TOC entry 5855 (class 1259 OID 20097)
-- Name: idx_users_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_location ON public.users USING gist (current_location);


--
-- TOC entry 5856 (class 1259 OID 20094)
-- Name: idx_users_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_phone ON public.users USING btree (phone);


--
-- TOC entry 5857 (class 1259 OID 20096)
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- TOC entry 5858 (class 1259 OID 20095)
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- TOC entry 5882 (class 1259 OID 20109)
-- Name: unique_active_conversation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_active_conversation ON public.conversations USING btree (request_id) WHERE (is_active = true);


--
-- TOC entry 5899 (class 2606 OID 20017)
-- Name: conversations conversations_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.rescue_requests(id) ON DELETE CASCADE;


--
-- TOC entry 5900 (class 2606 OID 20027)
-- Name: conversations conversations_rescuer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_rescuer_id_fkey FOREIGN KEY (rescuer_id) REFERENCES public.users(id);


--
-- TOC entry 5901 (class 2606 OID 20022)
-- Name: conversations conversations_victim_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_victim_id_fkey FOREIGN KEY (victim_id) REFERENCES public.users(id);


--
-- TOC entry 5897 (class 2606 OID 20001)
-- Name: location_history location_history_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_history
    ADD CONSTRAINT location_history_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.rescue_requests(id);


--
-- TOC entry 5898 (class 2606 OID 19996)
-- Name: location_history location_history_rescuer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_history
    ADD CONSTRAINT location_history_rescuer_id_fkey FOREIGN KEY (rescuer_id) REFERENCES public.users(id);


--
-- TOC entry 5905 (class 2606 OID 20085)
-- Name: message_images message_images_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_images
    ADD CONSTRAINT message_images_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- TOC entry 5902 (class 2606 OID 20044)
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- TOC entry 5903 (class 2606 OID 20049)
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- TOC entry 5904 (class 2606 OID 20068)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5894 (class 2606 OID 19958)
-- Name: request_images request_images_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_images
    ADD CONSTRAINT request_images_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.rescue_requests(id) ON DELETE CASCADE;


--
-- TOC entry 5895 (class 2606 OID 19975)
-- Name: rescue_assignments rescue_assignments_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments
    ADD CONSTRAINT rescue_assignments_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.rescue_requests(id);


--
-- TOC entry 5896 (class 2606 OID 19980)
-- Name: rescue_assignments rescue_assignments_rescuer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_assignments
    ADD CONSTRAINT rescue_assignments_rescuer_id_fkey FOREIGN KEY (rescuer_id) REFERENCES public.users(id);


--
-- TOC entry 5893 (class 2606 OID 19941)
-- Name: rescue_requests rescue_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rescue_requests
    ADD CONSTRAINT rescue_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


-- Completed on 2026-05-12 23:41:50

--
-- PostgreSQL database dump complete
--

\unrestrict BQwfqdaf18ohYFMfKurqZM4Mp9bnsPfoytyttQGQZ9sWdvjbKcEYtpfXpsApwAZ

