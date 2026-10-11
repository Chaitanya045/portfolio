// Content mirrors chaitanya_SE.pdf. Projects live in src/content/work as case studies.

export const profile = {
  name: 'Chaitanya Sanapala',
  title: 'Software Engineer',
  location: 'Bangalore, India',
  email: 'schaitanya075@gmail.com',
  github: 'https://github.com/Chaitanya045',
  linkedin: 'https://www.linkedin.com/in/chaitanya-sanapala-390609241/',
  // A web copy of the résumé without the phone number, generated from the job-search build script.
  resume: '/Chaitanya_Sanapala_Resume.pdf',
  statement: 'Software engineer working across backend development, SaaS quality engineering and AI systems.',
  summary: 'I build reliable backend workflows and the tests that keep them honest: GCP pipelines with Cloud Tasks and Vertex AI/Gemini, an OpenCV-based PDF extraction pipeline, and a TypeScript/Playwright automation framework. Knowing the application and its data model well helps me catch failure scenarios before they ship. Outside work I build coding agents, documentation hosting and API marketplace backends.',
};

export interface Job {
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  highlights: string[];
  tech: string[];
}

export const experience: Job[] = [
  {
    company: 'IronRod Health',
    role: 'Software Engineer',
    location: 'Bangalore',
    start: 'Feb 2025',
    end: 'Present',
    highlights: [
      'Replaced nondeterministic LLM-based extraction of unstructured PDF data with a code-driven pipeline using PDF parsing and OpenCV.',
      'Built a Gemini/Vertex AI pipeline on GCP and moved HTTP triggers to Cloud Tasks queues, fixing failures under high traffic.',
      'Contributed architectural recommendations that helped cut a microservice’s latency to one-fifth, and implemented retry logic across three microservices.',
      'Built a Playwright automation framework in TypeScript from scratch, replacing Puppeteer.',
      'Owned feature-release validation, acceptance-criteria reviews and production-readiness approvals.',
    ],
    tech: ['TypeScript', 'OpenCV', 'Playwright', 'GCP', 'Cloud Tasks', 'Vertex AI', 'Gemini', 'Zod'],
  },
  {
    company: 'Cognizant',
    role: 'Programmer Analyst',
    location: 'Hyderabad',
    start: 'Aug 2022',
    end: 'Jan 2025',
    highlights: [
      'Automated functional, regression and API tests with Selenium, RestAssured and TestNG.',
      'Integrated smoke and regression suites into Jenkins CI/CD pipelines.',
      'Led feature testing across QA, staging and production environments.',
    ],
    tech: ['Java', 'Selenium', 'RestAssured', 'TestNG', 'Jenkins'],
  },
];

// Stable anchor for a job, e.g. "IronRod Health" -> "ironrod-health".
export const jobId = (company: string) => company.toLowerCase().replace(/[^a-z0-9]+/g, '-');
