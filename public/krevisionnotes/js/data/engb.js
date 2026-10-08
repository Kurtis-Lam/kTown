/* IB English B HL - original IB-style notes and practice (Language B guide, first assessment 2020). */
(function () {
  const P1 = "Criterion A: Language (12) · B: Message (12) · C: Conceptual understanding (6) — 30 marks";
  const writeMs = (extra) => [
    "Criterion A - Language (12): varied, accurate vocabulary and complex structures; errors do not obscure meaning.",
    "Criterion B - Message (12): ideas are relevant, developed with detail/examples, and logically organised with cohesive devices.",
    "Criterion C - Conceptual understanding (6): text type, register, tone and conventions fully appropriate to audience, context and purpose.",
  ].concat(extra || []);
  IB.register({
    id: "engb",
    name: "English B HL",
    short: "Eng B HL",
    color: "var(--engb)",
    guide: "IB Language B guide (first assessment 2020)",
    assessment: [
      ["Paper 1 - Productive skills (writing)", "1h 30m", "30 marks", "25%", "One task from a choice of three, each linked to a theme. Choose a text type; 450-600 words."],
      ["Paper 2 - Receptive skills", "2h (1h listening + 1h reading)", "65 marks", "50%", "Listening comprehension on three audio texts; reading comprehension on three written texts."],
      ["Individual oral", "12-15 min (+20 min preparation)", "30 marks", "25%", "Presentation and discussion based on an extract from a literary work studied, followed by a conversation on at least one other theme."],
    ],
    papers: {
      P1: { name: "Paper 1 (writing)", minutes: 90, marks: 30, mix: { extended: 1 } },
      P2: { name: "Paper 2 reading (practice)", minutes: 60, marks: 30, mix: { mcq: 10, short: 8 } },
    },
    commandTerms: [
      ["Audience", "Who will read it? Adjust register (formal/informal), vocabulary and tone."],
      ["Context", "Where/when the text appears (school magazine, local newspaper, NGO website)."],
      ["Purpose", "Why it is written - to inform, persuade, complain, recommend, reflect, entertain."],
      ["Text type", "The genre (article, blog, speech…) - each has recognisable conventions that Criterion C rewards."],
      ["Register", "Level of formality - must stay consistent with the audience."],
      ["Cohesive devices", "Linking words (however, consequently, furthermore) that connect ideas - Criterion B."],
    ],
    topics: [
      {
        id: "engb-1", code: "Theme 1", unit: "Themes", title: "Identities",
        summary: "Lifestyles, health and well-being, beliefs and values, subcultures, language and identity.",
        concepts: [
          { h: "What the theme covers", b: "<p>How people express who they are and how identity is shaped. Possible topics: <strong>lifestyles</strong>, <strong>health and well-being</strong> (mental health, diet, sleep), <strong>beliefs and values</strong>, <strong>subcultures</strong>, <strong>language and identity</strong> (bilingualism, accents, heritage languages), <strong>gender and self-image</strong>.</p>" },
          { h: "Guiding questions", b: "<ul><li>What constitutes an identity?</li><li>How do we express our identity?</li><li>How do language and culture contribute to who we are?</li><li>How does social media shape self-image?</li></ul>" },
          { h: "Useful vocabulary", b: "<p>self-esteem · peer pressure · body image · well-being · cultural heritage · belonging · stereotype · mother tongue · assimilation · to fit in · to stand out · authenticity · burnout · work-life balance</p>" },
        ],
        terms: [["Subculture", "A group within a culture whose beliefs or interests differ from the wider culture."], ["Well-being", "The state of being comfortable, healthy and happy."], ["Stereotype", "A fixed, oversimplified idea about a type of person or group."], ["Heritage language", "A language spoken at home or in a community that differs from the main language of society."]],
        examples: [{ q: "Plan a blog post (450-600 words) for teenagers about the pressure to look perfect on social media.", a: "Title + date + friendly greeting → hook with a personal anecdote → paragraph on filters and comparison (statistic/example) → paragraph on effects on self-esteem → practical tips (numbered) → invitation to comment. Register: informal but thoughtful; rhetorical questions; direct address (\"you\")." }],
        questions: [
          { type: "extended", paper: "P1", marks: 30, diff: 2, q: "<strong>Identities.</strong> Your school wants to support students who speak a different language at home. Write a <strong>speech</strong> to be delivered at a school assembly explaining why heritage languages matter and what the school could do. (450-600 words)", ms: writeMs(["Speech conventions: greeting the audience, rhetorical questions, direct address, signposting, memorable ending/thanks.", "Explains why heritage languages matter (identity, family, cognitive/career benefits) and proposes concrete school actions."]) },
          { type: "extended", paper: "P1", marks: 30, diff: 2, q: "<strong>Identities.</strong> You have noticed many students sleep too little because of their phones. Write an <strong>article</strong> for the school magazine on the link between sleep, screens and well-being. (450-600 words)", ms: writeMs(["Article conventions: catchy headline, by-line, subheadings, engaging opening, conclusion.", "Developed explanation of causes and effects with specific suggestions."]) },
          { type: "mcq", paper: "P2", marks: 1, diff: 1, q: "Choose the word closest in meaning to <em>belonging</em>: \"Clubs gave her a sense of <em>belonging</em>.\"", options: ["ownership", "acceptance as part of a group", "independence", "competition"], answer: 1, ms: ["Belonging = feeling accepted as a member of a group."] },
          { type: "mcq", paper: "P2", marks: 1, diff: 2, q: "Which sentence is the most appropriate register for a formal letter to a headteacher?", options: ["Hey! Gotta tell you something.", "I am writing to express my concern about…", "So, like, the thing is…", "Yo, quick question about…"], answer: 1, ms: ["Formal register: complete sentences, no slang."] },
          { type: "short", paper: "P2", marks: 3, diff: 2, q: "<strong>Read the text.</strong><blockquote>\"When I moved to London at twelve, I stopped speaking Cantonese outside the house. I wanted to sound like everyone else. It took me ten years — and one long phone call with my grandmother — to realise what I had lost.\"</blockquote>(a) Why did the writer stop speaking Cantonese? [1] (b) Which phrase shows regret? [1] (c) What made the writer change their mind? [1]", ms: ["(a) She/he wanted to sound like everyone else / to fit in", "(b) \"what I had lost\"", "(c) a (long) phone call with her/his grandmother"] },
        ],
      },
      {
        id: "engb-2", code: "Theme 2", unit: "Themes", title: "Experiences",
        summary: "Leisure, holidays and travel, life stories, rites of passage, customs and traditions, migration.",
        concepts: [
          { h: "What the theme covers", b: "<p>Stories and events that shape our lives: <strong>leisure activities</strong>, <strong>holidays and travel</strong> (tourism, gap years), <strong>life stories</strong>, <strong>rites of passage</strong> (graduation, coming of age), <strong>customs and traditions</strong>, <strong>migration</strong>.</p>" },
          { h: "Guiding questions", b: "<ul><li>How does our past shape our present and future?</li><li>How and why do different cultures mark important moments in life?</li><li>How would our lives be different if we lived in another culture?</li></ul>" },
          { h: "Useful vocabulary", b: "<p>milestone · coming of age · nostalgia · broaden one's horizons · culture shock · homesick · eye-opening · overtourism · to settle in · tradition passed down · unforgettable · life-changing</p>" },
        ],
        terms: [["Rite of passage", "A ceremony or event marking an important stage in someone's life."], ["Culture shock", "Feelings of confusion when experiencing an unfamiliar culture."], ["Overtourism", "Too many tourists visiting a place, harming residents and the environment."]],
        examples: [{ q: "Plan a diary entry about your first week living in a new country.", a: "Date and 'Dear diary' → vivid opening moment → feelings (homesick, excited) with sensory detail → a misunderstanding (culture shock) → reflection on what you learned → hope for next week. Register: personal, emotive, first person, past tense with reflective present." }],
        questions: [
          { type: "extended", paper: "P1", marks: 30, diff: 2, q: "<strong>Experiences.</strong> You recently took part in a traditional festival in another country. Write a <strong>travel blog</strong> post describing the experience and what it taught you about the culture. (450-600 words)", ms: writeMs(["Blog conventions: title, date, informal-engaging voice, direct address, photos/captions referenced, invitation to comment.", "Vivid description + reflection on cultural insight."]) },
          { type: "extended", paper: "P1", marks: 30, diff: 3, q: "<strong>Experiences.</strong> Your town is suffering from overtourism. Write a <strong>letter to the editor</strong> of the local newspaper proposing ways to balance tourism with residents' quality of life. (450-600 words)", ms: writeMs(["Formal letter: addresses the editor, states purpose early, formal register, polite closing (Yours faithfully), name.", "Clear problem → impact → realistic proposals."]) },
          { type: "mcq", paper: "P2", marks: 1, diff: 1, q: "\"The trip was <em>eye-opening</em>.\" This means the trip was:", options: ["tiring", "surprising and taught new things", "boring", "expensive"], answer: 1, ms: ["Eye-opening = revealing new information or perspectives."] },
          { type: "short", paper: "P2", marks: 2, diff: 2, q: "<strong>Read the text.</strong><blockquote>\"In my village, turning sixteen means one thing: the first harvest you lead alone. Nobody congratulates you on your birthday; they congratulate you when the last basket is full.\"</blockquote>(a) What does turning sixteen mean in the village? [1] (b) When do people congratulate the young person? [1]", ms: ["(a) Leading the (first) harvest alone", "(b) When the last basket is full / the harvest is finished"] },
        ],
      },
      {
        id: "engb-3", code: "Theme 3", unit: "Themes", title: "Human ingenuity",
        summary: "Entertainment, artistic expression, communication and media, technology and scientific innovation.",
        concepts: [
          { h: "What the theme covers", b: "<p>How human creativity and innovation affect the world: <strong>entertainment</strong>, <strong>artistic expressions</strong>, <strong>communication and media</strong> (fake news, influencers), <strong>technology</strong> (AI, smartphones, automation), <strong>scientific innovation</strong> (medicine, space).</p>" },
          { h: "Guiding questions", b: "<ul><li>How do developments in science and technology influence our lives?</li><li>How do the arts help us understand the world?</li><li>What can we learn about a culture through its artistic expression?</li><li>How do the media change the way we relate to each other?</li></ul>" },
          { h: "Useful vocabulary", b: "<p>breakthrough · cutting-edge · artificial intelligence · misinformation · digital literacy · algorithm · privacy · innovation · double-edged sword · to revolutionise · ethical dilemma</p>" },
        ],
        terms: [["Misinformation", "False or inaccurate information, whether or not it is intended to deceive."], ["Digital literacy", "The ability to find, evaluate and communicate information using digital technologies."], ["Double-edged sword", "Something with both advantages and disadvantages."]],
        examples: [{ q: "Plan a debate speech: 'AI will do more harm than good in schools.'", a: "Greeting → state position clearly → argument 1 (cheating and loss of skills) with example → argument 2 (bias/privacy) → rebut the opposing view (personalised learning) → call to action. Use rhetorical questions, tricolon, signposting (Firstly… Moreover… Finally…)." }],
        questions: [
          { type: "extended", paper: "P1", marks: 30, diff: 3, q: "<strong>Human ingenuity.</strong> Your school is considering banning AI chatbots for homework. Write an <strong>opinion column</strong> for the school newspaper arguing for or against the ban. (450-600 words)", ms: writeMs(["Column/opinion article: headline, by-line, clear stance, persuasive devices, counter-argument addressed, strong conclusion.", "Balanced reasoning with examples; consistent semi-formal register."]) },
          { type: "extended", paper: "P1", marks: 30, diff: 2, q: "<strong>Human ingenuity.</strong> Write a <strong>review</strong> of a film, series or exhibition that made you think about technology. (450-600 words)", ms: writeMs(["Review conventions: title, details of the work, summary without spoilers, evaluation of strengths/weaknesses, rating/recommendation.", "Personal evaluative voice supported by specific examples."]) },
          { type: "mcq", paper: "P2", marks: 1, diff: 2, q: "Which linking word best completes: \"The app is free; ___, it collects a great deal of personal data.\"", options: ["therefore", "however", "for example", "similarly"], answer: 1, ms: ["Contrast is needed: however."] },
          { type: "short", paper: "P2", marks: 3, diff: 2, q: "<strong>Read the text.</strong><blockquote>\"The algorithm doesn't care whether a video is true. It cares whether you keep watching. And outrage, unfortunately, keeps us watching for longer than facts do.\"</blockquote>(a) What does the algorithm care about? [1] (b) According to the writer, why does false content spread? [1] (c) Find a word that means 'anger'. [1]", ms: ["(a) Whether you keep watching / watch time", "(b) Outrage keeps people watching longer than facts", "(c) outrage"] },
        ],
      },
      {
        id: "engb-4", code: "Theme 4", unit: "Themes", title: "Social organization",
        summary: "Social relationships, community, social engagement, education, the working world, law and order.",
        concepts: [
          { h: "What the theme covers", b: "<p>How groups organise themselves: <strong>social relationships</strong> (family, friendship), <strong>community</strong>, <strong>social engagement</strong> (volunteering, activism), <strong>education</strong>, <strong>the working world</strong> (remote work, gig economy, youth unemployment), <strong>law and order</strong>.</p>" },
          { h: "Guiding questions", b: "<ul><li>What is the individual's role in the community?</li><li>What role do rules and regulations play in society?</li><li>What is the role of language in social relationships?</li></ul>" },
          { h: "Useful vocabulary", b: "<p>community spirit · volunteer · civic duty · peer · generation gap · work experience · gig economy · remote working · inequality · to raise awareness · to make a difference · grassroots</p>" },
        ],
        terms: [["Civic duty", "Responsibilities of a citizen, such as voting or helping the community."], ["Gig economy", "A labour market of short-term, freelance or flexible jobs."], ["Grassroots", "Organised by ordinary people at a local level."]],
        examples: [{ q: "Plan a proposal to the student council for a peer-tutoring scheme.", a: "Title + To/From/Date/Subject → introduction (purpose) → background (the problem, data from a survey) → proposal details (who, when, how) under headings → benefits → budget/resources → conclusion and request for approval. Formal, objective, headings and bullet points." }],
        questions: [
          { type: "extended", paper: "P1", marks: 30, diff: 2, q: "<strong>Social organization.</strong> Your school wants to make community service compulsory. Write a <strong>proposal</strong> to the principal recommending how the programme should be organised. (450-600 words)", ms: writeMs(["Proposal conventions: title, To/From/Date/Subject, headings, objective tone, recommendations, conclusion.", "Specific, practical recommendations with justification."]) },
          { type: "extended", paper: "P1", marks: 30, diff: 2, q: "<strong>Social organization.</strong> Write an <strong>interview</strong> for a youth magazine with a young person who started a local volunteering project. (450-600 words)", ms: writeMs(["Interview conventions: introduction to the interviewee, Q&A format with names/initials, natural spoken register, closing remarks.", "Questions that draw out motivation, challenges and advice."]) },
          { type: "mcq", paper: "P2", marks: 1, diff: 2, q: "Choose the correct form: \"If I ___ more time, I would volunteer at the shelter.\"", options: ["have", "had", "will have", "would have"], answer: 1, ms: ["Second conditional: If + past simple, would + infinitive."] },
          { type: "short", paper: "P2", marks: 2, diff: 2, q: "<strong>Read the text.</strong><blockquote>\"Remote work saved me two hours of commuting a day. What nobody warned me about was the silence — no colleague to ask a quick question, no chat by the coffee machine.\"</blockquote>(a) What advantage of remote work is mentioned? [1] (b) What disadvantage surprised the writer? [1]", ms: ["(a) Saved two hours of commuting a day", "(b) Silence / isolation - no colleagues to talk to"] },
        ],
      },
      {
        id: "engb-5", code: "Theme 5", unit: "Themes", title: "Sharing the planet",
        summary: "The environment, human rights, peace and conflict, equality, globalization, ethics, urban and rural environments.",
        concepts: [
          { h: "What the theme covers", b: "<p>Challenges and opportunities facing individuals and communities worldwide: <strong>the environment</strong> (climate change, plastic, sustainability), <strong>human rights</strong>, <strong>peace and conflict</strong>, <strong>equality</strong>, <strong>globalization</strong>, <strong>ethics</strong>, <strong>urban and rural environment</strong>.</p>" },
          { h: "Guiding questions", b: "<ul><li>What environmental and social issues present challenges to the world?</li><li>How can these challenges be overcome?</li><li>What ethical issues arise from living in our globalized world?</li></ul>" },
          { h: "Useful vocabulary", b: "<p>sustainability · carbon footprint · biodiversity · fast fashion · fair trade · refugee · inequality · to tackle · to raise awareness · single-use plastic · climate anxiety · grassroots campaign</p>" },
        ],
        terms: [["Sustainability", "Meeting present needs without compromising future generations."], ["Carbon footprint", "The total greenhouse gas emissions caused by a person, product or organisation."], ["Fast fashion", "Cheap clothing produced quickly in response to trends, often with high environmental costs."]],
        examples: [{ q: "Plan a leaflet/brochure for an environmental campaign.", a: "Catchy title and slogan → short sections under headings (The problem / Why it matters / What you can do) → bullet points and facts → call to action with contact details. Concise, persuasive, imperative verbs (\"Bring your own bottle\")." }],
        questions: [
          { type: "extended", paper: "P1", marks: 30, diff: 2, q: "<strong>Sharing the planet.</strong> Write a <strong>speech</strong> for a youth climate conference persuading young people that individual actions still matter. (450-600 words)", ms: writeMs(["Speech conventions: greeting, rhetorical questions, inclusive pronouns, repetition/tricolon, call to action, thanks.", "Persuasive argument with concrete examples."]) },
          { type: "extended", paper: "P1", marks: 30, diff: 3, q: "<strong>Sharing the planet.</strong> Write a <strong>report</strong> for your school's environment committee on how much single-use plastic the cafeteria uses, with recommendations. (450-600 words)", ms: writeMs(["Report conventions: title, introduction/purpose, method/findings under headings, data, conclusions, recommendations; impersonal objective register.", "Findings logically linked to recommendations."]) },
          { type: "mcq", paper: "P2", marks: 1, diff: 1, q: "\"Fast fashion\" refers to:", options: ["Clothes for sport", "Cheap clothing made quickly to follow trends", "Second-hand clothing", "Designer clothing"], answer: 1, ms: ["Cheap, quickly produced trend clothing."] },
          { type: "short", paper: "P2", marks: 3, diff: 2, q: "<strong>Read the text.</strong><blockquote>\"Every minute, the equivalent of one rubbish truck of plastic enters the ocean. Yet the solution is not only bigger clean-ups; it is designing products that never become waste in the first place.\"</blockquote>(a) How much plastic enters the ocean every minute? [1] (b) What does the writer think is the real solution? [1] (c) Which word shows a contrast with the previous sentence? [1]", ms: ["(a) The equivalent of one rubbish truck", "(b) Designing products that never become waste", "(c) Yet"] },
        ],
      },
      {
        id: "engb-6", code: "Text types 1", unit: "Text types (Paper 1)", title: "Personal & professional texts",
        summary: "Formats and conventions of letters, emails, diary entries, proposals and reports - the conventions Criterion C rewards.",
        concepts: [
          { h: "Personal texts", b: "<table><tr><th>Text type</th><th>Must include</th></tr><tr><td>Informal letter / email</td><td>Greeting (Dear Sam / Hi Sam), friendly register, contractions, personal questions, sign-off (Best wishes / Love)</td></tr><tr><td>Diary / journal</td><td>Date, 'Dear diary' (optional), first person, emotions, reflection, past tense + reflective present</td></tr><tr><td>Blog</td><td>Title, date, author, direct address, informal-engaging voice, subheadings, invitation to comment</td></tr></table>" },
          { h: "Professional texts", b: "<table><tr><th>Text type</th><th>Must include</th></tr><tr><td>Formal letter</td><td>Addresses/date, Dear Sir or Madam (→ Yours faithfully) / Dear Mr X (→ Yours sincerely), purpose in paragraph 1, formal register, no contractions</td></tr><tr><td>Formal email</td><td>Subject line, formal greeting, clear purpose, polite request, closing and name</td></tr><tr><td>Proposal</td><td>Title, To/From/Date/Subject, headings (Introduction, Background, Proposal, Benefits, Conclusion), recommendations</td></tr><tr><td>Report</td><td>Title, purpose, findings under headings, data, conclusions, recommendations, impersonal register</td></tr></table>" },
        ],
        terms: [["Register", "The level of formality in language, chosen to suit the audience and purpose."], ["Conventions", "The expected features of a text type (layout, structure, style)."], ["Yours faithfully", "Formal closing used when you don't know the recipient's name (Dear Sir/Madam)."]],
        examples: [{ q: "What is the correct closing for a letter that begins 'Dear Ms Chan'?", a: "Yours sincerely - you know the recipient's name. Use 'Yours faithfully' after 'Dear Sir or Madam'." }],
        questions: [
          { type: "mcq", paper: "P2", marks: 1, diff: 1, q: "A formal letter beginning 'Dear Sir or Madam' should end with:", options: ["Yours sincerely", "Yours faithfully", "Cheers", "Best"], answer: 1, ms: ["Unknown recipient → Yours faithfully."] },
          { type: "mcq", paper: "P2", marks: 1, diff: 2, q: "Which feature is expected in a report but NOT usually in a blog?", options: ["Personal anecdotes", "Headings with findings and recommendations", "Direct address to readers", "A catchy title"], answer: 1, ms: ["Reports present findings and recommendations under headings."] },
          { type: "mcq", paper: "P2", marks: 1, diff: 2, q: "Which opening sentence suits a formal complaint email?", options: ["I'm super annoyed!!!", "I am writing to complain about the service I received on 4 May.", "Guess what happened to me?", "Hey there, quick rant."], answer: 1, ms: ["States purpose clearly in a formal register."] },
          { type: "short", paper: "P2", marks: 3, diff: 2, q: "List three conventions of a proposal.", ms: ["To/From/Date/Subject heading (or title)", "Headings for sections (introduction, background, proposal, benefits)", "Recommendations / formal objective register / conclusion with request"] },
          { type: "extended", paper: "P1", marks: 30, diff: 2, q: "Write a <strong>formal email</strong> to the manager of a local sports centre requesting reduced prices for students and explaining the benefits for the centre. (450-600 words)", ms: writeMs(["Email conventions: subject line, formal greeting and closing, clear purpose, polite request.", "Persuasive justification with benefits for both sides."]) },
        ],
      },
      {
        id: "engb-7", code: "Text types 2", unit: "Text types (Paper 1)", title: "Mass media texts",
        summary: "Articles, speeches, reviews, interviews, opinion columns, brochures and leaflets - structure and persuasive devices.",
        concepts: [
          { h: "Mass media conventions", b: "<table><tr><th>Text type</th><th>Must include</th></tr><tr><td>Article</td><td>Headline, (sub-headline), by-line, engaging lead paragraph, subheadings, quotes/facts, conclusion</td></tr><tr><td>Opinion column / editorial</td><td>Headline, clear stance, persuasive devices, counter-argument, strong ending</td></tr><tr><td>Speech</td><td>Greeting the audience, signposting, rhetorical questions, direct address, repetition, call to action, thanks</td></tr><tr><td>Review</td><td>Title, details of the work, brief summary (no spoilers), evaluation, rating/recommendation</td></tr><tr><td>Interview</td><td>Introduction of interviewee, Q&A format with names, natural spoken style, closing</td></tr><tr><td>Brochure / leaflet</td><td>Title/slogan, headings, short sections, bullet points, contact details, call to action</td></tr></table>" },
          { h: "Persuasive devices (AFOREST)", b: "<p><strong>A</strong>lliteration · <strong>F</strong>acts · <strong>O</strong>pinions · <strong>R</strong>hetorical questions · <strong>E</strong>motive language · <strong>S</strong>tatistics · <strong>T</strong>riples (tricolon). Also: direct address (\"you\"), inclusive pronouns (\"we\"), anecdotes, expert quotes, counter-argument and rebuttal.</p>" },
        ],
        terms: [["By-line", "The line naming the writer of an article."], ["Tricolon", "A list of three for emphasis (e.g. 'reduce, reuse, recycle')."], ["Rhetorical question", "A question asked for effect, not expecting an answer."]],
        examples: [{ q: "Give three features that would make a speech recognisable to an examiner.", a: "Greeting the audience ('Good morning, fellow students'), direct address and rhetorical questions ('Have you ever wondered…?'), and a closing call to action with thanks ('Thank you for listening')." }],
        questions: [
          { type: "mcq", paper: "P2", marks: 1, diff: 1, q: "\"Reduce, reuse, recycle\" is an example of:", options: ["a rhetorical question", "a tricolon", "a statistic", "an anecdote"], answer: 1, ms: ["A list of three = tricolon."] },
          { type: "mcq", paper: "P2", marks: 1, diff: 2, q: "Which element belongs in a review but not in a news report?", options: ["Headline", "Rating or recommendation", "By-line", "Paragraphs"], answer: 1, ms: ["Reviews evaluate and recommend."] },
          { type: "short", paper: "P2", marks: 2, diff: 1, q: "Explain the purpose of a by-line in an article.", ms: ["It names the writer", "adds credibility / tells readers who is responsible for the text"] },
          { type: "extended", paper: "P1", marks: 30, diff: 2, q: "Write an <strong>article</strong> for a teen magazine titled 'Why every teenager should learn to cook'. (450-600 words)", ms: writeMs(["Article conventions: headline, by-line, lead paragraph, subheadings, conclusion.", "Developed reasons (health, independence, budget, culture) with examples."]) },
          { type: "extended", paper: "P1", marks: 30, diff: 3, q: "Write a <strong>brochure</strong> for a new youth centre in your town, encouraging teenagers to join its activities. (450-600 words)", ms: writeMs(["Brochure conventions: title/slogan, headings, short sections, bullet points, practical details, call to action.", "Persuasive and informative content suited to teenagers."]) },
        ],
      },
      {
        id: "engb-8", code: "Paper 1", unit: "Exam skills", title: "Paper 1 writing skills & criteria",
        summary: "How to choose a task, plan in 10 minutes, hit all three criteria and manage 450-600 words.",
        concepts: [
          { h: "Choosing and planning (first 10 minutes)", b: "<ol><li>Read all three tasks; choose the one where you have <strong>ideas AND know the text type</strong>.</li><li>Underline <strong>audience, context, purpose, text type</strong>.</li><li>Plan: 4-6 paragraphs, one main idea each, with an example.</li><li>List 5-6 ambitious vocabulary items and 3 complex structures to use.</li></ol>" },
          { h: "The three criteria", b: "<table><tr><th>Criterion</th><th>Marks</th><th>How to score highly</th></tr><tr><td>A: Language</td><td>12</td><td>Varied, idiomatic vocabulary; complex structures (conditionals, passives, relative clauses); accuracy</td></tr><tr><td>B: Message</td><td>12</td><td>Relevant, developed ideas with examples; clear paragraphs; cohesive devices</td></tr><tr><td>C: Conceptual understanding</td><td>6</td><td>Correct text type conventions; consistent register and tone; clear sense of audience and purpose</td></tr></table>" },
        ],
        terms: [["Cohesive devices", "Words and phrases that link ideas: furthermore, in contrast, as a result."], ["Complex structure", "Sentences using subordinate clauses, conditionals, passive voice, inversion, etc."]],
        examples: [{ q: "Upgrade: 'Social media is bad because people feel sad.'", a: "'Although social media connects us, constant comparison with carefully filtered lives can quietly erode teenagers' self-esteem.' (concession + precise vocabulary + complex structure)" }],
        questions: [
          { type: "mcq", paper: "P2", marks: 1, diff: 2, q: "Which sentence shows the most complex structure?", options: ["I like music.", "Music is good and I like it.", "Had I known about the concert, I would have bought tickets earlier.", "I went to a concert."], answer: 2, ms: ["Inverted third conditional = complex structure."] },
          { type: "short", paper: "P2", marks: 3, diff: 2, q: "Name the three Paper 1 assessment criteria and their maximum marks.", ms: ["A Language - 12", "B Message - 12", "C Conceptual understanding - 6"] },
          { type: "short", paper: "P2", marks: 3, diff: 3, q: "Rewrite this sentence in a more sophisticated way: \"Many people think tourism is good but it makes problems.\"", ms: ["Uses a concession / contrast structure (although, while)", "More precise vocabulary (e.g. 'brings economic benefits', 'places pressure on')", "Accurate grammar; meaning preserved"] },
        ],
      },
      {
        id: "engb-9", code: "Paper 2", unit: "Exam skills", title: "Reading and listening strategies",
        summary: "Question types in Paper 2 and how to answer each: true/false with justification, gap fill, matching, short answers.",
        concepts: [
          { h: "Reading question types", b: "<ul><li><strong>True/false + justification</strong>: both parts needed - quote the shortest exact words that prove it.</li><li><strong>Short answer</strong>: answer briefly; lifting words from the text is fine if they answer exactly.</li><li><strong>Gap fill / sentence completion</strong>: answer must fit grammatically.</li><li><strong>Matching headings / synonyms</strong>: check word class and context.</li><li><strong>Who/what/to whom does 'it' refer?</strong>: find the noun the pronoun replaces.</li></ul>" },
          { h: "Listening tips", b: "<p>Use reading time to predict answers and underline keywords. Answers come in order. Write short answers in note form; spelling mistakes are usually accepted if the meaning is clear. Use the second listening to check and fill gaps.</p>" },
        ],
        terms: [["Justification", "The exact words from the text that prove a true/false answer."], ["Lifting", "Copying words directly from the text - fine when they answer the question precisely."]],
        examples: [{ q: "'The writer prefers city life.' True or false? Text: 'I miss the noise, the crowds and the late-night buses.'", a: "True - justification: 'I miss the noise, the crowds and the late-night buses'. Both parts needed for the mark." }],
        questions: [
          { type: "short", paper: "P2", marks: 2, diff: 2, q: "<strong>Read the text.</strong><blockquote>\"Most visitors come for the beaches, but locals will tell you the real treasure is the market that opens at 5 a.m., long before the tourists wake up.\"</blockquote>True or false: <em>Tourists usually visit the early market.</em> Justify your answer with words from the text.", ms: ["False", "\"long before the tourists wake up\""] },
          { type: "short", paper: "P2", marks: 1, diff: 2, q: "<strong>Read the text.</strong><blockquote>\"The museum reopened in May. It now has a rooftop garden and free entry for students.\"</blockquote>What does 'It' refer to?", ms: ["The museum"] },
          { type: "mcq", paper: "P2", marks: 1, diff: 1, q: "In a true/false question, how many parts must be correct to score the mark?", options: ["Only true or false", "Only the justification", "Both the answer and the justification", "Neither - it's marked holistically"], answer: 2, ms: ["Both are required."] },
        ],
      },
      {
        id: "engb-10", code: "IO (HL)", unit: "Exam skills", title: "Literature and the individual oral",
        summary: "How the HL individual oral works: presenting a literary extract, linking to a theme, and the general conversation.",
        concepts: [
          { h: "Structure of the HL IO", b: "<ol><li><strong>Preparation (20 min)</strong>: read a literary extract (~300 words) from a work studied; make up to 10 bullet points of notes.</li><li><strong>Presentation (3-4 min)</strong>: context of the extract, what happens, themes, characters, language and how it links to a theme of the course.</li><li><strong>Follow-up discussion (4-5 min)</strong> on the extract.</li><li><strong>General conversation (5-6 min)</strong> on at least one additional theme.</li></ol>" },
          { h: "Criteria", b: "<table><tr><th>Criterion</th><th>Marks</th></tr><tr><td>A: Language</td><td>12</td></tr><tr><td>B1: Message - literary extract</td><td>6</td></tr><tr><td>B2: Message - conversation</td><td>6</td></tr><tr><td>C: Interactive skills - communication</td><td>6</td></tr></table>" },
          { h: "Useful phrases", b: "<p>\"This extract is taken from… and it takes place just after…\" · \"The writer uses imagery to convey…\" · \"This links to the theme of Identities because…\" · \"That's an interesting question; I'd say…\" · \"Could you rephrase that, please?\"</p>" },
        ],
        terms: [["Literary extract", "A short passage (~300 words) from a literary work studied in class."], ["Interactive skills", "Ability to understand questions, respond naturally and keep the conversation going."]],
        examples: [{ q: "Give a model opening for an IO presentation.", a: "\"The extract I've chosen is from chapter 3 of the novel, where the narrator arrives in the city for the first time. I'll talk about how the writer uses contrast to show her sense of displacement, and how this links to the theme of Experiences, particularly migration.\"" }],
        questions: [
          { type: "short", paper: "IO", marks: 4, diff: 2, q: "List the four parts of the HL individual oral in order, with approximate timings.", ms: ["Preparation - 20 minutes", "Presentation on the literary extract - 3-4 minutes", "Discussion of the extract - 4-5 minutes", "General conversation on another theme - 5-6 minutes"] },
          { type: "extended", paper: "IO", marks: 30, diff: 3, q: "<strong>IO practice.</strong> Using a literary work you have studied, write the bullet-point notes you would make for a 4-minute presentation on an extract and its link to one course theme.", ms: ["Context of the extract within the work", "Summary of the key events/ideas of the extract", "Analysis of language/literary techniques with examples", "Clear link to a named course theme", "Personal response / interpretation", "Notes are concise (max 10 bullet points)"] },
          { type: "mcq", paper: "IO", marks: 1, diff: 1, q: "How many bullet points of notes may you take into the HL IO?", options: ["None", "Up to 5", "Up to 10", "Unlimited"], answer: 2, ms: ["Up to 10 bullet points."] },
        ],
      },
      {
        id: "engb-11", code: "Language", unit: "Exam skills", title: "Grammar and vocabulary for accuracy",
        summary: "High-value grammar for Criterion A: tenses, conditionals, passive voice, relative clauses, inversion and common errors.",
        concepts: [
          { h: "Structures that impress", b: "<ul><li><strong>Conditionals</strong>: second (If I were…, I would…), third (If I had known…, I would have…), mixed.</li><li><strong>Passive voice</strong> for formal texts: \"The survey was carried out by…\"</li><li><strong>Relative clauses</strong>: \"The students, who had volunteered all year, …\"</li><li><strong>Inversion</strong>: \"Not only does it save money, but it also…\" · \"Rarely have we seen…\"</li><li><strong>Modal verbs for recommendations</strong>: should, ought to, it is essential that…</li></ul>" },
          { h: "Common errors", b: "<table><tr><th>Wrong</th><th>Right</th></tr><tr><td>I am agree</td><td>I agree</td></tr><tr><td>He don't</td><td>He doesn't</td></tr><tr><td>informations / advices</td><td>information / advice (uncountable)</td></tr><tr><td>people is</td><td>people are</td></tr><tr><td>Since 3 years</td><td>For 3 years</td></tr><tr><td>Despite of</td><td>Despite / In spite of</td></tr></table>" },
        ],
        terms: [["Inversion", "Reversing the normal subject-verb order for emphasis, e.g. 'Never have I seen…'."], ["Uncountable noun", "A noun with no plural form, e.g. information, advice, equipment."]],
        examples: [{ q: "Correct: 'I am agree that peoples needs more informations.'", a: "'I agree that people need more information.'" }],
        questions: [
          { type: "mcq", paper: "P2", marks: 1, diff: 1, q: "Choose the correct sentence.", options: ["She gave me many advices.", "She gave me some advice.", "She gave me an advices.", "She gave me advices."], answer: 1, ms: ["Advice is uncountable."] },
          { type: "mcq", paper: "P2", marks: 1, diff: 2, q: "Choose the correct form: \"If they ___ the warning, the accident would not have happened.\"", options: ["heeded", "had heeded", "would heed", "have heeded"], answer: 1, ms: ["Third conditional: If + past perfect, would have + past participle."] },
          { type: "mcq", paper: "P2", marks: 1, diff: 2, q: "Which sentence uses inversion correctly?", options: ["Never I have seen such a crowd.", "Never have I seen such a crowd.", "Never have seen I such a crowd.", "I never have seen such a crowd."], answer: 1, ms: ["Negative adverbial + auxiliary + subject."] },
          { type: "mcq", paper: "P2", marks: 1, diff: 1, q: "Choose the correct preposition: \"I have lived here ___ 2019.\"", options: ["for", "since", "from", "during"], answer: 1, ms: ["since + point in time."] },
          { type: "short", paper: "P2", marks: 2, diff: 2, q: "Rewrite in the passive voice: \"The committee will announce the results tomorrow.\"", ms: ["The results will be announced", "(by the committee) tomorrow."] },
        ],
      },
    ],
  });
})();
