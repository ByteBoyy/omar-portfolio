import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  ChevronRight,
  Download,
  Mail,
  Pause,
  Play,
  Volume2,
  X,
} from "lucide-react";
import {
  SiCelery,
  SiDeepgram,
  SiFastapi,
  SiGooglegemini,
  SiGooglecloud,
  SiKubernetes,
  SiLangchain,
  SiNextdotjs,
  SiN8N,
  SiOpencv,
  SiPostgresql,
  SiPydantic,
  SiPytorch,
  SiReact,
  SiRedis,
  SiTensorflow,
} from "react-icons/si";

const projects = [
  {
    id: "casepeer",
    title: "CasePeer",
    type: "Agentic legal automation",
    image: "/images/casepeer.jpg",
    summary: "A five-agent LangGraph pipeline for document intake, research, drafting, compliance, and controlled human approval.",
    impact: "Case processing time reduced by more than 60%",
    metrics: ["12+ intake steps reduced to 2 actions", "PostgreSQL checkpoints after every node", "Typed outputs with retry gates"],
    stack: ["LangGraph", "FastAPI", "PostgreSQL", "Gemini OCR", "Pydantic", "n8n"],
    problem: "Legal teams moved documents and metadata through disconnected screens, repeated manual checks, and inconsistent handoffs. The workflow needed automation without removing control from consequential legal decisions.",
    flow: ["Route uploaded documents", "Extract typed legal fields", "Retrieve relevant statutes", "Draft from approved templates", "Flag compliance exceptions", "Pause for human approval"],
    decisions: ["Used an explicit LangGraph execution graph for auditability", "Scoped tools per agent and enforced RBAC at the tool boundary", "Persisted state after every node so failed work can resume", "Escalated low-confidence extraction and compliance flags to people"],
  },
  {
    id: "bundleskills",
    title: "BundleSkills",
    type: "Multi-agent RAG production",
    image: "/images/bundleskills.jpg",
    summary: "Transforms structured lesson outlines into validated, instructor-ready content through six coordinated agents and four retrieval indexes.",
    impact: "Production time reduced from 3 to 5 days to under 20 minutes",
    metrics: ["90%+ first-pass validation", "Four Pinecone knowledge indexes", "Parallel Celery execution with Redis"],
    stack: ["LangGraph", "Celery", "Redis", "Pinecone", "Pydantic v2", "OpenAI"],
    problem: "Expert instructors created concise outlines, while teams spent days expanding them into long lesson plans. Scaling manually weakened consistency, turnaround time, and the ability to create tailored material.",
    flow: ["Parse the source outline", "Plan work with an orchestrator", "Retrieve curriculum evidence", "Generate modules concurrently", "Validate structure and pedagogy", "Diff revisions before delivery"],
    decisions: ["Separated curriculum, source, taxonomy, and reference knowledge", "Made schema validation a hard delivery gate", "Used asynchronous workers for independent module generation", "Retained human review while removing repetitive drafting"],
  },
  {
    id: "bitewise",
    title: "BiteWise",
    type: "Real-time voice agent",
    image: "/images/bitewise.jpg",
    summary: "A voice-first restaurant assistant that streams speech, reasoning, tool calls, and synthesized audio through an event-driven session architecture.",
    impact: "Typical responses around 1.5 seconds in lighter interactions",
    metrics: ["Continuous streaming STT", "Per-session event isolation", "Tool-aware response buffering"],
    stack: ["FastAPI", "WebSockets", "Deepgram", "OpenAI", "AsyncIO", "Web Audio"],
    problem: "A useful voice assistant has to understand live speech, decide when to call tools, keep conversation state isolated, and begin speaking before an entire answer has finished generating.",
    flow: ["Capture browser microphone audio", "Stream audio over WebSocket", "Transcribe with Deepgram", "Run LLM reasoning and restaurant tools", "Stream text into TTS", "Queue PCM audio in the browser"],
    decisions: ["Namespaced every event channel by conversation ID", "Streamed each stage to reduce time to first audio", "Returned structured UI data separately from voice responses", "Kept the orchestration honest: one stateful tool-using agent, not an unnecessary multi-agent graph"],
    audio: true,
  },
  {
    id: "parth",
    title: "Parth Operation",
    type: "AI product and backend platform",
    image: "/images/parth-operation.jpg",
    summary: "A full-stack operations and finance platform with role-aware AI tools across sales, procurement, fulfillment, invoicing, and payments.",
    impact: "AI embedded directly into operational workflows",
    metrics: ["Order-to-cash and procure-to-pay", "Role-filtered tool allowlists", "Persistent AI actions and state"],
    stack: ["FastAPI", "Next.js", "PostgreSQL", "AWS S3", "OpenAI", "Gemini"],
    problem: "Operations teams needed one system for commercial workflows, finance state, documents, reporting, and AI assistance rather than a chatbot sitting beside fragmented business tools.",
    flow: ["Import customer purchase orders", "Resolve clients and SKUs", "Create sales and supplier orders", "Track fulfillment", "Generate invoices", "Record and report payments"],
    decisions: ["Generated tool schemas from typed Python functions", "Filtered available tools by the signed-in user role", "Used Gemini for document extraction and GPT for operations reasoning", "Kept domain services authoritative over business state"],
  },
  {
    id: "convirza",
    title: "Convirza",
    type: "Production speech and NLP",
    image: "/images/convirza.jpg",
    summary: "A privacy-aware conversation analytics pipeline combining multiple ASR engines with trained NLP models for sentiment, outcomes, and lead scoring.",
    impact: "About 30% lower word error rate than the legacy transcription system",
    metrics: ["8 to 10% phone-audio WER", "About 90% sentiment accuracy", "40% lower compute cost through hybrid routing"],
    stack: ["PyTorch", "Whisper", "Deepgram", "AssemblyAI", "TorchServe", "GKE"],
    problem: "Millions of noisy, industry-specific calls needed transcription, privacy filtering, sentiment analysis, outcome classification, and useful scoring at a sustainable latency and cost.",
    flow: ["Normalize and segment phone audio", "Select the appropriate ASR engine", "Redact sensitive transcript data", "Run sentiment and outcome models", "Score calls and agent behavior", "Serve results through analytics APIs"],
    decisions: ["Routed between cloud and on-prem ASR based on latency, cost, and privacy", "Used LoRA adaptation for client-specific language", "Deployed models behind TorchServe on GKE", "Fed human corrections back into evaluation and retraining"],
  },
  {
    id: "identity",
    title: "Identity and Fraud Detection",
    type: "Production computer vision",
    image: "/images/identity-fraud.jpg",
    summary: "An end-to-end KYC pipeline for document segmentation, geometric correction, field extraction, OCR, and presentation-attack detection.",
    impact: "Sub-second end-to-end inference on a V100",
    metrics: ["About 0.98 segmentation IoU", "About 95% field-detection mAP", "Concurrent OCR and GPU inference"],
    stack: ["U-Net", "YOLOv5", "Mask R-CNN", "ResNet", "OpenCV", "FastAPI"],
    problem: "Identity images arrived at inconsistent angles and quality, while the system also had to detect altered photos, printed copies, and screen replays before returning structured fields.",
    flow: ["Segment the document", "Correct perspective", "Detect semantic fields", "Extract text with OCR", "Inspect the face region", "Combine fraud signals into a decision"],
    decisions: ["Used specialized models for geometry, fields, and fraud instead of one opaque model", "Overlapped external OCR with local CNN inference", "Managed PyTorch and TensorFlow GPU memory in one container", "Validated extracted values with NER and deterministic rules"],
  },
];

