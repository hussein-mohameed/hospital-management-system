import { PrismaClient, Role, VisitStatus, ExamStatus, CaseStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed database operation...");

  // 1. Clear database tables in order of dependency
  await prisma.report.deleteMany({});
  await prisma.visitExam.deleteMany({});
  await prisma.examination.deleteMany({});
  await prisma.visitDoctor.deleteMany({});
  await prisma.visit.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("🧹 Existing database tables cleared successfully.");

  // 2. Hash passwords
  const adminPasswordHash = await hash("Admin@123", 10);
  const doctorPasswordHash = await hash("Doctor@123", 10);
  const receptionPasswordHash = await hash("Reception@123", 10);

  // 3. Create Admin User
  const admin = await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@hospital.com",
      passwordHash: adminPasswordHash,
      role: Role.SUPER_ADMIN,
    },
  });
  console.log("👤 Created Admin user: admin / Admin@123");

  // 4. Create Receptionist User
  const receptionist = await prisma.user.create({
    data: {
      username: "reception",
      email: "reception@hospital.com",
      passwordHash: receptionPasswordHash,
      role: Role.RECEPTIONIST,
    },
  });
  console.log("👤 Created Receptionist user: reception / Reception@123");

  // 5. Create Doctor Users and Doctor profiles
  const doc1 = await prisma.user.create({
    data: {
      username: "ali.rawi",
      email: "ali.rawi@hospital.com",
      passwordHash: doctorPasswordHash,
      role: Role.DOCTOR,
      doctor: {
        create: {
          fullName: "د. علي الراوي",
          specialty: "أمراض القلب والأوعية الدموية",
          phone: "07701122334",
          isActive: true,
        },
      },
    },
    include: { doctor: true },
  });

  const doc2 = await prisma.user.create({
    data: {
      username: "fatima.husseini",
      email: "fatima.husseini@hospital.com",
      passwordHash: doctorPasswordHash,
      role: Role.DOCTOR,
      doctor: {
        create: {
          fullName: "د. فاطمة الحسيني",
          specialty: "طب الأطفال وحديثي الولادة",
          phone: "07802233445",
          isActive: true,
        },
      },
    },
    include: { doctor: true },
  });

  const doc3 = await prisma.user.create({
    data: {
      username: "hussein.mohammed",
      email: "hussein.mohammed@hospital.com",
      passwordHash: doctorPasswordHash,
      role: Role.DOCTOR,
      doctor: {
        create: {
          fullName: "د. حسين محمد",
          specialty: "الجراحة العامة والأورام",
          phone: "07903344556",
          isActive: true,
        },
      },
    },
    include: { doctor: true },
  });

  const doc4 = await prisma.user.create({
    data: {
      username: "ahmed.khalil",
      email: "ahmed.khalil@hospital.com",
      passwordHash: doctorPasswordHash,
      role: Role.DOCTOR,
      doctor: {
        create: {
          fullName: "د. أحمد خليل",
          specialty: "الطب الباطني",
          phone: "07505566778",
          isActive: true,
        },
      },
    },
    include: { doctor: true },
  });

  console.log("👨‍⚕️ Created 4 Specialist Doctor accounts: Doctor@123");

  // 6. Create Patients
  const patientsData = [
    {
      fullName: "حسن علي الموسوي",
      dateOfBirth: new Date("1985-04-12"),
      region: "بغداد، الكرادة",
      email: "hassan.ali@gmail.com",
      phone: "07701234567",
      description: "يعاني من ضغط الدم المرتفع المزمن وحساسية من البنسلين.",
    },
    {
      fullName: "زهراء جعفر الصائغ",
      dateOfBirth: new Date("1992-09-24"),
      region: "البصرة، العشار",
      email: "zahra.jafar@yahoo.com",
      phone: "07809876543",
      description: "متابعة حمل طبيعي في الشهر الخامس.",
    },
    {
      fullName: "مصطفى كمال الدين الأربيلية",
      dateOfBirth: new Date("1978-01-05"),
      region: "أربيل، عنكاوة",
      email: "mustafa.k@gmail.com",
      phone: "07501112223",
      description: "مريض سكري من النوع الثاني يحتاج جرعات إنسولين منتظمة.",
    },
    {
      fullName: "كرار حسين الخفاجي",
      dateOfBirth: new Date("2000-11-30"),
      region: "النجف، الكوفة",
      email: "karrar.h@gmail.com",
      phone: "07712345678",
      description: "فحص روتيني رياضي لإصابة طفيفة في الكاحل الأيسر.",
    },
    {
      fullName: "مريم يوسف الربيعي",
      dateOfBirth: new Date("1965-06-18"),
      region: "كربلاء، حي الحسين",
      email: "maryam.y@gmail.com",
      phone: "07812233445",
      description: "تعاني من آلام مفاصل روماتيزمية وتتلقى علاج مسكن دوري.",
    },
    {
      fullName: "سجاد هادي الشمري",
      dateOfBirth: new Date("1990-08-15"),
      region: "بابل، الحلة",
      email: "sajjad.h@gmail.com",
      phone: "07855566677",
      description: "مراجعة بسبب صداع نصفي متكرر.",
    }
  ];

  const patients = [];
  for (const p of patientsData) {
    const createdPatient = await prisma.patient.create({ data: p });
    patients.push(createdPatient);
  }
  console.log(`🧑‍🤝‍🧑 Created ${patients.length} Sample Patients with Iraqi Phone credentials`);

  // 7. Create Lab & Imaging Examinations Catalog
  const examsData = [
    { name: "تحليل الدم الكامل CBC", category: "BLOOD", normalRange: "4.5 - 11.0", unit: "10^3/uL" },
    { name: "فحص السكر التراكمي HbA1c", category: "BLOOD", normalRange: "4.8 - 5.6", unit: "%" },
    { name: "فحص وظائف الكلى Creatinine", category: "BLOOD", normalRange: "0.6 - 1.2", unit: "mg/dL" },
    { name: "فحص السكر الصائم Fasting Blood Sugar", category: "BLOOD", normalRange: "70 - 99", unit: "mg/dL" },
    { name: "تحليل البول العام Urine Analysis", category: "URINE", normalRange: "Negative", unit: "" },
    { name: "تخطيط كهربائية القلب ECG", category: "CARDIAC", normalRange: "Normal sinus rhythm", unit: "" },
    { name: "أشعة الصدر Chest X-Ray", category: "IMAGING", normalRange: "Clear lung fields", unit: "" },
  ];

  const examinations = [];
  for (const e of examsData) {
    const createdExam = await prisma.examination.create({ data: e });
    examinations.push(createdExam);
  }
  console.log(`🧪 Created ${examinations.length} Lab/Imaging Diagnostic catalogs`);

  // 8. Create Sample Visits with doctors, exams, and reports
  // Visit 1: Hassan Ali under Dr. Ali Al-Rawi (Completed)
  const visit1 = await prisma.visit.create({
    data: {
      patientId: patients[0].id,
      visitDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: VisitStatus.COMPLETED,
      chiefComplaint: "خفقان مستمر في القلب وصداع في مؤخرة الرأس عند الاستيقاظ.",
      notes: "ضغط الدم المقاس 160/95. النبض 92 نبضة بالدقيقة. علامات إعياء عام.",
      diagnosis: "ارتفاع حاد مؤقت لضغط الدم الأساسي مع إجهاد بدني.",
      doctors: {
        create: [
          { doctorId: doc1.doctor!.id },
        ],
      },
      examinations: {
        create: [
          {
            examinationId: examinations[5].id, // ECG
            result: "Normal sinus rhythm with slight left axis deviation",
            status: ExamStatus.COMPLETED,
            performedAt: new Date(),
          },
          {
            examinationId: examinations[2].id, // Creatinine
            result: "0.9",
            status: ExamStatus.COMPLETED,
            performedAt: new Date(),
          },
        ],
      },
      report: {
        create: {
          content: "بعد إجراء التخطيط والفحص السريري، تبين وجود تشنج خفيف بالشرايين بسبب الإجهاد. تم كتابة علاج (Concor 5mg) حبة واحدة صباحاً مع تقليل الملح والراحة لمدة 3 أيام.",
          status: CaseStatus.TREATED,
        },
      },
    },
  });

  // Visit 2: Mustafa Kamal under Dr. Fatima Al-Husseini (In Progress)
  const visit2 = await prisma.visit.create({
    data: {
      patientId: patients[2].id,
      visitDate: new Date(), // Today
      status: VisitStatus.IN_PROGRESS,
      chiefComplaint: "مراجعة دورية لضبط جرعة الإنسولين مع إحساس بالدوار صباحاً.",
      notes: "السكر المقاس عشوائياً 142. الوزن ثابت.",
      doctors: {
        create: [
          { doctorId: doc2.doctor!.id },
        ],
      },
      examinations: {
        create: [
          {
            examinationId: examinations[1].id, // HbA1c
            status: ExamStatus.PENDING,
          },
          {
            examinationId: examinations[3].id, // Fasting Blood Sugar
            status: ExamStatus.PENDING,
          },
        ],
      },
    },
  });

  // Visit 3: Maryam Yousif under Dr. Hussein Mohammed (Pending)
  const visit3 = await prisma.visit.create({
    data: {
      patientId: patients[4].id,
      visitDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      status: VisitStatus.PENDING,
      chiefComplaint: "آلام حادة أسفل الظهر تمتد للرجل اليمنى مع صعوبة في الحركة.",
      notes: "محجوز مسبقاً للفحص السريري العام.",
      doctors: {
        create: [
          { doctorId: doc3.doctor!.id },
        ],
      },
    },
  });

  // Visit 4: Sajjad Hadi under Dr. Ahmed Khalil (Pending)
  const visit4 = await prisma.visit.create({
    data: {
      patientId: patients[5].id,
      visitDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      status: VisitStatus.PENDING,
      chiefComplaint: "صداع نصفي متكرر مع عدم وضوح في الرؤية.",
      notes: "مراجعة أولية للتشخيص.",
      doctors: {
        create: [
          { doctorId: doc4.doctor!.id },
        ],
      },
    },
  });

  console.log("🏥 Seeded 4 active patient visit dossiers (COMPLETED, IN_PROGRESS, PENDING).");
  console.log("🎉 Database seeded successfully! Ready to run.");
}

main()
  .catch((e) => {
    console.error("❌ Seed database operation failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
