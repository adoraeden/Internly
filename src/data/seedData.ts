import {
  Application,
  InterviewQuestion,
  UserProfile,
  LearningResource,
  DayStudyPlan,
} from '../types';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Alex Johnson',
  email: 'alex.johnson@demo.college.edu',
  degree: 'B.S. Computer Science (Class of 2027)',
  headline: 'Computer Science Junior @ UC Berkeley | Aspiring Full-Stack & Distributed Systems Engineer',
  targetRole: 'Software Engineering Intern, Summer 2027',
  location: 'Berkeley, CA',
  portfolioUrl: 'https://alexjohnson-portfolio.demo',
  linkedinUrl: 'https://linkedin.com/in/alex-johnson-demo',
  githubUrl: 'https://github.com/alexjohnson-demo',
  preferredRoles: [
    'Software Engineering Intern',
    'Frontend Engineer Intern',
    'Fullstack Developer Intern',
    'Backend Systems Intern',
  ],
  preferredIndustries: ['Cloud Infrastructure', 'Fintech', 'Developer Tooling', 'Enterprise SaaS'],
  preferredLocations: ['San Francisco, CA', 'Seattle, WA', 'New York, NY', 'Remote'],
  preferredWorkMode: 'Hybrid',
  employmentType: 'Internship',
  preferredDuration: '12-week summer term',
  technicalSkills: ['TypeScript', 'JavaScript', 'React', 'Node.js', 'Python', 'Go', 'PostgreSQL', 'MongoDB', 'Docker', 'Git'],
  toolsAndTechnologies: ['Next.js', 'Tailwind CSS', 'Express', 'Redis', 'AWS (S3, Lambda)', 'Postman', 'Linux / Bash'],
  areasToLearn: ['Distributed Consensus (Raft)', 'System Design Scaling', 'Kubernetes Orchestration', 'GraphQL Federation'],
  defaultApplicationView: 'table',
  defaultSortBy: 'newest',
  followUpReminderDays: 5,
  themePreference: 'Light',
  notificationsEnabled: true,
};