const projectLogos = {
  casepeer: [
    [SiFastapi, "FastAPI"],
    [SiPostgresql, "PostgreSQL"],
    [SiPydantic, "Pydantic"],
    [SiN8N, "n8n"],
  ],
  bundleskills: [
    [SiLangchain, "LangChain"],
    [SiCelery, "Celery"],
    [SiRedis, "Redis"],
    [SiPydantic, "Pydantic"],
  ],
  bitewise: [
    [SiDeepgram, "Deepgram"],
    [SiFastapi, "FastAPI"],
    [SiReact, "React"],
  ],
  parth: [
    [SiNextdotjs, "Next.js"],
    [SiFastapi, "FastAPI"],
    [SiPostgresql, "PostgreSQL"],
    [SiGooglegemini, "Gemini"],
  ],
  convirza: [
    [SiPytorch, "PyTorch"],
    [SiDeepgram, "Deepgram"],
    [SiGooglecloud, "Google Cloud"],
    [SiKubernetes, "Kubernetes"],
  ],
  identity: [
    [SiPytorch, "PyTorch"],
    [SiTensorflow, "TensorFlow"],
    [SiOpencv, "OpenCV"],
    [SiFastapi, "FastAPI"],
  ],
};

const capabilityGroups = [
  {
    title: "Agent systems",
    description: "Stateful workflows, controlled tool use, checkpoints, approval gates, and evaluation.",
    items: ["LangGraph", "LangChain", "LlamaIndex", "Tool calling", "Multi-agent workflows", "Human-in-the-loop", "LLM evaluation"],
  },
  {
    title: "Models and retrieval",
    description: "Grounded generation and model integration across hosted and self-managed stacks.",
    items: ["OpenAI", "Claude", "Gemini", "Llama", "Mistral", "RAG", "Pinecone", "FAISS", "Hybrid search", "Reranking", "LoRA"],
  },
  {
    title: "Voice and conversation",
    description: "Low-latency speech pipelines, live sessions, telephony, and conversation intelligence.",
    items: ["Deepgram", "Whisper", "AssemblyAI", "Twilio", "SignalWire", "Streaming STT / TTS", "WebSockets"],
  },
  {
    title: "Backend and product",
    description: "Typed APIs, asynchronous services, durable state, integrations, and AI-facing interfaces.",
    items: ["Python", "FastAPI", "Django", "Flask", "GraphQL", "REST", "AsyncIO", "Celery", "Redis", "React", "TypeScript", "Next.js"],
  },
  {
    title: "Data and infrastructure",
    description: "Production deployment from relational data and queues through cloud and GPU serving.",
    items: ["PostgreSQL", "MongoDB", "Neo4j", "Supabase", "Docker", "AWS", "GKE", "Azure", "GitHub Actions", "Nginx", "vLLM", "Ollama"],
  },
  {
    title: "Machine learning and vision",
    description: "Training and serving systems for language, document understanding, identity, and fraud.",
    items: ["PyTorch", "TensorFlow", "Hugging Face", "BERT", "YOLOv5", "U-Net", "Mask R-CNN", "OpenCV", "OCR", "spaCy"],
  },
];

