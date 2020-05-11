var graphConfig = new GitGraph.Template({
    colors: ["#14CC73", "#FFFFFF", "#17a2b8", "#FFBB33"],
    branch: {
        //    color: "#000000",
        lineWidth: 10,
        spacingX: 60,
        mergeStyle: "bezier",
        showLabel: true, // display branch names on graph
        labelFont: "normal 10pt Arial",
        labelRotation: 0
    },
    commit: {
        spacingY: -30,
        dot: {
            size: 8,
            //      strokeColor: "#000000",
            strokeWidth: 4
        },
        tag: {
            font: "normal 10pt Arial"
        },
        message: {
            color: "#FFF",
            font: "normal 12pt Arial",
            displayAuthor: false,
            displayBranch: false,
            displayHash: false,
        }
    }
});

var config = {
    template: graphConfig,
    mode: "extended",
    orientation: "vertical-reverse"
};

// You can manually fix columns to control the display.
var careerCol = 1;
var trainingCol = 0;
var employerCol = 2;
var engagementCol = 3;

var gitgraph = new GitGraph(config);

var career = gitgraph.branch({
    name: "Career",
    column: careerCol
});
career.commit({
    message: "[Career] Initialise Career",
    tag: "Jul.09",
    tagColor: "#FFFFFF",
    messageColor: "#FFFFFF"
});

var monash = gitgraph.branch({
    parentBranch: career,
    name: "Monash",
    column: trainingCol
});

monash.commit({
    messageDisplay: false
});

career.commit({
    message: "[Employer] Started at AMP - Transformation Business Analyst",
    date: "01/01/11",
    tag: "Jan.11",
    tagColor: "#17a2b8",
    messageColor: "#17a2b8"
});

var amp = gitgraph.branch({
    parentBranch: career,
    name: "AMP",
    column: employerCol
});

amp.commit({
    messageDisplay: false,
});
amp.merge(career, {
    message: "[Employer] Started at IBM (Internal) - Data Analyst",
    date: "01/07/11",
    tag: "Jul.11",
    tagColor: "#17a2b8",
    messageColor: "#17a2b8"
});

var ibmIntern = gitgraph.branch({
    parentBranch: career,
    name: "IBM (Internal)",
    column: employerCol
});
ibmIntern.commit({
    messageDisplay: false
});

ibmIntern.merge(career, {
    message: "[Employer] Started at IBM - Consultant",
    tag: "Jan.13",
    tagColor: "#17a2b8",
    messageColor: "#17a2b8"
});

monash.merge(career, {
    message: "[Training] Obtained Bus. Info. Systems Bachelors Degree",
    tag: "Dec.12",
    tagColor: "#14CC73",
    messageColor: "#14CC73"
});

var ibm = gitgraph.branch({
    parentBranch: career,
    name: "IBM",
    column: employerCol
});
ibm.commit({
    message: "[Engagement] Started at Schweppes - Business Analyst",
    tag: "Feb.13",
    tagColor: "#FFBB33",
    messageColor: "#FFBB33"
});

var schweppes = gitgraph.branch({
    parentBranch: ibm,
    name: "Schweppes",
    column: engagementCol
});
schweppes.commit({
    messageDisplay: false
});
schweppes.merge(ibm, {
    message: "[Engagement] Started at NBN - Test Lead",
    tag: "Jun.13",
    tagColor: "#FFBB33",
    messageColor: "#FFBB33"
});

var nbn = gitgraph.branch({
    parentBranch: ibm,
    name: "NBN",
    column: engagementCol
});
nbn.commit({
    messageDisplay: false
});
nbn.merge(ibm, {
    message: "[Engagement] Started at Energy Australia - Test Manager",
    tag: "Dec.13",
    tagColor: "#FFBB33",
    messageColor: "#FFBB33"
});

var ea = gitgraph.branch({
    parentBranch: ibm,
    name: "Energy Aus.",
    column: engagementCol
});
ea.commit({
    messageDisplay: false
});

ibm.commit({
    message: "[Employer] Promoted at IBM - Senior Consultant",
    tag: "Jan.14",
    tagColor: "#17a2b8",
    messageColor: "#17a2b8"
});

ea.merge(ibm, {
    message: "[Engagement] Started at Jetstar - UX Design Lead",
    tag: "Oct.14",
    tagColor: "#FFBB33",
    messageColor: "#FFBB33"
});

