--
-- PostgreSQL database dump
--

\restrict FC9Qh2UOXtMLwGGeNfaIJw785YtH8XxIo8HehObmoEsnW6QCexUfN7URNY7yWT5

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-13 23:00:48

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
-- TOC entry 6062 (class 0 OID 20204)
-- Dependencies: 225
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversations (id, request_id, victim_id, rescuer_id, created_at, is_active) FROM stdin;
3	47	12	11	2026-05-11 23:05:46.424627	t
4	48	13	11	2026-05-11 23:59:59.654029	t
5	49	14	11	2026-05-12 00:00:02.803265	t
6	50	15	11	2026-05-12 00:00:06.064359	t
7	51	12	11	2026-05-12 00:03:33.152378	t
8	54	14	11	2026-05-12 22:40:03.461328	t
9	56	13	11	2026-05-13 03:19:37.429859	t
10	52	12	11	2026-05-13 03:26:05.330213	t
11	57	13	11	2026-05-13 16:47:02.190212	t
\.


--
-- TOC entry 6064 (class 0 OID 20211)
-- Dependencies: 227
-- Data for Name: location_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.location_history (id, rescuer_id, request_id, location, recorded_at) FROM stdin
21	33	https://res.cloudinary.com/drgq2349s/image/upload/v1778536424/lifeline/rv5bpbo4ajifrkfoj26q.png	2026-05-12 04:53:45.488215
22	52	https://res.cloudinary.com/drgq2349s/image/upload/v1778567683/lifeline/jcn7ynssczp7cemi2d1n.png	2026-05-12 13:34:44.650038
23	55	https://res.cloudinary.com/drgq2349s/image/upload/v1778568289/lifeline/xjhcdtssyf7zj6opxjfz.png	2026-05-12 13:44:50.064556
24	56	https://res.cloudinary.com/drgq2349s/image/upload/v1778568717/lifeline/ujcebfq9atn6atye7eon.jpg	2026-05-12 13:51:58.911377
25	56	https://res.cloudinary.com/drgq2349s/image/upload/v1778568718/lifeline/hyfpbevby87anzq0vk2m.png	2026-05-12 13:51:58.913807
\.


--
-- TOC entry 6068 (class 0 OID 20228)
-- Dependencies: 231
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, conversation_id, sender_id, content, is_read, sent_at, istext) FROM stdin;
64	9	11	helo bro	t	2026-05-13 03:19:48.69942	t
57	7	12	hello	t	2026-05-12 16:13:37.501117	t
65	9	11	aloalo	t	2026-05-13 16:45:19.072318	t
\.


--
-- TOC entry 6070 (class 0 OID 20238)
-- Dependencies: 233
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, title, content, ref_id, is_read, created_at) FROM stdin;
1	13	request_assigned	Yeu cau da duoc tiep nhan	Mot nhan vien cuu ho da nhan yeu cau cua ban. Ban co the trao doi trong khung chat.	57	t	2026-05-13 16:47:02.194468
2	16	new_rescue_request	Co yeu cau cuu ho moi	SOS - Chay - muc do 5	58	f	2026-05-13 18:05:44.834642
3	11	new_rescue_request	Co yeu cau cuu ho moi	SOS - Chay - muc do 5	58	f	2026-05-13 18:05:44.866313
4	16	new_rescue_request	Co yeu cau cuu ho moi	SOS - Khan cap - muc do 5	59	f	2026-05-13 18:06:34.151565
5	11	new_rescue_request	Co yeu cau cuu ho moi	SOS - Khan cap - muc do 5	59	f	2026-05-13 18:06:34.186569
6	12	request_completed	Ca cuu ho da hoan tat	test da duoc danh dau hoan tat.	52	f	2026-05-13 18:19:23.186482
7	13	request_completed	Ca cuu ho da hoan tat	bão to da duoc danh dau hoan tat.	56	t	2026-05-13 18:19:30.383034
8	16	new_rescue_request	Co yeu cau cuu ho moi	SOS - Chay - muc do 5	60	f	2026-05-13 19:16:40.277262
9	11	new_rescue_request	Co yeu cau cuu ho moi	SOS - Chay - muc do 5	60	f	2026-05-13 19:16:40.277372
\.