export const SEED_APPLICATIONS: Application[] = [
  {
    id: 'app-google-swe',
    company: 'Google',
    jobTitle: 'Software Engineering Intern, Summer 2027',
    role: 'Software Engineering Intern, Summer 2027',
    jobDescription:
      'Design, develop, test, deploy, and maintain software solutions for distributed cloud systems. Experience with C++, Java, Python, or Go. Strong algorithms and data structures background. Responsibilities include building scalable services, participating in design reviews, and optimizing latency.',
    applicationUrl: 'https://careers.google.com/students',
    companyWebsite: 'https://google.com',
    location: 'Mountain View, CA',
    workMode: 'Hybrid',
    applicationDate: '2026-09-18',
    deadline: '2026-10-28',
    interviewDate: '2026-10-22',
    followUpDate: '2026-10-24',
    followUpCompleted: false,
    status: 'Interview',
    priority: 'High',
    source: 'University Portal',
    salary: '$58 / hr',
    currency: 'USD',
    notes:
      'Technical phone screen passed on Oct 10. Round 2 technical coding interview scheduled for Oct 22 at 2:00 PM PT. Focus on tree algorithms and system design trade-offs.',
    timeline: [
      {
        id: 't-g-1',
        type: 'created',
        title: 'Application Submitted',
        description: 'Applied via Google Student Careers Portal with customized SWE resume.',
        timestamp: '2026-09-18T14:20:00Z',
      },
      {
        id: 't-g-2',
        type: 'status_change',
        title: 'Recruiter Outreach & Phone Screen',
        description: 'Completed 45-min screening on Oct 10; algorithmic problem solved with optimal O(n) space.',
        timestamp: '2026-10-10T11:00:00Z',
      },
      {
        id: 't-g-3',
        type: 'interview_scheduled',
        title: 'Technical Round 2 Confirmed',
        description: 'Scheduled with Distributed Systems team for Oct 22, 2:00 PM PT.',
        timestamp: '2026-10-12T09:15:00Z',
      },
    ],
    createdAt: '2026-09-18T14:20:00Z',
    updatedAt: '2026-10-12T09:15:00Z',
  },
  {
    id: 'app-amazon-sde',
    company: 'Amazon',
    jobTitle: 'Software Development Engineer Intern (AWS Cloud)',
    role: 'Software Development Engineer Intern (AWS Cloud)',
    jobDescription:
      'Build scalable distributed services powering Amazon Web Services. Work with Java, TypeScript, and AWS serverless architectures. Deliver production-ready features during a 12-week internship with dedicated principal engineer mentorship.',
    applicationUrl: 'https://amazon.jobs/en/business_categories/student-programs',
    companyWebsite: 'https://amazon.com',
    location: 'Seattle, WA',
    workMode: 'On-site',
    applicationDate: '2026-08-30',
    deadline: '2026-10-25',
    interviewDate: '2026-09-25',
    followUpDate: '2026-10-20',
    followUpCompleted: true,
    status: 'Offered',
    priority: 'High',
    source: 'LinkedIn',
    salary: '$56 / hr + $2,400/mo housing',
    currency: 'USD',
    notes:
      'Received official offer letter on Oct 04! Deadline to sign or request an extension is Oct 25. Mentorship structure looks very promising.',
    timeline: [
      {
        id: 't-a-1',
        type: 'created',
        title: 'Applied to AWS Student Programs',
        description: 'Submitted online assessment 1 & 2 via HackerRank.',
        timestamp: '2026-08-30T10:00:00Z',
      },
      {
        id: 't-a-2',
        type: 'interview_scheduled',
        title: 'Virtual Final Loop Scheduled',
        description: '3 back-to-back technical and Leadership Principles interviews.',
        timestamp: '2026-09-15T15:30:00Z',
      },
      {
        id: 't-a-3',
        type: 'status_change',
        title: 'Official Internship Offer Extended',
        description: 'Offer received: $56/hr with corporate housing stipend and relocation assistance.',
        timestamp: '2026-10-04T16:30:00Z',
      },
    ],
    createdAt: '2026-08-30T10:00:00Z',
    updatedAt: '2026-10-04T16:30:00Z',
  },
  {
    id: 'app-stripe-backend',
    company: 'Stripe',
    jobTitle: 'Backend Systems Engineer Intern',
    role: 'Backend Systems Engineer Intern',
    jobDescription:
      'Work on financial infrastructure that powers global internet commerce. Build low-latency APIs in Ruby, Go, or Java. Emphasize correctness, fault tolerance, transaction isolation, and security at scale.',
    applicationUrl: 'https://stripe.com/jobs/university',
    companyWebsite: 'https://stripe.com',
    location: 'San Francisco, CA',
    workMode: 'Hybrid',
    applicationDate: '2026-09-22',
    deadline: '2026-11-05',
    interviewDate: '2026-10-29',
    followUpDate: '2026-10-26',
    followUpCompleted: false,
    status: 'Interview',
    priority: 'High',
    source: 'Referral',
    salary: '$62 / hr + housing',
    currency: 'USD',
    notes:
      'Completed HackerRank challenge with 100% test pass. Virtual onsite (pair programming on API idempotency & concurrency) booked for Oct 29.',
    timeline: [
      {
        id: 't-s-1',
        type: 'created',
        title: 'Referred by University Alumni',
        description: 'Direct referral submitted to Stripe University Recruiting team.',
        timestamp: '2026-09-22T11:45:00Z',
      },
      {
        id: 't-s-2',
        type: 'status_change',
        title: 'Coding Assessment 100% Score',
        description: 'Completed automated rate limiter and transaction pipeline challenge.',
        timestamp: '2026-10-02T18:00:00Z',
      },
      {
        id: 't-s-3',
        type: 'interview_scheduled',
        title: 'Virtual Onsite Pairing Interview',
        description: 'Scheduled with Staff Systems Engineer for Oct 29.',
        timestamp: '2026-10-14T08:20:00Z',
      },
    ],
    createdAt: '2026-09-22T11:45:00Z',
    updatedAt: '2026-10-14T08:20:00Z',
  },
  {
    id: 'app-microsoft-frontend',
    company: 'Microsoft',
    jobTitle: 'Frontend Engineer Intern (Web Experiences)',
    role: 'Frontend Engineer Intern (Web Experiences)',
    jobDescription:
      'Design and implement accessible, high-performance web applications using TypeScript, React, and Fluent UI. Collaborate with designers, accessibility engineers, and cloud backends.',
    applicationUrl: 'https://careers.microsoft.com/students/us/en',
    companyWebsite: 'https://microsoft.com',
    location: 'Redmond, WA',
    workMode: 'Hybrid',
    applicationDate: '2026-10-02',
    deadline: '2026-10-31',
    followUpDate: '2026-10-23',
    followUpCompleted: false,
    status: 'Applied',
    priority: 'Medium',
    source: 'Company Website',
    salary: '$52 / hr + relocation',
    currency: 'USD',
    notes: 'Submitted via university recruiter link. Recruiter indicated initial portfolio and resume screening takes 2-3 weeks.',
    timeline: [
      {
        id: 't-m-1',
        type: 'created',
        title: 'Application Logged',
        description: 'Applied for Microsoft Office 365 Core Web Experiences team.',
        timestamp: '2026-10-02T16:10:00Z',
      },
    ],
    createdAt: '2026-10-02T16:10:00Z',
    updatedAt: '2026-10-02T16:10:00Z',
  },
  {
    id: 'app-notion-fullstack',
    company: 'Notion',
    jobTitle: 'Fullstack Web Intern',
    role: 'Fullstack Web Intern',
    jobDescription:
      'Help craft the all-in-one workspace. Write rich client-side components in TypeScript and React, and optimize high-throughput PostgreSQL and SQLite sync pipelines for desktop and browser clients.',
    applicationUrl: 'https://www.notion.so/careers',
    companyWebsite: 'https://notion.so',
    location: 'San Francisco, CA',
    workMode: 'Hybrid',
    applicationDate: '2026-09-12',
    deadline: '2026-11-10',
    interviewDate: '2026-10-15',
    followUpDate: '2026-10-19',
    followUpCompleted: false,
    status: 'Interview',
    priority: 'High',
    source: 'Job Board',
    salary: '$55 / hr',
    currency: 'USD',
    notes: 'Product architecture chat with engineering manager went very smoothly. Waiting on feedback for final project presentation round.',
    timeline: [
      {
        id: 't-n-1',
        type: 'created',
        title: 'Direct Application Submitted',
        description: 'Submitted customized cover letter and link to real-time collaborative whiteboard project.',
        timestamp: '2026-09-12T13:00:00Z',
      },
      {
        id: 't-n-2',
        type: 'status_change',
        title: 'Interview Round 1 Completed',
        description: 'Architecture & state management deep dive on Oct 15.',
        timestamp: '2026-10-15T17:00:00Z',
      },
    ],
    createdAt: '2026-09-12T13:00:00Z',
    updatedAt: '2026-10-15T18:00:00Z',
  },
  {
    id: 'app-datadog-systems',
    company: 'Datadog',
    jobTitle: 'Distributed Systems & Observability Intern',
    role: 'Distributed Systems & Observability Intern',
    jobDescription:
      'Build real-time monitoring and telemetry collection agents that handle trillions of events daily. Low overhead code in Go, C++, or Rust. Linux internals and networking protocols.',
    applicationUrl: 'https://careers.datadoghq.com/early-career/',
    companyWebsite: 'https://datadoghq.com',
    location: 'New York, NY',
    workMode: 'Hybrid',
    applicationDate: '2026-09-05',
    deadline: '2026-10-20',
    status: 'Rejected',
    priority: 'Medium',
    source: 'Company Website',
    salary: '$54 / hr',
    currency: 'USD',
    notes: 'Reached final stage technical design interview. Position filled by an internal return intern. Recruiter encouraged re-applying for full-time new grad.',
    timeline: [
      {
        id: 't-d-1',
        type: 'created',
        title: 'Applied Online',
        description: 'Submitted application for NYC Engineering headquarters.',
        timestamp: '2026-09-05T09:30:00Z',
      },
      {
        id: 't-d-2',
        type: 'status_change',
        title: 'Status: Position Filled',
        description: 'Received feedback noting strong systems understanding; role given to returning intern.',
        timestamp: '2026-10-08T14:15:00Z',
      },
    ],
    createdAt: '2026-09-05T09:30:00Z',
    updatedAt: '2026-10-08T14:15:00Z',
  },
  {
    id: 'app-figma-web',
    company: 'Figma',
    jobTitle: 'Software Engineer Intern (Editor Core)',
    role: 'Software Engineer Intern (Editor Core)',
    jobDescription:
      'Work on the real-time collaborative canvas editor. Focus on WebAssembly, TypeScript, WebGL rendering, and multi-user operational transformation protocols.',
    applicationUrl: 'https://www.figma.com/careers/',
    companyWebsite: 'https://figma.com',
    location: 'San Francisco, CA',
    workMode: 'On-site',
    applicationDate: '2026-10-05',
    deadline: '2026-11-15',
    followUpDate: '2026-10-27',
    followUpCompleted: false,
    status: 'Interested',
    priority: 'High',
    source: 'LinkedIn',
    salary: '$60 / hr',
    currency: 'USD',
    notes: 'Polishing portfolio demo with WebGL shader experiment before submitting referral link from college lab mentor.',
    timeline: [
      {
        id: 't-f-1',
        type: 'created',
        title: 'Added to Opportunity Tracker',
        description: 'Targeting Editor Core and Multiplayer syncing teams.',
        timestamp: '2026-10-05T12:00:00Z',
      },
    ],
    createdAt: '2026-10-05T12:00:00Z',
    updatedAt: '2026-10-05T12:00:00Z',
  },
  {
    id: 'app-adobe-creative',
    company: 'Adobe',
    jobTitle: 'Creative Cloud Web Application Intern',
    role: 'Creative Cloud Web Application Intern',
    jobDescription:
      'Build browser-based creative tools using modern React, WebAssembly, and cloud backends. Deliver high-performance image manipulation and user interface experiences.',
    applicationUrl: 'https://adobe.com/careers/university',
    companyWebsite: 'https://adobe.com',
    location: 'San Jose, CA',
    workMode: 'Remote',
    applicationDate: '2026-09-28',
    deadline: '2026-10-30',
    followUpDate: '2026-10-25',
    followUpCompleted: false,
    status: 'Applied',
    priority: 'Low',
    source: 'Job Board',
    salary: '$48 / hr',
    currency: 'USD',
    notes: 'Application confirmation email received. Automated status says Under Review by hiring manager.',
    timeline: [
      {
        id: 't-ad-1',
        type: 'created',
        title: 'Application Submitted',
        description: 'Applied via Adobe University Careers site.',
        timestamp: '2026-09-28T15:00:00Z',
      },
    ],
    createdAt: '2026-09-28T15:00:00Z',
    updatedAt: '2026-09-28T15:00:00Z',
  },
];