const additionalProjects = [
  ["QuoteAI", "Gemini document understanding, Microsoft Graph ingestion, Redis queues, and browser-driven insurance quotation workflows."],
  ["CareMate", "NDIS evidence extraction and schema-driven DOCX report generation with persisted document history."],
  ["Real Estate AI", "Django, Celery, Redis, SignalWire, Gemini, and CRM automation supporting more than 500 leads per day."],
  ["Hybrid RAG", "FAISS semantic retrieval, optional BM25 boosting, PCA-compressed indexes, and OpenAI or local Ollama generation."],
  ["RAG Workbench", "A configurable Streamlit environment for comparing splitting, retrieval, compression, memory, and generation strategies."],
  ["Automation Systems", "Production workflows spanning recruitment, sales, documents, content, alerts, and human approval in n8n and Make."],
];

const roles = [
  ["2024 to present", "ML Engineer", "Turing", "LLM training data, agent benchmarks, evaluation harnesses, and hard coding datasets across more than ten projects."],
  ["2023 to present", "Senior AI/ML Engineer", "Solgenci", "Agentic products, RAG platforms, voice and document automation, backend systems, GPU infrastructure, and client delivery."],
  ["2021 to 2023", "Data Scientist", "Senarios", "Conversation analytics, EdTech generation, NLP training, diffusion fine-tuning, and scalable Python ML pipelines."],
  ["2019 to 2021", "Junior Data Scientist", "Machine Learning 1", "Document intelligence, KYC computer vision, fraud detection, OCR, edge AI, and production GPU deployment."],
];

