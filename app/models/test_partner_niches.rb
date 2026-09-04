module TestPartnerNiches
  ADHD_APPS = [
    { name: "Inflow", domain: "getinflow.io", stat: "$14M raised", stat_label: "100k+ downloads", note: "ADHD self-management app, acquired by Cerebral in 2026." },
    { name: "Tiimo", domain: "tiimoapp.com", stat: "50k paying subs", stat_label: "1M downloads", note: "Visual daily planner for neurodivergent people." },
    { name: "Endel", domain: "endel.io", stat: "$15.8M ARR", stat_label: "~200k downloads a month", note: "Focus soundscapes. Started as a tiny audio app." },
    { name: "Numo", domain: "numo.ai", stat: "$35k MRR", stat_label: "in its first 10 months · 500k+ users", note: "Gamified ADHD squads. Tiny team." },
    { name: "Llama Life", domain: "llamalife.co", stat: "$950k raised", stat_label: "solo founder", note: "A to-do timer for ADHD brains. That's the whole app." },
    { name: "Flown", domain: "flown.com", stat: "$5.1M raised", stat_label: "paid membership", note: "Live body-doubling focus sessions." }
  ].freeze

  MARKETPLACE_APPS = [
    { name: "EverBee", domain: "everbee.io", stat: "$5M ARR", stat_label: "1M+ Etsy sellers", note: "Zero to $5M in two years. Bootstrapped." },
    { name: "eRank", domain: "erank.com", stat: "$2.6M ARR", stat_label: "2M+ sellers", note: "Started as a tool for the founder's wife's Etsy shop." },
    { name: "Helium 10", domain: "helium10.com", stat: "$20.9M ARR", stat_label: "2M+ users", note: "Amazon seller suite, later acquired." },
    { name: "Jungle Scout", domain: "junglescout.com", stat: "210k weekly users", stat_label: "$110M raised", note: "The Amazon research pioneer. Started bootstrapped." },
    { name: "Alura", domain: "alura.io", stat: "800k+ sellers", stat_label: "bootstrapped", note: "The biggest Etsy Chrome extension." }
  ].freeze

  FINANCE_APPS = [
    { name: "ProjectionLab", domain: "projectionlab.com", stat: "$1M ARR", stat_label: "100k+ households", note: "One founder. Zero funding, zero ads." },
    { name: "Copilot Money", domain: "copilot.money", stat: "$2.9M/yr", stat_label: "100k+ paying subscribers", note: "The design-led winner of the Mint shutdown." },
    { name: "Lunch Money", domain: "lunchmoney.app", stat: "$34k MRR", stat_label: "solo founder", note: "Fully bootstrapped budgeting app." },
    { name: "Monarch Money", domain: "monarchmoney.com", stat: "$75M raised", stat_label: "$850M valuation (2025)", note: "Paid subscribers grew 20x after Mint died." },
    { name: "YNAB", domain: "ynab.com", stat: "~$49M/yr", stat_label: "millions of users", note: "Bootstrapped since 2004. Subscription only." },
    { name: "getquin", domain: "getquin.com", stat: "$24M raised", stat_label: "500k+ users · €20B tracked", note: "Social portfolio tracker from Berlin." }
  ].freeze

  JOB_SEARCH_APPS = [
    { name: "Teal", domain: "tealhq.com", stat: "$4.2M/yr", stat_label: "2M members · 100k+ paying", note: "Job tracker and resume builder." },
    { name: "Rezi", domain: "rezi.ai", stat: "$2.5M ARR", stat_label: "4.3M users", note: "Bootstrapped AI resume builder." },
    { name: "Careerflow", domain: "careerflow.ai", stat: "$5.6M/yr", stat_label: "1M+ users", note: "Bootstrapped job-search copilot." },
    { name: "Kickresume", domain: "kickresume.com", stat: "$1.9M/yr", stat_label: "8M users helped", note: "Profitable since 2013." },
    { name: "Simplify", domain: "simplify.jobs", stat: "2M+ job seekers", stat_label: "100M+ applications autofilled", note: "One-click job applications." },
    { name: "Final Round AI", domain: "finalroundai.com", stat: "$6.9M raised", stat_label: "10M users claimed", note: "Real-time interview copilot." }
  ].freeze

  NO_FAP_APPS = [
    { name: "QUITTR", domain: "quittr.co", stat: "$250k/mo", stat_label: "4 months after launch · 1M+ users", note: "Built by two teens. Bootstrapped." },
    { name: "Brainbuddy", domain: "brainbuddyapp.com", stat: "~$100k/mo", stat_label: "top-grossing recovery app", note: "On the App Store since 2013." },
    { name: "Covenant Eyes", domain: "covenanteyes.com", stat: "$23M/yr", stat_label: "1.5M+ users", note: "Accountability app running since 2000." },
    { name: "Fortify", domain: "joinfortify.com", stat: "$2.2M raised", stat_label: "100k+ downloads · 200 countries", note: "Recovery program spun out of a nonprofit." },
    { name: "BlockerX", domain: "blockerx.net", stat: "~$60k/mo", stat_label: "on iOS alone", note: "Bootstrapped blocker plus community." }
  ].freeze

  ALL = {
    "adhd" => {
      name: "ADHD",
      card_title: "Your ADHD app",
      card_role: "Creator · ADHD",
      proof_head: "ADHD apps already print money",
      proof_sub: "Public numbers from apps your audience already pays for. The market is proven. What's missing is an app with your name on it.",
      apps: ADHD_APPS
    },
    "marketplace-sellers" => {
      name: "Marketplace sellers",
      card_title: "Your seller app",
      card_role: "Creator · E-commerce",
      proof_head: "Seller tools already print money",
      proof_sub: "Public numbers from tools Etsy and Amazon sellers already pay for. The market is proven. What's missing is a tool with your name on it.",
      apps: MARKETPLACE_APPS
    },
    "finance" => {
      name: "Finance",
      card_title: "Your finance app",
      card_role: "Creator · Finance",
      proof_head: "Finance apps already print money",
      proof_sub: "Public numbers from apps your audience already pays for. The market is proven. What's missing is an app with your name on it.",
      apps: FINANCE_APPS
    },
    "job-search" => {
      name: "Job search",
      card_title: "Your career app",
      card_role: "Creator · Careers",
      proof_head: "Job-search apps already print money",
      proof_sub: "Public numbers from tools job seekers already pay for. The market is proven. What's missing is a tool with your name on it.",
      apps: JOB_SEARCH_APPS
    },
    "no-fap" => {
      name: "NoFap",
      card_title: "Your recovery app",
      card_role: "Creator · NoFap",
      proof_head: "Recovery apps already print money",
      proof_sub: "Public numbers from apps your audience already pays for. The market is proven. What's missing is an app with your name on it.",
      apps: NO_FAP_APPS
    }
  }.freeze

  DEFAULT_APPS = [
    NO_FAP_APPS[0],
    MARKETPLACE_APPS[0],
    FINANCE_APPS[0],
    JOB_SEARCH_APPS[1],
    ADHD_APPS[1],
    FINANCE_APPS[2]
  ].freeze
end