export const SEED_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'q-tech-1',
    category: 'Technical',
    learningPath: 'Technical',
    topic: 'React & Virtual DOM',
    subCategory: 'JavaScript & React',
    question: 'How does React’s Reconciliation algorithm work, and why are stable keys essential when rendering dynamic lists?',
    difficulty: 'Medium',
    status: 'Completed',
    saved: true,
    assessing: 'Evaluates your comprehension of the Virtual DOM, diffing tree heuristics, performance bottlenecks, and component lifecycle identity.',
    conceptRefresher:
      'React creates a lightweight JavaScript representation of the DOM tree (Virtual DOM). Comparing two arbitrary trees in general takes O(n³) operations. React implements an O(n) heuristic diffing algorithm based on two fundamental assumptions: 1) Two elements of different types will produce completely different trees (unmount and replace). 2) The developer can hint at which child elements are stable across renders with a key prop.',
    codeSnippet: {
      language: 'tsx',
      code: `// Anti-pattern: Using array index causes state misattribution on deletion/reorder
{items.map((item, index) => (
  <ListItem key={index} data={item} /> // ❌ Avoid if list changes
))}

// Recommended: Use unique, stable business identifier
{items.map(item => (
  <ListItem key={item.id} data={item} /> // ✅ Preserves internal input state
))}`,
    },
    answerStructure: [
      '1. Define Reconciliation and the purpose of the Virtual DOM.',
      '2. State the O(n) diffing assumptions (type comparison and key equality).',
      '3. Explain how keys maintain instance identity and internal state.',
      '4. Highlight real bugs caused by index-as-key (input focus loss, stale state).',
    ],
    exampleAnswer:
      'Reconciliation is the process through which React updates the actual DOM to match changes in the Virtual DOM. In a naive tree comparison, diffing is O(n³), which is too slow for 60fps web apps. React achieves O(n) performance using two assumptions: elements with different types generate different trees, and elements with stable keys represent the same conceptual entity across renders. When rendering dynamic lists, a stable key (like a database ID) tells React whether a list item was moved, inserted, or removed. If you use array indices, inserting an item at the beginning forces React to mutate every subsequent item instead of simply shifting the DOM nodes, which corrupts local input state and degrades performance.',
    followUpQuestions: [
      {
        question: 'What happens under the hood when a component’s root tag changes from <div> to <span>?',
        hint: 'React unmounts the entire old subtree, destroying all child component states, and mounts a fresh new tree.',
      },
      {
        question: 'How does React Fiber improve on the legacy stack reconciler?',
        hint: 'Fiber breaks reconciliation work into interruptible units, enabling priority scheduling and concurrent mode rendering.',
      },
    ],
    commonMistakes: [
      'Generating random keys (e.g. key={Math.random()}) which causes a full re-mount and DOM recreation on every single render.',
      'Claiming the Virtual DOM is always faster than native DOM manipulation rather than explaining it minimizes unnecessary reflows/repaints.',
    ],
    preparationTips: [
      'Explain the Virtual DOM diffing heuristic (O(n) instead of O(n³)).',
      'Describe how element type comparisons trigger remounting vs updating.',
      'Explain why index-based keys break state when items are reordered or filtered.',
    ],
    suggestedFramework: 'Concept -> Diffing Assumption -> Key Role -> Common Anti-pattern',
    notes: 'Emphasize that React assumes elements of different types will produce different trees, and stable keys give React identity across re-renders.',
  },
  {
    id: 'q-tech-2',
    category: 'Technical',
    learningPath: 'Technical',
    topic: 'JavaScript Engine & Runtime',
    subCategory: 'JavaScript & React',
    question: 'Walk through the JavaScript Event Loop, call stack, microtask queue, and macrotask queue with an execution trace example.',
    difficulty: 'Medium',
    status: 'Practicing',
    saved: true,
    assessing: 'Tests understanding of single-threaded non-blocking asynchronous execution, event loop phases, and task prioritization.',
    conceptRefresher:
      'JavaScript is single-threaded: it has one Call Stack that executes synchronous frames. Asynchronous Web APIs (timers, network fetches, DOM events) execute outside the V8 runtime and register callbacks into queues. Microtasks (Promise.then, queueMicrotask, MutationObserver) have higher priority than Macrotasks (setTimeout, setInterval, setImmediate). The event loop runs microtasks to completion whenever the call stack empties, BEFORE dequeuing the next macrotask.',
    codeSnippet: {
      language: 'javascript',
      code: `console.log('1'); // Synchronous frame

setTimeout(() => {
  console.log('2'); // Macrotask
}, 0);

Promise.resolve().then(() => {
  console.log('3'); // Microtask
});

console.log('4'); // Synchronous frame

// Execution Output: 1 -> 4 -> 3 -> 2`,
    },
    answerStructure: [
      '1. Overview: Single-threaded JS runtime + asynchronous host environment.',
      '2. Define the Call Stack, Web APIs, Microtask Queue, and Macrotask Queue.',
      '3. Step-by-step trace of the sample code.',
      '4. Explain the rendering opportunity phase before macrotasks.',
    ],
    exampleAnswer:
      'JavaScript operates with a single execution thread and a call stack. Synchronous code runs sequentially on the stack. When an asynchronous operation like setTimeout or Promise runs, the background browser Web APIs handle the timer or resolution, and deposit the callbacks into two distinct queues: the microtask queue (Promises) and the macrotask queue (timers, I/O). The event loop constantly monitors the stack. When the stack is empty, it drains the microtask queue completely—including any microtasks queued by running microtasks—before dequeuing a single macrotask. In the classic snippet, 1 and 4 print synchronously; then the promise microtask prints 3; and finally the timeout macrotask prints 2.',
    followUpQuestions: [
      {
        question: 'What happens if a microtask recursively enqueues another microtask?',
        hint: 'It starves the event loop: the call stack never yields, the macrotask queue is never reached, and browser UI freezes (UI lockup).',
      },
      {
        question: 'Where does requestAnimationFrame fit into this sequence?',
        hint: 'It executes immediately before the browser renders the display frame, aligned with the monitor refresh cycle.',
      },
    ],
    commonMistakes: [
      'Thinking setTimeout(..., 0) runs immediately on the next line.',
      'Confusing the Node.js event loop phases (Timer, Poll, Check) with the browser W3C event loop specification.',
    ],
    preparationTips: [
      'Draw the call stack, Web APIs, Microtask Queue, and Task Queue.',
      'Clarify that microtasks run to exhaustion before the next macrotask is dequeued.',
      'Trace output order accurately with confidence.',
    ],
    suggestedFramework: 'Component Roles -> Priority Rules -> Trace Example -> Render Phase',
    notes: 'Output trace is 1, 4, 3, 2. Microtask queue clears before macrotask queue. UI renders between task iterations.',
  },
  {
    id: 'q-tech-3',
    category: 'Technical',
    learningPath: 'Technical',
    topic: 'Databases & Storage',
    subCategory: 'Databases & SQL',
    question: 'Compare SQL (Relational) and NoSQL (Document) databases. When would you select PostgreSQL over MongoDB?',
    difficulty: 'Medium',
    status: 'Practicing',
    saved: false,
    assessing: 'Evaluates architectural judgment, schema design trade-offs, transactional guarantees (ACID vs BASE), and scaling characteristics.',
    conceptRefresher:
      'Relational databases (PostgreSQL) enforce strict table schemas, foreign key integrity, and ACID guarantees (Atomicity, Consistency, Isolation, Durability). Document databases (MongoDB) store self-contained JSON/BSON documents, allowing polymorphic schemas and horizontal sharding by key. Postgres provides powerful relational joins, window functions, and JSONB indexing; MongoDB excels when documents are queried and updated as complete domain aggregates.',
    codeSnippet: {
      language: 'sql',
      code: `-- PostgreSQL: Enforced relational constraints with ACID transactions
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
INSERT INTO audit_log (sender, receiver, amount) VALUES (1, 2, 100);
COMMIT;`,
    },
    answerStructure: [
      '1. Core modeling: Tables & relations vs nested Document collections.',
      '2. Consistency guarantees: ACID vs Eventual consistency / BASE.',
      '3. Query patterns: Complex joins & reporting vs hierarchical read/writes.',
      '4. Concrete decision criteria for choosing PostgreSQL vs MongoDB.',
    ],
    exampleAnswer:
      'The choice between PostgreSQL and MongoDB hinges on data relationships, consistency requirements, and access patterns. I choose PostgreSQL when the domain requires strong consistency, complex relational joins, and strict schema enforcement—such as financial ledgers, inventory, and multi-tenant SaaS where foreign keys prevent orphaned records. I choose MongoDB when entities naturally form self-contained aggregates that are read and written together, such as user session logs, polymorphic product catalogs, or rapid mobile prototypes where schemas evolve frequently. Furthermore, modern PostgreSQL handles semi-structured data exceptionally well via JSONB columns, making it a great default choice.',
    followUpQuestions: [
      {
        question: 'How do you handle indexing in PostgreSQL JSONB fields?',
        hint: 'GIN (Generalized Inverted Index) allows efficient querying of nested keys and array elements inside JSONB.',
      },
      {
        question: 'What is the N+1 query problem, and how do you resolve it in relational schemas?',
        hint: 'Fetching a parent record and querying its children one-by-one in a loop; resolved using SQL JOINs or ORM eager-loading (e.g. include / prefetch).',
      },
    ],
    commonMistakes: [
      'Claiming NoSQL databases cannot handle transactions (MongoDB added multi-document ACID transactions in v4.0).',
      'Believing NoSQL is always faster than SQL without considering indexing or query shapes.',
    ],
    preparationTips: [
      'Compare ACID transactions vs BASE consistency models.',
      'Explain structured schema migrations vs schema-less polymorphism.',
      'Cite real examples: payments (Postgres) vs unstructured analytics (MongoDB).',
    ],
    suggestedFramework: 'Core Data Modeling -> Consistency Guarantees -> Query Patterns -> Trade-off Matrix',
    notes: 'Postgres handles relational integrity, complex joins, and window functions seamlessly; Mongo excels at hierarchical documents with independent query patterns.',
  },
  {
    id: 'q-tech-4',
    category: 'Technical',
    learningPath: 'Technical',
    topic: 'API Design & Protocols',
    subCategory: 'Node.js & Backend',
    question: 'Contrast RESTful APIs with GraphQL. What problems does GraphQL solve, and what operational trade-offs does it introduce?',
    difficulty: 'Easy',
    status: 'Completed',
    saved: false,
    assessing: 'Evaluates network efficiency understanding, client-server decoupling, over-fetching/under-fetching, and backend caching trade-offs.',
    conceptRefresher:
      'REST utilizes standard HTTP methods (GET, POST, PUT, DELETE) on fixed resource URIs. GraphQL provides a single endpoint where clients request exact field schemas using a typed query language. GraphQL eliminates over-fetching (getting 50 user fields when only name is needed) and under-fetching (requiring 4 separate network waterfalls to render one screen). However, GraphQL complicates HTTP-level caching (URLs are no longer cache keys) and introduces recursive query denial-of-service risks.',
    codeSnippet: {
      language: 'graphql',
      code: `# GraphQL Client Query: Requesting exact fields in single roundtrip
query GetUserProfile($id: ID!) {
  user(id: $id) {
    name
    email
    applications(limit: 5) {
      company
      status
    }
  }
}`,
    },
    answerStructure: [
      '1. Define REST (resource-based URIs, standard HTTP verbs) and its limitations.',
      '2. Define GraphQL (single endpoint, client-defined schema selection).',
      '3. Core advantages: Solving over-fetching and multi-request waterfall latency.',
      '4. Operational costs: CDN caching difficulty, complex rate limiting, and N+1 resolver queries.',
    ],
    exampleAnswer:
      'REST organizes endpoints around resources with predictable CRUD semantics, leveraging standard HTTP status codes and transparent CDN edge caching. However, mobile and frontend clients often suffer from over-fetching unnecessary data or under-fetching, forcing multiple consecutive API roundtrips. GraphQL solves this by giving clients the ability to ask for exactly what they need in a single request. The trade-offs include losing trivial HTTP URL-based caching, handling complex query depth limits to prevent malicious deep queries, and mitigating N+1 database queries using tools like DataLoader to batch subfield resolvers.',
    followUpQuestions: [
      {
        question: 'How does DataLoader solve the N+1 problem in GraphQL resolvers?',
        hint: 'It batches all IDs requested across a single event-loop tick into one SQL WHERE id IN (...) query and memoizes results.',
      },
    ],
    commonMistakes: [
      'Saying GraphQL replaces databases; it is purely an application layer query language.',
      'Overlooking that REST is significantly easier to secure and cache at the CDN layer.',
    ],
    preparationTips: [
      'Discuss over-fetching and under-fetching with traditional REST endpoints.',
      'Explain single endpoint vs multiple resource-oriented URIs.',
      'Address GraphQL drawbacks: N+1 queries, complex caching, query complexity attacks.',
    ],
    suggestedFramework: 'Motivation -> Schema Contract -> Client Flexibility -> Server & Caching Complexity',
    notes: 'DataLoader pattern is essential in GraphQL to batch database requests and eliminate N+1 latency spikes.',
  },
  {
    id: 'q-tech-5',
    category: 'Technical',
    learningPath: 'Technical',
    topic: 'Data Structures & Algorithms',
    subCategory: 'Data Structures & Algorithms',
    question: 'What are the lookup, insertion, and collision handling characteristics of Hash Tables vs Balanced Binary Search Trees (e.g. Red-Black Tree)?',
    difficulty: 'Hard',
    status: 'Not Started',
    saved: true,
    assessing: 'Measures algorithmic rigor, collision resolution mechanics, amortized vs worst-case bounds, and memory layout awareness.',
    conceptRefresher:
      'Hash tables map keys to bucket indices using a hash function, delivering O(1) amortized lookup and insertion. Collisions are handled via separate chaining (linked list / dynamic array at each bucket) or open addressing (linear/quadratic probing). When load factor exceeds a threshold (typically 0.75), resizing requires O(n) re-hashing. Balanced BSTs (Red-Black, AVL) guarantee strict O(log n) worst-case time for search, insertion, and deletion, while maintaining ordered elements for range queries (finding all keys between X and Y).',
    codeSnippet: {
      language: 'typescript',
      code: `// Hash Table: O(1) average lookup, unordered
const userMap = new Map<string, User>();
userMap.set('alex', alexObj); // O(1)

// Balanced BST: O(log n) lookup, preserves sorted ordering
// Range query: find users where score between 80 and 95 in O(log n + k)`,
    },
    answerStructure: [
      '1. Compare time complexity: Hash table O(1) average vs BST guaranteed O(log n).',
      '2. Collision mechanisms: Chaining vs Open Addressing.',
      '3. Memory & cache locality trade-offs.',
      '4. Practical use cases: Point lookups vs sorted range scans / prefix matching.',
    ],
    exampleAnswer:
      'A Hash Table offers O(1) average-case time complexity for search, insertion, and deletion by computing key hashes directly into an array index. However, its worst-case is O(n) if collisions degrade into a linked list, or when resizing the underlying table. Collision resolution is achieved either by chaining or open addressing with probing. In contrast, a Balanced Binary Search Tree (like a Red-Black Tree) guarantees O(log n) time complexity even in the worst case, and naturally keeps keys sorted. Thus, while hash tables are superior for fast point lookups, BSTs are chosen when in-order traversal, floor/ceiling queries, or range scans are required.',
    followUpQuestions: [
      {
        question: 'Why did Java 8 modify HashMap from a pure linked-list chaining to a Red-Black tree inside buckets?',
        hint: 'When a bucket exceeds 8 entries, it converts from a linked list O(k) to a Red-Black tree O(log k) to defend against hash collision DoS attacks.',
      },
    ],
    commonMistakes: [
      'Claiming hash tables are strictly O(1) without stating that it is an amortized average bound.',
      'Forgetting that hash tables have no concept of ordering or range queries.',
    ],
    preparationTips: [
      'Hash Table average case: O(1) time complexity; worst case O(n) under heavy collisions.',
      'Collision resolution methods: Chaining with linked lists/trees vs Open Addressing.',
      'BST lookup: Guaranteed O(log n); preserves sorted in-order traversal.',
    ],
    suggestedFramework: 'Lookup Bounds -> Collision Handling -> Memory Allocation -> Range Query Suitability',
    notes: 'Range queries and sorted traversals are impossible in hash tables without O(n log n) sorting.',
  },
  {
    id: 'q-tech-6',
    category: 'Technical',
    learningPath: 'Technical',
    topic: 'Node.js & Backend Architecture',
    subCategory: 'Node.js & Backend',
    question: 'How do Node.js Streams and Backpressure prevent memory exhaustion when transferring multi-gigabyte files over HTTP?',
    difficulty: 'Hard',
    status: 'Practicing',
    saved: true,
    assessing: 'Evaluates asynchronous I/O understanding, memory buffer limitations, stream pipeline handling, and backpressure mechanisms.',
    conceptRefresher:
      'Loading a large file with fs.readFile buffers the entire payload into RAM, quickly exceeding the V8 heap limit (~1.4GB default) and causing process crashes. Node.js Streams process data piece-by-piece in small chunks (default 64KB for buffers). Backpressure occurs when a readable stream produces data faster than a writable stream (like a slow mobile network connection) can consume it. The writable stream signals the readable stream to pause until its internal buffer drains.',
    codeSnippet: {
      language: 'typescript',
      code: `import fs from 'fs';
import http from 'http';
import { pipeline } from 'stream/promises';

// Recommended: Streaming with backpressure management
http.createServer(async (req, res) => {
  const readStream = fs.createReadStream('./huge-dataset.csv');
  // pipeline handles auto-cleanup, error propagation, and backpressure
  await pipeline(readStream, res);
});`,
    },
    answerStructure: [
      '1. Identify the fatal flaw of buffering entire files in memory.',
      '2. Define the four stream types (Readable, Writable, Duplex, Transform).',
      '3. Explain how chunking keeps memory usage constant (O(1) memory).',
      '4. Detail backpressure: pause(), drain event, and pipeline() utility.',
    ],
    exampleAnswer:
      'Attempting to read a multi-gigabyte file into memory with standard read methods allocates a contiguous buffer in the Node.js process heap, triggering an Out of Memory crash. Streams solve this by dividing the payload into manageable chunks, passing them through memory buffers of typically 64KB. Backpressure is the essential flow-control mechanism: when the writable consumer cannot keep up with the incoming readable stream rate, its buffer fills up and write() returns false. This signals the readable stream to pause reading from the source. Once the buffer drains, a drain event triggers the readable stream to resume, guaranteeing constant memory consumption regardless of file size.',
    followUpQuestions: [
      {
        question: 'Why should you prefer pipeline() over stream.pipe() in modern Node.js?',
        hint: 'stream.pipe() does not properly forward errors or close streams on premature client aborts, causing file descriptor leaks. pipeline() handles cleanup safely.',
      },
    ],
    commonMistakes: [
      'Thinking streams make disk reads faster; they don’t speed up disk speeds, they keep memory footprint small and constant.',
    ],
    preparationTips: [
      'Explain the difference between buffering and streaming.',
      'Describe the 4 stream types.',
      'Walk through how stream.pipeline manages error handling and backpressure.',
    ],
    suggestedFramework: 'Problem -> Stream Chunking -> Backpressure Mechanism -> Best Practice Utility',
    notes: 'Always recommend stream/promises pipeline() over stream.pipe() for production code.',
  },
  {
    id: 'q-beh-1',
    category: 'HR & Behavioral',
    learningPath: 'HR & Behavioral',
    topic: 'Introduction & Self-Presentation',
    subCategory: 'Behavioral STAR',
    question: '“Tell me about yourself.” Walk through your academic background, technical journey, and what drives you.',
    difficulty: 'Easy',
    status: 'Completed',
    saved: true,
    assessing: 'Assesses communication clarity, enthusiasm, career trajectory alignment, and the ability to synthesize experience concisely in under 2 minutes.',
    conceptRefresher:
      'The "Tell Me About Yourself" question is the opening anchor of nearly every interview. It is NOT an invitation to recite your chronological resume line-by-line. Instead, use the Present-Past-Future framework: Present (who you are today, current studies and primary skills), Past (a pivotal project or experience that sparked your technical curiosity and demonstrated ability), and Future (why this specific company and role represents the natural next step).',
    answerStructure: [
      '1. Present (30s): Current student status, core specialization, and recent technical focus.',
      '2. Past (45s): 1-2 impactful projects or internships demonstrating real problem-solving.',
      '3. Future (30s): Why this company’s engineering culture excites you and what you look forward to contributing.',
    ],
    exampleAnswer:
      '“I’m a junior studying Computer Science at UC Berkeley, with a strong focus on distributed backend systems and modern web architecture. Over the past year, I’ve worked deeply with TypeScript, React, Node.js, and PostgreSQL. Most recently, I built a real-time collaborative application that solved synchronization lag for student study groups using WebSockets and conflict-free data types, which reached over 400 active monthly student users. What drew me to your team is your work on high-throughput cloud infrastructure: I want to contribute to systems operating at scale where reliability and low latency are first-class engineering priorities.”',
    followUpQuestions: [
      {
        question: 'What was the single most difficult technical hurdle in that collaborative project?',
        hint: 'Be ready to discuss a concrete concurrency edge-case, network reconnect logic, or database indexing lesson.',
      },
    ],
    commonMistakes: [
      'Reciting elementary school history or hobbies unrelated to technology.',
      'Talking for over 3 minutes without pause or clear milestones.',
      'Sounding like a generic script with no mention of why this specific company matters.',
    ],
    preparationTips: [
      'Keep delivery time between 90 and 120 seconds.',
      'Follow Present -> Past -> Future structure.',
      'Anchor on 1 flagship technical project with real measurable results.',
    ],
    suggestedFramework: 'Present -> Past Impact -> Future Alignment',
    notes: 'Keep tone conversational, authentic, and forward-looking. Avoid reciting bullet points from the printed resume.',
  },
  {
    id: 'q-beh-2',
    category: 'HR & Behavioral',
    learningPath: 'HR & Behavioral',
    topic: 'Conflict Resolution & Teamwork',
    subCategory: 'Behavioral STAR',
    question: 'Describe a situation where you had a strong disagreement with a teammate on a technical decision. How did you resolve it?',
    difficulty: 'Medium',
    status: 'Practicing',
    saved: true,
    assessing: 'Evaluates emotional intelligence, data-driven collaboration, ego detachment, and constructive conflict resolution under deadline pressure.',
    conceptRefresher:
      'Engineering teams constantly disagree on libraries, architectures, and database models. Interviewers want to see that you do not take disagreements personally, do not resort to shouting or passive aggression, and instead rely on objective data, small prototypes (benchmarks), and team alignment.',
    answerStructure: [
      '1. Situation: Context of the project, deadline, and the specific technical debate.',
      '2. Task: The shared goal that both teammates wanted to achieve.',
      '3. Action: Proposing an objective spike/benchmark, discussing pros/cons with empathy.',
      '4. Result: Selected outcome, lessons learned, and strong remaining working relationship.',
    ],
    exampleAnswer:
      '“During a semester capstone project building a microservices-based campus marketplace, my peer wanted to use MongoDB for rapid schema flexibility, while I advocated for PostgreSQL because our checkout system required atomic transactions and strict foreign key integrity. Rather than debating abstract opinions, I suggested a 1-day spike: we wrote the transaction flow for an order with concurrent stock reservation in both. We found that Postgres prevented race conditions out of the box with row-level locks, whereas MongoDB required extra application-level idempotency handling that added unnecessary complexity given our 3-week deadline. My teammate agreed with the data, we implemented Postgres, and we launched with zero double-sell incidents. We both gained mutual respect and delivered an A-grade project.”',
    followUpQuestions: [
      {
        question: 'What would you have done if your teammate still insisted on MongoDB despite the spike?',
        hint: 'Mention escalating respectfully to a tech lead or agreeing to disagree while committing 100% to making their chosen solution succeed.',
      },
    ],
    commonMistakes: [
      'Portraying the teammate as incompetent or malicious.',
      'Claiming you never have disagreements (suggests lack of real collaborative experience).',
    ],
    preparationTips: [
      'Use the STAR method rigorously.',
      'Highlight testing and objective metrics over ego.',
      'Focus on the positive relationship after resolution.',
    ],
    suggestedFramework: 'Situation -> Task -> Objective Action (Benchmarking) -> Positive Team Outcome',
    notes: 'The best resolution relies on evidence and prototypes, not arguing who has more seniority.',
  },
  {
    id: 'q-beh-3',
    category: 'HR & Behavioral',
    learningPath: 'HR & Behavioral',
    topic: 'Handling Failure & Growth',
    subCategory: 'Behavioral STAR',
    question: 'Tell me about a time you made a significant mistake or a project failed. What happened and what did you learn?',
    difficulty: 'Medium',
    status: 'Not Started',
    saved: false,
    assessing: 'Checks accountability, resilience, humility, root-cause analysis ability, and concrete process improvements.',
    conceptRefresher:
      'Never choose a fake failure like "I worked too hard." Genuine engineers make mistakes: dropping a test database, introducing an uncaught regression, or missing a sprint estimation. Interviewers check whether you take ownership immediately, communicate transparently, and implement safeguards so the failure never recurs.',
    answerStructure: [
      '1. Situation: Project context and the honest mistake made.',
      '2. Action: Immediate mitigation, transparent communication with team/users.',
      '3. Root Cause Analysis: Why did the safeguard fail?',
      '4. Preventative Result: The automated check, CI/CD lint, or test added permanently.',
    ],
    exampleAnswer:
      '“During my previous summer project, I pushed an unindexed database query into our staging environment right before a student demo. The query performed a full table scan across 80,000 records, maxing out CPU utilization and bringing down the staging API. As soon as alerts fired, I took immediate ownership in Slack, rolled back the commit, and restored the service within 10 minutes. Afterwards, I conducted a blameless post-mortem. I added an automated query linter in our CI pipeline and a pre-commit hook that warns about missing indexes on foreign keys. The failure taught me the critical importance of automated observability and never assuming local sample data scales linearly to staging.”',
    followUpQuestions: [
      {
        question: 'How did your team lead react when you reported the incident?',
        hint: 'Highlight that prompt, transparent communication built trust and facilitated rapid rollback.',
      },
    ],
    commonMistakes: [
      'Blaming external factors, bad documentation, or fellow students.',
      'Choosing a trivial mistake with no real stakes.',
    ],
    preparationTips: [
      'Acknowledge ownership without defensiveness.',
      'Detail the immediate containment step.',
      'Show the long-term automated preventative measure implemented.',
    ],
    suggestedFramework: 'Mistake -> Immediate Ownership -> Root Cause Analysis -> Permanent Safeguard',
    notes: 'A strong engineer is defined not by never failing, but by never making the same mistake twice.',
  },
  {
    id: 'q-role-1',
    category: 'Role-Specific',
    learningPath: 'Role-Specific',
    topic: 'Frontend Performance & Core Web Vitals',
    subCategory: 'Frontend & UI Engineering',
    question: 'How do you diagnose and optimize slow web applications? Explain Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS).',
    difficulty: 'Medium',
    status: 'Completed',
    saved: false,
    assessing: 'Tests knowledge of modern browser rendering pipeline, Core Web Vitals, asset optimization, code splitting, and layout stability.',
    conceptRefresher:
      'Largest Contentful Paint (LCP) measures perceived load speed by timing when the largest content element (hero image, heading text) is rendered on screen. Target is < 2.5s. Cumulative Layout Shift (CLS) measures visual stability by calculating the sum total of unexpected layout shifts during the page lifecycle. Target is < 0.1.',
    codeSnippet: {
      language: 'tsx',
      code: `// Prevent CLS: Always reserve aspect ratio space for dynamic media
<img
  src="/hero-banner.webp"
  alt="Dashboard Preview"
  width={1200}
  height={600}
  style={{ aspectRatio: '2 / 1', maxWidth: '100%', height: 'auto' }}
  loading="eager" // For LCP hero
  fetchPriority="high"
/>`,
    },
    answerStructure: [
      '1. Define Core Web Vitals (LCP, CLS, INP).',
      '2. Diagnosing tools: Chrome DevTools Lighthouse, Performance Profiler.',
      '3. LCP optimizations: modern image formats (WebP/AVIF), CDN caching, preloading.',
      '4. CLS optimizations: explicit width/height dimensions, font-display: swap with fallback matching.',
    ],
    exampleAnswer:
      'To diagnose frontend bottlenecks, I start by auditing with Chrome DevTools Performance Profiler and Lighthouse to establish baseline Core Web Vitals. For LCP, which targets under 2.5 seconds, I ensure the primary hero image or heading is preloaded via <link rel="preload">, served in modern WebP/AVIF formats from a CDN, and render-blocking scripts are deferred. For CLS, which should stay below 0.1, I always specify explicit width and height dimensions or CSS aspect-ratio on images and ad slots so the browser reserves layout space before download completes. I also avoid injecting DOM elements above existing content without user interaction.',
    followUpQuestions: [
      {
        question: 'What is Interaction to Next Paint (INP) and how is it optimized?',
        hint: 'INP replaced FID in 2024; it measures page responsiveness to user clicks/taps. Optimized by breaking long tasks with scheduler.yield() or setTimeout.',
      },
    ],
    commonMistakes: [
      'Focusing exclusively on bundle minification while ignoring huge unoptimized images that account for 80% of page weight.',
    ],
    preparationTips: [
      'State target threshold numbers (< 2.5s for LCP, < 0.1 for CLS).',
      'Explain practical code implementations (aspect ratio, preloading).',
    ],
    suggestedFramework: 'Metrics Definition -> Profiling Tools -> Asset & Network Fixes -> Layout Stability Fixes',
    notes: 'Knowing Core Web Vitals targets demonstrates production web engineering experience.',
  },
  {
    id: 'q-role-2',
    category: 'Role-Specific',
    learningPath: 'Role-Specific',
    topic: 'Backend Security & Authentication',
    subCategory: 'Node.js & Backend',
    question: 'How should you securely store user passwords, and what are the security trade-offs between JWTs in localStorage vs HttpOnly Cookies?',
    difficulty: 'Medium',
    status: 'Practicing',
    saved: true,
    assessing: 'Evaluates web security fundamentals: hashing algorithms, salting, XSS vs CSRF attack vectors, and token revocation strategies.',
    conceptRefresher:
      'Passwords should NEVER be encrypted (two-way); they must be cryptographically hashed using memory-hard algorithms like Argon2id or bcrypt with random salts and adequate cost factors. For token storage: localStorage is vulnerable to Cross-Site Scripting (XSS), as any malicious script can read tokens. HttpOnly cookies cannot be read by JavaScript, protecting against XSS token theft, but require SameSite=Lax/Strict and CSRF tokens to protect against Cross-Site Request Forgery.',
    codeSnippet: {
      language: 'typescript',
      code: `// Secure Cookie configuration in Express
res.cookie('token', jwtToken, {
  httpOnly: true, // Prevents XSS JavaScript access
  secure: process.env.NODE_ENV === 'production', // Transmit only over HTTPS
  sameSite: 'lax', // Defends against CSRF attacks
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
});`,
    },
    answerStructure: [
      '1. Password hashing standards (Argon2 / bcrypt with automatic salting).',
      '2. Storing tokens in localStorage: prone to XSS theft.',
      '3. Storing tokens in HttpOnly Cookies: immune to XSS theft, needs CSRF protection.',
      '4. Recommended production pattern: short-lived access token in memory + HttpOnly refresh cookie.',
    ],
    exampleAnswer:
      'For password storage, we use one-way cryptographic hashing with Argon2id or bcrypt with an adaptive cost factor and a unique salt per user to defend against rainbow table attacks. For authentication tokens, storing JWTs in localStorage exposes the user to total credential theft if any third-party dependency introduces an XSS vulnerability. HttpOnly cookies are far more secure because browser JavaScript cannot access the cookie. The trade-off is vulnerability to CSRF, which is effectively countered by setting SameSite=Lax and validating anti-CSRF headers. In enterprise applications, the gold standard is storing short-lived access tokens (15 mins) in React memory, paired with a secure HttpOnly refresh token cookie.',
    followUpQuestions: [
      {
        question: 'Why are SHA-256 or MD5 completely unsuitable for password storage?',
        hint: 'They are designed for speed (calculating checksums); modern GPUs can calculate billions of SHA-256 hashes per second, making brute-force trivial.',
      },
    ],
    commonMistakes: [
      'Saying passwords are encrypted with AES instead of hashed.',
      'Assuming HTTPS alone protects tokens stored in localStorage.',
    ],
    preparationTips: [
      'Distinguish one-way hashing from two-way encryption.',
      'Articulate XSS vs CSRF trade-offs clearly.',
    ],
    suggestedFramework: 'Password Hashing Standards -> XSS Risk -> CSRF Mitigation -> Modern Dual-Token Pattern',
    notes: 'Distinguishing between XSS and CSRF token vulnerabilities is a classic senior engineering test.',
  },
];

