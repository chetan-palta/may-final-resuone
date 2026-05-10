# ResuOne Application Architecture Analysis

## 1. RESUME COMPONENT ARCHITECTURE

### ResumeForm.tsx Structure
**File**: [frontend/src/components/ResumeForm.tsx](frontend/src/components/ResumeForm.tsx)

#### Component Layout
- **Wrapper**: Uses `Section` component (accordion-style collapsible sections)
- **Sections** (in order):
  1. Personal Details (default open)
  2. Career Summary
  3. Education
  4. Skills
  5. Projects
  6. Experience/Internships
  7. Extra Curricular Activities
  8. Certifications (conditional)

#### Key Features
- **AI Skill Autocomplete** (`SkillAutocomplete` component):
  - Fetches suggestions from `/api/ai/skills/autocomplete?category=`
  - Shows up to 6 suggestions per category
  - Debounced API calls (800ms delay)
  - Validates: max 6 skills per category
  
- **Form Controls**:
  - Validation: Full names (letters/spaces only), phone (numbers only)
  - Word counters: Summary (55 words max), Project descriptions (25 words max)
  - Conditional rendering: Certifications only show if data exists
  - Max limits: Education (unlimited), Skills (3-6 categories), Projects (4), Experience (unlimited)

- **Validation Rules** (enforced in ResumeContext):
  ```
  - Summary: 55 words max
  - Extra Curricular: 15 words max per line, 3 entries max
  - Certifications: 2 max
  - Skills: 3-6 categories, 6 skills per category
  - Projects: 4 max (25 words description)
  - Experience: 3 bullet points max, 15 words per bullet
  ```

---

## 2. DARK MODE IMPLEMENTATION

### ThemeToggle.tsx
**File**: [frontend/src/components/ThemeToggle.tsx](frontend/src/components/ThemeToggle.tsx)

#### Implementation Details
- **Storage**: Uses `localStorage` with key `"theme"`
- **Method**: CSS class toggle on `<html>` element (`dark` class)
- **Default**: "light" mode
- **Persistence**: Survives page reloads

#### CSS Variables (Dark Mode)
**File**: [frontend/src/index.css](frontend/src/index.css)

```css
.dark {
  --bg-color: #020617;
  --surface-color: #0f172a;
  --border-color: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --right-panel-bg: linear-gradient(135deg, #020617, #0f172a);
}
```

#### Tailwind Configuration
**File**: [frontend/tailwind.config.js](frontend/tailwind.config.js)

- **Dark Mode Strategy**: `darkMode: 'class'`
- **Custom Colors**: Primary blue (#2563eb), hover state (#1d4ed8)
- **Animations**: Blob, float, shimmer, glow effects
- **Custom Utilities**: Animation delays, custom shadows

#### Component Dark Mode Support
- Input fields: `dark:bg-gray-800` classes
- Backgrounds: `dark:border-slate-700`, `dark:text-slate-400`
- Transitions: All color changes animated (300ms-500ms)

---

## 3. ACCORDION/SECTION STYLING

### Section Component
**File**: [frontend/src/components/ResumeForm.tsx](frontend/src/components/ResumeForm.tsx) (lines 72-82)

```typescript
const Section = ({ title, children, defaultOpen = false }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div>
      <div className={`section-header ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <span>{title}</span>
        {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </div>
      {isOpen && <div className="section-body">{children}</div>}
    </div>
  );
};
```

### CSS Styling
**File**: [frontend/src/index.css](frontend/src/index.css) (lines 321-360)

```css
.section-header {
  padding: 1rem 1.25rem;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  transition: all 0.2s;
}

.section-header.active {
  background-color: var(--bg-color);
  border-bottom-color: transparent;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  margin-bottom: 0;
}

.section-body {
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  border-top: none;
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  margin-bottom: 1rem;
  background: white;
}
```

#### Item Arrays Styling
```css
.array-item {
  border: 1px solid var(--border-color);
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  background: #f8fafc;
  position: relative;
}