--
-- TOC entry 6072 (class 0 OID 20248)
-- Dependencies: 235
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
13	55	https://res.cloudinary.com/drgq2349s/image/upload/v1778607620/lifeline/zde1znw9pat2htzn3mpj.jpg	2026-05-13 00:40:20.715845
14	56	https://res.cloudinary.com/drgq2349s/image/upload/v1778617147/lifeline/x3dxwmq2bnodtyfl4hkr.jpg	2026-05-13 03:19:08.93541
15	57	https://res.cloudinary.com/drgq2349s/image/upload/v1778618275/lifeline/cxoa5r1ufhembitrji4w.jpg	2026-05-13 03:37:56.193424
16	57	https://res.cloudinary.com/drgq2349s/image/upload/v1778618268/lifeline/etxhxfxu6vd1axfxknnj.jpg	2026-05-13 03:37:56.193424
\.


--
-- TOC entry 6074 (class 0 OID 20257)
-- Dependencies: 237
-- Data for Name: rescue_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rescue_assignments (id, request_id, rescuer_id, assigned_at, status, finished_at, completion_note, failure_reason, victim_confirmed_at, response_seconds, resolution_seconds) FROM stdin;
13	47	11	2026-05-11 23:05:46.394325	accepted	\N	\N	\N	\N	\N	\N
14	48	11	2026-05-11 23:59:59.630491	accepted	\N	\N	\N	\N	\N	\N
16	50	11	2026-05-12 00:00:06.05973	accepted	\N	\N	\N	\N	\N	\N
17	51	11	2026-05-12 00:03:33.135169	accepted	\N	\N	\N	\N	\N	\N
18	53	11	2026-05-12 22:35:36.062399	accepted	\N	\N	\N	\N	\N	\N
19	54	11	2026-05-12 22:40:03.429445	cancelled	\N	\N	\N	\N	\N	\N
15	49	11	2026-05-12 00:00:02.79541	completed	2026-05-12 23:21:44.251676	\N	\N	\N	\N	\N
20	55	11	2026-05-13 00:41:31.543283	accepted	\N	\N	\N	\N	\N	\N
24	57	11	2026-05-13 16:47:02.120165	accepted	\N	\N	\N	\N	\N	\N
23	52	11	2026-05-13 03:26:05.323286	completed	2026-05-13 18:19:23.164153	Da ho tro xong	\N	\N	\N	53598
22	56	11	2026-05-13 03:19:37.418308	completed	2026-05-13 18:19:30.36654	Da ho tro xong	\N	\N	\N	53993
\.


