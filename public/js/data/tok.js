/* Original Theory of Knowledge course notes and assessment practice. */
(function () {
  const makeTopic = (code, unit, title, summary, concepts, questions, terms) => ({
    id: `tok-${code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    code, unit, title, summary, concepts, questions, terms,
    methods: ["Move from a specific real-life situation to a focused knowledge question, then compare perspectives and explain why the difference matters."],
    traps: ["Do not treat an example as proof by itself; explain how it supports or challenges a knowledge claim.", "Avoid broad claims about whole areas of knowledge or cultures without qualification."],
    tips: ["Use precise examples and make the link to the knowledge question explicit in every paragraph."],
    examples: [{ q: "How can a real-life situation become useful TOK evidence?", a: "Identify a specific situation, state what knowledge claim it illustrates, explain the evidence and assumptions behind the claim, then consider a credible alternative perspective and the implications." }],
  });

  IB.register({
    id: "tok",
    name: "Theory of Knowledge (TOK)",
    short: "TOK",
    color: "var(--tok)",
    guide: "IB Theory of Knowledge course; confirm current exhibition and essay instructions with your teacher.",
    assessment: [
      ["TOK exhibition", "Internal assessment", "3 objects + commentary", "33%", "Commentary of up to 950 words explaining how objects connect to one selected IA prompt."],
      ["TOK essay", "External assessment", "Prescribed title", "67%", "Essay of up to 1,600 words answering one prescribed title through a focused comparison of areas of knowledge."],
    ],
    papers: {
      EXH: { name: "Exhibition practice", minutes: 60, marks: 10, mix: { extended: 1 } },
      ESSAY: { name: "Essay practice", minutes: 90, marks: 10, mix: { extended: 1 } },
    },
    commandTerms: [
      ["Knowledge question", "An open question about the nature, methods, evidence or limits of knowledge."],
      ["Claim", "A reasoned statement that answers part of a knowledge question."],
      ["Counterclaim", "A credible alternative or qualification that tests the limits of a claim."],
      ["Perspective", "A position shaped by assumptions, methods, values, context or experience."],
      ["Implication", "A consequence of accepting or acting on a knowledge claim."],
      ["Evaluate", "Weigh the strength and limits of arguments and examples to reach a justified judgement."],
    ],
    gameplan: {
      intro: "TOK is an inquiry into how knowledge is produced, shared and justified. Strong work uses real examples to compare perspectives and answers the exact question rather than summarising a topic.",
      rows: [
        ["Exhibition", "Three objects linked to one IA prompt", "Choose specific objects, explain their real-world context and make a distinct prompt-linked point for each."],
        ["Essay", "Prescribed title through areas of knowledge", "Define key terms, develop claims and counterclaims, compare methods and implications, then answer the title."],
      ],
      habits: ["Ask what would count as evidence and who gets to judge it.", "Compare perspectives fairly before deciding how convincing each is.", "Keep every example and paragraph connected to the prompt or title."],
    },
    topics: [
      makeTopic("C1", "Core theme", "Knowledge and the knower", "Explore how personal experience, values, identity and communities shape what people accept as knowledge.", [
        { h: "The knower and perspective", b: "<p>Knowers interpret evidence through prior experience, language, values and social relationships. Perspective can reveal details that a supposedly neutral account overlooks, but it can also shape attention and expectations. Reflexivity means examining how the knower's position affects a claim.</p>" },
        { h: "Shared knowledge", b: "<p>Knowledge is often produced and checked collectively through communities, institutions and practices. Consensus can support reliability when methods are open to criticism; it is not a guarantee of truth when authority excludes evidence or alternative voices.</p>" },
      ], [
        { type: "short", paper: "EXH", marks: 3, diff: 2, q: "Explain one way a knower's perspective can influence the interpretation of evidence.", ms: ["Identifies a relevant influence such as experience, values, language or identity [1]", "Explains how it changes attention or interpretation [1]", "Uses a specific example or notes a limitation [1]"] },
        { type: "extended", paper: "ESSAY", marks: 10, diff: 3, q: "To what extent can we separate knowledge from the knower? Discuss with reference to two areas of knowledge. [10]", ms: ["Focused interpretation of the title [2]", "Claims and counterclaims supported by specific examples across two AOKs [4]", "Meaningful comparison of methods or perspectives [2]", "Balanced conclusion answering 'to what extent' [2]"] },
      ], [["Perspective", "A way of interpreting knowledge shaped by a knower's position and assumptions."], ["Reflexivity", "Critical awareness of how one's own position influences inquiry and interpretation."]]),
      makeTopic("T1", "Optional theme: knowledge and technology", "Knowledge and technology", "Consider how tools, algorithms and digital networks change access to knowledge, evidence and authority.", [
        { h: "Tools and methods", b: "<p>Technology extends human capacities: instruments make previously inaccessible phenomena observable, while databases allow patterns to be tested at scale. Every tool has design choices, measurement limits and assumptions that affect what can be known.</p>" },
        { h: "Digital knowledge systems", b: "<p>Search engines and recommendation systems rank information using data and objectives. They can broaden access but also amplify bias, misinformation and unequal visibility. Transparency, provenance and independent verification matter when evaluating digital claims.</p>" },
      ], [
        { type: "short", paper: "EXH", marks: 3, diff: 2, q: "Explain why an algorithm's output should not automatically be treated as neutral knowledge.", ms: ["Outputs depend on training data, design choices or optimisation goals [1]", "These choices can reproduce bias or omit relevant evidence [1]", "Independent checks or transparent methods are needed [1]"] },
        { type: "extended", paper: "ESSAY", marks: 10, diff: 3, q: "Does new technology always improve the quality of knowledge? Discuss with reference to two areas of knowledge. [10]", ms: ["Defines improvement in a relevant way [2]", "Specific examples show how tools expand or constrain knowledge [4]", "Evaluates reliability, access, bias or unintended consequences [2]", "Reasoned comparative conclusion [2]"] },
      ], [["Algorithm", "A defined procedure used to process data or make a decision."], ["Provenance", "The origin and history of information or an object."]]),
      makeTopic("T2", "Optional theme: knowledge and language", "Knowledge and language", "Examine how language communicates, classifies and shapes knowledge, including translation and ambiguity.", [
        { h: "Language as a knowledge tool", b: "<p>Shared vocabularies make knowledge communicable and allow complex distinctions. Categories can direct attention and support comparison, yet labels may simplify continuous realities or embed assumptions about what matters.</p>" },
        { h: "Translation and interpretation", b: "<p>Translation can make knowledge available across communities but rarely transfers every connotation, context or cultural reference unchanged. Meaning depends on audience, purpose and conventions as well as words.</p>" },
      ], [
        { type: "short", paper: "EXH", marks: 3, diff: 2, q: "Give one reason a translation may change the knowledge communicated by a source.", ms: ["A word or concept may lack an exact equivalent [1]", "Cultural context, connotation or audience differs [1]", "A specific example or consequence is explained [1]"] },
        { type: "extended", paper: "ESSAY", marks: 10, diff: 3, q: "How does language shape what can be known? Discuss with reference to two areas of knowledge. [10]", ms: ["Focused interpretation of 'shape' and 'known' [2]", "Examples show language enabling and limiting knowledge [4]", "Comparison of how AOK methods handle meaning or ambiguity [2]", "Balanced conclusion [2]"] },
      ], [["Classification", "Grouping phenomena according to selected similarities or distinctions."], ["Connotation", "Associations and implications a word carries beyond its literal definition."]]),
      makeTopic("T3", "Optional theme: knowledge and politics", "Knowledge and politics", "Explore the relationship between evidence, power, authority, public narratives and collective decision-making.", [
        { h: "Authority and evidence", b: "<p>Political decisions rely on knowledge claims about populations, risks and outcomes. Governments, experts, journalists and communities may have different access to evidence and different incentives. Scrutinise methods, sources and whose experiences are counted.</p>" },
        { h: "Knowledge and power", b: "<p>Power can determine which questions receive funding, whose testimony is trusted and how statistics are framed. Public disagreement does not mean all claims are equally supported: compare evidence quality while recognising uncertainty and interests.</p>" },
      ], [
        { type: "short", paper: "EXH", marks: 3, diff: 2, q: "Explain one way political power can influence the production of knowledge.", ms: ["Identifies an influence such as funding, data access, censorship or agenda setting [1]", "Explains how it affects methods, visibility or conclusions [1]", "Gives a specific example or notes a countervailing check [1]"] },
        { type: "extended", paper: "ESSAY", marks: 10, diff: 3, q: "Can evidence remain objective when it is used to make political decisions? Discuss with reference to two areas of knowledge. [10]", ms: ["Clarifies objectivity and decision context [2]", "Examples examine evidence, values and interpretation [4]", "Evaluates safeguards and unavoidable selection [2]", "Nuanced conclusion [2]"] },
      ], [["Objectivity", "An aspiration to reduce the influence of personal or institutional bias in inquiry."], ["Agenda setting", "Influencing which issues are treated as important or receive attention."]]),
      makeTopic("T4", "Optional theme: knowledge and religion", "Knowledge and religion", "Compare ways religious traditions and other communities develop, interpret and justify knowledge claims.", [
        { h: "Sources and interpretation", b: "<p>Religious knowledge may draw on sacred texts, traditions, authority, experience, reason and community practice. Interpretations can differ within a tradition and change with historical context; identify which community and method a claim concerns.</p>" },
        { h: "Ways of knowing and evidence", b: "<p>Different questions may call for different standards of justification. Empirical evidence, testimony, revelation and ethical reasoning are not interchangeable, but they can interact. Avoid assuming one method can settle every kind of question.</p>" },
      ], [
        { type: "short", paper: "EXH", marks: 3, diff: 2, q: "Why is it important to identify the interpretive community when discussing a religious knowledge claim?", ms: ["Traditions contain diverse interpretations [1]", "Community context affects authority, practice and meaning [1]", "This prevents an overgeneralisation [1]"] },
        { type: "extended", paper: "ESSAY", marks: 10, diff: 3, q: "Are there limits to the kinds of knowledge that can be justified by reason alone? Discuss with reference to two areas of knowledge. [10]", ms: ["Defines relevant senses of reason and justification [2]", "Examples compare reasoning with other methods or evidence [4]", "Considers strengths and limits rather than false dichotomies [2]", "Supported conclusion [2]"] },
      ], [["Testimony", "Knowledge communicated by another person or source and assessed for credibility."], ["Interpretation", "The process of assigning meaning to evidence, texts or experience."]]),
      makeTopic("T5", "Optional theme: knowledge and indigenous societies", "Knowledge and indigenous societies", "Explore how knowledge is embedded in place, language, relationships, practice and intergenerational transmission.", [
        { h: "Knowledge, place and community", b: "<p>Knowledge in Indigenous societies is diverse and situated within particular communities, languages, lands and histories. It may be transmitted through oral histories, practice, observation, ceremony and relationships with place. Avoid treating distinct peoples as one uniform group.</p>" },
        { h: "Authority, exchange and responsibility", b: "<p>Questions of who may share, interpret or use knowledge are connected to authority, consent and responsibility. Research and public institutions should consider whose knowledge is represented, how context is preserved and whether communities benefit from exchange.</p>" },
      ], [
        { type: "short", paper: "EXH", marks: 3, diff: 2, q: "Explain why knowledge should not be generalised across all Indigenous societies.", ms: ["Indigenous peoples and communities have distinct histories and practices [1]", "Knowledge is situated in specific languages, lands and relationships [1]", "A generalisation risks misrepresentation or erasure [1]"] },
        { type: "extended", paper: "ESSAY", marks: 10, diff: 3, q: "Who should have authority to decide how knowledge is shared? Discuss with reference to two areas of knowledge. [10]", ms: ["Clarifies authority and sharing in context [2]", "Specific examples examine communities, institutions and consent [4]", "Evaluates benefits, risks and unequal power [2]", "Balanced conclusion [2]"] },
      ], [["Situated knowledge", "Knowledge shaped by the particular place, community and context in which it is produced."], ["Knowledge transmission", "Processes through which knowledge is taught, shared and sustained over time."]]),
      makeTopic("A1", "Area of knowledge: natural sciences", "Natural sciences", "Examine observation, experimentation, models, explanation and replication in the natural sciences.", [
        { h: "Methods and models", b: "<p>Natural sciences use observation, measurement, experimentation and modelling to explain patterns in the natural world. Models simplify reality and are judged by explanatory and predictive success, consistency with evidence and openness to revision.</p>" },
        { h: "Evidence and uncertainty", b: "<p>Measurements have uncertainty; studies require suitable controls and methods. Replication and peer criticism can increase confidence, while anomalous results may prompt refinement rather than immediate rejection of a theory.</p>" },
      ], [
        { type: "short", paper: "EXH", marks: 3, diff: 2, q: "Explain why replication can strengthen a scientific knowledge claim without proving it with certainty.", ms: ["Independent repetition tests whether a result is robust [1]", "Consistent results reduce the likelihood of a one-off error [1]", "Models remain open to new evidence and revision [1]"] },
        { type: "extended", paper: "ESSAY", marks: 10, diff: 3, q: "How important is disagreement to the production of knowledge in the natural sciences and one other area of knowledge? [10]", ms: ["Explains forms of productive and unproductive disagreement [2]", "Specific examples from both AOKs [4]", "Compares methods for resolving disagreement [2]", "Balanced judgement [2]"] },
      ], [["Falsifiability", "The possibility that evidence could count against a claim or theory."], ["Replication", "Repeating an investigation to test the robustness of a result."]]),
      makeTopic("A2", "Area of knowledge: the arts", "The arts", "Explore interpretation, creativity, artistic knowledge, evaluation and the role of audiences.", [
        { h: "Making and interpreting", b: "<p>Artistic knowledge can be embodied in practice, perception, emotion and interpretation. An artwork may support several readings, but interpretations should be accountable to features of the work and relevant context.</p>" },
        { h: "Evaluation and value", b: "<p>Judgements of artistic value use criteria that may vary across traditions, audiences and purposes. Subjectivity does not make evaluation arbitrary: explain standards, evidence and perspective, and recognise who has authority to define a canon.</p>" },
      ], [
        { type: "short", paper: "EXH", marks: 3, diff: 2, q: "How can an interpretation of an artwork be supported even when there is no single agreed meaning?", ms: ["Refers to specific features of the work [1]", "Connects features to context, form or audience response [1]", "Acknowledges another plausible interpretation [1]"] },
        { type: "extended", paper: "ESSAY", marks: 10, diff: 3, q: "Can artistic knowledge be evaluated using shared standards? Discuss with reference to the arts and one other area of knowledge. [10]", ms: ["Defines evaluation and shared standards [2]", "Specific examples from both AOKs [4]", "Compares role of interpretation, expertise and context [2]", "Balanced conclusion [2]"] },
      ], [["Aesthetic judgement", "An evaluation of features such as form, expression, significance or artistic value."], ["Canon", "A set of works treated by an institution or community as especially important."]]),
      makeTopic("A3", "Area of knowledge: history", "History", "Analyse historical evidence, source interpretation, causation, perspective and the limits of historical accounts.", [
        { h: "Sources and context", b: "<p>Historical knowledge is constructed from surviving sources. Historians consider origin, purpose, audience, context, corroboration and silence. A source can be valuable for one question and limited for another.</p>" },
        { h: "Explanation and narrative", b: "<p>Historical explanations select and relate causes, consequences and perspectives. Interpretations change when new sources or questions emerge. Distinguish evidence about the past from the narrative used to organise it.</p>" },
      ], [
        { type: "short", paper: "EXH", marks: 3, diff: 2, q: "Give three questions a historian might ask when evaluating a source.", ms: ["Origin / author / date [1]", "Purpose or intended audience [1]", "Context, corroboration, perspective or omission [1]"] },
        { type: "extended", paper: "ESSAY", marks: 10, diff: 3, q: "To what extent can historians produce objective knowledge about the past? [10]", ms: ["Clarifies objectivity and historical knowledge [2]", "Examples examine source evidence and interpretation [4]", "Considers methods that limit bias and remaining uncertainty [2]", "Reasoned conclusion [2]"] },
      ], [["Corroboration", "Checking a claim against independent sources or evidence."], ["Historiography", "The study of how historical interpretations are produced and change."]]),
      makeTopic("A4", "Area of knowledge: human sciences", "Human sciences", "Consider how human behaviour is studied using models, data, interpretation and ethical research.", [
        { h: "Methods and people", b: "<p>Human sciences use quantitative and qualitative methods to study individuals and societies. Human behaviour is context-dependent; participants may respond to being observed, and researchers' categories and assumptions influence study design.</p>" },
        { h: "Models, prediction and ethics", b: "<p>Models can reveal patterns but may simplify motives and social structures. Correlation does not establish causation. Ethical research considers consent, harm, privacy, representation and the distribution of benefits.</p>" },
      ], [
        { type: "short", paper: "EXH", marks: 3, diff: 2, q: "Why does a correlation in a human-science study not by itself establish causation?", ms: ["A third variable may influence both variables [1]", "Reverse causation or coincidence may explain the pattern [1]", "Further design or evidence is needed to support causation [1]"] },
        { type: "extended", paper: "ESSAY", marks: 10, diff: 3, q: "Is prediction a reliable measure of knowledge in the human sciences? [10]", ms: ["Clarifies prediction and reliability [2]", "Examples examine successful and limited predictions [4]", "Considers context, reflexivity and ethical constraints [2]", "Balanced judgement [2]"] },
      ], [["Reflexivity", "Recognition that research and researchers can affect the people or systems being studied."], ["Correlation", "A statistical association between variables that does not alone show causation."]]),
      makeTopic("A5", "Area of knowledge: mathematics", "Mathematics", "Explore proof, axioms, abstraction, certainty and the application of mathematical models.", [
        { h: "Proof and certainty", b: "<p>Mathematical proof establishes a conclusion from stated assumptions using accepted rules of inference. A proof can be valid while its axioms or application to the world remain open to discussion.</p>" },
        { h: "Models and abstraction", b: "<p>Mathematics abstracts and idealises. Models are useful when assumptions fit a purpose and context; limitations arise when ignored factors matter. Different mathematical frameworks can describe the same situation from different perspectives.</p>" },
      ], [
        { type: "short", paper: "EXH", marks: 3, diff: 2, q: "Distinguish mathematical certainty within a system from the reliability of applying that system to the real world.", ms: ["Proof establishes a result from assumptions and rules [1]", "Real-world application depends on whether the assumptions fit [1]", "Model limitations or measurement uncertainty can affect conclusions [1]"] },
        { type: "extended", paper: "ESSAY", marks: 10, diff: 3, q: "Does mathematical certainty make mathematics independent of human perspectives? [10]", ms: ["Explains certainty, axioms and perspective [2]", "Examples examine proof, choice of assumptions or modelling [4]", "Compares formal reasoning with human choices in application [2]", "Nuanced conclusion [2]"] },
      ], [["Axiom", "A starting assumption accepted within a formal mathematical system."], ["Model", "A simplified representation used to describe, explain or predict a system."]]),
      makeTopic("X1", "Assessment skills: exhibition", "TOK exhibition", "Plan an exhibition that uses three specific objects to answer one official IA prompt.", [
        { h: "Choose and anchor objects", b: "<p>Choose three distinct, specific objects with a real-world context. Explain where each comes from, who uses or made it, and why that context matters. A generic object without a clear connection is difficult to analyse.</p>" },
        { h: "Commentary structure", b: "<p>For each object, make a focused point about the selected prompt, support it with context and reasoning, and explain its contribution to the exhibition. The three objects should develop different aspects rather than repeat one idea.</p>" },
      ], [
        { type: "short", paper: "EXH", marks: 3, diff: 2, q: "State three features that make an object choice effective in a TOK exhibition.", ms: ["Specific identifiable object [1]", "Clear real-world context and provenance [1]", "Distinct, explained connection to the selected prompt [1]"] },
        { type: "extended", paper: "EXH", marks: 10, diff: 3, q: "Plan a three-object exhibition for an official IA prompt of your choice. Explain each object's context and distinct contribution. [10]", ms: ["Prompt selected and addressed throughout [2]", "Three specific objects with relevant context [3]", "Distinct claims and clear TOK analysis for each object [3]", "Coherent connections and concise focus [2]"] },
      ], [["IA prompt", "One of the official questions used to frame the TOK exhibition."], ["Object context", "The real-world origin, use, ownership or situation that makes an object specific."]]),
      makeTopic("X2", "Assessment skills: essay", "TOK essay", "Develop a focused response to a prescribed title through comparison of two areas of knowledge.", [
        { h: "Interpreting the title", b: "<p>Define key terms in context, identify the title's assumptions and tension, and turn it into a line of inquiry. Avoid answering a nearby question instead of the prescribed title.</p>" },
        { h: "Argument and comparison", b: "<p>Use claims and counterclaims supported by specific examples. Compare how areas of knowledge produce or evaluate knowledge rather than writing two disconnected mini-essays. Evaluate the significance of differences and answer the title in the conclusion.</p>" },
      ], [
        { type: "short", paper: "ESSAY", marks: 3, diff: 2, q: "List three elements of a focused TOK essay paragraph.", ms: ["A clear claim linked to the prescribed title [1]", "A specific example and explanation of its relevance [1]", "Evaluation, qualification or comparison [1]"] },
        { type: "extended", paper: "ESSAY", marks: 10, diff: 3, q: "Write a concise argument plan for a prescribed title using two areas of knowledge, including one claim and one counterclaim in each. [10]", ms: ["Interprets the title and defines key terms [2]", "Relevant claims/counterclaims in both AOKs [3]", "Specific examples and explicit comparative analysis [3]", "Line of argument and conclusion answer the title [2]"] },
      ], [["Prescribed title", "An official TOK essay question released for a given assessment session."], ["Counterclaim", "A reasoned alternative that challenges or qualifies a claim."]]),
    ],
  });
})();