function AudioDemo() {
  const [available, setAvailable] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    fetch("/audio/bitewise-demo.mp3", { method: "HEAD" })
      .then((response) => setAvailable(response.ok))
      .catch(() => setAvailable(false));
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !available) return;
    if (audio.paused) audio.play();
    else audio.pause();
  };

  return (
    <section className="audio-demo" aria-labelledby="audio-title">
      <div>
        <span className="detail-label">Voice demo</span>
        <h3 id="audio-title">Listen to one call</h3>
        <p>Hear the streaming turn-taking, restaurant tool call, and synthesized response as one product interaction.</p>
      </div>
      <div className={`audio-console ${available ? "is-ready" : "is-pending"}`}>
        <button type="button" onClick={toggle} disabled={!available} aria-label={playing ? "Pause demo" : "Play demo"}>
          {playing ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <div className="waveform" aria-hidden="true">{Array.from({ length: 28 }, (_, index) => <i key={index} style={{ height: `${20 + ((index * 17) % 55)}%` }} />)}</div>
        <Volume2 size={19} aria-hidden="true" />
        <span>{available ? "Demo call" : "Recording pending"}</span>
        <audio ref={audioRef} src="/audio/bitewise-demo.mp3" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
      </div>
    </section>
  );
}

function ProjectModal({ project, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <article className="modal" role="dialog" aria-modal="true" aria-labelledby={`${project.id}-title`}>
        <button ref={closeRef} className="modal-close" type="button" onClick={onClose} aria-label="Close case study"><X size={22} /></button>
        <div className="modal-hero">
          <span>{project.type}</span>
          <h2 id={`${project.id}-title`}>{project.title}</h2>
          <p>{project.summary}</p>
        </div>
        <img className="modal-diagram" src={project.image} alt={`${project.title} system architecture diagram`} />
        <div className="modal-impact">
          <span>Outcome</span>
          <strong>{project.impact}</strong>
          <div>{project.metrics.map((metric) => <p key={metric}><Check size={17} />{metric}</p>)}</div>
        </div>
        <div className="modal-columns">
          <section>
            <span className="detail-label">The problem</span>
            <h3>Why this system existed</h3>
            <p>{project.problem}</p>
          </section>
          <section>
            <span className="detail-label">Engineering decisions</span>
            <h3>How it stayed reliable</h3>
            <ul>{project.decisions.map((decision) => <li key={decision}>{decision}</li>)}</ul>
          </section>
        </div>
        <section className="flow-section">
          <span className="detail-label">Execution flow</span>
          <h3>From input to outcome</h3>
          <ol>{project.flow.map((step, index) => <li key={step}><b>{String(index + 1).padStart(2, "0")}</b><span>{step}</span></li>)}</ol>
        </section>
        {project.audio && <AudioDemo />}
        <div className="modal-stack">{project.stack.map((item) => <span key={item}>{item}</span>)}</div>
      </article>
    </div>,
    document.body,
  );
}