.array-item-title {
  font-weight: 600;
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
}
```

---

## 4. ADMIN PANEL IMPLEMENTATION

### Route Protection
**File**: [frontend/src/App.tsx](frontend/src/App.tsx) (lines 285-305)

```typescript
function App() {
  const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading session...</div>;
    if (!user) return <Navigate to="/auth" replace />;
    return <>{children}</>;
  };

  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}
```

**Current Protection Level**: ⚠️ **BASIC** - Only checks if user is logged in
- No role-based access control (RBAC)
- No admin flag verification
- **Security Issue**: Any authenticated user can access `/admin`

### Admin.tsx Implementation
**File**: [frontend/src/components/Admin.tsx](frontend/src/components/Admin.tsx)

#### Features
- **Data Display**: Table of all resumes with filters
- **Columns**: Student Name, User Account (email), Branch/Degree, Last Updated, Final PDF
- **Filters**: By student name, branch, date updated
- **Functionality**: 
  - Fetches from `/api/admin/resumes`
  - Displays PDF export links
  - Sidebar navigation

#### Current Authentication Check
```typescript
const fetchAdminResumes = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/admin/resumes`, { withCredentials: true });
    setResumes(res.data.resumes || []);
  } catch (err) {
    console.error(err);
    alert('Failed to fetch admin data.');
  }
};
```

**Note**: No explicit auth check - relies on backend `/api/admin/resumes` endpoint

### Backend Admin Routes
**File**: [backend/src/routes/adminRoutes.ts](backend/src/routes/adminRoutes.ts)

```typescript
router.get('/resumes', getAllResumes);
```

**⚠️ Critical Issue**: No `authenticateToken` middleware applied!
- Admin endpoint is **publicly accessible**
- Comment in code: "In a real system, you'd have an isAdmin check"
- Database query returns all user resumes with no filtering

### Admin Controller
**File**: [backend/src/controllers/adminController.ts](backend/src/controllers/adminController.ts)

```typescript
export const getAllResumes = async (req: Request, res: Response) => {
  // No auth check!
  const { rows } = await pool.query(`
    SELECT r.id, r.name, r.data, u.id, u.name, u.email
    FROM resumes r
    LEFT JOIN users u ON r.user_id = u.id
    ORDER BY r.last_updated DESC
  `);
  
  // Extracts student_name and branch from resume.data
  // Returns structured list of all resumes
};
```

---

## 5. PDF EXPORT MECHANISM

### Frontend Export Flow
**File**: [frontend/src/App.tsx](frontend/src/App.tsx) (lines 80-110)

```typescript
const handleExport = async () => {
  // 1. Validate data
  if (!validateExtraCurricular()) return;
  
  // 2. Auto-save if logged in
  if (data.id) {
    await axios.post(`${API_URL}/api/resumes`, data, { withCredentials: true });
  }
  
  // 3. POST to /api/resumes/export-direct
  const response = await fetch(`${API_URL}/api/resumes/export-direct`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  
  // 4. Download blob as PDF
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.personalDetails.fullName.replace(/\s+/g, '_')}.pdf`;
  a.click();
};
```

### Backend Export Routes
**File**: [backend/src/routes/resumeRoutes.ts](backend/src/routes/resumeRoutes.ts)

```typescript
// Direct export (no auth required)
router.post('/export-direct', exportDirect);

