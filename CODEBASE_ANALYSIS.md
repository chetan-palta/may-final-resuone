# ResuOne Codebase Analysis - May 15, 2026

## 1. CURRENT LIMITS OVERVIEW

| Section | Current Limit | Target Limit | Status |
|---------|---------------|--------------|--------|
| **Certifications** | ❌ NONE | 3 max | NEEDS FIX |
| **Education** | ❌ NONE | 4 max | NEEDS FIX |
| **Experience** | ❌ NONE | 4 max | NEEDS FIX |
| Skills (categories) | 6 max | 4 max | ✅ DONE |
| Skills (per category) | 4 max | 4 max | ✅ VERIFIED |
| Projects | 4 max | 4 max | ✅ VERIFIED |
| Resumes (per user) | 5 max | 5 max | ✅ VERIFIED |

---

## 2. VALIDATION LOGIC - ResumeContext.tsx

### 2.1 MISSING: Certifications Limit Validation
**FILE:** `frontend/src/context/ResumeContext.tsx`
**LINES:** 361-366

```typescript
// CURRENT (NO LIMIT):
const addCertification = () => {
  setData(prev => ({
    ...prev,
    certifications: [...prev.certifications, { id: uuidv4(), title: '', issuer: '', link: '', date: '', description: '' }]
  }));
};
```

**❌ PROBLEM:** No check for certifications count. Users can add unlimited certifications.
**✅ NEEDED:** `if (data.certifications.length >= 3) return;`

---

### 2.2 MISSING: Education Limit Validation
**FILE:** `frontend/src/context/ResumeContext.tsx`
**LINES:** 208-215

```typescript
// CURRENT (NO LIMIT):
const addEducation = () => {
  setData(prev => ({
    ...prev,
    education: [...prev.education, { id: uuidv4(), degree: '', institution: '', location: '', scoreType: 'CGPA (out of 10)', score: '', startDate: '', endDate: '' }]
  }));
};
```

**❌ PROBLEM:** No check for education count. Form starts with 1 education entry, can add unlimited.
**✅ NEEDED:** `if (data.education.length >= 4) return;`

---

### 2.3 MISSING: Experience Limit Validation
**FILE:** `frontend/src/context/ResumeContext.tsx`
**LINES:** 254-258

```typescript
// CURRENT (NO LIMIT):
const addExperience = () => {
  setData(prev => ({
    ...prev,
    experience: [...prev.experience, { id: uuidv4(), company: '', role: '', location: '', type: '', startDate: '', endDate: '', bulletPoints: ['', '', ''] }]
  }));
};
```

**❌ PROBLEM:** No check for experience count. Users can add unlimited experience entries.
**✅ NEEDED:** `if (data.experience.length >= 4) return;`

---

### 2.4 ✅ VERIFIED: Skill Category Limit Validation
**FILE:** `frontend/src/context/ResumeContext.tsx`
**LINES:** 225-232

```typescript
const addSkillCategory = () => {
  setData(prev => {
    if (prev.skills.length >= 6) return prev;  // ✅ MAX 6 ENFORCED (note: should be 4)
    return {
      ...prev,
      skills: [...prev.skills, { id: uuidv4(), name: '', items: '' }]
    };
  });
};
```

**✅ LIMIT ENFORCED:** 6 categories (currently being used, should be reduced to 4)

---

### 2.5 ✅ VERIFIED: Skills Per Category Limit
**FILE:** `frontend/src/context/ResumeContext.tsx`
**LINES:** 234-242

```typescript
const updateSkillCategory = (id: string, field: string, value: string) => {
  if (field === 'items') {
    const parts = value.split(',').filter(x => x.trim() !== '');
    if (parts.length > 4) return;  // ✅ MAX 4 SKILLS PER CATEGORY
  }
  setData(prev => ({
    ...prev,
    skills: prev.skills.map(s => s.id === id ? { ...s, [field]: value } : s)
  }));
};
```

**✅ LIMIT ENFORCED:** 4 skills per category

---