--
-- TOC entry 6076 (class 0 OID 20264)
-- Dependencies: 239
-- Data for Name: rescue_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rescue_requests (id, user_id, title, description, urgency_level, location, address, status, created_at, updated_at, incident_type, victim_rating, victim_feedback) FROM stdin;
53	14	mới nè	abc	2	0101000020E6100000CC35F266FA725A40483B5B2D9DF83440	đường chiến thắng	assigned	2026-05-12 22:31:30.732184	2026-05-12 22:31:30.732184	\N	\N	\N
51	12	Ngập tại đường Yên Xá	Mưa to gây ngập lụt 	2	0101000020E610000039454772F9725A40A25D85949FF83440	Đường Yên Xá, Thanh Trì, Hà Nội	assigned	2026-05-11 21:10:16.354406	2026-05-11 21:10:16.354406	\N	\N	\N
54	14	đây nhé	đây	1	0101000020E610000081F10C1AFA725A402E95B7239CF83440	đường chiến thắng	pending	2026-05-12 22:39:51.029851	2026-05-12 22:39:51.029851	\N	\N	\N
49	14	Ngập lụt - mức nước nguy hiểm	Khu vực này đang ngập nước sâu khoảng 1.5m do mưa lớn kéo dài. Có người mắc kẹt trên nóc nhà. Cần sơ tán gấp.	5	0101000020E6100000431CEBE236765A40E02D90A0F8013540	789 Đường Trần Hưng Đạo, Hoàn Kiếm, Hà Nội	completed	2026-05-11 21:07:07.501417	2026-05-11 21:07:07.501417	\N	\N	\N
47	12	Cháy nhà dân cư	Nhà số 123 bốc cháy, lửa lớn, khói đen. Có người bị mắc kẹt bên trong. Cần sơ tán gấp các hộ dân xung quanh.	5	0101000020E6100000910F7A36AB765A409EEFA7C64B073540	123 Đường Nguyễn Huệ, Hoàn Kiếm, Hà Nội	assigned	2026-05-11 21:06:08.99996	2026-05-11 21:06:08.99996	\N	\N	\N
48	13	Tai nạn giao thông - xe máy	Có 2 xe máy va chạm giao nhau, 1 người bị thương nặng, máu chảy rất nhiều. Xe tải cũng gây cổ chai giao thông.	5	0101000020E61000000B24287E8C755A40ECC039234A0B3540	456 Đường Lý Thường Kiệt, Hai Bà Trưng, Hà Nội	assigned	2026-05-11 21:06:33.304849	2026-05-11 21:06:33.304849	\N	\N	\N
50	15	Sạt lở đất - nguy hiểm	Bờ sông bắt đầu sạt lở, nhiều nhà dân có nguy cơ rơi xuống. Cần sơ tán dân trong vùng ngay lập tức.	4	0101000020E6100000BE9F1A2FDD745A402B1895D409083540	321 Đường Bà Triệu, Hoàn Kiếm, Hà Nội	assigned	2026-05-11 21:07:07.501417	2026-05-11 21:07:07.501417	\N	\N	\N
55	13	ngập lụt	lũ quét	3	0101000020E6100000FA483ACCEC725A4041582533BAF83440	ở yên xá hà nội	assigned	2026-05-13 00:40:20.715845	2026-05-13 00:40:20.715845	\N	\N	\N
57	13	Tai nạn giao thông	Xe container đâm liên hoàn tại đường Yên Xá	5	0101000020E610000068073ECFEC725A408395A610BEF83440	Yên Xá, Tân Triều, Thanh Trì, Hà Nội	assigned	2026-05-13 03:37:56.193424	2026-05-13 03:37:56.193424	\N	\N	\N
58	13	SOS - Chay	Yeu cau khan cap tao nhanh, se bo sung mo ta sau.	5	0101000020E6100000794DCC72ED725A400CEBCC22B6F83440	Vi tri GPS hien tai	pending	2026-05-13 18:05:44.763103	2026-05-13 18:05:44.763103	\N	\N	\N
59	13	SOS - Khan cap	Yeu cau khan cap tao nhanh, se bo sung mo ta sau.	5	0101000020E610000090434F3FED725A405C14C7D3B7F83440	Vi tri GPS hien tai	pending	2026-05-13 18:06:33.988217	2026-05-13 18:06:33.988217	\N	\N	\N
52	12	test	\N	4	0101000020E610000081F10C1AFA725A402E95B7239CF83440	Đường Yên Xá, Thanh Trì, Hà Nội	completed	2026-05-11 21:12:26.77763	2026-05-11 21:12:26.77763	\N	\N	\N
56	13	bão to	đổ cây	5	0101000020E61000006439F9A2EC725A404364C392BEF83440	việt trì, phú thọ	completed	2026-05-13 03:19:08.93541	2026-05-13 03:19:08.93541	\N	\N	\N
60	13	SOS - Chay	Yeu cau khan cap tao nhanh, se bo sung mo ta sau.	5	0101000020E6100000AE94E637ED725A40FBACF8E0B4F83440	Vi tri GPS hien tai	pending	2026-05-13 19:16:40.272418	2026-05-13 19:16:40.272418	\N	\N	\N
\.