// Save & generate PDF
router.get('/:id/pdf', getResumePdf);
```

### PDF Generation Service
**File**: [backend/src/services/pdfService.ts](backend/src/services/pdfService.ts)

#### Libraries Used
- **Puppeteer**: Headless Chrome for PDF generation
- **Server-side rendering**: HTML template converted to PDF

```typescript
export const generatePdf = async (data: ResumeData): Promise<Buffer> => {
  let browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  const html = renderHtml(data);  // Use template.ts

  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.evaluateHandle("document.fonts.ready");

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" }
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
};
```

### HTML Template Rendering
**File**: [backend/src/utils/template.ts](backend/src/utils/template.ts)

#### Styling Applied During Export
```typescript
const style = `
  :root { --font-serif: 'Times New Roman', Times, serif; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; }
  .a4-container { width: 210mm; background: white; margin: 0 auto; }
  .resume-paper { 
    padding: 8mm 15mm; 
    width: 100%; 
    font-family: var(--font-serif); 
    color: black; 
    font-size: 11pt; 
    line-height: 1.2; 
  }
  .resume-name { font-size: 24pt; font-weight: 700; text-transform: uppercase; }
  .resume-section-title { font-size: 12pt; font-weight: bold; border-bottom: 1px solid black; }
  .resume-item { margin-bottom: 1.5mm; }
  .resume-list { padding-left: 6mm; list-style-type: disc; }
  .resume-skills-group { margin-bottom: 1px; display: grid; grid-template-columns: 1fr 1fr; gap: 0 10px; }
`;
```

#### Template Sections
1. **Header**: Name (24pt, uppercase), contact info (email, phone, social links)
2. **Career Summary**: Justified text
3. **Education**: Degree, Institution, Location, CGPA/Percentage, Dates (2-column layout)
4. **Skills**: 2-column grid layout by category
5. **Projects**: Title, Technologies, Description
6. **Experience**: Company, Role, Location, Type, Dates, Bullet points
7. **Extra Curricular**: Simple list
8. **Certifications**: Title, Issuer, Link, Date

#### Export Endpoints
**File**: [backend/src/controllers/resumeController.ts](backend/src/controllers/resumeController.ts)

```typescript
// Direct export from frontend data (no DB)
export const exportDirect = async (req: Request, res: Response) => {
  const pdfBuffer = await generatePdf(req.body);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="resume.pdf"');
  res.send(pdfBuffer);
};

// Fetch & export stored resume
export const getResumePdf = async (req: Request, res: Response) => {
  const { rows } = await pool.query('SELECT * FROM resumes WHERE id = $1', [req.params.id]);
  const resumeData = rows[0].data || mappedData;
  const pdfBuffer = await generatePdf(resumeData);
  res.send(pdfBuffer);
};
```

#### A4 Paper Dimensions in CSS
**File**: [frontend/src/index.css](frontend/src/index.css) (lines 363-381)

```css
.a4-container {
  width: 210mm;
  height: 297mm;
  background: white;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  position: relative;
  overflow: hidden;
}

.resume-paper {
  padding: 10mm 15mm;
  width: 100%;
  height: 100%;
  font-family: var(--font-serif);
  color: black;
  font-size: 11pt;
  line-height: 1.4;
  box-sizing: border-box;
}
```

---

## 6. RESUME STATE MANAGEMENT

### ResumeContext.tsx Overview
**File**: [frontend/src/context/ResumeContext.tsx](frontend/src/context/ResumeContext.tsx)

#### State Variables
```typescript
interface ResumeContextType {
  data: ResumeData;                           // Main form data
  aiScore: number | null;                     // AI analysis score
  aiSuggestions: AISuggestion[];              // AI feedback
  aiSkillRecommendations: AISkillCategory;    // AI skill suggestions
  isAnalyzing: boolean;                       // Loading state
}
```

#### Data Structure (defaultData)
```typescript
const defaultData: ResumeData = {
  personalDetails: {
    fullName, email, phone, linkedin, github, leetcode, portfolio, location, customLinks
  },
  summary: '',
  education: [{ id, degree, institution, location, scoreType, score, startDate, endDate }],
  skills: [
    { id, name: 'Languages', items: '' },
    { id, name: 'Technologies', items: '' }
  ],
  projects: [],
  experience: [],
  extraCurricular: [''],
  certifications: []
};
```

### "New Resume" Handling

#### 1. **On Application Load**
```typescript
// In App.tsx MainApp component
useEffect(() => {
  if (user && !data.id && !autoLoaded) {
    axios.get(`${API_URL}/api/resume/user`, { withCredentials: true })
      .then(res => {
        if (res.data && res.data.id) {
          setResumeData(res.data);  // Load existing resume
        }
        setAutoLoaded(true);
      })
      .catch(() => setAutoLoaded(true));  // No saved resume = new resume
  }
}, [user, data.id, autoLoaded]);
```

#### 2. **Default State**
- Fresh user gets `defaultData` from `loadSavedData()` function
- Starts with 1 education entry, 2 skill categories
- Empty projects, experience, extra curricular

#### 3. **localStorage Persistence**
**Key**: `"resuone_form_data"`

```typescript
// Auto-save on every change
useEffect(() => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Silently fail if localStorage full
  }
}, [data]);