function App() {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div className="site-shell">
      <header className="site-nav">
        <a className="brand" href="#top" aria-label="Omar Ashraf home"><span>OA</span><b>Omar Ashraf</b></a>
        <nav aria-label="Primary navigation">
          <a href="#work">Projects</a>
          <a href="#capabilities">Capabilities</a>
          <a href="#experience">Experience</a>
        </nav>
        <a className="nav-contact" href="mailto:omermisc001@gmail.com">Email Omar</a>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="hero-kicker">Omar Ashraf · Senior AI/ML Engineer</p>
            <h1>Production AI, from agent logic to infrastructure.</h1>
            <p className="hero-intro">I build agentic products, voice systems, and retrieval pipelines—and the APIs, data services, and cloud infrastructure required to run them reliably.</p>
            <div className="hero-actions">
              <a href="#work">View projects <ArrowDown size={17} /></a>
              <a href="/Omar_Ashraf_AI_ML_Engineer_CV.pdf" download>Download résumé <Download size={17} /></a>
            </div>
          </div>
          <aside className="hero-brief" aria-label="Engineering profile">
            <div className="hero-brief-intro">
              <span>Engineering profile</span>
              <p>Six years taking AI systems from prototype through production across legal, education, voice, operations, and identity products.</p>
            </div>
            <dl>
              <div><dt>Primary focus</dt><dd>Agents, RAG, voice AI</dd></div>
              <div><dt>Engineering depth</dt><dd>Python, APIs, data, cloud</dd></div>
              <div><dt>Working style</dt><dd>Hands-on individual contributor</dd></div>
            </dl>
            <div className="hero-evidence">
              <div><strong>60%+</strong><span>faster legal case processing</span></div>
              <div><strong>&lt;20 min</strong><span>for multi-agent lesson production</span></div>
              <div><strong>&lt;1 sec</strong><span>end-to-end KYC inference</span></div>
            </div>
          </aside>
        </section>

        <section className="positioning" aria-labelledby="positioning-title">
          <div>
            <span className="section-index">What I build</span>
            <h2 id="positioning-title">AI engineering beyond the model call.</h2>
          </div>
          <div className="positioning-copy">
            <p>My work covers the complete product path: orchestration, retrieval, evaluation, APIs, asynchronous processing, data, cloud infrastructure, and user-facing delivery.</p>
            <p>I choose multi-agent systems when the workflow benefits from explicit roles and checkpoints. When a focused tool-calling loop is better, I keep the architecture simpler.</p>
          </div>
        </section>

        <section className="projects-section" id="work" aria-labelledby="work-title">
          <div className="section-heading">
            <span className="section-index">Selected work</span>
            <h2 id="work-title">Systems with real constraints.</h2>
            <p>Six case studies selected for agentic AI, voice, backend depth, production ML, and measurable outcomes.</p>
          </div>
          <div className="project-grid">
            {projects.map((project) => (
              <article className="project-card" key={project.id}>
                <button type="button" onClick={() => setSelectedProject(project)} aria-label={`Open ${project.title} case study`}>
                  <div className="project-image">
                    <img src={project.image} alt={`${project.title} architecture`} />
                    <div className="logo-dock" aria-label={`${project.title} technologies`}>
                      {projectLogos[project.id].map(([Icon, label]) => (
                        <span key={label} aria-label={label} title={label}><Icon aria-hidden="true" /></span>
                      ))}
                    </div>
                  </div>
                  <div className="project-content">
                    <div><span>{project.type}</span><h3>{project.title}</h3></div>
                    <p>{project.summary}</p>
                    <strong>{project.impact}</strong>
                    <div className="project-footer"><div>{project.stack.slice(0, 4).map((item) => <span key={item}>{item}</span>)}</div><i>Open case study <ChevronRight size={18} /></i></div>
                  </div>
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="capabilities" id="capabilities" aria-labelledby="capabilities-title">
          <div className="capabilities-lead">
            <span className="section-index">Capabilities</span>
            <h2 id="capabilities-title">What I work across.</h2>
            <p>A focused view of the tools and systems I use in production. The emphasis is agentic AI, supported by the backend, ML, and infrastructure depth needed to ship complete products.</p>
          </div>
          <div className="capability-list">
            {capabilityGroups.map((group) => (
              <div key={group.title}>
                <h3>{group.title}</h3>
                <p>{group.description}</p>
                <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>

        <section className="experience" id="experience" aria-labelledby="experience-title">
          <div className="experience-heading"><span className="section-index">Experience</span><h2 id="experience-title">From computer vision to agentic products.</h2></div>
          <div className="role-list">
            {roles.map(([period, title, company, description]) => (
              <article key={`${company}-${title}`}><time>{period}</time><div><h3>{title}</h3><span>{company}</span></div><p>{description}</p></article>
            ))}
          </div>
        </section>

        <section className="additional" aria-labelledby="additional-title">
          <div><span className="section-index">Additional systems</span><h2 id="additional-title">More shipped and explored.</h2></div>
          <div className="additional-list">
            {additionalProjects.map(([title, summary]) => <article key={title}><h3>{title}</h3><p>{summary}</p></article>)}
          </div>
        </section>

        <section className="contact" aria-labelledby="contact-title">
          <div><span>Open to global remote roles</span><h2 id="contact-title">Looking for an engineer who can own the whole AI system?</h2></div>
          <a href="mailto:omermisc001@gmail.com"><Mail size={24} />Email Omar <ArrowUpRight size={24} /></a>
        </section>
      </main>

      <footer><span>Omar Ashraf</span><p>Senior AI Engineer based in Pakistan, working remotely with teams worldwide.</p><a href="#top">Back to top</a></footer>
      {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </div>
  );
}

export default App;