### 2.6 ✅ VERIFIED: Project Limit Validation
**FILE:** `frontend/src/context/ResumeContext.tsx`
**LINES:** 244-252

```typescript
const addProject = () => {
  if (data.projects.length < 4) {  // ✅ MAX 4 PROJECTS
    setData(prev => ({
      ...prev,
      projects: [...prev.projects, { id: uuidv4(), title: '', technologies: '', description: '', link: '', github: '', date: '' }]
    }));
  }
};
```

**✅ LIMIT ENFORCED:** 4 projects max

---

### 2.7 Other Validations
**FILE:** `frontend/src/context/ResumeContext.tsx`
**LINES:** 186-193

```typescript
const updateSummary = (value: string) => {
  // Basic word limit validation: New limit 55 words
  if (value.split(/\s+/).filter(Boolean).length <= 55) {
    setData(prev => ({ ...prev, summary: value }));
  }
};
```

**✅ Summary:** Max 55 words

---

**FILE:** `frontend/src/context/ResumeContext.tsx`
**LINES:** 264-270

```typescript
const updateProject = (id: string, field: string, value: string) => {
  if (field === 'description' && value.split(/\s+/).filter(Boolean).length > 25) return;
  setData(prev => ({
    ...prev,
    projects: prev.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
  }));
};
```

**✅ Project Description:** Max 25 words

---

**FILE:** `frontend/src/context/ResumeContext.tsx`
**LINES:** 278-291

```typescript
const updateExperienceBullet = (expId: string, index: number, value: string) => {
  if (value.split(/\s+/).filter(Boolean).length > 15) return;  // ✅ MAX 15 WORDS PER BULLET
  setData(prev => ({
    ...prev,
    experience: prev.experience.map(e => {
      if (e.id === expId) {
        const newBullets = [...e.bulletPoints];
        newBullets[index] = value;
        return { ...e, bulletPoints: newBullets };
      }
      return e;
    })
  }));
};
```

**✅ Experience Bullet:** Max 15 words

---

## 3. SKILLS RENDERING ANALYSIS

### 3.1 Skills in LivePreview.tsx
**FILE:** `frontend/src/components/LivePreview.tsx`
**LINES:** 113-129

```typescript
{/* Skills */}
{skills.some(s => s.name && s.items) && (
  <div className="resume-section">
    <div className="resume-section-title">Skills</div>
    <div className="resume-skills-group">
      {skills.map(skill => skill.name && skill.items && (
        <div key={skill.id} className="resume-skill-row" style={{ display: 'flex', alignItems: 'baseline', marginBottom: '1px' }}>
          <span className="resume-item-subtitle" style={{ whiteSpace: 'nowrap', marginRight: '6px', fontWeight: 'bold' }}>
            • {skill.name}:
          </span>
          <span>{skill.items.split(',').map(s => s.trim()).filter(Boolean).join(', ')}</span>
        </div>
      ))}
    </div>
  </div>
)}
```

**RENDERING:**
- Uses bullet character `•` before category name
- Categories stacked vertically (not 2-column in preview)
- Items comma-separated
- **Issue:** No 2-column grid layout in preview

---

### 3.2 Skills in PDF Template (backend/src/utils/template.ts)
**FILE:** `backend/src/utils/template.ts`
**LINES:** 84-99

```typescript
${skills.some((s: SkillCategory) => s.name && s.items) ? `
  <div class="resume-section">
    <div class="resume-section-title">Skills</div>
    <div class="resume-skills-group">
      ${skills.map((skill: SkillCategory) => skill.name && skill.items ? `
        <div class="resume-skill-row">
          <span class="resume-item-subtitle" style="margin-right: 6px">• <b>${skill.name}:</b></span>
          <span>${skill.items}</span>
        </div>
      ` : '').join('')}
    </div>
  </div>
` : ''}
```

**RENDERING:**
- Uses same bullet character `•`
- HTML has `resume-skills-group` class with grid CSS
- Items NOT split/joined (raw comma-separated list)
- **Issue:** CSS defines 2-column grid, but items not processed

