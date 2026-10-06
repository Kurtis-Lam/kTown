/* Geography HL shares the SL core and options, with original HL extension notes. */
(function () {
  const sl = IB.subjects.geo;
  const cloneTopic = (t, i) => ({
    ...t,
    id: `geohl-${i + 1}`,
    questions: t.questions.map(({ id, ...q }) => q),
  });
  const extension = (id, code, unit, title, summary, concepts, questions, terms) => ({
    id, code, unit, title, summary, concepts, questions, terms,
    methods: ["Build each explanation around a located example, then connect evidence to a process and a consequence at the correct scale."],
    traps: ["Avoid listing places without explaining how they demonstrate the geographical process.", "Treat global connections as uneven: identify who benefits, who bears costs and why."],
    tips: ["Use precise place evidence and acknowledge variation within countries and over time."],
    examples: [{ q: "How should a case study support an evaluation?", a: "Use a named place and specific evidence, explain the process the evidence demonstrates, compare alternative explanations, and reach a conclusion that answers the command term." }],
  });
  const topics = sl.topics.map(cloneTopic);
  topics.push(
    extension("geohl-hl-1", "HL1", "HL extension: global interactions", "Global interactions and flows", "Examine how movements of capital, goods, people, information and ideas connect places unevenly.", [
      { h: "Flows, networks and hubs", b: "<p>Global interactions occur through flows of trade, finance, migration, tourism, data and culture. Networks are organised around nodes and links; gateway cities, ports and digital platforms can gain influence because they control connections. A place's network position affects its access to investment and opportunities.</p>" },
      { h: "Uneven outcomes", b: "<p>Flows can support employment, remittances, innovation and market access while also producing dependency, insecure work, displacement, cultural homogenisation and environmental costs. Outcomes depend on bargaining power, regulation, infrastructure and who owns assets.</p>" },
    ], [
      { type: "short", paper: "P3", marks: 3, diff: 2, q: "Explain one way a transport or information hub can influence the development of connected places.", ms: ["A hub concentrates flows / access to markets, investment or information [1]", "This can attract firms, jobs or services and strengthen connectivity [1]", "Benefit is uneven; places outside the network may be bypassed or become dependent [1]"] },
      { type: "extended", paper: "P3", marks: 10, diff: 3, q: "Evaluate the view that global flows benefit all connected places equally. Use located examples. [10]", ms: ["Contrasting located examples and specific evidence [3]", "Explains economic, social, political or environmental benefits and costs [3]", "Evaluates differences in ownership, bargaining power and network position [2]", "Balanced conclusion directly answers 'equally' [2]"] },
    ], [["Global flow", "Movement of people, goods, capital, information or ideas between places."], ["Network node", "A location where routes, connections or flows intersect."]]),
    extension("geohl-hl-2", "HL2", "HL extension: power and places", "Power, sovereignty and contested places", "Analyse how states, firms and communities exercise power over territories, resources, identities and decision-making.", [
      { h: "Forms of power", b: "<p>Power may be exercised through law, military force, economic leverage, ownership, knowledge, surveillance or control of narratives. State sovereignty is challenged or reshaped by supranational bodies, transnational corporations, social movements and cross-border problems.</p>" },
      { h: "Place, identity and contestation", b: "<p>Places carry meanings and identities. Competing claims over land, borders, sacred sites, housing or resources can reflect unequal power and different scales of governance. Geographical analysis asks whose perspective is represented, who decides and who is excluded.</p>" },
    ], [
      { type: "short", paper: "P3", marks: 3, diff: 2, q: "Explain how a transnational corporation can influence a local place without owning its government.", ms: ["Controls investment, employment, supply chains or access to markets [1]", "Its choices can shape local wages, land use, infrastructure or public revenue [1]", "Influence is mediated by regulation, community action and the bargaining power of the state [1]"] },
      { type: "extended", paper: "P3", marks: 10, diff: 3, q: "Examine how power relations shape the meaning or use of one contested place. [10]", ms: ["Clearly identified place and competing stakeholders [2]", "Explains at least two forms or scales of power using located evidence [4]", "Considers affected groups and changing outcomes over time [2]", "Supported judgement on which relationships matter most [2]"] },
    ], [["Sovereignty", "The authority of a state to govern its territory and make decisions."], ["Contested place", "A location where groups have competing claims, meanings or interests."]]),
    extension("geohl-hl-3", "HL3", "HL extension: global risks", "Global risks and resilience", "Compare how interconnected risks are produced, experienced and managed across places and scales.", [
      { h: "Risk and vulnerability", b: "<p>Risk emerges from the interaction of a hazard, exposure and vulnerability. Global systems can transmit shocks through finance, supply chains, disease, climate and information. Exposure is spatially uneven; vulnerability reflects income, health, governance, infrastructure and social inequality.</p>" },
      { h: "Resilience and governance", b: "<p>Resilience includes the capacity to prepare, absorb, adapt and recover. Responses range from household coping and city planning to international agreements. Evaluate who pays, whose knowledge is used, whether risk is reduced or displaced, and how resilience changes over time.</p>" },
    ], [
      { type: "short", paper: "P3", marks: 3, diff: 2, q: "Distinguish exposure from vulnerability in a geographical risk assessment.", ms: ["Exposure is the people/assets located where a hazard may occur [1]", "Vulnerability is their susceptibility to harm and limited capacity to cope [1]", "Example showing they can vary independently [1]"] },
      { type: "extended", paper: "P3", marks: 10, diff: 3, q: "Evaluate the effectiveness of one strategy for building resilience to a global risk. [10]", ms: ["Names the risk, place and strategy [2]", "Explains how the strategy reduces exposure or vulnerability, with evidence [3]", "Assesses limits, distributional effects and governance/scale [3]", "Reasoned conclusion about effectiveness [2]"] },
    ], [["Exposure", "People, assets or systems located in an area that may be affected by a hazard."], ["Resilience", "Capacity to prepare for, absorb, adapt to and recover from a disturbance."]])
  );

  const s = {
    ...sl,
    id: "geohl",
    name: "Geography HL",
    short: "Geography HL",
    color: "var(--geohl)",
    guide: "IB Geography HL guide; includes SL core/options and original HL extension study notes.",
    topics,
    assessment: [
      ["Paper 1 - Geographic themes (options)", "1h 30m", "2 options", "35%", "Structured questions using maps, graphs and data."],
      ["Paper 2 - Core: global change", "1h 15m", "-", "25%", "Data-based questions and extended response."],
      ["Paper 3 - Geographic perspectives", "1h 15m", "3 questions", "20%", "Extended response on global interactions, power and global risks."],
      ["Internal assessment", "20 h", "Fieldwork report", "20%", "Fieldwork investigation; confirm word count and current requirements in the guide."],
    ],
    papers: {
      ...sl.papers,
      P3: { name: "Paper 3 (geographic perspectives)", minutes: 75, marks: 30, mix: { short: 3, extended: 1 } },
    },
    gameplan: {
      intro: "Geography HL combines the SL core and options with a deeper global-perspectives paper. Use located examples to connect processes, power and outcomes.",
      rows: [
        ["Paper 1", "Two options with data and extended responses", "Use accurate case evidence and link processes to the question."],
        ["Paper 2", "Core data-response questions", "Read the resource carefully, quote data and explain spatial patterns."],
        ["Paper 3", "Global interactions, power and risk", "Build a clear argument, compare perspectives and evaluate at more than one scale."],
      ],
      habits: ["Learn a small number of detailed, flexible case studies.", "Separate description of a pattern from explanation of the process.", "Evaluate who benefits, who is vulnerable and how outcomes vary by scale."],
    },
  };
  IB.register(s);
})();
