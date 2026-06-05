import fs from "fs";
import path from "path";

// Define the file path for the mock database
const dbFilePath = path.join(process.cwd(), "prisma", "mock_db.json");

// Helper to generate IDs
const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substring(2, 9)}`;

// Initial seed data
const initialDb = {
  user: [
    {
      id: "mock-admin-id",
      username: "admin",
      email: "admin@hospital.com",
      passwordHash: "$2a$10$U7v02P3J6R7fB3L3c.sWaeK8BqBwFf1C0eT1B9u0C.9mZc9Uu.C9u", // hash of Admin@123
      role: "SUPER_ADMIN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mock-doc-user-1",
      username: "ali.rawi",
      email: "ali.rawi@hospital.com",
      passwordHash: "$2a$10$U7v02P3J6R7fB3L3c.sWaeK8BqBwFf1C0eT1B9u0C.9mZc9Uu.C9u",
      role: "DOCTOR",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mock-doc-user-2",
      username: "fatima.husseini",
      email: "fatima.husseini@hospital.com",
      passwordHash: "$2a$10$U7v02P3J6R7fB3L3c.sWaeK8BqBwFf1C0eT1B9u0C.9mZc9Uu.C9u",
      role: "DOCTOR",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mock-doc-user-3",
      username: "hussein.mohammed",
      email: "hussein.mohammed@hospital.com",
      passwordHash: "$2a$10$U7v02P3J6R7fB3L3c.sWaeK8BqBwFf1C0eT1B9u0C.9mZc9Uu.C9u",
      role: "DOCTOR",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  doctor: [
    {
      id: "doc-1",
      userId: "mock-doc-user-1",
      fullName: "د. علي الراوي",
      specialty: "أمراض القلب والأوعية الدموية",
      phone: "07701122334",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "doc-2",
      userId: "mock-doc-user-2",
      fullName: "د. فاطمة الحسيني",
      specialty: "طب الأطفال وحديثي الولادة",
      phone: "07802233445",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "doc-3",
      userId: "mock-doc-user-3",
      fullName: "د. حسين محمد",
      specialty: "الجراحة العامة والأورام",
      phone: "07903344556",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  patient: [
    {
      id: "patient-1",
      fullName: "حسن علي الموسوي",
      dateOfBirth: "1985-04-12T00:00:00.000Z",
      region: "بغداد، الكرادة",
      email: "hassan.ali@gmail.com",
      phone: "07701234567",
      description: "يعاني من ضغط الدم المرتفع المزمن وحساسية من البنسلين.",
      isActive: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "patient-2",
      fullName: "زهراء جعفر الصائغ",
      dateOfBirth: "1992-09-24T00:00:00.000Z",
      region: "البصرة، العشار",
      email: "zahra.jafar@yahoo.com",
      phone: "07809876543",
      description: "متابعة حمل طبيعي في الشهر الخامس.",
      isActive: true,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "patient-3",
      fullName: "مصطفى كمال الدين الأربيلية",
      dateOfBirth: "1978-01-05T00:00:00.000Z",
      region: "أربيل، عنكاوة",
      email: "mustafa.k@gmail.com",
      phone: "07501112223",
      description: "مريض سكري من النوع الثاني يحتاج جرعات إنسولين منتظمة.",
      isActive: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "patient-4",
      fullName: "كرار حسين الخفاجي",
      dateOfBirth: "2000-11-30T00:00:00.000Z",
      region: "النجف، الكوفة",
      email: "karrar.h@gmail.com",
      phone: "07712345678",
      description: "فحص روتيني رياضي لإصابة طفيفة في الكاحل الأيسر.",
      isActive: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "patient-5",
      fullName: "مريم يوسف الربيعي",
      dateOfBirth: "1965-06-18T00:00:00.000Z",
      region: "كربلاء، حي الحسين",
      email: "maryam.y@gmail.com",
      phone: "07812233445",
      description: "تعاني من آلام مفاصل روماتيزمية وتتلقى علاج مسكن دوري.",
      isActive: true,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  examination: [
    { id: "exam-1", name: "تحليل الدم الكامل CBC", category: "BLOOD", normalRange: "4.5 - 11.0", unit: "10^3/uL", createdAt: new Date().toISOString() },
    { id: "exam-2", name: "فحص السكر التراكمي HbA1c", category: "BLOOD", normalRange: "4.8 - 5.6", unit: "%", createdAt: new Date().toISOString() },
    { id: "exam-3", name: "فحص وظائف الكلى Creatinine", category: "BLOOD", normalRange: "0.6 - 1.2", unit: "mg/dL", createdAt: new Date().toISOString() },
    { id: "exam-4", name: "فحص السكر الصائم Fasting Blood Sugar", category: "BLOOD", normalRange: "70 - 99", unit: "mg/dL", createdAt: new Date().toISOString() },
    { id: "exam-5", name: "تحليل البول العام Urine Analysis", category: "URINE", normalRange: "Negative", unit: "", createdAt: new Date().toISOString() },
    { id: "exam-6", name: "تخطيط كهربائية القلب ECG", category: "CARDIAC", normalRange: "Normal sinus rhythm", unit: "", createdAt: new Date().toISOString() },
    { id: "exam-7", name: "أشعة الصدر Chest X-Ray", category: "IMAGING", normalRange: "Clear lung fields", unit: "", createdAt: new Date().toISOString() }
  ],
  visit: [
    {
      id: "visit-1",
      patientId: "patient-1",
      visitDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      status: "COMPLETED",
      chiefComplaint: "خفقان مستمر في القلب وصداع في مؤخرة الرأس عند الاستيقاظ.",
      notes: "ضغط الدم المقاس 160/95. النبض 92 نبضة بالدقيقة. علامات إعياء عام.",
      diagnosis: "ارتفاع حاد مؤقت لضغط الدم الأساسي مع إجهاد بدني.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "visit-2",
      patientId: "patient-3",
      visitDate: new Date().toISOString(), // Today
      status: "IN_PROGRESS",
      chiefComplaint: "مراجعة دورية لضبط جرعة الإنسولين مع إحساس بالدوار صباحاً.",
      notes: "السكر المقاس عشوائياً 142. الوزن ثابت.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "visit-3",
      patientId: "patient-5",
      visitDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      status: "PENDING",
      chiefComplaint: "آلام حادة أسفل الظهر تمتد للرجل اليمنى مع صعوبة في الحركة.",
      notes: "محجوز مسبقاً للفحص السريري العام.",
      createdAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  visitDoctor: [
    { visitId: "visit-1", doctorId: "doc-1" },
    { visitId: "visit-2", doctorId: "doc-2" },
    { visitId: "visit-3", doctorId: "doc-3" }
  ],
  visitExam: [
    {
      id: "ve-1",
      visitId: "visit-1",
      examinationId: "exam-6",
      result: "Normal sinus rhythm with slight left axis deviation",
      status: "COMPLETED",
      performedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "ve-2",
      visitId: "visit-1",
      examinationId: "exam-3",
      result: "0.9",
      status: "COMPLETED",
      performedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "ve-3",
      visitId: "visit-2",
      examinationId: "exam-2",
      status: "PENDING",
    },
    {
      id: "ve-4",
      visitId: "visit-2",
      examinationId: "exam-4",
      status: "PENDING",
    }
  ],
  report: [
    {
      id: "rep-1",
      visitId: "visit-1",
      content: "بعد إجراء التخطيط والفحص السريري، تبين وجود تشنج خفيف بالشرايين بسبب الإجهاد. تم كتابة علاج (Concor 5mg) حبة واحدة صباحاً مع تقليل الملح والراحة لمدة 3 أيام.",
      status: "TREATED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ]
};

// Database state accessor
function readDb(): any {
  if (!fs.existsSync(dbFilePath)) {
    fs.mkdirSync(path.dirname(dbFilePath), { recursive: true });
    fs.writeFileSync(dbFilePath, JSON.stringify(initialDb, null, 2), "utf8");
    return initialDb;
  }
  try {
    const content = fs.readFileSync(dbFilePath, "utf8");
    return JSON.parse(content);
  } catch (e) {
    console.error("Failed to read mock db file, resetting to initial data", e);
    return initialDb;
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("Failed to write to mock db", e);
  }
}

// Matching and filtering functions
function matchesFilter(item: any, where: any): boolean {
  if (!where) return true;

  for (const key of Object.keys(where)) {
    const filterVal = where[key];

    if (key === "OR" && Array.isArray(filterVal)) {
      return filterVal.some((subWhere: any) => matchesFilter(item, subWhere));
    }
    if (key === "AND" && Array.isArray(filterVal)) {
      return filterVal.every((subWhere: any) => matchesFilter(item, subWhere));
    }
    if (key === "NOT") {
      return !matchesFilter(item, filterVal);
    }

    const itemVal = item[key];

    if (filterVal && typeof filterVal === "object" && !(filterVal instanceof Date)) {
      if ("contains" in filterVal) {
        const needle = String(filterVal.contains);
        const haystack = String(itemVal || "");
        if (filterVal.mode === "insensitive") {
          if (!haystack.toLowerCase().includes(needle.toLowerCase())) return false;
        } else {
          if (!haystack.includes(needle)) return false;
        }
      }
      else if ("equals" in filterVal) {
        if (itemVal !== filterVal.equals) return false;
      }
      else if ("gte" in filterVal) {
        const itemTime = new Date(itemVal).getTime();
        const filterTime = new Date(filterVal.gte).getTime();
        if (itemTime < filterTime) return false;
      }
      else if ("lte" in filterVal) {
        const itemTime = new Date(itemVal).getTime();
        const filterTime = new Date(filterVal.lte).getTime();
        if (itemTime > filterTime) return false;
      }
      else if ("in" in filterVal) {
        const arr = filterVal.in;
        if (Array.isArray(arr) && !arr.includes(itemVal)) return false;
      }
    } else {
      if (filterVal instanceof Date) {
        if (new Date(itemVal).getTime() !== filterVal.getTime()) return false;
      } else {
        if (itemVal !== filterVal) return false;
      }
    }
  }
  return true;
}

// Expander / Relational Join Resolver
function expandItem(modelName: string, item: any, include: any, db: any): any {
  if (!include || !item) return item;

  const newItem = { ...item };

  for (const relationName of Object.keys(include)) {
    if (!include[relationName]) continue;

    const subInclude = typeof include[relationName] === "object" ? include[relationName].include : null;

    if (modelName === "user" && relationName === "doctor") {
      const doctor = db.doctor.find((d: any) => d.userId === item.id);
      newItem.doctor = expandItem("doctor", doctor, subInclude, db);
    }

    if (modelName === "doctor" && relationName === "user") {
      const user = db.user.find((u: any) => u.id === item.userId);
      newItem.user = expandItem("user", user, subInclude, db);
    }

    if (modelName === "visit" && relationName === "patient") {
      const patient = db.patient.find((p: any) => p.id === item.patientId);
      newItem.patient = expandItem("patient", patient, subInclude, db);
    }

    if (modelName === "visit" && relationName === "doctors") {
      const visitDoctors = db.visitDoctor.filter((vd: any) => vd.visitId === item.id);
      newItem.doctors = visitDoctors.map((vd: any) => {
        const expandedVd = { ...vd };
        const doctor = db.doctor.find((d: any) => d.id === vd.doctorId);
        expandedVd.doctor = expandItem("doctor", doctor, typeof include[relationName].include?.doctor === "object" ? include[relationName].include.doctor.include : null, db);
        return expandedVd;
      });
    }

    if (modelName === "visit" && relationName === "examinations") {
      const visitExams = db.visitExam.filter((ve: any) => ve.visitId === item.id);
      newItem.examinations = visitExams.map((ve: any) => {
        const expandedVe = { ...ve };
        const exam = db.examination.find((e: any) => e.id === ve.examinationId);
        expandedVe.examination = expandItem("examination", exam, typeof include[relationName].include?.examination === "object" ? include[relationName].include.examination.include : null, db);
        return expandedVe;
      });
    }

    if (modelName === "visit" && relationName === "report") {
      const report = db.report.find((r: any) => r.visitId === item.id);
      newItem.report = expandItem("report", report, subInclude, db);
    }

    if (modelName === "patient" && relationName === "visits") {
      const visits = db.visit.filter((v: any) => v.patientId === item.id);
      newItem.visits = visits.map((v: any) => expandItem("visit", v, subInclude, db));
    }

    if (modelName === "visitExam" && relationName === "examination") {
      const exam = db.examination.find((e: any) => e.id === item.examinationId);
      newItem.examination = expandItem("examination", exam, subInclude, db);
    }

    if (modelName === "report" && relationName === "visit") {
      const visit = db.visit.find((v: any) => v.id === item.visitId);
      newItem.visit = expandItem("visit", visit, subInclude, db);
    }
  }

  return newItem;
}

// Generate Model Operations Class
class MockModel {
  constructor(private name: string) {}

  async findMany(args: any = {}) {
    const db = readDb();
    let list = db[this.name] || [];

    // Filter
    if (args.where) {
      list = list.filter((item: any) => matchesFilter(item, args.where));
    }

    // Sort
    if (args.orderBy) {
      const orderKeys = Object.keys(args.orderBy);
      if (orderKeys.length > 0) {
        const key = orderKeys[0];
        const direction = args.orderBy[key];
        list = [...list].sort((a, b) => {
          const valA = a[key];
          const valB = b[key];
          if (valA === valB) return 0;
          if (direction === "desc") {
            return valA < valB ? 1 : -1;
          } else {
            return valA > valB ? 1 : -1;
          }
        });
      }
    }

    // Pagination
    if (typeof args.skip === "number") {
      list = list.slice(args.skip);
    }
    if (typeof args.take === "number") {
      list = list.slice(0, args.take);
    }

    // Expand includes
    if (args.include) {
      list = list.map((item: any) => expandItem(this.name, item, args.include, db));
    }

    return list;
  }

  async findFirst(args: any = {}) {
    const list = await this.findMany(args);
    return list[0] || null;
  }

  async findUnique(args: any = {}) {
    return this.findFirst(args);
  }

  async count(args: any = {}) {
    const db = readDb();
    let list = db[this.name] || [];
    if (args.where) {
      list = list.filter((item: any) => matchesFilter(item, args.where));
    }
    return list.length;
  }

  async create(args: any = {}) {
    const db = readDb();
    const data = args.data || {};
    const id = data.id || generateId(this.name);

    // Filter nested fields from core item
    const coreData: any = { id };
    for (const key of Object.keys(data)) {
      const val = data[key];
      if (val && typeof val === "object" && ("create" in val || "connect" in val)) {
        // Nested relation write - handled below
        continue;
      }
      coreData[key] = val;
    }

    // Set timestamps
    coreData.createdAt = new Date().toISOString();
    coreData.updatedAt = new Date().toISOString();

    db[this.name].push(coreData);

    // Handle nested creates
    if (this.name === "user" && data.doctor?.create) {
      const docData = data.doctor.create;
      const docId = generateId("doctor");
      const doctor = {
        id: docId,
        userId: id,
        ...docData,
        isActive: docData.isActive ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.doctor.push(doctor);
    }

    if (this.name === "visit") {
      if (data.doctors?.create) {
        const createList = Array.isArray(data.doctors.create) ? data.doctors.create : [data.doctors.create];
        for (const vd of createList) {
          db.visitDoctor.push({
            visitId: id,
            doctorId: vd.doctorId,
            role: vd.role || null,
          });
        }
      }
      if (data.examinations?.create) {
        const createList = Array.isArray(data.examinations.create) ? data.examinations.create : [data.examinations.create];
        for (const ve of createList) {
          db.visitExam.push({
            id: generateId("visitExam"),
            visitId: id,
            examinationId: ve.examinationId,
            result: ve.result || null,
            status: ve.status || "PENDING",
            notes: ve.notes || null,
            performedAt: ve.performedAt || null,
          });
        }
      }
    }

    writeDb(db);

    // Fetch newly created record with any expands requested
    return this.findUnique({ where: { id }, include: args.include });
  }

  async update(args: any = {}) {
    const db = readDb();
    const where = args.where || {};
    const data = args.data || {};

    const index = db[this.name].findIndex((item: any) => matchesFilter(item, where));
    if (index === -1) {
      throw new Error(`Record to update not found in ${this.name}`);
    }

    const item = db[this.name][index];
    const updatedItem = { ...item };

    for (const key of Object.keys(data)) {
      const val = data[key];
      if (val && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
        // Ignore nested operations like connect/create for simple mocks
        continue;
      }
      updatedItem[key] = val;
    }

    updatedItem.updatedAt = new Date().toISOString();
    db[this.name][index] = updatedItem;

    writeDb(db);

    return this.findUnique({ where: { id: updatedItem.id }, include: args.include });
  }

  async upsert(args: any = {}) {
    const db = readDb();
    const where = args.where || {};
    const existing = db[this.name].find((item: any) => matchesFilter(item, where));

    if (existing) {
      return this.update({ where, data: args.update, include: args.include });
    } else {
      return this.create({ data: args.create, include: args.include });
    }
  }

  async delete(args: any = {}) {
    const db = readDb();
    const where = args.where || {};
    const index = db[this.name].findIndex((item: any) => matchesFilter(item, where));
    if (index === -1) {
      throw new Error(`Record to delete not found in ${this.name}`);
    }
    const deleted = db[this.name].splice(index, 1)[0];
    writeDb(db);
    return deleted;
  }

  async deleteMany(args: any = {}) {
    const db = readDb();
    if (!args.where || Object.keys(args.where).length === 0) {
      const count = db[this.name].length;
      db[this.name] = [];
      writeDb(db);
      return { count };
    }
    const initialCount = db[this.name].length;
    db[this.name] = db[this.name].filter((item: any) => !matchesFilter(item, args.where));
    writeDb(db);
    const count = initialCount - db[this.name].length;
    return { count };
  }
}

// Export mock client instantiator
export function getMockPrisma() {
  // Return an object that mirrors the Prisma client
  return {
    user: new MockModel("user"),
    doctor: new MockModel("doctor"),
    patient: new MockModel("patient"),
    visit: new MockModel("visit"),
    visitDoctor: new MockModel("visitDoctor"),
    examination: new MockModel("examination"),
    visitExam: new MockModel("visitExam"),
    report: new MockModel("report"),
    $disconnect: async () => {},
    $connect: async () => {},
  };
}