--
-- TOC entry 5824 (class 0 OID 19403)
-- Dependencies: 221
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- TOC entry 6078 (class 0 OID 20278)
-- Dependencies: 241
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, phone, full_name, role, avatar_url, is_active, current_location, created_at, rescuer_skills, vehicle_info, last_seen_at) FROM stdin;
13	victim1	$2b$10$BS8wnXS5kDXlxsdIMd.2iOvnhYonYcDWwm1h.9f68q2MKCpqg3tqe	0964399308	Trần Văn C	victim	\N	t	\N	2026-05-11 20:47:05.409207	{}	\N	\N
15	victim3	$2b$10$BfyNyHqqM7XxenkKAxSgfOe4EnEjc.BvUewtbpEQ5Vfay3ZRcXBnG	0964399304	Đỗ Thị D	victim	\N	t	\N	2026-05-11 20:47:51.553477	{}	\N	\N
14	victim2	$2b$10$VPjn3uMZh.bHU8QFX7OccOwzX/0IeAkrsfw7CjV0QGv39JYyPbez6	0964399300	Nguyễn Văn A	victim	https://res.cloudinary.com/drgq2349s/image/upload/v1778531623/lifeline/ezv2whdhcahtke40yh1y.png	t	\N	2026-05-11 20:47:26.170039	{}	\N	\N
16	rescuer1	$2b$10$BU.r.gMg.S9nmbc6idW2duHvBSbF9SKIotWygOhwSm76ZU8ZaBuF.	01234556	Phạm Thế Quyền	rescuer	\N	t	\N	2026-05-12 19:26:17.179307	{}	\N	\N
12	victim	$2b$10$Kbzkqk1Lie7eE9NM1AwiE.GVTrgHDjHlll7SpRyYtwVW.CSjg2kiC	0964399307	Nguười cần cứu hộ	victim	\N	t	0101000020E610000000000000000024400000000000002440	2026-05-11 20:45:49.334173	{}	\N	\N
17	admin	$2b$10$fgj6Xhn3UjdC.fFUKggLM.J7OBuQs1AHT3jjE7kl/WrOdKvfnFpjO	0900000000	Admin Test	admin	\N	t	\N	2026-05-13 19:20:44.1334	{}	\N	\N
11	rescuer	$2b$10$OwW1QNQbmetriak93FYw6.hoRDqt0GERqKm1QxpLLRq6Fdiazf3qK	0964399302	Nguười cứu hộ	rescuer	\N	t	0101000020E610000010EF6742EF725A40C9D5F31EACF83440	2026-05-11 20:44:28.323928	{}	\N	2026-05-13 21:34:21.028479
\.


--
-- TOC entry 6095 (class 0 OID 0)
-- Dependencies: 226
-- Name: conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conversations_id_seq', 11, true);


--
-- TOC entry 6096 (class 0 OID 0)
-- Dependencies: 228
-- Name: location_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.location_history_id_seq', 3814, true);


--
-- TOC entry 6097 (class 0 OID 0)
-- Dependencies: 230
-- Name: message_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.message_images_id_seq', 25, true);


--
-- TOC entry 6098 (class 0 OID 0)
-- Dependencies: 232
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 65, true);


--
-- TOC entry 6099 (class 0 OID 0)
-- Dependencies: 234
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 9, true);


--
-- TOC entry 6100 (class 0 OID 0)
-- Dependencies: 236
-- Name: request_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.request_images_id_seq', 16, true);


--
-- TOC entry 6101 (class 0 OID 0)
-- Dependencies: 238
-- Name: rescue_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rescue_assignments_id_seq', 24, true);


--
-- TOC entry 6102 (class 0 OID 0)
-- Dependencies: 240
-- Name: rescue_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rescue_requests_id_seq', 60, true);


--
-- TOC entry 6103 (class 0 OID 0)
-- Dependencies: 242
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 17, true);


-- Completed on 2026-05-13 23:00:48

--
-- PostgreSQL database dump complete
--

\unrestrict FC9Qh2UOXtMLwGGeNfaIJw785YtH8XxIo8HehObmoEsnW6QCexUfN7URNY7yWT5

