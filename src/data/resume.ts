// Content follows chaitanya_SE.pdf, reworded for the web. Projects live in src/content/work as case studies.

export const profile = {
  name: 'Chaitanya Sanapala',
  title: 'Software Engineer',
  location: 'Bangalore, India',
  email: 'schaitanya075@gmail.com',
  github: 'https://github.com/Chaitanya045',
  linkedin: 'https://www.linkedin.com/in/chaitanya-sanapala-390609241/',
  x: 'https://x.com/chrx_chaitanya',
  xHandle: '@chrx_chaitanya',
  // A web copy of the résumé without the phone number, generated from the job-search build script.
  resume: '/Chaitanya_Sanapala_Resume.pdf',
  statement: 'I build backend pipelines, and the tests that catch them breaking.',
  summary: 'I’m a software engineer at IronRod Health. I build GCP pipelines on Cloud Tasks and Vertex AI/Gemini, replaced LLM-based PDF extraction with a deterministic OpenCV pipeline, and built our Playwright framework from scratch. Before that I spent two and a half years automating tests at Cognizant, so I tend to look for how something will fail before it ships. Outside work I build coding agents, documentation hosting and API marketplace backends.',
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
      'Proposed architecture changes that helped cut a microservice’s latency to a fifth, and added retry logic across three microservices.',
      'Built a Playwright automation framework in TypeScript from scratch, replacing Puppeteer.',
      'Signed off feature releases: reviewed acceptance criteria and approved them for production.',
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