**CSS (index.css, lines 616-619):**
```css
.resume-skills-group {
  margin-bottom: 2px;
  display: flex;
  flex-direction: column;
}
```

**❌ ISSUE:** CSS shows `flex-direction: column` (single column), not grid!

---

## 4. BULLET POINT STYLING ANALYSIS

### 4.1 Bullet Point Styles

**Experience Section (LivePreview.tsx, lines 147-154):**
```typescript
<div className="resume-item-header">
  <span className="resume-item-title">
    <span style={{ fontSize: '10pt', marginRight: '4px' }}>●</span>  // ✅ FILLED CIRCLE
    {exp.company}
  </span>
```

**Role Line (LivePreview.tsx, lines 155-161):**
```typescript
<div className="resume-item-header" style={{ fontStyle: 'italic', fontSize: '9.5pt', marginTop: '-2px' }}>
  <span style={{ marginLeft: '1.5mm' }}>
    {exp.role}
    // ❌ NO BULLET HERE
```

**PDF Template (backend/src/utils/template.ts, lines 132-139):**
```typescript
<span style="margin-left: 1.5mm;">
  <span style="font-size: 9pt; margin-right: 4px;">○</span>  // ❌ HOLLOW CIRCLE
  ${exp.role}
</span>
```

### 4.2 Inconsistencies Found

| Component | Company Bullet | Role Bullet | BulletPoints List |
|-----------|---|---|---|
| **LivePreview** | ● (filled) | none | ● (disc) |
| **PDF Template** | ● (filled) | ○ (hollow) | ● (disc) |

**❌ MISMATCH:** 
- Role line uses hollow circle in PDF but nothing in preview
- Style differs between preview and export

---

### 4.3 CSS Styling for Lists

**File:** `frontend/src/index.css`
**LINES:** 602-611

```css
.resume-list {
  padding-left: 6mm;
  margin-top: 2px;
  list-style-type: disc;  // ✅ DISC BULLETS
}

.resume-list li {
  margin-bottom: 2px;
  text-align: left;
  font-size: 10.5pt;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

**✅ VERIFIED:** Experience bullet points use standard `disc` style

---

## 5. NEW RESUME CREATION FLOW

### 5.1 Dashboard.tsx - handleCreate Function
**FILE:** `frontend/src/components/Dashboard.tsx`
**LINES:** 47-51

```typescript
const handleCreate = () => {
  if (resumes.length >= 5) return;
  // Clear saved data so form starts empty
  clearSavedData();
  navigate('/resume');
};
```

**FLOW:**
1. Check if user has 5 resumes (max limit)
2. If limit not reached: call `clearSavedData()`
3. Navigate to `/resume` route (ResumeForm component)

---

### 5.2 Resume Count Checking - Dashboard Header
**FILE:** `frontend/src/components/Dashboard.tsx`
**LINES:** 151-159

```typescript
<div className="hidden sm:flex flex-col items-end">
  <p className="text-sm font-semibold text-slate-900 dark:text-white">
    {user?.name}
  </p>
  <p className="text-xs text-slate-600 dark:text-slate-400">
    {resumes.length} of 5 resumes
  </p>
</div>
```

**DISPLAY:** Shows "X of 5 resumes"

---

### 5.3 Create Button - Disabled State
**FILE:** `frontend/src/components/Dashboard.tsx`
**LINES:** 173-185

```typescript
<button
  onClick={handleCreate}
  disabled={resumes.length >= 5}
  className={`px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
    resumes.length >= 5
      ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed'
      : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white hover:shadow-xl hover:scale-105'
  }`}
>
  <Plus className="w-5 h-5" />
  Create Resume