var jetstar = gitgraph.branch({
    parentBranch: ibm,
    name: "Jetstar",
    column: engagementCol
});
jetstar.commit({
    messageDisplay: false
});
jetstar.merge(ibm, {
    messageDisplay: false
});

ibm.merge(career, {
    message: "[Employer] Started at Elabor8 - Consultant",
    tag: "Mar.15",
    tagColor: "#17a2b8",
    messageColor: "#17a2b8"
});

var elabor8 = gitgraph.branch({
    parentBranch: career,
    name: "Elabor8",
    column: employerCol
});
elabor8.commit({
    message: "[Engagement] Started at Open Universities Australia - Scrum Master / Agile BA",
    tag: "Apr.16",
    tagColor: "#FFBB33",
    messageColor: "#FFBB33"
});

var oua = gitgraph.branch({
    parentBranch: elabor8,
    name: "Open Uni. Australia",
    column: engagementCol
});

var psm1 = gitgraph.branch({
    parentBranch: career,
    name: "Scrum.org",
    column: trainingCol
});

psm1.commit({
    messageDisplay: false,
});
psm1.merge(career, {
    message: "[Training] Obtained Professional Scrum Master 1 (PSM1) Cert.",
    tag: "Jan.16",
    tagColor: "#14CC73",
    messageColor: "#14CC73"
});

oua.commit({
    messageDisplay: false
});
oua.merge(elabor8, {
    message: "[Engagement] Started at Proquo - Scrum Master / Agile BA",
    tag: "Feb.16",
    tagColor: "#FFBB33",
    messageColor: "#FFBB33"
});

var proquo = gitgraph.branch({
    parentBranch: elabor8,
    name: "Proquo",
    column: engagementCol
});

var kmp1 = gitgraph.branch({
    parentBranch: career,
    name: "LKU",
    column: trainingCol
});

kmp1.commit({
    messageDisplay: false
});
kmp1.merge(career, {
    message: "[Training] Obtained Kanban System Design 1 (KMP1) Cert.",
    tag: "Jan.16",
    tagColor: "#14CC73",
    messageColor: "#14CC73"
});

proquo.commit({
    messageDisplay: false
});
proquo.merge(elabor8, {
    message: "[Engagement] Started at BetEasy - Agile Delivery Lead",
    tag: "Nov.16",
    tagColor: "#FFBB33",
    messageColor: "#FFBB33"
});

var beteasy = gitgraph.branch({
    parentBranch: elabor8,
    name: "BetEasy",
    column: engagementCol
});

var kmp2 = gitgraph.branch({
    parentBranch: career,
    name: "LKU",
    column: trainingCol
});

kmp2.commit({
    messageDisplay: false
});
kmp2.merge(career, {
    message: "[Training] Obtained Kanban System Design 2 (KMP2) Cert.",
    tag: "Oct.17",
    tagColor: "#14CC73",
    messageColor: "#14CC73"
});

var akt = gitgraph.branch({
    parentBranch: career,
    name: "LKU",
    column: trainingCol
});

akt.commit({
    messageDisplay: false
});
akt.merge(career, {
    message: "[Training] Obtained Accredited Kanban Trainer (AKT) Cert.",
    tag: "Nov.17",
    tagColor: "#14CC73",
    messageColor: "#14CC73"
});

beteasy.commit({
    messageDisplay: false
});
beteasy.merge(elabor8, {
    message: "[Engagement] Started at DST Systems - Agile Coach / Data Analyst",
    tag: "Feb.18",
    tagColor: "#FFBB33",
    messageColor: "#FFBB33"
});

var dst = gitgraph.branch({
    parentBranch: elabor8,
    name: "DST",
    column: engagementCol
});
dst.commit({
    messageDisplay: false
});
dst.merge(elabor8, {
    messageDisplay: false
});

elabor8.merge(career, {
    message: "[Employer] Started at ANZ - Agile Coach",
    tag: "Nov.18",
    tagColor: "#17a2b8",
    messageColor: "#17a2b8"
});

var anz = gitgraph.branch({
    parentBranch: career,
    name: "ANZ",
    column: employerCol
});
anz.commit({
    messageDisplay: false
});

anz.merge(career, {
    message: "[Employer] Started at NAB - Agile Coach",
    tag: "Jan.20",
    tagColor: "#17a2b8",
    messageColor: "#17a2b8"
});

var nab = gitgraph.branch({
    parentBranch: career,
    name: "NAB",
    column: employerCol
});
nab.commit({
    messageDisplay: false,
    tag: "Present",
    tagColor: "white"
});