export const SEED_LEARNING_RESOURCES: LearningResource[] = [
  {
    id: 'res-mdn-js',
    title: 'MDN Web Docs — JavaScript Language Reference',
    type: 'Documentation',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    topic: 'JavaScript & React',
    description: 'The authoritative, definitive reference for JavaScript syntax, event loop, closures, prototypes, and asynchronous APIs.',
    bookmarked: true,
    completed: true,
  },
  {
    id: 'res-react-docs',
    title: 'React Official Documentation (react.dev)',
    type: 'Documentation',
    url: 'https://react.dev/learn',
    topic: 'JavaScript & React',
    description: 'Official interactive documentation detailing components, hooks, state preservation, reconciliation, and effects.',
    bookmarked: true,
    completed: true,
  },
  {
    id: 'res-neetcode-150',
    title: 'NeetCode 150 — Curated LeetCode Problem Roadmap',
    type: 'Practice Problems',
    url: 'https://neetcode.io/practice',
    topic: 'Data Structures & Algorithms',
    description: 'Structured 150-question roadmap organized into arrays, two-pointers, trees, graphs, and dynamic programming.',
    bookmarked: true,
    completed: false,
  },
  {
    id: 'res-system-design-primer',
    title: 'The System Design Primer (Donne Martin)',
    type: 'Article / Guide',
    url: 'https://github.com/donnemartin/system-design-primer',
    topic: 'Node.js & Backend',
    description: 'Comprehensive open-source guide to designing large-scale distributed systems, load balancing, caching, and database sharding.',
    bookmarked: true,
    completed: false,
  },
  {
    id: 'res-postgres-tutorial',
    title: 'PostgreSQL Official Documentation & Tutorial',
    type: 'Documentation',
    url: 'https://www.postgresql.org/docs/current/tutorial.html',
    topic: 'Databases & SQL',
    description: 'Core relational database concepts, ACID transactions, window functions, and indexing strategies.',
    bookmarked: false,
    completed: true,
  },
  {
    id: 'res-node-best-practices',
    title: 'Node.js Production Best Practices & Architecture',
    type: 'Article / Guide',
    url: 'https://github.com/goldbergyoni/nodebestpractices',
    topic: 'Node.js & Backend',
    description: 'Comprehensive guidelines covering async error handling, streams backpressure, Dockerization, and security hygiene.',
    bookmarked: false,
    completed: false,
  },
  {
    id: 'res-web-dev-vitals',
    title: 'Google web.dev — Core Web Vitals Guide',
    type: 'Article / Guide',
    url: 'https://web.dev/explore/metrics',
    topic: 'Frontend & UI Engineering',
    description: 'Detailed breakdowns of LCP, CLS, INP metrics, real user monitoring, and rendering performance profiling.',
    bookmarked: false,
    completed: true,
  },
  {
    id: 'res-harvard-cs50',
    title: 'Harvard CS50 — Introduction to Computer Science',
    type: 'Video Tutorial',
    url: 'https://cs50.harvard.edu/x/',
    topic: 'Data Structures & Algorithms',
    description: 'World-renowned university computer science fundamentals covering memory management, algorithms, and data structures.',
    bookmarked: true,
    completed: false,
  },
];