</button>
```

**✅ VERIFIED:**
- Button disabled when `resumes.length >= 5`
- Gray styling applied when disabled
- Shows visual feedback

---

### 5.4 Resume Limit Warning
**FILE:** `frontend/src/components/Dashboard.tsx`
**LINES:** 196-203

```typescript
{/* Limit Warning */}
{resumes.length >= 5 && (
  <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-gap-3">
    <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
    <p className="text-sm text-amber-900 dark:text-amber-200">
      You've reached the maximum of 5 resumes. Delete one to create a new one.
    </p>
  </div>
)}
```

**✅ VERIFIED:** Warning displayed when limit reached

---

## 6. ResumeContext DEFAULT DATA

**FILE:** `frontend/src/context/ResumeContext.tsx`
**LINES:** 55-72

```typescript
const defaultData: ResumeData = {
  personalDetails: {
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    leetcode: '',
    portfolio: '',
    location: '',
    customLinks: []
  },
  summary: '',
  education: [
    { id: uuidv4(), degree: '', institution: '', location: '', scoreType: 'CGPA (out of 10)', score: '', startDate: '', endDate: '' }
  ],
  skills: [
    { id: uuidv4(), name: 'Languages', items: '' },
    { id: uuidv4(), name: 'Technologies', items: '' }
  ],
  projects: [],
  experience: [],
  extraCurricular: [''],
  certifications: []
};
```

**DEFAULTS:**
- ✅ Starts with 1 education entry
- ✅ Starts with 2 skill categories
- ✅ Empty projects array
- ✅ Empty experience array
- ✅ Empty certifications array

---

## 7. ResumeForm.tsx - Add Button Limits

### 7.1 Education Section
**FILE:** `frontend/src/components/ResumeForm.tsx`
**LINES:** 254-255

```typescript
<button className="btn btn-outline w-full mt-2" onClick={addEducation}>
  <Plus size={16} /> Add Education
</button>
```

**❌ PROBLEM:** No `disabled` attribute, no limit message

---

### 7.2 Skills Section
**FILE:** `frontend/src/components/ResumeForm.tsx`
**LINES:** 261-262 & 290

```typescript
<div className="text-sm text-gray-500 mb-4 pb-2 border-b">
  Recommended: Use 4 skill categories for best formatting. (Min 3, Max 6 categories Allowed. Max 4 skills per category)
</div>
```

```typescript
<button className="btn btn-outline w-full mt-2" onClick={addSkillCategory} disabled={data.skills.length >= 6}>
  <Plus size={16} /> Add Skill Category
</button>
```

**✅ VERIFIED:**
- Disabled when 6 categories reached
- Help text displays: "Max 6 categories"

---

### 7.3 Projects Section
**FILE:** `frontend/src/components/ResumeForm.tsx`
**LINES:** 290-291

```typescript
<div className="text-sm text-gray-500 mb-4 pb-2 border-b">
  Maximum 4 projects allowed. AI feedback available for descriptions.
</div>
```

```typescript
<button className="btn btn-outline w-full mt-2" onClick={addProject} disabled={data.projects.length >= 4}>
  <Plus size={16} /> Add Project
</button>
```

**✅ VERIFIED:**
- Disabled when 4 projects reached
- Help text displays: "Maximum 4 projects"

---

### 7.4 Experience Section
**FILE:** `frontend/src/components/ResumeForm.tsx`
**LINES:** 392-393

```typescript
<button className="btn btn-outline w-full mt-2" onClick={addExperience}>
  <Plus size={16} /> Add Experience
</button>
```

**❌ PROBLEM:** No `disabled` attribute, no limit message

---

### 7.5 Certifications Section
**FILE:** `frontend/src/components/ResumeForm.tsx`
**LINES:** 469-474

```typescript
<button 
  className="btn btn-outline w-full mt-2" 
  onClick={addCertification}
  disabled={hasExtraCurricular}
>
  <Plus size={16} /> Add Certification