// Load on component mount
const loadSavedData = (): ResumeData => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultData, ...JSON.parse(saved) };
    }
  } catch {
    // Fall through to default
  }
  return defaultData;
};
```

#### 4. **Clear After Export**
```typescript
// After successful PDF export
clearSavedData();  // Removes localStorage entry
// User gets fresh defaultData on next load
```

### AI Analysis Integration
**File**: [frontend/src/context/ResumeContext.tsx](frontend/src/context/ResumeContext.tsx) (lines 96-130)

```typescript
// 1-second debounced analysis
useEffect(() => {
  const handler = setTimeout(async () => {
    // Only analyze if meaningful data exists
    if (!data.projects.length && !data.experience.length && !data.summary) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch(`${API_URL}/api/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const result = await response.json();
        setAiScore(result.resumeScore);
        setAiSuggestions(result.suggestions || []);
        setAiSkillRecommendations(result.skillRecommendations || null);
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, 1000);

  return () => clearTimeout(handler);
}, [data]);
```

#### AI Response Structure
```typescript
interface AISuggestion {
  section: 'projects' | 'experience';
  index: number;
  tips: Array<{
    type: string;
    message: string;
    suggestion?: string;
    originalText?: string;
  }>;
}

interface AISkillCategory {
  languages: string[];
  tools: string[];
  databases: string[];
}
```

---

## 7. SKILLS SECTION LAYOUT

### Skills Rendering
**File**: [frontend/src/components/ResumeForm.tsx](frontend/src/components/ResumeForm.tsx) (lines 265-300)

#### Form Structure
```typescript
<Section title="Skills">
  <div className="text-sm text-gray-500 mb-4">
    Recommended: Use 4 skill categories for best formatting. 
    (Min 3, Max 6 categories Allowed. Max 6 skills per category)
  </div>
  
  {data.skills.map((skill, idx) => (
    <div key={skill.id} className="array-item">
      <div className="array-item-title">
        Category #{idx + 1}
        <button onClick={() => removeSkillCategory(skill.id)}>
          <Trash2 size={16} />
        </button>
      </div>
      
      {/* Category Name Input */}
      <div className="input-group">
        <label>Category Name</label>
        <input placeholder="e.g. Languages" />
      </div>
      
      {/* Skills Input (comma-separated) */}
      <div className="input-group">
        <label>Skills (comma separated)</label>
        <input placeholder="Java, Python, C++" />
        {/* AI Autocomplete Component */}
        <SkillAutocomplete 
          categoryName={skill.name}
          currentItems={skill.items}
          onSelect={(newItems) => updateSkillCategory(skill.id, 'items', newItems)}
        />
      </div>
    </div>
  ))}
  
  <button onClick={addSkillCategory} disabled={data.skills.length >= 6}>
    <Plus size={16} /> Add Skill Category
  </button>
</Section>
```

### AI Autocomplete Component
**File**: [frontend/src/components/ResumeForm.tsx](frontend/src/components/ResumeForm.tsx) (lines 9-57)

```typescript
const SkillAutocomplete = ({ categoryName, currentItems, onSelect }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch suggestions when category name changes
  React.useEffect(() => {
    if (!categoryName || categoryName.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    
    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/ai/skills/autocomplete?category=${encodeURIComponent(categoryName)}`,
          { credentials: 'include' }
        );
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } finally {
        setLoading(false);
      }
    }, 800);  // 800ms debounce
    
    return () => clearTimeout(handler);
  }, [categoryName]);

  const handleAdd = (skill: string) => {
    const items = currentItems.split(',').map(s => s.trim()).filter(Boolean);
    if (!items.includes(skill) && items.length < 6) {
      onSelect([...items, skill].join(', '));
    }
  };

  if (!categoryName || (suggestions.length === 0 && !loading)) return null;

  return (
    <div className="mt-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
      <div className="text-xs font-semibold text-blue-800 flex items-center gap-1 mb-2">
        <Sparkles size={12} /> AI Suggestions
      </div>
      {loading ? (
        <div className="text-xs text-blue-600">Loading suggestions...</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {suggestions.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => handleAdd(s)}
              className="px-2 py-1 bg-white text-blue-700 text-xs rounded border border-blue-200 hover:bg-blue-600 hover:text-white transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
```

### CSS/Tailwind Classes for Skills

#### Input Styling
```css
.input-group {
  margin-bottom: 1.25rem;
}

.input-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-main);
  margin-bottom: 0.5rem;
}

.input-field {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background-color: #f8fafc;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--focus-ring);
  background-color: var(--surface-color);
}
```

#### Autocomplete UI
```typescript
// Styling via className
"mt-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100"
// Button
"px-2 py-1 bg-white text-blue-700 text-xs rounded border border-blue-200 hover:bg-blue-600 hover:text-white transition-colors"
```

### PDF Skills Rendering
**File**: [backend/src/utils/template.ts](backend/src/utils/template.ts) (in HTML generation)

```typescript
${skills.some((s: SkillCategory) => s.name && s.items) ? `
  <div class="resume-section">
    <div class="resume-section-title">Skills</div>
    <div class="resume-skills-group">
      ${skills.map((skill: SkillCategory) => skill.name && skill.items ? `
        <div class="resume-skill-row">
          <span class="resume-item-subtitle">• <b>${skill.name}:</b></span>
          <span>${skill.items}</span>
        </div>
      ` : '').join('')}
    </div>
  </div>
` : ''}
```

#### PDF Skills Layout CSS
```typescript
.resume-skills-group { 
  margin-bottom: 1px; 
  display: grid; 
  grid-template-columns: 1fr 1fr;  // 2-column layout
  gap: 0 10px; 
}

.resume-skill-row { 
  margin-bottom: 1px; 
  display: flex; 
  align-items: flex-start; 
}

.resume-skill-row b { 
  min-width: 100px; 
  display: inline-block; 
}
```

#### Rendering Example
For skills: `Languages: Java, Python` and `Tools: React, Node.js`
```
| • Languages:  | Java, Python    |
| • Tools:      | React, Node.js  |
```

---

## 8. AUTHENTICATION SYSTEM

### Auth Routes
**File**: [backend/src/routes/authRoutes.ts](backend/src/routes/authRoutes.ts)

```typescript
router.post('/register', register);
router.post('/login', login);
router.get('/session', authenticateToken, getSession);
router.post('/logout', logout);
router.get('/google', googleAuthInitiate);
router.get('/google/callback', googleAuthCallback);
```

### Auth Middleware
**File**: [backend/src/utils/authMiddleware.ts](backend/src/utils/authMiddleware.ts)

```typescript
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const decoded = jwt.verify(token, secret);
    (req as any).user = decoded;  // { id, email }
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};
```

### Auth Context (Frontend)
**File**: [frontend/src/context/AuthContext.tsx](frontend/src/context/AuthContext.tsx)

```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// On mount: Fetch session from `/api/auth/session`
// On login: Set user in context
// On logout: POST to `/api/auth/logout`, clear user
```

---

## 9. DATABASE SCHEMA

### Resume Storage
**Backend Resume Controller**: [backend/src/controllers/resumeController.ts](backend/src/controllers/resumeController.ts)

```sql
-- Inferred from code:
CREATE TABLE resumes (
  id UUID PRIMARY KEY,
  user_id INTEGER FOREIGN KEY,
  name VARCHAR,
  data JSONB,  -- Full resume data as JSON
  last_updated TIMESTAMP
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE,
  name VARCHAR,
  password_hash VARCHAR,
  google_id VARCHAR,
  avatar VARCHAR
);
```

---

## 10. KEY FILES SUMMARY TABLE

| Purpose | Frontend File | Backend File |
|---------|---------------|--------------|
| Resume Form | `src/components/ResumeForm.tsx` | - |
| State Management | `src/context/ResumeContext.tsx` | - |
| Authentication | `src/context/AuthContext.tsx` | `src/controllers/authController.ts` |
| Admin Panel | `src/components/Admin.tsx` | `src/controllers/adminController.ts` |
| PDF Export | `src/App.tsx` (handleExport) | `src/services/pdfService.ts` |
| HTML Template | - | `src/utils/template.ts` |
| Styling | `src/index.css` | - |
| Dark Mode | `src/components/ThemeToggle.tsx` | - |
| Tailwind Config | `tailwind.config.js` | - |

---

## 11. CRITICAL SECURITY ISSUES

### 🔴 **Issue 1: Admin Endpoint Not Protected**
- **File**: `backend/src/routes/adminRoutes.ts`
- **Problem**: No `authenticateToken` middleware
- **Impact**: Anyone can access `/api/admin/resumes` and download all user data
- **Fix**: Add `router.get('/resumes', authenticateToken, isAdminCheck, getAllResumes);`

### 🔴 **Issue 2: Admin Access Not Verified on Frontend**
- **File**: `frontend/src/App.tsx`
- **Problem**: `ProtectedRoute` only checks if user exists, not if admin
- **Impact**: Any logged-in user can access `/admin` page
- **Fix**: Add role check: `if (!user?.isAdmin) return <Navigate to="/" />`

### 🟡 **Issue 3: No Admin Flag in Database**
- **File**: `backend/src/controllers/adminController.ts`
- **Problem**: Comment says "In a real system, you'd have an isAdmin check"
- **Fix**: Add `is_admin` boolean column to users table

---

## 12. DATA FLOW DIAGRAMS

### Resume Creation & Export Flow
```
User Types → ResumeForm → ResumeContext (localStorage)
                                ↓
                        [AI Analysis API]
                                ↓
                        LivePreview (render)
                                ↓
            [Export Button] → /api/resumes/export-direct
                                ↓
                        pdfService.generatePdf()
                                ↓
                        Puppeteer (headless)
                                ↓
                        template.ts (HTML rendering)
                                ↓
                        PDF Buffer → Download
```

### Authentication Flow
```
User Logs In → Auth Component
                    ↓
          /api/auth/login (email/password)
                    ↓
          Generate JWT Token
                    ↓
          Set auth_token cookie (httpOnly)
                    ↓
          AuthContext.refreshSession()
                    ↓
          User object stored in context
```

### Admin Data Access Flow
```
Admin User → /admin route (ProtectedRoute)
                    ↓
            Admin Component renders
                    ↓
            /api/admin/resumes (NO AUTH CHECK ⚠️)
                    ↓
            getAllResumes() controller
                    ↓
            SQL: SELECT * FROM resumes JOIN users
                    ↓
            Parse JSON, extract branch/name
                    ↓
            Display in table with filters
```

---

## END OF ARCHITECTURE ANALYSIS