export const SEED_STUDY_PLAN: DayStudyPlan[] = [
  {
    day: 1,
    title: 'Day 1: JavaScript Runtime & Event Loop',
    focus: 'Core JS engine execution, call stack, microtasks vs macrotasks, and closures.',
    description: 'Master how the single-threaded V8 engine handles asynchronous promises and timers. Practice tracing execution order.',
    targetTopics: ['JavaScript & React', 'Language Fundamentals'],
    recommendedQuestionIds: ['q-tech-2'],
    completed: true,
  },
  {
    day: 2,
    title: 'Day 2: React Reconciliation & Performance',
    focus: 'Virtual DOM, diffing heuristics, keys, and preventing unnecessary re-renders.',
    description: 'Review how React Fiber schedules updates, why keys matter in dynamic lists, and when to use useMemo / useCallback.',
    targetTopics: ['JavaScript & React', 'Frontend & UI Engineering'],
    recommendedQuestionIds: ['q-tech-1', 'q-role-1'],
    completed: true,
  },
  {
    day: 3,
    title: 'Day 3: Relational vs Document Databases',
    focus: 'ACID guarantees, SQL joins, schema design, and MongoDB vs Postgres trade-offs.',
    description: 'Deep dive into database storage engines, index types (B-tree, GIN), and transaction isolation levels.',
    targetTopics: ['Databases & SQL'],
    recommendedQuestionIds: ['q-tech-3'],
    completed: false,
  },
  {
    day: 4,
    title: 'Day 4: Backend API Architecture & Security',
    focus: 'REST vs GraphQL, Node.js streams, backpressure, and authentication cookies.',
    description: 'Understand high-throughput I/O handling, avoiding heap memory crashes, and defending against XSS and CSRF attacks.',
    targetTopics: ['Node.js & Backend'],
    recommendedQuestionIds: ['q-tech-4', 'q-tech-6', 'q-role-2'],
    completed: false,
  },
  {
    day: 5,
    title: 'Day 5: Fundamental Data Structures & Algorithms',
    focus: 'Hash tables, balanced BSTs, collision resolution, and Big-O time/space complexity.',
    description: 'Review amortized vs guaranteed worst-case bounds, tree traversals, and range search mechanics.',
    targetTopics: ['Data Structures & Algorithms'],
    recommendedQuestionIds: ['q-tech-5'],
    completed: false,
  },
  {
    day: 6,
    title: 'Day 6: Behavioral Excellence with the STAR Method',
    focus: 'Tell me about yourself, technical disagreements, failure, and leadership.',
    description: 'Structure 3 flagship project stories using Situation, Task, Action, and Measurable Result.',
    targetTopics: ['Behavioral STAR'],
    recommendedQuestionIds: ['q-beh-1', 'q-beh-2', 'q-beh-3'],
    completed: false,
  },
  {
    day: 7,
    title: 'Day 7: Full Mock Simulation & Company Review',
    focus: 'Timed question practice, confidence self-rating, and question review.',
    description: 'Simulate a real 45-minute technical and behavioral interview round using the interactive mock practice mode.',
    targetTopics: ['Comprehensive Simulation'],
    recommendedQuestionIds: ['q-tech-1', 'q-tech-2', 'q-beh-1', 'q-role-1'],
    completed: false,
  },
];