</button>
```

**❌ PROBLEM:** Only disabled when Extra Curricular Activities section is used
**❌ MISSING:** No limit check on certifications count

---

## 8. SUMMARY OF ISSUES

### 8.1 Missing Validation Logic
| Item | File | Line | Issue |
|------|------|------|-------|
| **Certifications Limit** | ResumeContext.tsx | 361 | No `length >= 3` check in `addCertification()` |
| **Education Limit** | ResumeContext.tsx | 208 | No `length >= 4` check in `addEducation()` |
| **Experience Limit** | ResumeContext.tsx | 254 | No `length >= 4` check in `addExperience()` |

### 8.2 Missing UI Feedback
| Section | File | Issue |
|---------|------|-------|
| **Education Add Button** | ResumeForm.tsx | No `disabled` attribute |
| **Experience Add Button** | ResumeForm.tsx | No `disabled` attribute |
| **Certifications Button** | ResumeForm.tsx | Only disabled by Extra Curricular, not by count |
| **Certifications Help Text** | ResumeForm.tsx | No "Max 3" message |
| **Education Help Text** | ResumeForm.tsx | No "Max 4" message |
| **Experience Help Text** | ResumeForm.tsx | No "Max 4" message |

### 8.3 Skills Layout Mismatch
| Component | Layout | CSS | Issue |
|-----------|--------|-----|-------|
| **LivePreview** | Single column | No grid | Not matching 2-column design |
| **PDF Template** | Single column | CSS says `flex-column` | Missing 2-column grid |
| **CSS** | Column | `flex-direction: column` | Should be `display: grid; grid-template-columns: 1fr 1fr;` |

### 8.4 Bullet Point Inconsistencies
| Location | Company | Role | BulletPoints |
|----------|---------|------|--------------|
| **LivePreview** | ● (10pt filled) | (none) | disc |
| **PDF** | ● (10pt filled) | ○ (9pt hollow) | disc |

---

## 9. REQUIRED FIXES

### Fix 1: Add Certifications Limit (3 max)
**File:** `frontend/src/context/ResumeContext.tsx`
- Add length check to `addCertification()`
- Update ResumeForm to disable button at 3 certifications
- Add help text: "Maximum 3 certifications allowed"

### Fix 2: Add Education Limit (4 max)
**File:** `frontend/src/context/ResumeContext.tsx`
- Add length check to `addEducation()`
- Update ResumeForm to disable button at 4 educations
- Add help text: "Maximum 4 education entries allowed"

### Fix 3: Add Experience Limit (4 max)
**File:** `frontend/src/context/ResumeContext.tsx`
- Add length check to `addExperience()`
- Update ResumeForm to disable button at 4 experiences
- Add help text: "Maximum 4 experience entries allowed"

### Fix 4: Fix Skills Layout
**File:** `frontend/src/index.css`
- Change `.resume-skills-group` from `flex-direction: column` to 2-column grid
- **Current:** `display: flex; flex-direction: column;`
- **Target:** `display: grid; grid-template-columns: 1fr 1fr; gap: 0 10px;`

### Fix 5: Standardize Bullet Points
**Files:** `LivePreview.tsx` & `template.ts`
- Remove role line bullet (○) from PDF template OR add it to preview
- Recommend: Remove role line bullet from both for cleaner design

---

## 10. TYPE DEFINITIONS

**FILE:** `frontend/src/types/resume.ts`

```typescript
export interface Resume {
  id: string;
  title: string;
  data: ResumeData;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeData {
  personalDetails: PersonalDetails;
  summary: string;
  education: Education[];
  skills: SkillCategory[];
  projects: Project[];
  experience: Experience[];
  extraCurricular: string[];
  certifications: Certification[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  scoreType: string;
  score: string;
  startDate: string;
  endDate: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  type: string;
  startDate: string;
  endDate: string;
  bulletPoints: string[];
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  link: string;
  date: string;
  description: string;
}
```

---

## 11. API ENDPOINTS REFERENCE

**Resume Operations:**
- `GET /api/resumes` - List user's resumes
- `GET /api/resumes/{id}` - Get resume data
- `POST /api/resumes` - Create new resume
- `PUT /api/resumes/{id}` - Update resume
- `DELETE /api/resumes/{id}` - Delete resume
- `GET /api/resumes/{id}/pdf` - Download PDF

---

**Generated:** May 15, 2026
**Analysis Scope:** Full codebase validation for limits, rendering, and styling