export const SAMPLE_JOB_DESCRIPTION = `Software Engineering Intern, Summer 2027

About the Team:
We build scalable, distributed cloud infrastructure powering real-time collaboration for millions of global developers. As a Software Engineering Intern, you will partner closely with staff engineers and product designers to design, test, and ship mission-critical features.

Key Responsibilities:
• Build resilient, low-latency microservices and RESTful APIs using TypeScript, Node.js, and Express.
• Develop responsive, accessible web user interfaces with React, Next.js, and modern CSS frameworks.
• Optimize relational queries and schema migrations in PostgreSQL, utilizing Redis caching for sub-10ms response times.
• Participate in design reviews, write unit and end-to-end integration tests using Jest and Playwright.
• Containerize services using Docker and collaborate via Git, GitHub Actions CI/CD pipelines, and AWS cloud services.

Requirements:
• Currently pursuing a B.S. or M.S. in Computer Science or related engineering discipline.
• Demonstrated proficiency in JavaScript, TypeScript, React, and Node.js.
• Strong foundation in Data Structures, Algorithms, Object-Oriented Design, and System Architecture.
• Experience with relational databases (PostgreSQL or MySQL) and REST API principles.
• Familiarity with Git, Linux terminal environments, Docker, and agile development methodologies.
• Excellent problem-solving skills, collaborative attitude, and clear technical communication.`;

export const SAMPLE_RESUME_TEXT = `Alex Johnson
alex.johnson@demo.college.edu • (555) 234-5678 • San Francisco, CA
GitHub: github.com/alexjohnson-demo • Portfolio: alexjohnson-portfolio.demo

EDUCATION
University of California, Berkeley — B.S. in Computer Science, GPA: 3.82
Expected Graduation: May 2027
Relevant Coursework: Data Structures & Algorithms, Operating Systems, Database Systems, Computer Networks, Software Engineering Principles.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript (ES6+), Python, Go, SQL (PostgreSQL), HTML5, CSS3
Frameworks & Libraries: React, Node.js, Express, Next.js, Tailwind CSS, Jest
Tools & Infrastructure: Docker, Git, GitHub Actions, Redis, Postman, Linux/Unix, AWS (S3, Lambda)
Concepts: RESTful API Design, Object-Oriented Programming, CI/CD, Agile/Scrum

EXPERIENCE
Full-Stack Engineering Fellow | Open-Source Campus Labs
June 2026 – August 2026 | Berkeley, CA
• Developed a real-time collaborative classroom whiteboard used by 400+ weekly university students using React, TypeScript, and WebSockets.
• Engineered backend microservices in Node.js and Express with PostgreSQL, reducing database query latency by 32% through indexing.
• Implemented Redis caching for active user sessions, decreasing API latency from 45ms to 8ms under peak concurrent loads.
• Built automated CI/CD pipeline using GitHub Actions to execute Jest unit tests and Docker container builds on every pull request.

PROJECTS
Internly — Career & Application Management Platform
TypeScript, React, Tailwind CSS, Node.js, PostgreSQL
• Architected a responsive career tracker helping students manage internship applications across Kanban and Table views.
• Implemented keyword alignment analysis comparing candidate resumes against job descriptions with categorized skill feedback.
• Structured local caching algorithms and offline persistence, ensuring zero latency navigation across desktop and mobile.

Distributed Task Queue & Rate Limiter
Go, Redis, Docker, REST API
• Built a token-bucket rate limiter and asynchronous worker queue capable of processing 1,500 requests/second.
• Utilized Redis atomic primitives to ensure thread safety across distributed worker nodes without database race conditions.`;
