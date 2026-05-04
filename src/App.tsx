import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Search, 
  FileText, 
  Archive, 
  Plus, 
  X, 
  Link as LinkIcon, 
  Upload, 
  ChevronRight, 
  FileCheck,
  AlertCircle,
  Clock,
  Edit3,
  Save,
  Activity,
  Calendar,
  Eye,
  Download,
  Bell,
  Mail,
  Send,
  Reply,
  Trash2,
  User,
  AlertTriangle,
  ShieldCheck,
  Radio,
  Zap,
  ShieldAlert,
  Shield,
  Printer,
  Paperclip,
  Lock,
  Power,
  History,
  UserCheck,
  ChevronLeft,
  Fingerprint,
  UserCircle,
  GanttChartSquare,
  Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as pdfjs from 'pdfjs-dist';

// Type definitions
interface Employee {
  id: string;
  name: string;
  position?: string;
  department?: string;
  avatar?: string;
  status?: 'online' | 'busy' | 'offline';
  office?: string;
}

interface Notification {
  id: number;
  title: string;
  body: string;
  date: string;
  read?: boolean;
  type?: string;
}

interface Message {
  id: number;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  read?: boolean;
}

interface EntryData {
  from: string;
  to: string;
  date?: string;
  branch: string;
  type?: string;
  needsProcessing?: boolean;
  summary?: string;
  title?: string;
  status?: string;
}

interface Movement {
  id: string;
  from: string;
  to: string;
  date: string;
  branch: string;
  status?: string;
  grace?: number;
}

interface FileData {
  name: string;
  url?: string;
  id?: string;
  thumbnail?: string;
}

interface Document {
  id: string;
  docNumber: string;
  entityNumber: string;
  name: string;
  type: string;
  date: string;
  content?: string;
  attachments?: string[];
  entry?: EntryData;
  movements?: Movement[];
  files?: FileData[];
  office?: string;
}

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// --- Constants & Data (Full Lists from HTML) ---
const ENTITIES = [
  "قيادة الامن الداخلي في دمشق", "قيادة الأمن الداخلي ريف في دمشق", "قيادة الامن الداخلي في حمص", "قيادة الامن الداخلي في حماه", "قيادة الامن الداخلي في إدلب", "قيادة الامن الداخلي في حلب", "قيادة الامن الداخلي في دير الزور", "قيادة الامن الداخلي في الحسكة", "قيادة الامن الداخلي في طرطوس", "قيادة الامن الداخلي في اللاذقية", "قيادة الامن الداخلي في درعا", "قيادة الامن الداخلي في البادية", "قيادة الامن الداخلي في الرقة", "قيادة الامن الداخلي في القنيطرة", "قيادة الامن الداخلي في السويداء", "مكتب السيد معاون الوزير لشؤون الشرطة", "مكتب السيد معاون الوزير لشؤون القوى البشرية", "مكتب السيد معاون الوزير للشؤون الإدارية والمالية", "مكتب السيد معاون الوزير للشؤون الأمنية", "مكتب السيد معاون الوزير للشؤون التقنية", "مكتب مستشار السيد الوزير لشؤون القانونية", "مكتب السيد نائب الوزير", "دائرة الشكاوى - دمشق", "مكتب السيد الوزير", "إدارة القوى البشرية", "إدارة الهجرة والجوازات", "إدارة الخدمات الطبية", "إدارة الحماية والأمن الدبلوماسي", "إدارة القضايا والملاحقات المسلكية", "إدارة المباحث الجنائية", "إدارة مكافحة المخدرات", "إدارة مكافحة الإرهاب", "إدارة الاتصال والشبكات", "إدارة العمليات", "إدارة الاتجار بالاشخاص", "إدارة الاصلاحيات والسجون", "إدارة التدريب والتاهيل", "إدارة الانشاءات", "إدارة المرور", "إدارة المركبات والرحبات", "إدارة الاتصال والدعم التنفيذي", "إدارة التخطيط والتنظيم", "إدارة التوجيه المعنوي والشرعي", "إدارة الرقابة التفتيش", "إدارة أندية ضباط قوى الأمن الداخلي", "إدارة الشرطة السياحية", "نقابة المحامين", "إدارة المطابع", "إدارة التسليح والمهمات", "الإدارة المالية", "إدارة أمن المطارات والمنافذ", "إدارة أمن الاتصالات", "إدارة الاعلام", "إدارة أمن الطرق العامة", "المديرية العامة للشؤون المدنية", "إدارة المعلومات", "الهيئة العامة لمستشفى الشرطة بحرستا", "إدارة التعاون الدولي", "نقابة المهندسين", "إدارة المهام الخاصة", "إدارة الأمن السيبراني", "جهازالاستخبارات العامة", "إدارة امن المعلومات", "الهيئة العامة لمشفى الشرطة", "إدارة وحدات K9", "إدارة المعلوماتية", "إدارة أمن المنشأت الحيوية", "فرع شؤون العاملين المدنيين والمتعاقدين", "فرع شؤون صف الضباط", "فرع السكن الوظيفي", "فرع شؤون الضباط", "قسم الرواتب والأجور", "فرع الدعم والرعاية", "فرع المتابعة والتقييم", "فرع الانتساب والقبول", "فرع التنمية والتطوير", "فرع المعلوماتية", "معاون مدير إدارة القوى البشرية", "معاون مدير إدارة القوى البشرية 2", "فرع شؤون الأفراد", "قسم التوظيف", "الديوان المركزي", "فرع التخطيط والإحصاء", "فرع إدارة البيانات", "قسم المركبات", "مكتب الخدمات اللوجستية", "مدير مكتب إدارة القوى البشرية", "غير ذلك"
];

const BRANCHES = [
  "فرع شؤون العاملين المدنيين والمتعاقدين", "فرع شؤون صف الضباط", "فرع السكن الوظيفي", "فرع شؤون الضباط", "قسم الرواتب والأجور", "فرع الدعم والرعاية", "فرع المتابعة والتقييم", "فرع الانتساب والقبول", "فرع التنمية والتطوير", "فرع المعلوماتية", "معاون مدير إدارة القوى البشرية", "معاون مدير إدارة القوى البشرية 2", "فرع شؤون الأفراد", "قسم التوظيف", "الديوان المركزي", "فرع التخطيط والإحصاء", "فرع إدارة البيانات", "قسم المركبات", "مكتب الخدمات اللوجستية", "مدير مكتب إدارة القوى البشرية", "غير ذلك"
];

const TRANS_TYPES = [
  "نقل", "احتياج نقل", "استقالة", "طرد", "تسريح", "فصل", "شطب", "انهاء خدمة", "تثبيت", "توظيف", "انهاء تعاقد", "تبديل مسمى وظيفي", "اجازة دراسية", "اجازة مرضية", "اجازة خارجية", "اجازة امومة", "اجازة استيداع بلا اجر", "تعيين", "ندب", "رخصة زواج", "اضافة عقار", "بدل ايجار", "تخصيص شقة سكنية", "ابقاء بالسكن", "ايفاد دراسة", "تسجيل جامعة", "دورات تدريبية", "تعديل رقم ذاتي / استبدال", "إضافة ولد", "اضافة زوجة", "كف يد", "طلب انتساب", "موافاة استمارة", "موافاة بيانات", "التحاق", "تسيير", "طي قرار", "غير ذلك"
];

const DECISION_TYPES = ["نقل", "تعيين", "ترقية", "تثبيت", "ندب / إعارة", "إيفاد / بعثة", "إعادة للخدمة", "إحالة على التقاعد", "تسريح من الخدمة", "استقالة", "فصل / طرد", "تعديل وضع وظيفي", "منح قدم ممتاز", "إنهاء خدمة", "إجازة استيداع", "تغيير مسمى وظيفي", "غير ذلك"];
const DISC_TYPES = ["تشكيل مجلس انضباط", "تحقيق مسلكي", "عقوبة مباشرة", "كف يد عن العمل", "إعادة للخدمة", "حفظ ملف", "غير ذلك"];
const DISC_RESULTS = ["إنذار", "توبيخ", "حسم من الراتب", "حبس مسلكي", "تنزيل رتبة", "طرد من الخدمة", "تسريح تأديبي", "براءة", "غير ذلك"];

type Office = 'entry' | 'archive' | 'data' | 'reports' | 'inquiry' | 'messages';
type EntryTab = 'letters' | 'decisions' | 'disciplinary' | 'telegrams' | 'circulars' | 'search';

export default function App() {
  const [activeOffice, setActiveOffice] = useState<Office>('entry');
  const [activeEntryTab, setActiveEntryTab] = useState<EntryTab>('letters');
  
  // Inquiry State
  const [inquirySearch, setInquirySearch] = useState({ docNumber: "", entityNumber: "", name: "" });
  const [inquiryDoc, setInquiryDoc] = useState<Document | null>(null);
  const [isInquiryLoading, setIsInquiryLoading] = useState(false);
  const [inquiryError, setInquiryError] = useState("");
  
  // Archive States
  const [archiveDocId, setArchiveDocId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  
  // Notifications & Messaging State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [internalMessages, setInternalMessages] = useState<Message[]>([]);
  const [currentEmployeeId, setCurrentEmployeeId] = useState("emp1"); // Default user
  const [newMessage, setNewMessage] = useState({ from: "emp1", to: "", subject: "مراسلة", body: "" });
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [newNotification, setNewNotification] = useState({ title: "", body: "", type: "info" });
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchMessages();
    fetchEmployees();
    const interval = setInterval(() => {
      fetchNotifications();
      fetchMessages();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees', {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 100)}`);
      }
      const data = await res.json();
      setEmployees(data);
    } catch (err) { 
      console.error("Failed to fetch employees", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 100)}`);
      }
      const data = await res.json();
      setNotifications(data);
    } catch (err) { 
      console.error("Failed to fetch notifications", err);
      if (err instanceof Error) console.log("Error details:", err.message);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages', {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 100)}`);
      }
      const data = await res.json();
      setInternalMessages(data);
    } catch (err) { 
      console.error("Failed to fetch messages", err);
      if (err instanceof Error) console.log("Error details:", err.message);
    }
  };

  const markNotifRead = async (id: number) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const handleSendMessage = async () => {
    if (!newMessage.to || !newMessage.body) return;
    setIsSendingMsg(true);
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newMessage, from: currentEmployeeId })
      });
      setNewMessage({ ...newMessage, body: "" });
      fetchMessages();
    } catch (err) { console.error(err); }
    finally { setIsSendingMsg(false); }
  };

  const handleSendNotification = async () => {
    if (!newNotification.title || !newNotification.body) return;
    setIsSendingNotif(true);
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotification)
      });
      setNewNotification({ title: "", body: "", type: "info" });
      fetchNotifications();
      handleSave("تم بث التنبيه لجميع المكاتب بنجاح");
    } catch (err) { console.error(err); }
    finally { setIsSendingNotif(false); }
  };
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [archiveStatus, setArchiveStatus] = useState<'waiting' | 'found'>('waiting');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [needsReview, setNeedsReview] = useState(false);
  const [archiveShowSplit, setArchiveShowSplit] = useState(false);
  const [docHistory, setDocHistory] = useState<Record<string, number>>({});
  const [archiveTarget, setArchiveTarget] = useState("");

  const removePage = (id: string) => {
    setPages((prev: {id: string, name: string, url?: string, thumbnail?: string}[]) => prev.filter(p => p.id !== id));
    if (pages.length <= 1) setUploadedFile(null);
  };

  // New Archive Metadata States
  const [archiveType, setArchiveType] = useState<string>("إدخال جديد");
  const [movementNumber, setMovementNumber] = useState<number>(1);
  const [archiveDate, setArchiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [pages, setPages] = useState<{id: string, name: string, url?: string, thumbnail?: string}[]>([]);

  // Thumbnail Generator Using PDF.js
  const generateThumbnail = async (file: File): Promise<string> => {
    try {
      const data = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      
      const viewport = page.getViewport({ scale: 0.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (context) {
        await page.render({ canvasContext: context, viewport, canvas: canvas } as any).promise;
        return canvas.toDataURL();
      }
    } catch (error) {
      console.error("Thumbnail generation failed:", error);
    }
    return '';
  };

  useEffect(() => {
    if (archiveType === "إدخال جديد") {
      setMovementNumber(1);
      setPages([]);
    } else if (archiveType === "تسديد") {
      const lastMove = docHistory[archiveDocId] || 1;
      setMovementNumber(lastMove + 1);
    } else if (archiveType === "تعديل") {
      setMovementNumber(docHistory[archiveDocId] || 1);
    }
  }, [archiveType, archiveDocId, docHistory]);

  // Repeater States
  const [adminNames, setAdminNames] = useState<string[]>(['']);
  const [discNames, setDiscNames] = useState<string[]>(['']);
  const [teleRecipients, setTeleRecipients] = useState<string[]>(['']);
  const [teleNames, setTeleNames] = useState<string[]>(['']);

  const [searchScope, setSearchScope] = useState<string>('all');
  const [letterType, setLetterType] = useState("");
  const [letterFrom, setLetterFrom] = useState("");
  const [letterTo, setLetterTo] = useState("");
  
  useEffect(() => {
    if (letterType === "صادر") {
      setLetterFrom("إدارة القوى البشرية");
    } else if (letterType === "وارد") {
      setLetterTo("إدارة القوى البشرية");
    }
  }, [letterType]);

  const [isSaving, setIsSaving] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [previewFile, setPreviewFile] = useState<{name: string, url: string} | null>(null);

  // --- Unified Document & Movement State ---
  const [allDocs, setAllDocs] = useState<Record<string, Document>>({
    "12345": {
      id: "12345",
      docNumber: "12345",
      entityNumber: "E-12345",
      name: "خطة تداول الوثيقة",
      type: "وارد",
      date: "2026-04-20",
      entry: { from: "قيادة الأمن العام", to: "إدارة القوى البشرية", date: "2026-04-20", branch: "الديوان المركزي", type: "وارد", needsProcessing: false },
      movements: [
        { id: "1", from: "قيادة الأمن العام", to: "إدارة القوى البشرية", branch: "الديوان المركزي", date: "2026-04-20", grace: 3, status: "مكتمل (مؤرشف)" }
      ],
      files: [{ id: 'f1', name: 'كتاب_رسمي_عن_بعد.pdf', thumbnail: '' }]
    },
    "1001": {
      id: "1001",
      docNumber: "1001",
      entityNumber: "E-1001",
      name: "طلب صيانة المعدات الثقيلة",
      type: "وارد",
      date: "2024-04-20",
      entry: {
        type: "كتاب رسمي",
        date: "2024-04-20",
        branch: "فرع الخرطوم",
        summary: "طلب صيانة دورية للمعدات الثقيلة في موقع العمل الرئيسي",
        needsProcessing: true,
        from: "فرع الخرطوم",
        to: ''
      },
      movements: [
        { id: "1", date: "2024-04-20", from: "الموقع", to: "فرع الخرطوم", branch: "فرع الخرطوم", grace: 2 },
        { id: "2", date: "2024-04-22", from: "فرع الخرطوم", to: "الديوان العام", branch: "الديوان العام", grace: 3 }
      ]
    },
    "1002": {
      id: "1002",
      docNumber: "1002",
      entityNumber: "E-1002",
      name: "تنسيب موظفين جدد",
      type: "وارد",
      date: "2024-04-25",
      entry: {
        type: "قرار إداري",
        date: "2024-04-25",
        branch: "فرع أم درمان",
        summary: "تنسيب موظفين جدد لقسم العمليات اللوجستية",
        needsProcessing: false,
        from: "إدارة الموارد البشرية",
        to: ''
      },
      movements: [
        { id: "1", date: "2024-04-25", from: "الموارد البشرية", to: "فرع أم درمان", branch: "فرع أم درمان", grace: 5 },
        { id: "2", date: "2024-04-28", from: "فرع أم درمان", to: "الديوان", branch: "الديوان", grace: 1 }
      ]
    }
  });
  const [searchId, setSearchId] = useState("");
  const [currentDoc, setCurrentDoc] = useState<Document | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedFrom, setEditedFrom] = useState("");
  const [editedTo, setEditedTo] = useState("");
  const [editedBranch, setEditedBranch] = useState("");
  const [editedNeedsProcessing, setEditedNeedsProcessing] = useState(true);
  const [movementDate, setMovementDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const movementTableRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!movementTableRef.current || !currentDoc) return;
    
    setIsSaving(true);
    try {
      const element = movementTableRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save(`خطه_المعامله_${currentDoc.id}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("حدث خطأ أثناء تصدير الملف");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDownloadStatsReport = () => {
    setIsSaving(true);
    try {
      const allDocsList = Object.values(allDocs) as any[];
      
      const filteredDocs = allDocsList.filter((doc: any) => {
        const docDate = new Date(doc.entry.date);
        const start = reportStartDate ? new Date(reportStartDate) : null;
        const end = reportEndDate ? new Date(reportEndDate) : null;
        const branchToMatch = reportFilterBasis === "current" ? doc.entry.branch : doc.entry.from;
        const matchesBranch = reportBranch === "الكل" || branchToMatch === reportBranch;
        const matchesStart = !start || docDate >= start;
        const matchesEnd = !end || docDate <= end;
        return matchesBranch && matchesStart && matchesEnd;
      });

      const stats = {
        total: filteredDocs.length,
        completed: filteredDocs.filter(d => d.entry.needsProcessing === false).length,
        pending: filteredDocs.filter(d => d.entry.needsProcessing === true).length,
        delayed: filteredDocs.filter(d => {
          const lastM = d.movements[d.movements.length - 1];
          const mDate = new Date(lastM.date);
          const today = new Date();
          today.setHours(0,0,0,0);
          const grace = lastM.grace || 0;
          const waitDays = Math.max(0, Math.ceil((today.getTime() - mDate.getTime()) / (1000 * 60 * 60 * 24)));
          return waitDays > grace;
        }).length
      };

      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Header
      pdf.setFillColor(26, 43, 86);
      pdf.rect(0, 0, 210, 40, 'F');
      pdf.setTextColor(255);
      pdf.setFontSize(24);
      pdf.text('إحصائيات إنجاز المعاملات', 105, 20, { align: 'center' });
      pdf.setFontSize(10);
      pdf.text(`تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}`, 105, 30, { align: 'center' });

      let y = 55;

      // Filter Info
      pdf.setTextColor(80);
      pdf.setFontSize(11);
      pdf.text(`الفرع: ${reportBranch}`, 195, y, { align: 'right' });
      pdf.text(`الفترة: ${reportStartDate || 'غير محدد'} إلى ${reportEndDate || 'اليوم'}`, 10, y, { align: 'left' });
      y += 15;

      // Summary Cards
      pdf.setDrawColor(230);
      pdf.setFillColor(248, 250, 252);
      
      // Total Received
      pdf.rect(145, y, 50, 25, 'F');
      pdf.setTextColor(26, 43, 86);
      pdf.setFontSize(10);
      pdf.text('إجمالي المعاملات', 170, y + 8, { align: 'center' });
      pdf.setFontSize(16);
      pdf.text(stats.total.toString(), 170, y + 18, { align: 'center' });

      // Completed
      pdf.setFillColor(240, 253, 244);
      pdf.rect(80, y, 50, 25, 'F');
      pdf.setTextColor(22, 163, 74);
      pdf.setFontSize(10);
      pdf.text('المعاملات المعالجة', 105, y + 8, { align: 'center' });
      pdf.setFontSize(16);
      pdf.text(stats.completed.toString(), 105, y + 18, { align: 'center' });

      // Delayed
      pdf.setFillColor(254, 242, 242);
      pdf.rect(15, y, 50, 25, 'F');
      pdf.setTextColor(220, 38, 38);
      pdf.setFontSize(10);
      pdf.text('المعاملات المتأخرة', 40, y + 8, { align: 'center' });
      pdf.setFontSize(16);
      pdf.text(stats.delayed.toString(), 40, y + 18, { align: 'center' });

      y += 40;

      // Detailed Branch Breakdown
      pdf.setTextColor(26, 43, 86);
      pdf.setFontSize(14);
      pdf.text('تفصيل الأداء حسب الفرع', 195, y, { align: 'right' });
      y += 10;

      const branches = [...new Set(filteredDocs.map(d => d.entry.branch))];
      branches.forEach(br => {
        if (y > 270) { pdf.addPage(); y = 20; }
        const brDocs = filteredDocs.filter(d => d.entry.branch === br);
        const brDone = brDocs.filter(d => d.entry.needsProcessing === false).length;
        const brLate = brDocs.filter(d => {
          const lastM = d.movements[d.movements.length - 1];
          const mDate = new Date(lastM.date);
          const today = new Date();
          const grace = lastM.grace || 0;
          return Math.ceil((today.getTime() - mDate.getTime()) / (1000 * 60 * 60 * 24)) > grace;
        }).length;

        // Progress bar logic
        const percent = brDocs.length > 0 ? (brDone / brDocs.length) * 100 : 0;
        
        pdf.setFontSize(10);
        pdf.setTextColor(50);
        pdf.text(`${br}`, 195, y, { align: 'right' });
        
        // Progress Bar
        pdf.setFillColor(240, 240, 240);
        pdf.rect(15, y - 4, 100, 5, 'F');
        pdf.setFillColor(22, 163, 74);
        pdf.rect(15, y - 4, percent, 5, 'F');

        pdf.text(`إنجاز: %${Math.round(percent)}`, 130, y, { align: 'right' });
        pdf.text(`متأخر: ${brLate}`, 155, y, { align: 'right' });
        
        y += 12;
        pdf.setDrawColor(245);
        pdf.line(15, y - 5, 195, y - 5);
      });

      pdf.save(`احصائيات_الانجاز_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error("Stats Export Error:", err);
      alert("حدث خطأ أثناء تصدير الإحصائيات");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInquirySearch = () => {
    const { docNumber, entityNumber, name } = inquirySearch;
    if (!docNumber.trim() && !entityNumber.trim() && !name.trim()) {
      setInquiryError("يرجى إدخال معيار واحد للبحث على الأقل (رقم الوثيقة، رقم الجهة، أو الاسم)");
      return;
    }
    
    setIsInquiryLoading(true);
    setInquiryError("");
    
    // Simulate lookup from allDocs
    setTimeout(() => {
      const allDocsList = Object.values(allDocs);
      const foundDoc = allDocsList.find((doc: any) => {
        const matchDoc = docNumber.trim() ? doc.id.includes(docNumber.trim()) : true;
        
        // Entity number could be a custom field or mapped to entry info
        // For demo, we'll check if entry.entityNumber exists, otherwise we match against entry.from string
        const entityNumToMatch = doc.entry.entityNumber || "";
        const matchEntity = entityNumber.trim() ? entityNumToMatch.includes(entityNumber.trim()) || doc.entry.from.includes(entityNumber.trim()) : true;
        
        // Name match (checking summary or a potential name field)
        const nameToMatch = doc.entry.name || doc.entry.summary || "";
        const matchName = name.trim() ? nameToMatch.includes(name.trim()) : true;
        
        return (docNumber.trim() ? matchDoc : false) || 
               (entityNumber.trim() ? matchEntity : false) || 
               (name.trim() ? matchName : false);
      });

      if (foundDoc) {
        setInquiryDoc(foundDoc);
      } else {
        setInquiryDoc(null);
        setInquiryError("عذراً، لم يتم العثور على معاملة تطابق معايير البحث المدخلة.");
      }
      setIsInquiryLoading(false);
    }, 800);
  };

  const handleDownloadBranchReport = (type: 'needsProcessing' | 'delayed' | 'completed') => {
    setIsSaving(true);
    try {
      const allDocsList = Object.values(allDocs) as any[];
      
      let filteredDocs = allDocsList.filter((doc: any) => {
        // Basic Metadata Filter
        const docDate = new Date(doc.entry.date);
        const start = reportStartDate ? new Date(reportStartDate) : null;
        const end = reportEndDate ? new Date(reportEndDate) : null;
        
        const branchToMatch = reportFilterBasis === "current" ? doc.entry.branch : doc.entry.from;
        const matchesBranch = reportBranch === "الكل" || branchToMatch === reportBranch;
        
        const matchesStart = !start || docDate >= start;
        const matchesEnd = !end || docDate <= end;
        
        if (!(matchesBranch && matchesStart && matchesEnd)) return false;

        // Specific Type Filter
        if (type === 'needsProcessing') {
          return doc.entry.needsProcessing === true;
        } else if (type === 'completed') {
          return doc.entry.needsProcessing === false;
        } else if (type === 'delayed') {
          const lastMovement = doc.movements[doc.movements.length - 1];
          const mDate = new Date(lastMovement.date);
          const today = new Date();
          today.setHours(0,0,0,0);
          const grace = lastMovement.grace || 0;
          const waitDays = Math.max(0, Math.ceil((today.getTime() - mDate.getTime()) / (1000 * 60 * 60 * 24)));
          return waitDays > grace;
        }
        return true;
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Title
      pdf.setFontSize(22);
      pdf.setTextColor(26, 43, 86);
      
      let title = "";
      if (type === 'needsProcessing') title = 'تقرير المعاملات التي بحاجة معالجة';
      else if (type === 'completed') title = 'تقرير المعاملات المنجزة (ليست بحاجة معالجة)';
      else if (type === 'delayed') title = 'تقرير المعاملات المتأخرة المستحقة';
      
      const basisText = reportFilterBasis === "sender" ? " (الصادرة من الفرع)" : " (الموجودة في الفرع)";
      pdf.text(title + basisText, 105, 20, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`الفرع: ${reportBranch} | الفترة: ${reportStartDate || 'البداية'} - ${reportEndDate || 'اليوم'}`, 105, 30, { align: 'center' });
      pdf.text(`تاريخ التصدير: ${new Date().toLocaleDateString('ar-EG')}`, 105, 36, { align: 'center' });
      
      let y = 50;
      
      const branches = [...new Set(filteredDocs.map((d: any) => d.entry.branch))];
      
      if (branches.length === 0) {
        pdf.setFontSize(14);
        pdf.text('لا توجد معاملات مطابقة للفلتر المحدد', 105, 70, { align: 'center' });
      } else {
        branches.forEach((branch: string) => {
          const branchDocs = filteredDocs.filter((d: any) => d.entry.branch === branch);
          
          pdf.setFillColor(248, 250, 252);
          pdf.rect(10, y, 190, 10, 'F');
          pdf.setTextColor(26, 43, 86);
          pdf.setFontSize(12);
          pdf.text(`الفرع: ${branch}`, 195, y + 7, { align: 'right' });
          y += 15;
          
          branchDocs.forEach((doc: any) => {
            if (y > 260) {
              pdf.addPage();
              y = 20;
            }
            
            pdf.setFontSize(10);
            pdf.setTextColor(0);
            pdf.text(`رقم: ${doc.id}`, 195, y, { align: 'right' });
            pdf.text(`تاريخ: ${doc.entry.date}`, 150, y, { align: 'right' });

            if (type === 'delayed') {
              const lastM = doc.movements[doc.movements.length - 1];
              const wait = Math.ceil((new Date().getTime() - new Date(lastM.date).getTime()) / (1000 * 60 * 60 * 24));
              const delay = Math.max(0, wait - (lastM.grace || 0));
              pdf.setTextColor(180, 0, 0);
              pdf.text(`التأخير: ${delay} يوم`, 30, y, { align: 'left' });
              pdf.setTextColor(0);
            }
            
            y += 7;
            pdf.setFontSize(9);
            pdf.setTextColor(80);
            const summary = doc.entry.summary || 'بدون ملخص';
            const splitSummary = pdf.splitTextToSize(summary, 170);
            pdf.text(splitSummary, 195, y, { align: 'right' });
            
            y += (splitSummary.length * 5) + 10;
            
            pdf.setDrawColor(240);
            pdf.line(10, y - 5, 200, y - 5);
          });
          
          y += 10;
        });
      }
      
      pdf.save(`تقرير_${type}_${reportBranch}_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error("Report Export Error:", err);
      alert("حدث خطأ أثناء تصدير التقرير");
    } finally {
      setIsSaving(false);
    }
  };

  // Entry Form States
  const [entryDocId, setEntryDocId] = useState("");
  const [entryRefId, setEntryRefId] = useState("");
  const [entryDocDate, setEntryDocDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryBranch, setEntryBranch] = useState("الديوان المركزي");
  const [entryTransType, setEntryTransType] = useState("");
  const [entrySummary, setEntrySummary] = useState("");
  const [entryNeedsProcessing, setEntryNeedsProcessing] = useState(true);
  const [reportBranch, setReportBranch] = useState("الكل");
  const [reportFilterBasis, setReportFilterBasis] = useState<"current" | "sender">("current");
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");
  const [newBranch, setNewBranch] = useState("");
  const [newGrace, setNewGrace] = useState("3");

  const handleFetchData = () => {
    if (!searchId) {
      alert("يرجى إدخال رقم الوثيقة للبحث");
      return;
    }
    
    setIsScanning(true);
    setIsEditMode(false);
    
    setTimeout(() => {
      let doc = allDocs[searchId];
      
      if (!doc) {
        // Generate Dummy Data for testing purposes
        const fallbackDate = new Date().toISOString().split('T')[0];
        doc = {
          id: searchId,
          docNumber: searchId,
          entityNumber: `E-${searchId}`,
          name: "معاملة وهمية",
          type: "وارد",
          date: fallbackDate,
          entry: { 
            from: "رئاسة الأركان (افتراضي)", 
            to: "إدارة القوى البشرية", 
            date: fallbackDate, 
            branch: "فرع شؤون الضباط", 
            type: "وارد",
            needsProcessing: true
          },
          movements: [
            { id: "1", from: "رئاسة الأركان", to: "إدارة القوى البشرية", branch: "الديوان المركزي", date: fallbackDate, grace: 3, status: "مكتمل (مؤرشف)" }
          ],
          files: [{ id: 'f_mock', name: 'ملف_وهمي_للمعاينة.pdf', thumbnail: '' }]
        };
        setAllDocs((prev: Record<string, Document>) => ({ ...prev, [searchId]: doc }));
      }

      setCurrentDoc(doc);
      setEditedFrom(doc.entry?.from || "");
      setEditedTo(doc.entry?.to || "");
      setEditedBranch(doc.entry?.branch || "");
      setEditedNeedsProcessing(doc.entry?.needsProcessing ?? true);
      setNewFrom(doc.movements?.[doc.movements.length - 1]?.to || "");
      
      setIsScanning(false);
    }, 1000);
  };

  const handleUpdateRecord = () => {
    if (!currentDoc) return;
    setIsSaving(true);
    setTimeout(() => {
      const updatedDoc = {
        ...currentDoc,
        entry: {
          ...currentDoc.entry,
          from: editedFrom,
          to: editedTo,
          branch: editedBranch,
          needsProcessing: editedNeedsProcessing
        }
      };
      setAllDocs((prev: Record<string, Document>) => ({ ...prev, [currentDoc.id]: updatedDoc }));
      setCurrentDoc(updatedDoc);
      setIsEditMode(false);
      setIsSaving(false);
      alert("تم تحديث بيانات السجل بنجاح");
    }, 1000);
  };

  const handleAddMovement = () => {
    if (!newTo) {
      alert("يرجى تحديد الجهة المرسل إليها");
      return;
    }
    if (!currentDoc) return;

    const nextId = ((currentDoc.movements?.length || 0) + 1).toString();
    const nm = {
      id: nextId,
      from: newFrom || "غير محدد",
      to: newTo,
      branch: newBranch || "غير محدد",
      date: movementDate,
      grace: parseInt(newGrace) || 0,
      status: "قيد المتابعة"
    };

    const updatedDoc = {
      ...currentDoc,
      movements: [...(currentDoc.movements || []), nm]
    };

    setAllDocs((prev: Record<string, Document>) => ({ ...prev, [currentDoc.id]: updatedDoc }));
    setCurrentDoc(updatedDoc);
    
    setNewFrom(newTo);
    setNewTo("");
    setNewBranch("");
  };

  const handleSaveToDatabase = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("تمت مزامنة السجل المتكامل وحفظه في قاعدة البيانات بنجاح");
    }, 1500);
  };

  // --- Actions ---
  const handleSave = (message: string, data?: any) => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      
      if (data && data.docId) {
        // Create initial record
        const newDoc = {
          id: data.docId,
          entry: data,
          movements: [{
            id: "1",
            from: data.from,
            to: data.to,
            branch: data.branch,
            date: data.date,
            grace: 3,
            status: "بانتظار الأرشفة"
          }],
          files: []
        };
        setAllDocs((prev: Record<string, Document>) => ({ ...prev, [data.docId]: newDoc }));
      }

      setLetterType("");
      setLetterFrom("");
      setLetterTo("");
      alert(message);
    }, 1500);
  };

  const handleArchiveSubmit = () => {
    if (!allDocs[archiveDocId]) {
      alert("الرقم المرجعي لم يتم إدخاله في مكتب الإدخال بعد!");
      return;
    }

    setIsSaving(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev: number) => Math.min(prev + 15, 100));
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setIsSaving(false);
      
      const doc = allDocs[archiveDocId];
      const updatedDoc = {
        ...doc,
        files: [...(doc.files || []), ...pages],
        movements: archiveType === "إدخال جديد" 
          ? (doc.movements || []).map((m: any) => m.id === "1" ? { ...m, status: "مكتمل (مؤرشف)" } : m)
          : [...(doc.movements || []), {
              id: (((doc.movements || []).length) + 1).toString(),
              from: "الأرشيف",
              to: "إدارة البيانات",
              branch: "تحديث وثائق",
              date: archiveDate,
              grace: 1,
              status: "تم الرفع"
            }]
      };

      setAllDocs((prev: Record<string, Document>) => ({ ...prev, [archiveDocId]: updatedDoc }));
      alert("تم ربط الملفات وتحديث حركة المعاملة بنجاح");
      
      setUploadedFile(null); 
      setPages([]);
      setArchiveDocId('');
    }, 1500);
  };

  const lastFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (previewFile) {
      lastFocusRef.current = document.activeElement as HTMLElement;
    } else if (lastFocusRef.current) {
      lastFocusRef.current.focus();
    }
  }, [previewFile]);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const getSearchHeaders = () => {
    switch (searchScope) {
      case 'letters': return ['رقم الوثيقة', 'من', 'إلى', 'الفرع', 'الإجراء'];
      case 'decisions': return ['رقم القرار', 'الأسماء', 'المعدة', 'الإجراء'];
      case 'disc': return ['رقم القرار', 'الأسماء', 'النتيجة', 'الإجراء'];
      case 'tele': return ['التسلسلي', 'المرسل إليه', 'الأسماء', 'الإجراء'];
      case 'circ': return ['رقم التعميم', 'الجهة المعدة', 'التاريخ', 'الإجراء'];
      default: return ['النوع', 'الرقم', 'الموضوع', 'التاريخ', 'الإجراء'];
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="bg-gradient-to-r from-royal via-[#0f362b] to-[#172d27] text-white shadow-2xl sticky top-0 z-50 border-b-4 border-gold">
        <div className="container mx-auto p-4 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 rounded-[28px] flex items-center justify-center border border-white/15 p-1 overflow-hidden group shadow-lg shadow-black/20">
                <img src="img/Syrian_logo_icon_gold.png"
                  alt="شعار وزارة الداخلية"
                  className="w-full h-full object-contain brightness-110 contrast-125 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-right">
                <h1 className="text-xl font-bold text-gold tracking-[0.28em] uppercase leading-none font-display">وزارة الداخلية</h1>
                <p className="text-[11px] opacity-90 font-bold mt-1 text-white/85">إدارة القوى البشرية - الديوان العام</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 border border-white/15 text-[11px] font-black uppercase tracking-[0.24em]">
                نظام الديوان العام
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 border border-white/15 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(110,231,183,0.35)]"></span>
                يعمل في وضع التطوير
              </span>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2 items-center justify-between overflow-x-auto no-scrollbar rounded-[34px] bg-white/10 border border-white/10 py-3 px-3 shadow-inner" role="tablist" aria-label="أقسام المكتب الرئيسية">
            <div className="flex flex-wrap gap-2 items-center">
              <NavBtn active={activeOffice === 'entry'} onClick={() => setActiveOffice('entry')}>مكتب الإدخال</NavBtn>
              <NavBtn active={activeOffice === 'archive'} onClick={() => setActiveOffice('archive')}>مكتب الأرشيف</NavBtn>
              <NavBtn active={activeOffice === 'data'} onClick={() => setActiveOffice('data')}>إدارة البيانات</NavBtn>
              <NavBtn active={activeOffice === 'reports'} onClick={() => setActiveOffice('reports')}>التقارير</NavBtn>
              <NavBtn active={activeOffice === 'inquiry'} onClick={() => setActiveOffice('inquiry')}>واجهة الاستعلام</NavBtn>
              <NavBtn active={activeOffice === 'messages'} onClick={() => setActiveOffice('messages')}>المراسلات</NavBtn>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 rounded-full bg-white/10 hover:bg-white/15 transition-colors"
                aria-label="فتح التنبيهات"
              >
                <Bell size={24} className="text-gold" />
                {notifications.filter((n: Notification) => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 translate-x-1 -translate-y-1 w-4 h-4 bg-red-600 text-white text-[10px] flex items-center justify-center rounded-full font-black border-2 border-royal">
                    {notifications.filter((n: Notification) => !n.read).length}
                  </span>
                )}
              </button>

              <button
                onClick={handleInstallClick}
                disabled={!deferredPrompt}
                className={`px-4 py-2 rounded-2xl text-[10px] font-black transition-all flex items-center gap-2 ${deferredPrompt ? 'bg-gold text-royal shadow-lg hover:bg-[#d4b96b]' : 'bg-white/10 text-white/50 cursor-not-allowed'}`}
                title={deferredPrompt ? 'تثبيت التطبيق كبرنامج مستقل' : 'متاح بعد استيفاء شروط التثبيت في المتصفح'}
                aria-label="تثبيت التطبيق"
              >
                📥 تثبيت التطبيق
              </button>

              <button
                onClick={() => { setActiveOffice('entry'); setActiveEntryTab('search'); }}
                className={`btn-nav-search-only ${activeEntryTab === 'search' && activeOffice === 'entry' ? 'active' : ''}`}
                title="البحث الشامل"
                aria-label="الانتقال إلى البحث الشامل"
                aria-pressed={activeEntryTab === 'search' && activeOffice === 'entry'}
              >
                <Search size={20} />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 flex-1 text-right">
        <AnimatePresence mode="wait">
          {activeOffice === 'entry' && (
            <motion.section 
              key="entry"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              id="section-entry"
            >
              <div id="entry-content-container">
                {activeEntryTab === 'letters' && (
                  <>
                    <Card title="تسجيل الكتب والمراسلات" accent="royal">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                      <Input label="رقم الوثيقة" value={entryDocId} onChange={setEntryDocId} />
                      <Input label="رقم الجهة" value={entryRefId} onChange={setEntryRefId} />
                      <Select label="نوع المراسلة" options={["وارد", "صادر"]} selected={letterType} onSelect={setLetterType} />
                      <Input label="تاريخ الوثيقة" type="date" value={entryDocDate} onChange={setEntryDocDate} />
                      <Select label="من" options={ENTITIES} searchable hasOther selected={letterFrom} onSelect={setLetterFrom} />
                      <Select label="إلى" options={ENTITIES} searchable hasOther selected={letterTo} onSelect={setLetterTo} />
                      <Select label="الفرع المختص" options={BRANCHES} searchable hasOther selected={entryBranch} onSelect={setEntryBranch} />
                      <Select label="نوع المعاملة" options={TRANS_TYPES} searchable hasOther selected={entryTransType} onSelect={setEntryTransType} />
                      <div className="col-span-full md:col-span-2 lg:col-span-1">
                        <label className="text-xs font-bold text-gray-500 mb-2 block">حالة المعالجة</label>
                        <div className="flex bg-slate-50 p-1 rounded-xl gap-1">
                          <button 
                            onClick={() => setEntryNeedsProcessing(true)}
                            className={`flex-1 py-2 rounded-lg text-[11px] font-black transition-all ${entryNeedsProcessing ? 'bg-royal text-white shadow-md' : 'text-slate-400 hover:bg-white/50'}`}
                          >
                            بحاجة معالجة
                          </button>
                          <button 
                            onClick={() => setEntryNeedsProcessing(false)}
                            className={`flex-1 py-2 rounded-lg text-[11px] font-black transition-all ${!entryNeedsProcessing ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-white/50'}`}
                          >
                            ليست بحاجة معالجة
                          </button>
                        </div>
                      </div>
                      <div className="col-span-full">
                        <label className="text-xs font-bold text-gray-500 mb-1 block">الخلاصة</label>
                        <textarea 
                          value={entrySummary}
                          onChange={(e) => setEntrySummary(e.target.value)}
                          className="w-full border border-gray-100 p-3 rounded-xl min-h-24 outline-none focus:ring-2 focus:ring-gold/20 transition-all text-right" 
                        />
                      </div>
                      <button 
                        disabled={isSaving}
                        onClick={() => {
                          if (!entryDocId) {
                            alert("يرجى إدخال رقم الوثيقة!");
                            return;
                          }
                          handleSave("تم حفظ الكتاب في السجل بنجاح! يمكن الآن أرشفته برقم: " + entryDocId, {
                            docId: entryDocId,
                            from: letterFrom,
                            to: letterTo,
                            date: entryDocDate,
                            branch: entryBranch,
                            type: letterType,
                            summary: entrySummary,
                            needsProcessing: entryNeedsProcessing
                          });
                          // Reset form
                          setEntryDocId("");
                          setEntryRefId("");
                          setEntrySummary("");
                        }}
                        className="col-span-full md:w-max px-16 py-3 bg-royal text-gold rounded-xl font-black shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSaving ? <LoadingSpinner size={18} /> : null}
                        حفظ الكتاب في السجل
                      </button>
                    </div>
                  </Card>

                    <div className="mt-8 flex gap-3 justify-between">
                      <button 
                        onClick={() => setActiveEntryTab('circulars')}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-black hover:bg-slate-200 transition-all"
                      >
                        التعاميم →
                      </button>
                      <button 
                        onClick={() => setActiveEntryTab('decisions')}
                        className="flex items-center gap-2 px-6 py-3 bg-royal text-gold rounded-xl font-black shadow-lg hover:bg-black transition-all"
                      >
                        → القرارات الإدارية
                      </button>
                    </div>
                  </>
                )}

                {activeEntryTab === 'decisions' && (
                  <>
                    <Card title="تسجيل القرارات الإدارية" accent="gold">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-gray-100 pb-4 gap-4">
                      <h2 className="font-black text-gold text-base">تسجيل القرارات الإدارية</h2>
                      <div className="flex items-end gap-2">
                        <Input label="رقم الربط" placeholder="000" />
                        <button className="bg-gray-50 text-blue-800 border border-gray-200 px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 hover:bg-blue-50 transition-all h-10">
                          <LinkIcon size={14} /> ربط
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                      <Input label="رقم القرار" />
                      <Input label="تاريخ القرار" type="date" />
                      <Select label="نوع القرار" options={DECISION_TYPES} searchable hasOther />
                      <Select label="الجهة المعدة للقرار" options={ENTITIES} searchable hasOther />
                      <div className="col-span-full md:col-span-2 lg:col-span-1">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-gray-500">الأسماء</label>
                          <button onClick={() => setAdminNames([...adminNames, ''])} className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded-lg text-[10px] font-black border border-green-100">+ إضافة اسم</button>
                        </div>
                        {adminNames.map((name, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <input className="flex-1 border border-gray-100 p-2 rounded-xl text-xs font-bold outline-none focus:border-gold text-right" placeholder="الاسم الكامل" value={name} onChange={(e) => {
                              const n = [...adminNames]; n[idx] = e.target.value; setAdminNames(n);
                            }} />
                            {idx > 0 && <button onClick={() => setAdminNames(adminNames.filter((_, i) => i !== idx))} className="text-red-400"><X size={14} /></button>}
                          </div>
                        ))}
                      </div>
                      <Select label="من (في حال النقل)" options={ENTITIES} searchable hasOther />
                      <Select label="إلى (في حال النقل)" options={ENTITIES} searchable hasOther />
                      <div className="col-span-full md:col-span-2 lg:col-span-1">
                        <label className="text-xs font-bold text-gray-500 mb-2 block text-right">حالة المعالجة</label>
                        <div className="flex bg-slate-50 p-1 rounded-xl gap-1">
                          <button 
                            onClick={() => setEntryNeedsProcessing(true)}
                            className={`flex-1 py-3 rounded-lg text-[11px] font-black transition-all ${entryNeedsProcessing ? 'bg-royal text-white shadow-md' : 'text-slate-400 hover:bg-white/50'}`}
                          >
                            بحاجة معالجة
                          </button>
                          <button 
                            onClick={() => setEntryNeedsProcessing(false)}
                            className={`flex-1 py-3 rounded-lg text-[11px] font-black transition-all ${!entryNeedsProcessing ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-white/50'}`}
                          >
                            ليست بحاجة معالجة
                          </button>
                        </div>
                      </div>
                      <div className="col-span-full">
                        <label className="text-xs font-bold text-gray-500 mb-1 block text-right">الخلاصة</label>
                        <textarea className="w-full border border-gray-100 p-3 rounded-xl min-h-24 outline-none focus:ring-2 focus:ring-gold/20 text-right" />
                      </div>
                      <button 
                        disabled={isSaving}
                        onClick={() => handleSave("تم حفظ القرار بنجاح!", { needsProcessing: entryNeedsProcessing })}
                        className="col-span-full md:w-max px-20 py-3 bg-black text-gold rounded-xl font-black shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSaving ? <LoadingSpinner size={18} /> : null}
                        حفظ القرار
                      </button>
                    </div>
                  </Card>

                    <div className="mt-8 flex gap-3 justify-between">
                      <button 
                        onClick={() => setActiveEntryTab('circulars')}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-black hover:bg-slate-200 transition-all"
                      >
                        التعاميم →
                      </button>
                      <button 
                        onClick={() => setActiveEntryTab('letters')}
                        className="flex items-center gap-2 px-6 py-3 bg-royal text-gold rounded-xl font-black shadow-lg hover:bg-black transition-all"
                      >
                        → الكتب والمراسلات
                      </button>
                    </div>
                  </>
                )}

                {activeEntryTab === 'disciplinary' && (
                  <>
                    <Card title="القرارات المسلكية" accent="red">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-gray-100 pb-4 gap-4">
                      <h2 className="font-black text-red-700 text-base">القرارات المسلكية</h2>
                      <div className="flex items-end gap-2">
                        <Input label="رقم الربط" />
                        <button className="bg-gray-50 text-blue-800 border border-gray-200 px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 h-10">
                          <LinkIcon size={14} /> ربط
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                      <Input label="رقم القرار" />
                      <Input label="رقم الوزير" />
                      <Input label="تاريخ القرار" type="date" />
                      <Select label="نوع القرار" options={DISC_TYPES} searchable hasOther />
                      <div className="col-span-full md:col-span-2 lg:col-span-1">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-red-700 font-black">الأسماء</label>
                          <button onClick={() => setDiscNames([...discNames, ''])} className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-lg text-[10px] font-black border border-red-100">+ إضافة</button>
                        </div>
                        {discNames.map((name, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <input className="flex-1 border border-red-50 p-2 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-red-100 text-right" placeholder="الاسم الكامل" value={name} onChange={(e) => {
                              const n = [...discNames]; n[idx] = e.target.value; setDiscNames(n);
                            }} />
                            {idx > 0 && <button onClick={() => setDiscNames(discNames.filter((_, i) => i !== idx))}><X size={14} /></button>}
                          </div>
                        ))}
                      </div>
                      <Select label="نتيجة القرار" options={DISC_RESULTS} searchable hasOther />
                      <Select label="الفرع المختص" options={BRANCHES} searchable hasOther />
                      <div className="col-span-full md:col-span-2">
                        <label className="text-xs font-bold text-red-700 mb-2 block text-right font-black">حالة المعالجة</label>
                        <div className="flex bg-red-50/50 p-1 rounded-xl gap-1 border border-red-50">
                          <button 
                            onClick={() => setEntryNeedsProcessing(true)}
                            className={`flex-1 py-3 rounded-lg text-[11px] font-black transition-all ${entryNeedsProcessing ? 'bg-red-700 text-white shadow-md' : 'text-red-300 hover:bg-white/50'}`}
                          >
                            بحاجة معالجة
                          </button>
                          <button 
                            onClick={() => setEntryNeedsProcessing(false)}
                            className={`flex-1 py-3 rounded-lg text-[11px] font-black transition-all ${!entryNeedsProcessing ? 'bg-emerald-600 text-white shadow-md' : 'text-red-300 hover:bg-white/50'}`}
                          >
                            ليست بحاجة معالجة
                          </button>
                        </div>
                      </div>
                      <button 
                        disabled={isSaving}
                        onClick={() => handleSave("تم حفظ القرار المسلكي بنجاح!", { needsProcessing: entryNeedsProcessing })}
                        className="col-span-full md:w-max px-24 py-3 bg-red-900 text-white rounded-xl font-black shadow-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSaving ? <LoadingSpinner size={18} color="white" /> : null}
                        حفظ المسلكي
                      </button>
                    </div>
                  </Card>

                    <div className="mt-8 flex gap-3 justify-between">
                      <button 
                        onClick={() => setActiveEntryTab('telegrams')}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-black hover:bg-slate-200 transition-all"
                      >
                        البرقيات →
                      </button>
                      <button 
                        onClick={() => setActiveEntryTab('decisions')}
                        className="flex items-center gap-2 px-6 py-3 bg-royal text-gold rounded-xl font-black shadow-lg hover:bg-black transition-all"
                      >
                        → القرارات الإدارية
                      </button>
                    </div>
                  </>
                )}

                {activeEntryTab === 'telegrams' && (
                  <>
                    <Card title="تسجيل البرقيات" accent="blue">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-gray-100 pb-4 gap-4">
                      <h2 className="font-black text-blue-800 text-base">تسجيل البرقيات</h2>
                      <div className="flex items-end gap-2">
                        <Input label="رقم الربط" />
                        <button className="bg-gray-50 text-blue-800 border border-gray-200 px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 h-10">
                          <LinkIcon size={14} /> ربط
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
                      <Input label="الرقم التسلسلي (إدارة العمليات)" />
                      <Select label="الجهة المرسلة" options={ENTITIES} searchable hasOther />
                      <div className="col-span-full md:col-span-2">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-blue-800 font-black">الجهات المرسل إليها</label>
                          <button onClick={() => setTeleRecipients([...teleRecipients, ''])} className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-[10px] font-black border border-blue-100">+ إضافة جهة</button>
                        </div>
                        {teleRecipients.map((rec, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <div className="flex-1"><Select label="" options={ENTITIES} searchable /></div>
                            {idx > 0 && <button onClick={() => setTeleRecipients(teleRecipients.filter((_, i) => i !== idx))}><X size={14} /></button>}
                          </div>
                        ))}
                      </div>
                      <div className="col-span-full md:col-span-2">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-blue-800 font-black">الأسماء</label>
                          <button onClick={() => setTeleNames([...teleNames, ''])} className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-[10px] font-black border border-blue-100">+ إضافة اسم</button>
                        </div>
                        {teleNames.map((name, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <input className="flex-1 border border-blue-50 p-2 rounded-xl text-xs font-bold outline-none text-right" placeholder="الاسم الكامل" value={name} onChange={(e) => {
                              const n = [...teleNames]; n[idx] = e.target.value; setTeleNames(n);
                            }} />
                            {idx > 0 && <button onClick={() => setTeleNames(teleNames.filter((_, i) => i !== idx))}><X size={14} /></button>}
                          </div>
                        ))}
                      </div>
                      <Input label="رقم البرقية" />
                      <div className="col-span-full md:col-span-2">
                        <label className="text-xs font-bold text-blue-800 mb-2 block text-right font-black">حالة المعالجة</label>
                        <div className="flex bg-blue-50/50 p-1 rounded-xl gap-1 border border-blue-50">
                          <button 
                            onClick={() => setEntryNeedsProcessing(true)}
                            className={`flex-1 py-3 rounded-lg text-[11px] font-black transition-all ${entryNeedsProcessing ? 'bg-blue-800 text-white shadow-md' : 'text-blue-300 hover:bg-white/50'}`}
                          >
                            بحاجة معالجة
                          </button>
                          <button 
                            onClick={() => setEntryNeedsProcessing(false)}
                            className={`flex-1 py-3 rounded-lg text-[11px] font-black transition-all ${!entryNeedsProcessing ? 'bg-emerald-600 text-white shadow-md' : 'text-blue-300 hover:bg-white/50'}`}
                          >
                            ليست بحاجة معالجة
                          </button>
                        </div>
                      </div>
                      <div className="col-span-full">
                        <label className="text-xs font-bold text-blue-800 font-black mb-1 block">الخلاصة</label>
                        <textarea className="w-full border border-blue-100 bg-gray-50/50 p-3 rounded-xl min-h-24 outline-none focus:ring-2 focus:ring-blue-100 text-right" />
                      </div>
                      <button 
                        disabled={isSaving}
                        onClick={() => handleSave("تم حفظ البرقية بنجاح!", { needsProcessing: entryNeedsProcessing })}
                        className="col-span-full md:w-max px-24 py-3 bg-blue-900 text-white rounded-xl font-black shadow-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSaving ? <LoadingSpinner size={18} color="white" /> : null}
                        حفظ البرقية
                      </button>
                    </div>
                  </Card>

                    <div className="mt-8 flex gap-3 justify-between">
                      <button 
                        onClick={() => setActiveEntryTab('circulars')}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-black hover:bg-slate-200 transition-all"
                      >
                        التعاميم →
                      </button>
                      <button 
                        onClick={() => setActiveEntryTab('disciplinary')}
                        className="flex items-center gap-2 px-6 py-3 bg-royal text-gold rounded-xl font-black shadow-lg hover:bg-black transition-all"
                      >
                        → القرارات المسلكية
                      </button>
                    </div>
                  </>
                )}

                {activeEntryTab === 'circulars' && (
                  <>
                    <Card title="تسجيل التعاميم" accent="green">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-gray-100 pb-4 gap-4">
                      <h2 className="font-black text-green-700 text-base">تسجيل التعاميم</h2>
                      <div className="flex items-end gap-2">
                        <div className="w-32"><Input label="رقم وثيقة الربط" /></div>
                        <button className="bg-gray-50 text-blue-800 border border-gray-200 px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 h-10 hover:bg-blue-50 transition-all">
                          <LinkIcon size={14} /> ربط
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      <Input label="رقم التعميم" placeholder="00/ت" />
                      <Input label="التاريخ" type="date" />
                      <Select label="الجهة المعدة للتعميم" options={ENTITIES} searchable hasOther />
                      <div className="col-span-full md:col-span-1">
                        <label className="text-xs font-bold text-green-700 mb-2 block text-right font-black">حالة المعالجة</label>
                        <div className="flex bg-green-50/50 p-1 rounded-xl gap-1 border border-green-50">
                          <button 
                            onClick={() => setEntryNeedsProcessing(true)}
                            className={`flex-1 py-3 rounded-lg text-[11px] font-black transition-all ${entryNeedsProcessing ? 'bg-green-800 text-white shadow-md' : 'text-green-300 hover:bg-white/50'}`}
                          >
                            بحاجة معالجة
                          </button>
                          <button 
                            onClick={() => setEntryNeedsProcessing(false)}
                            className={`flex-1 py-3 rounded-lg text-[11px] font-black transition-all ${!entryNeedsProcessing ? 'bg-emerald-600 text-white shadow-md' : 'text-green-300 hover:bg-white/50'}`}
                          >
                            ليست بحاجة معالجة
                          </button>
                        </div>
                      </div>
                      <div className="col-span-full">
                        <label className="text-xs font-bold text-gray-500 mb-1 block">مضمون التعميم</label>
                        <textarea className="w-full border border-gray-100 bg-gray-50/50 p-3 rounded-xl min-h-32 outline-none focus:ring-2 focus:ring-gold/20 text-right" />
                      </div>
                      <button 
                        disabled={isSaving}
                        onClick={() => handleSave("تم حفظ التعميم بنجاح!", { needsProcessing: entryNeedsProcessing })}
                        className="col-span-full md:w-max px-20 py-3 bg-green-800 text-white rounded-xl font-black shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSaving ? <LoadingSpinner size={18} color="white" /> : null}
                        حفظ التعميم
                      </button>
                    </div>
                  </Card>
                  </>
                )}

                {activeEntryTab === 'search' && (
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                    <h2 className="text-2xl font-black text-royal mb-8">محرك البحث الموحد</h2>
                    <div className="flex flex-wrap justify-center gap-2 mb-8" role="radiogroup" aria-label="نطاق البحث">
                       <FilterChip active={searchScope === 'all'} label="الكل (شامل)" onClick={() => setSearchScope('all')} />
                       <FilterChip active={searchScope === 'letters'} label="الكتب" onClick={() => setSearchScope('letters')} />
                       <FilterChip active={searchScope === 'decisions'} label="القرارات" onClick={() => setSearchScope('decisions')} />
                       <FilterChip active={searchScope === 'disc'} label="المسلكية" onClick={() => setSearchScope('disc')} />
                       <FilterChip active={searchScope === 'tele'} label="البرقيات" onClick={() => setSearchScope('tele')} />
                       <FilterChip active={searchScope === 'circ'} label="التعاميم" onClick={() => setSearchScope('circ')} />
                    </div>
                    <div className="max-w-3xl mx-auto flex gap-0 rounded-2xl border-2 border-gold overflow-hidden shadow-xl focus-within:ring-4 focus-within:ring-gold/10 transition-all">
                      <div className="bg-gray-50 px-5 flex items-center text-gray-400">
                        <Search size={22} />
                      </div>
                      <input className="flex-1 p-5 font-bold outline-none text-right" placeholder="ابحث بالاسم، الرقم، أو بالتاريخ..." aria-label="كلمة البحث" />
                      <button className="bg-royal text-gold px-12 font-black hover:bg-black transition-all" aria-label="تنفيذ البحث">بــحــث</button>
                    </div>
                    <div className="mt-12 overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-gray-50 text-royal">
                            <tr>
                              {getSearchHeaders().map((h, i) => <th key={i} className="p-4 font-black">{h}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            <tr><td colSpan={10} className="text-center py-20 text-gray-300 font-bold italic">النتائج تظهر هنا</td></tr>
                          </tbody>
                        </table>
                    </div>
                  </div>
                )}
              </div>
            </motion.section>
          )}

          {activeOffice === 'archive' && (
            <motion.section 
              key="archive"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border-t-8 border-gold">
                  <h3 className="font-black text-royal text-lg mb-6 flex items-center gap-2">
                    <FileCheck className="text-gold" /> بيانات المطابقة
                  </h3>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">رقم الوثيقة المرجعية</label>
                  <input 
                    type="text" value={archiveDocId}
                    onChange={(e) => { setArchiveDocId(e.target.value); setArchiveStatus(e.target.value.length > 2 ? 'found' : 'waiting'); }}
                    className="w-full text-center text-3xl font-black text-royal border-2 border-gray-100 rounded-2xl p-4 mt-2 outline-none focus:border-gold transition-all"
                    placeholder="000-000"
                  />
                  
                  <div className="mt-6 space-y-4">
                    <Select 
                      label="نوع الأرشفة" 
                      options={["إدخال جديد", "تعديل", "تسديد"]} 
                      onSelect={(val) => setArchiveType(val)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <label className="text-[11px] font-black text-slate-700 mb-1">تاريخ الأرشفة</label>
                        <input 
                          type="date" 
                          value={archiveDate}
                          onChange={(e) => setArchiveDate(e.target.value)}
                          className="border border-slate-200 p-2.5 rounded-xl text-xs font-bold outline-none text-right bg-gray-50" 
                        />
                      </div>
                      <div className="flex flex-col">
                         <label className="text-[11px] font-black text-slate-700 mb-1">رقم الحركة</label>
                         <input 
                            type="number" 
                            value={movementNumber}
                            onChange={(e) => setMovementNumber(parseInt(e.target.value) || 0)}
                            className="border border-slate-200 p-2.5 rounded-xl text-xs font-bold outline-none text-center bg-gray-50" 
                         />
                      </div>
                    </div>
                  </div>

                  <div className={`mt-6 p-5 rounded-2xl border transition-all ${archiveStatus === 'found' ? 'bg-green-50 border-green-100 opacity-100' : 'bg-gray-50 border-gray-100 opacity-40'}`}>
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase mb-4 inline-block ${archiveStatus === 'found' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {archiveStatus === 'found' ? 'سجل متاح' : 'في انتظار التحقق'}
                    </span>
                    <div className="space-y-2 text-xs font-bold text-slate-600">
                      <p>الموضوع: <span className="text-royal">{archiveStatus === 'found' ? 'طلب نقل - فرع الأفراد' : '---'}</span></p>
                      <p>التاريخ: <span className="text-royal">{archiveStatus === 'found' ? '29-04-2026' : '---'}</span></p>
                      <p>من: <span className="text-royal">{archiveStatus === 'found' ? 'قيادة المنطقة الشمالية' : '---'}</span></p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-royal to-black text-gold rounded-3xl p-6 shadow-xl">
                  <h4 className="font-black mb-4 text-xs border-b border-gold/20 pb-2 flex items-center gap-2">
                    <AlertCircle size={14} /> تعليمات الأرشفة والربط
                  </h4>
                  <ul className="text-[10px] space-y-3 font-bold opacity-80 leading-relaxed">
                    <li>• للماسح الضوئي الخارجي (USB): قم بالمسح باستخدام برامج مثل NAPS2 ثم اختر "رفع ملف PDF".</li>
                    <li className="text-gold">💡 نصيحة: استخدم زر "تثبيت البرنامج" أعلاه لتشغيل النظام كبرنامج مستقل على جهازك.</li>
                    <li>• ارفع الملفات بصيغة PDF فقط للارتباط الرقمي.</li>
                    <li>• الحجم الأقصى للوثيقة الواحدة 20 ميجابايت.</li>
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="bg-white rounded-[2rem] p-8 shadow-sm flex-1 flex flex-col min-h-[600px] border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-royal">مركز الأرشفة الرقمية</h2>
                    {uploadedFile && (
                      <button 
                        onClick={() => setArchiveShowSplit(!archiveShowSplit)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 transition-all ${
                          archiveShowSplit ? "bg-red-50 text-red-600 border border-red-100" : "bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20"
                        }`}
                      >
                        {archiveShowSplit ? <X size={14} /> : <Eye size={14} />}
                        {archiveShowSplit ? "إغلاق المعاينة" : "معاينة الوثيقة المرفقة"}
                      </button>
                    )}
                  </div>

                  <div className="flex-1 border-4 border-dashed border-gray-100 rounded-[2.5rem] relative overflow-hidden group hover:bg-slate-50 transition-colors flex flex-col items-center justify-center text-center">
                    {archiveShowSplit && pages.length > 0 ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full p-4 flex flex-col">
                        <div className="bg-slate-800 rounded-2xl overflow-hidden flex-1 shadow-inner relative">
                          <embed 
                            src={`${pages[0].url}#toolbar=0&navpanes=0&scrollbar=0`} 
                            type="application/pdf"
                            className="w-full h-full bg-white" 
                          />
                          <div className="absolute top-4 left-4 flex gap-2">
                            <button 
                              onClick={() => setPreviewFile({ name: pages[0].name, url: pages[0].url || '#' })} 
                              className="bg-white/90 p-2 rounded-lg shadow-sm hover:bg-white text-royal"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-center px-2">
                           <p className="text-[10px] font-black text-slate-500">{pages[0].name}</p>
                           <span className="text-[8px] bg-gold/10 text-gold px-2 py-1 rounded-full font-black">نمط المعاينة المباشرة</span>
                        </div>
                      </motion.div>
                    ) : (
                      <>
                        {archiveType === 'تعديل' && (
                      <div className="absolute top-6 right-6 z-10 flex flex-col gap-2 text-right">
                        <button 
                          onClick={() => {
                            if (!archiveDocId) {
                              alert("يرجى إكمال البيانات الأساسية (الرقم المرجعي) قبل إلحاق الملفات!");
                              return;
                            }
                            document.getElementById('file-upload')?.click();
                          }} 
                          className={`p-3 rounded-xl shadow-lg transition-all flex items-center gap-2 text-[10px] font-black ${
                            archiveDocId 
                              ? "bg-green-600 text-white hover:bg-green-700" 
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <Plus size={14} /> إلحاق ملف جديد
                        </button>
                        <button className="bg-amber-500 text-white p-3 rounded-xl shadow-lg hover:bg-amber-600 transition-all flex items-center gap-2 text-[10px] font-black">
                          <Edit3 size={14} /> تعديل بيانات الوثيقة
                        </button>
                      </div>
                    )}
                    
                    {isScanning && (
                      <motion.div 
                        initial={{ top: 0 }} animate={{ top: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 w-full h-1 bg-gold shadow-[0_0_20px_#a68d6d] z-10"
                      />
                    )}
                    {!uploadedFile && !isScanning && (
                      <div className="relative z-20 flex flex-col items-center">
                        <div 
                          onClick={() => {
                            if (!archiveDocId) {
                              alert("يرجى إدخال رقم الوثيقة المرجعية أولاً!");
                              return;
                            }
                            document.getElementById('file-upload')?.click();
                          }}
                          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all group/up border-2 border-dashed mb-6 ${
                            archiveDocId 
                              ? "bg-gold/10 hover:bg-gold/20 border-gold/30" 
                              : "bg-gray-100 border-gray-200 grayscale opacity-50"
                          }`}
                        >
                          <Upload className="text-gold w-10 h-10 mb-2 group-hover/up:scale-110 transition-transform" />
                          <span className="text-xs font-black text-gold uppercase tracking-widest">رفع وثيقة PDF</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-700">مركز الأرشفة والربط الرقمي</h3>
                        <p className="text-xs text-gray-400 font-bold mt-2 tracking-tight">
                          {archiveDocId 
                            ? "إسقط الملف هنا أو اضغط للرفع اليدوي" 
                            : "يرجى إكمال بيانات الأرشفة أعلاه أولاً"}
                        </p>
                        <input id="file-upload" type="file" className="hidden" onChange={async (e) => {
                             const f = e.target.files?.[0];
                                 if (f) {
                                   setIsScanning(true);
                                   const url = URL.createObjectURL(f);
                                   const thumbnail = await generateThumbnail(f);
                                   const newDoc = { id: Date.now().toString(), name: f.name, url, thumbnail };
                                   setUploadedFile({ name: f.name, size: (f.size / (1024 * 1024)).toFixed(2) + " MB", url, thumbnail } as any);
                                   setPages(prev => [...prev, newDoc]);
                                   setNeedsReview(true);
                                   setIsScanning(false);
                                 }
                        }} accept=".pdf" />
                      </div>
                    )}
                    {isScanning && (
                      <div className="text-center animate-pulse">
                        <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-6" />
                        <p className="font-black text-gold text-lg">جاري معالجة الملف واستيراد البيانات...</p>
                      </div>
                    )}
                    {uploadedFile && !isScanning && (
                      <div className="w-full max-w-2xl px-6">
                        {pages.length > 0 ? (
                           <div className="flex flex-wrap justify-center gap-4 py-8">
                              {pages.map((page, index) => (
                                <motion.div 
                                  key={page.id} 
                                  initial={{ scale: 0.9, opacity: 0 }} 
                                  animate={{ scale: 1, opacity: 1 }} 
                                  transition={{ delay: index * 0.1 }}
                                  className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 relative group w-40 cursor-pointer hover:border-gold/50 transition-all font-sans"
                                  onClick={() => setPreviewFile({ name: page.name, url: page.url || '#' })}
                                >
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); removePage(page.id); if(page.url) URL.revokeObjectURL(page.url); }} 
                                      className="absolute -top-3 -left-3 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
                                      title="حذف هذه الصفحة"
                                   >
                                      <X size={14} />
                                   </button>
                                   <div className="absolute top-2 right-3 text-[10px] font-black text-gray-300">#{index + 1}</div>
                                   {page.thumbnail ? (
                                      <img src={page.thumbnail} alt="Preview" className="w-full h-24 object-cover rounded-lg mb-3 shadow-inner border border-gray-50" />
                                   ) : (
                                      <FileText size={40} className="text-red-500 mx-auto mb-3" />
                                   )}
                                   <p className="text-[9px] font-bold truncate text-slate-600 text-center">{page.name}</p>
                                   <div className="mt-3 flex justify-center">
                                      <span className="text-[8px] bg-slate-50 px-2 py-1 rounded-md text-slate-400 font-bold uppercase">PDF DOCUMENT</span>
                                   </div>
                                </motion.div>
                              ))}
                           </div>
                        ) : (
                          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-12 rounded-[2rem] shadow-2xl border border-gray-100 w-full max-w-sm relative overflow-hidden mx-auto">
                            {needsReview && <div className="absolute top-0 right-0 bg-gold text-white px-6 py-1 font-black text-[9px] uppercase tracking-tighter transform rotate-[-45deg] translate-x-[-20px] translate-y-[10px]">مراجعة الرقمنة</div>}
                            <FileText size={80} className="text-red-500 mx-auto mb-6" />
                            <h4 className="font-black text-slate-800 mb-1 truncate">{uploadedFile.name}</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-4">{uploadedFile.size}</p>
                            
                            {isSaving && (
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                                <motion.div 
                                  className="bg-gold h-full" 
                                  initial={{ width: 0 }} 
                                  animate={{ width: `${uploadProgress}%` }} 
                                />
                              </div>
                            )}
                            
                            <div className="flex gap-4 justify-center">
                              <button onClick={() => { setUploadedFile(null); setNeedsReview(false); setPages([]); }} className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors uppercase">إلغاء</button>
                              {needsReview && !isSaving && <button onClick={() => setPreviewFile({ name: uploadedFile.name, url: (uploadedFile as any).url || '#' })} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase">معاينة كاملة</button>}
                            </div>
                          </motion.div>
                        )}
                        {pages.length > 0 && (
                           <div className="text-center pb-6">
                              <button onClick={() => { setUploadedFile(null); setPages([]); setNeedsReview(false); }} className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors uppercase">إلغاء الكل والبدء من جديد</button>
                           </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
                  <button 
                    disabled={!uploadedFile || isScanning || isSaving} 
                    onClick={handleArchiveSubmit}
                    className="mt-10 bg-royal text-gold py-5 rounded-[1.25rem] font-black text-lg shadow-xl hover:bg-black transition-all disabled:opacity-30 flex items-center justify-center gap-3"
                  >
                    {isSaving ? <LoadingSpinner size={24} /> : null}
                    {needsReview ? "تأكيد ومعالجة المستند" : uploadedFile ? "رفع ملف PDF" : "تـنـفـيــذ الأرشــفــة الـرقـمـيــة"}
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          {/* 3. مكتب إدارة البيانات (Data Management) */}
          {activeOffice === 'data' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-100 pb-6 mb-8 gap-4">
                  <h3 className="text-xl font-black text-royal italic">استكمال وتعديل بيانات السجل</h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="w-40 border border-gold/30 bg-[#fffdf5] rounded-xl px-4 py-2 text-sm outline-none font-bold text-center text-royal"
                      placeholder="رقم الوثيقة"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                    />
                    <button 
                      onClick={handleFetchData}
                      disabled={isScanning}
                      className="bg-royal text-gold px-6 py-2 rounded-xl font-black text-xs hover:bg-black transition-all flex items-center gap-2"
                    >
                      {isScanning ? <Clock size={14} className="animate-spin" /> : null}
                      جلب البيانات
                    </button>
                  </div>
                </div>
                
                {currentDoc && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input label="تعديل (من)" value={editedFrom} onChange={setEditedFrom} disabled={!isEditMode} />
                    <Input label="تعديل (إلى)" value={editedTo} onChange={setEditedTo} disabled={!isEditMode} />
                    <Input label="تعديل (الفرع)" value={editedBranch} onChange={setEditedBranch} disabled={!isEditMode} />
                    
                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-gray-400 mb-2 block">حالة المعالجة</label>
                      <div className="flex bg-slate-50 p-1 rounded-xl gap-1">
                        <button 
                          disabled={!isEditMode}
                          onClick={() => setEditedNeedsProcessing(true)}
                          className={`flex-1 py-3 rounded-lg text-[11px] font-black transition-all ${editedNeedsProcessing ? 'bg-royal text-white shadow-md' : 'text-slate-400 hover:bg-white/50 disabled:hover:bg-transparent'}`}
                        >
                          بحاجة معالجة
                        </button>
                        <button 
                          disabled={!isEditMode}
                          onClick={() => setEditedNeedsProcessing(false)}
                          className={`flex-1 py-3 rounded-lg text-[11px] font-black transition-all ${!editedNeedsProcessing ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-white/50 disabled:hover:bg-transparent'}`}
                        >
                          ليست بحاجة معالجة
                        </button>
                      </div>
                    </div>
                    
                    <div className="col-span-full bg-slate-50 p-4 rounded-2xl border border-dashed border-gray-200 mt-4">
                      <p className="text-[10px] font-black text-slate-400 mb-3 uppercase">المرفقات الرقمية (معاينة فقط)</p>
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {currentDoc.files?.map((file: any) => (
                           <div 
                             key={file.id} 
                             onClick={() => setPreviewFile({ name: file.name, url: file.url || '#' })}
                             className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm min-w-32 flex flex-col items-center cursor-pointer hover:border-gold hover:shadow-md transition-all group"
                           >
                              <div className="relative w-full aspect-[3/4] bg-slate-50 rounded-lg mb-2 overflow-hidden flex items-center justify-center">
                                {file.thumbnail ? (
                                  <img src={file.thumbnail} className="w-full h-full object-cover" alt="preview" />
                                ) : (
                                  <FileText size={24} className="text-red-500 opacity-50" />
                                )}
                                <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/10 transition-colors flex items-center justify-center">
                                  <Eye size={16} className="text-royal opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all" />
                                </div>
                              </div>
                              <span className="text-[9px] font-black text-slate-600 truncate w-full text-center">{file.name}</span>
                              <span className="text-[7px] text-gold font-bold uppercase mt-1">انقر للمعاينة</span>
                           </div>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-full flex justify-end gap-3 mt-4">
                      {!isEditMode ? (
                        <button 
                          onClick={() => setIsEditMode(true)}
                          className="bg-blue-600 text-white px-8 py-2 rounded-xl text-xs font-black shadow-lg flex items-center gap-2"
                        >
                          <Edit3 size={14} /> تفعيل نمط التعديل
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => setIsEditMode(false)}
                            className="bg-gray-100 text-gray-500 px-6 py-2 rounded-xl text-xs font-black"
                          >
                            إلغاء
                          </button>
                          <button 
                            onClick={handleUpdateRecord}
                            disabled={isSaving}
                            className="bg-gold text-royal px-8 py-2 rounded-xl text-xs font-black shadow-lg flex items-center gap-2"
                          >
                            {isSaving ? <Clock size={14} className="animate-spin" /> : <Save size={14} />} 
                            حفظ التغييرات
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {currentDoc && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 border-t-[6px] border-t-gold">
                  <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-black text-royal italic">خطة دوران المعاملة والمسار الزمني</h3>
                    <div className="flex gap-2">
                       {currentDoc.files && currentDoc.files.length > 0 && (
                        <button 
                          onClick={() => setPreviewFile({ name: currentDoc.files![0].name, url: currentDoc.files![0].url || '#' })}
                          className="flex items-center gap-2 bg-royal/10 text-royal px-4 py-2 rounded-xl text-[10px] font-black border border-royal/20 hover:bg-royal/20 transition-all"
                        >
                          <Eye size={14} /> عرض الملف المرفوع
                        </button>
                       )}
                      <button 
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-[10px] font-black border border-emerald-100 hover:bg-emerald-100 transition-all"
                      >
                        <Download size={14} /> تحميل الخطة PDF
                      </button>
                    </div>
                  </div>
                  
                  {/* Movements Table */}
                  <div ref={movementTableRef} className="overflow-hidden border border-gray-100 rounded-2xl mb-8 shadow-inner bg-white p-4">
                    <div className="mb-4 text-right flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-royal mb-1">الموضوع: {currentDoc.entry?.summary || 'خطة متابعة المعاملة'}</p>
                        <p className="text-[9px] text-gray-500">رقم الوثيقة: {currentDoc.id} | تاريخ التصدير: {new Date().toLocaleDateString('ar-EG')}</p>
                      </div>
                      <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black border ${currentDoc.entry?.needsProcessing ? 'bg-royal text-white border-royal' : 'bg-emerald-600 text-white border-emerald-600'}`}>
                        {currentDoc.entry?.needsProcessing ? 'بحاجة معالجة' : 'ليست بحاجة معالجة'}
                      </div>
                    </div>
                    <table className="w-full text-right border-collapse">
                      <thead className="bg-[#f8fafc] text-royal font-black text-[10px] uppercase">
                        <tr>
                          <th className="p-4 border-b border-l border-gray-100">رقم الحركة</th>
                          <th className="p-4 border-b border-l border-gray-100">تاريخ الحركة</th>
                          <th className="p-4 border-b border-l border-gray-100">من / إلى</th>
                          <th className="p-4 border-b border-l border-gray-100">المهلة</th>
                          <th className="p-4 border-b border-l border-gray-100 text-center">الانتظار / المتبقي</th>
                          <th className="p-4 border-b border-l border-gray-100 text-center">التأخير</th>
                          <th className="p-4 border-b">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="text-[11px] font-bold text-slate-600">
                        {currentDoc.movements?.map((m: any, idx: number) => {
                          const start = new Date(m.date);
                          const today = new Date();
                          today.setHours(0,0,0,0);
                          
                          const graceDays = m.grace || 0;
                          const waitDays = Math.max(0, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
                          const remaining = Math.max(0, graceDays - waitDays);
                          const delay = Math.max(0, waitDays - graceDays);
                          
                          let statusColor = "bg-green-100 text-green-700";
                          let statusText = "ضمن المدة";
                          
                          if (delay > 0) {
                            statusColor = "bg-red-100 text-red-700";
                            statusText = "متأخر";
                          } else if (remaining <= 2 && remaining > 0) {
                            statusColor = "bg-amber-100 text-amber-700";
                            statusText = "وشك النفاذ";
                          } else if (m.status.includes('مكتمل')) {
                            statusColor = "bg-blue-100 text-blue-700";
                            statusText = m.status;
                          }

                          return (
                            <tr key={m.id} className="border-t border-gray-50 hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 border-l border-gray-50 text-center">
                                <span className="bg-royal/5 text-royal px-2 py-1 rounded text-[10px] font-black">حركة رقم {m.id}</span>
                              </td>
                              <td className="p-4 border-l border-gray-50 font-mono text-royal text-center">{m.date}</td>
                              <td className="p-4 border-l border-gray-50">
                                <div className="text-royal font-black">{m.from}</div>
                                <div className="text-gray-400 text-[10px] mt-1">← {m.to}</div>
                              </td>
                              <td className="p-4 border-l border-gray-50 text-center">
                                <span className="font-black text-royal">{graceDays}</span> <span className="text-[9px] text-gray-400">يوم</span>
                              </td>
                              <td className="p-4 border-l border-gray-50 text-center">
                                <div className="flex flex-col items-center">
                                  <span className="text-slate-400 text-[9px]">انتظار: {waitDays}</span>
                                  <span className="text-green-600 text-[10px] font-black">متبقي: {remaining}</span>
                                </div>
                              </td>
                              <td className="p-4 border-l border-gray-50 text-center">
                                <span className={`font-black ${delay > 0 ? 'text-red-600' : 'text-slate-200'}`}>{delay} يوم</span>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded-lg text-[9px] font-black block text-center ${statusColor}`}>
                                  {statusText}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
                    <Select label="إضافة حركة: من" options={ENTITIES} searchable selected={newFrom} onSelect={setNewFrom} />
                    <Select label="إلى" options={ENTITIES} searchable selected={newTo} onSelect={setNewTo} />
                    <Select label="الفرع" options={BRANCHES} searchable selected={newBranch} onSelect={setNewBranch} />
                    <div className="flex flex-col">
                      <Input label="أيام المهلة" type="number" placeholder="3" value={newGrace} onChange={setNewGrace} />
                      {newGrace && movementDate && (
                        <div className="mt-1 text-[9px] font-bold text-red-500 text-left">
                          تاريخ الاستحقاق المتوقع: {(() => {
                            const d = new Date(movementDate);
                            d.setDate(d.getDate() + parseInt(newGrace));
                            return d.toISOString().split('T')[0];
                          })()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <Input label="تاريخ الحركة" type="date" value={movementDate} onChange={setMovementDate} />
                      <button 
                        onClick={handleAddMovement}
                        className="mt-2 bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={14} /> إضافة هذه الحركة للجدول
                      </button>
                    </div>

                    <div className="col-span-full pt-4">
                      <button 
                        onClick={handleSaveToDatabase}
                        disabled={isSaving}
                        className="w-full bg-royal text-gold font-black py-4 rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
                      >
                        {isSaving ? <Clock size={20} className="animate-spin" /> : <Save size={20} />}
                        <span>حفظ السجل المتكامل في قاعدة البيانات المركزية</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* 4. الإجراءات والتقارير (Reports & Analytics) */}
          {activeOffice === 'reports' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "إجمالي التأخير المسجل", val: "26 يوم", color: "border-red-600", text: "text-red-600", pulse: true },
                  { label: "عدد القرارات اليومية", val: "12", color: "border-royal", text: "text-royal" },
                  { label: "المعاملات النشطة", val: "154", color: "border-blue-500", text: "text-royal" },
                  { label: "المؤرشف اليوم", val: "48", color: "border-green-500", text: "text-royal" }
                ].map((stat, i) => (
                  <div key={i} className={`bg-white p-6 rounded-3xl shadow-sm border-r-4 ${stat.color}`}>
                    <p className="text-[10px] text-gray-400 font-black uppercase mb-1">{stat.label}</p>
                    <h3 className={`text-2xl font-black ${stat.text} ${stat.pulse ? 'animate-pulse' : ''}`}>{stat.val}</h3>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Workflow Station Path */}
                <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col">
                  <h3 className="font-black text-royal mb-8 border-b border-gray-100 pb-4 flex items-center gap-2 italic">
                    <Activity size={20} className="text-gold" />
                    خطة دوران المعاملة والمسار الزمني
                  </h3>
                  
                  <div className="mb-8">
                    <label className="text-[11px] font-black text-slate-700 mb-2 block">تتبع مسار التداول برقم الوثيقة</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        className="flex-1 bg-[#fffdf5] border border-gold/30 rounded-xl p-3 text-center text-xl font-black text-royal outline-none" 
                        placeholder="رقم الوثيقة" 
                      />
                      <button 
                        onClick={handleFetchData}
                        className="bg-royal text-gold px-6 rounded-xl text-xs font-black hover:bg-black transition-all"
                      >
                        بحث
                      </button>
                    </div>
                  </div>

                  {currentDoc ? (
                    <div className="flex-1 space-y-6">
                      <div className="flex justify-between gap-2 mb-4">
                        <button 
                          onClick={handleDownloadPDF}
                          className="flex-1 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl text-[9px] font-black border border-emerald-100 flex items-center justify-center gap-1"
                        >
                          <Download size={12} /> تحميل الخطة
                        </button>
                        {currentDoc.files && currentDoc.files.length > 0 && (
                          <button 
                            onClick={() => setPreviewFile({ name: currentDoc.files![0].name, url: currentDoc.files![0].url || '#' })}
                            className="flex-1 bg-royal/10 text-royal px-3 py-2 rounded-xl text-[9px] font-black border border-royal/20 flex items-center justify-center gap-1"
                          >
                            <Eye size={12} /> عرض الملف
                          </button>
                        )}
                      </div>

                      <div className="relative border-r-2 border-slate-100 pr-6 space-y-8 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {currentDoc.movements?.map((m: any, idx: number) => {
                          const start = new Date(m.date);
                          const today = new Date();
                          today.setHours(0,0,0,0);
                          const graceDays = m.grace || 0;
                          const waitDays = Math.max(0, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
                          const delay = Math.max(0, waitDays - graceDays);

                          return (
                            <div key={m.id} className="relative">
                              <div className={`absolute -right-[1.125rem] top-1 w-4 h-4 rounded-full border-4 border-white ${idx === currentDoc.movements!.length - 1 ? 'bg-gold animate-bounce' : 'bg-green-500'}`} />
                              <div className={`p-4 rounded-2xl border ${idx === currentDoc.movements!.length - 1 ? 'bg-[#fffbeb] border-gold/30 shadow-md' : 'bg-white border-gray-100'}`}>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-[8px] px-2 py-0.5 rounded font-black bg-royal/5 text-royal">حركة {m.id}</span>
                                  <span className="text-[9px] text-gray-400 font-bold">{m.date}</span>
                                </div>
                                <p className="text-[10px] font-black text-royal mb-1">من: <span className="text-gray-500 font-bold">{m.from}</span></p>
                                <p className="text-[10px] font-black text-royal">إلى: <span className="text-gray-500 font-bold">{m.to}</span></p>
                                
                                <div className="mt-2 pt-2 border-t border-gray-50 flex justify-between items-center">
                                  <p className="text-[9px] italic font-black text-gold">{m.branch}</p>
                                  {delay > 0 ? (
                                    <span className="text-[8px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-black animate-pulse">
                                      متأخر {delay} يوم
                                    </span>
                                  ) : (
                                    <span className="text-[8px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-black">
                                      ضمن الاستحقاق
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                      <div className="bg-slate-100 p-6 rounded-full mb-4">
                        <Activity size={32} className="text-slate-300" />
                      </div>
                      <p className="text-[11px] font-black text-slate-400">يرجى إدخال رقم المعاملة للبحث</p>
                    </div>
                  )}
                </div>

                {/* Right Analytics Panel */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white rounded-3xl shadow-sm border-r-[12px] border-r-gold p-8">
                    <h3 className="font-black text-royal mb-8 border-b border-gray-100 pb-4 italic">مركز استخراج التقارير والتحليلات</h3>
                    
                    {/* Filters Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 bg-slate-50 p-6 rounded-3xl border border-gray-100">
                      <div className="flex flex-col">
                        <label className="text-[11px] font-black text-royal mb-2 block">فلترة حسب الفرع</label>
                        <select 
                          value={reportBranch}
                          onChange={(e) => setReportBranch(e.target.value)}
                          className="bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-royal outline-none focus:ring-2 focus:ring-gold/20"
                        >
                          <option value="الكل">جميع الأفرع</option>
                          {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[11px] font-black text-royal mb-2 block">أساس البحث</label>
                        <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1">
                          <button 
                            onClick={() => setReportFilterBasis("current")}
                            className={`flex-1 py-2 rounded-lg text-[9px] font-black transition-all ${reportFilterBasis === "current" ? 'bg-royal text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                          >
                            في الفرع
                          </button>
                          <button 
                            onClick={() => setReportFilterBasis("sender")}
                            className={`flex-1 py-2 rounded-lg text-[9px] font-black transition-all ${reportFilterBasis === "sender" ? 'bg-royal text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                          >
                            وارد من الفرع
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[11px] font-black text-royal mb-2 block">تاريخ البدء</label>
                        <input 
                          type="date"
                          value={reportStartDate}
                          onChange={(e) => setReportStartDate(e.target.value)}
                          className="bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-royal outline-none focus:ring-2 focus:ring-gold/20"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[11px] font-black text-royal mb-2 block">تاريخ الانتهاء</label>
                        <input 
                          type="date"
                          value={reportEndDate}
                          onChange={(e) => setReportEndDate(e.target.value)}
                          className="bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-royal outline-none focus:ring-2 focus:ring-gold/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { label: "تقرير المتأخرين", sub: "تجاوز تاريخ الاستحقاق", icon: <Clock className="text-red-600" />, bg: "bg-red-50", hover: "hover:border-red-600", action: () => handleDownloadBranchReport('delayed') },
                        { label: "تقرير المعالجة", sub: "بحاجة معالجة حالياً", icon: <Download className="text-emerald-600" />, bg: "bg-emerald-50", hover: "hover:border-emerald-600", action: () => handleDownloadBranchReport('needsProcessing') },
                        { label: "تقرير المنجزة", sub: "لا تحتاج معالجة", icon: <FileCheck className="text-blue-600" />, bg: "bg-blue-50", hover: "hover:border-blue-600", action: () => handleDownloadBranchReport('completed') },
                        { label: "إحصائيات الإنجاز", sub: "تصدير تحليل البيانات", icon: <Activity className="text-green-600" />, bg: "bg-green-50", hover: "hover:border-green-600", action: handleDownloadStatsReport }
                      ].map((btn, i) => (
                        <button 
                          key={i} 
                          onClick={btn.action}
                          disabled={isSaving}
                          className={`flex flex-col items-center p-6 border-2 border-dashed border-gray-100 rounded-3xl transition-all group ${btn.hover} disabled:opacity-50`}
                        >
                          <div className={`${btn.bg} p-4 rounded-full mb-4 group-hover:scale-110 transition-transform`}>{btn.icon}</div>
                          <span className="text-xs font-black text-royal text-center">{btn.label}</span>
                          <p className="text-[9px] text-gray-400 mt-1 font-bold italic">{btn.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <h3 className="font-black text-royal mb-8 text-sm italic">متوسط سرعة استجابة الفروع (كفاءة الأداء)</h3>
                    <div className="space-y-10">
                      {[
                        { branch: "فرع شؤون الضباط", status: "ممتاز (1.5 يوم)", color: "bg-green-500", label: "text-green-600", width: "90%" },
                        { branch: "فرع السكن الوظيفي", status: "متوسط (4.2 يوم)", color: "bg-gold", label: "text-gold", width: "55%" },
                        { branch: "فرع شؤون الأفراد", status: "بحاجة لمتابعة (7.8 يوم)", color: "bg-red-500", label: "text-red-600", width: "25%" }
                      ].map((bar, i) => (
                        <div key={i}>
                          <div className={`flex justify-between text-[11px] mb-3 font-black italic ${bar.label}`}>
                            <span>{bar.branch}</span>
                            <span>{bar.status}</span>
                          </div>
                          <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden border border-gray-100 shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }} animate={{ width: bar.width }} transition={{ delay: 0.5, duration: 1 }}
                              className={`h-full ${bar.color} rounded-full`} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeOffice === 'inquiry' && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto w-full space-y-12 pb-24"
            >
              {/* Sovereign Inquiry Portal Header */}
              <div className="relative">
                <div className="flex flex-col items-center text-center space-y-4 mb-16">
                  <div className="w-20 h-20 bg-royal/5 rounded-3xl flex items-center justify-center border-2 border-royal/10 shadow-inner group">
                    <Search size={40} className="text-royal group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 justify-center mb-1">
                      <span className="text-[10px] font-black text-gold uppercase tracking-[0.4em] bg-gold/10 px-3 py-1 rounded-full border border-gold/20">نظام الاستعلام السيادي</span>
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tight italic">
                      بوابة <span className="text-royal font-light not-italic">التدقيق الموحد</span>
                    </h2>
                    <p className="text-slate-400 text-sm font-bold max-w-xl mx-auto leading-relaxed">
                      المنصة المركزية لمتابعة دوران الوثائق والخطابات الرسمية عبر كافة وحدات الديوان العام بوزارة الداخلية.
                    </p>
                  </div>
                </div>

                {/* Advanced Multi-Factor Search Module */}
                <div className="bg-white/80 backdrop-blur-2xl border border-slate-200 rounded-[3rem] p-12 shadow-[0_30px_100px_-20px_rgba(15,23,42,0.1)] relative z-10 overflow-hidden">
                  <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-slate-100 to-transparent" />
                  <div className="absolute top-0 right-2/4 w-px h-full bg-gradient-to-b from-transparent via-slate-100 to-transparent" />
                  <div className="absolute top-0 right-3/4 w-px h-full bg-gradient-to-b from-transparent via-slate-100 to-transparent" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                    <div className="space-y-4 group">
                      <div className="flex items-center gap-2 mb-2 pr-2">
                        <Fingerprint size={16} className="text-royal/60" />
                        <label className="text-[10px] font-black text-royal uppercase tracking-[0.25em]">رقم الوثيقة</label>
                      </div>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="000-000-000"
                          value={inquirySearch.docNumber}
                          onChange={(e) => setInquirySearch({...inquirySearch, docNumber: e.target.value})}
                          className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-lg font-black focus:border-royal focus:bg-white outline-none text-right transition-all group-hover:border-slate-200"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4 group">
                      <div className="flex items-center gap-2 mb-2 pr-2">
                        <Building2 size={16} className="text-royal/60" />
                        <label className="text-[10px] font-black text-royal uppercase tracking-[0.25em]">رقم الجهة</label>
                      </div>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="رمز الوحدة الإدارية"
                          value={inquirySearch.entityNumber}
                          onChange={(e) => setInquirySearch({...inquirySearch, entityNumber: e.target.value})}
                          className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-lg font-black focus:border-royal focus:bg-white outline-none text-right transition-all group-hover:border-slate-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 group">
                      <div className="flex items-center gap-2 mb-2 pr-2">
                        <UserCircle size={16} className="text-royal/60" />
                        <label className="text-[10px] font-black text-royal uppercase tracking-[0.25em]">اسم صاحب العلاقة</label>
                      </div>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="الاسم الكامل..."
                          value={inquirySearch.name}
                          onChange={(e) => setInquirySearch({...inquirySearch, name: e.target.value})}
                          className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-lg font-black focus:border-royal focus:bg-white outline-none text-right transition-all group-hover:border-slate-200"
                        />
                      </div>
                    </div>

                    <div className="flex items-end">
                      <button 
                        onClick={handleInquirySearch}
                        disabled={isInquiryLoading}
                        className="w-full bg-royal text-gold py-6 rounded-2xl font-black text-lg flex items-center justify-center gap-4 hover:shadow-2xl hover:shadow-royal/30 active:scale-95 transition-all disabled:opacity-50 h-[74px] group/btn overflow-hidden relative"
                      >
                        <div className="absolute inset-0 bg-white/5 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                        {isInquiryLoading ? <LoadingSpinner size={24} /> : <Search size={24} className="group-hover/btn:scale-110 transition-transform" />}
                        <span className="relative z-10">تنفيذ استعلام</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {inquiryDoc ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                  className="space-y-10"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Primary Document Summary Card */}
                    <div className="lg:col-span-8 bg-white rounded-[3rem] p-12 shadow-xl border border-slate-100 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-32 h-32 bg-royal/5 rounded-br-[4rem] border-b border-r border-royal/10" />
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-12 relative z-10">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${
                              inquiryDoc.entry?.status === 'urgent' ? 'bg-red-500 text-white animate-pulse' : 'bg-royal text-gold'
                            }`}>
                              {inquiryDoc.entry?.status === 'urgent' ? 'بلاغ عاجل' : 'معاملة رسمية'}
                            </span>
                            <span className="text-slate-300 font-bold text-[10px] uppercase">رقم النظام: {inquiryDoc.id}</span>
                          </div>
                          <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-none italic">{inquiryDoc.entry?.summary || inquiryDoc.entry?.title}</h3>
                          <div className="flex items-center gap-4 text-slate-400 text-sm font-bold">
                            <span className="flex items-center gap-2"><Building2 size={16} /> {inquiryDoc.entry?.from}</span>
                            <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                            <span className="flex items-center gap-2"><Calendar size={16} /> {inquiryDoc.entry?.date}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="w-20 h-20 bg-slate-900 rounded-3xl flex flex-col items-center justify-center border-t-4 border-gold shadow-lg">
                            <div className="text-white text-xs font-black">QR</div>
                            <div className="w-10 h-10 bg-white/10 rounded mt-1 overflow-hidden">
                              <div className="grid grid-cols-2 gap-0.5 p-1">
                                {[1,2,3,4].map(i => <div key={i} className="bg-gold h-3 w-3" />)}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">كود التحقق الرقمي</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <div className="p-8 bg-slate-50/80 rounded-[2rem] border border-slate-100 shadow-inner group transition-all hover:bg-white hover:border-royal/20">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                            <GanttChartSquare size={24} className="text-royal" />
                          </div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">المرحلة الحالية</div>
                          <div className="text-lg font-black text-royal">{inquiryDoc.office || "الديوان العام"}</div>
                        </div>
                        <div className="p-8 bg-slate-50/80 rounded-[2rem] border border-slate-100 shadow-inner group transition-all hover:bg-white hover:border-royal/20">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                            <History size={24} className="text-emerald-600" />
                          </div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">زمن المعالجة</div>
                          <div className="text-lg font-black text-emerald-600">48 ساعة مضت</div>
                        </div>
                        <div className="p-8 bg-slate-50/80 rounded-[2rem] border border-slate-100 shadow-inner group transition-all hover:bg-white hover:border-royal/20">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                            <FileText size={24} className="text-amber-500" />
                          </div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">نوع الوثيقة</div>
                          <div className="text-lg font-black text-amber-600">{inquiryDoc.type === 'letter' ? 'كتاب رسمي' : inquiryDoc.type === 'decision' ? 'قرار إداري' : 'تعميم'}</div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-4">
                          <Network size={20} className="text-royal" />
                          <h4 className="text-sm font-black text-royal uppercase tracking-widest">مسار الخط الزمني للدوران</h4>
                        </div>
                        <div className="relative pr-8 space-y-12 before:absolute before:top-2 before:right-[11px] before:w-1 before:h-full before:bg-slate-100">
                          {inquiryDoc.movements?.map((step: any, i: number) => (
                            <div key={i} className="relative flex items-center justify-between">
                              <div className={`absolute -right-[30px] w-6 h-6 rounded-full border-4 border-white shadow-md z-10 ${
                                i < (inquiryDoc.movements?.length || 0) - 1 ? 'bg-emerald-500' : 'bg-royal animate-pulse'
                              }`} />
                              <div>
                                <div className={`text-[11px] font-black uppercase tracking-widest ${i === (inquiryDoc.movements?.length || 0) - 1 ? 'text-royal' : 'text-slate-400'}`}>{i === 0 ? "نقطة الوصول" : i === (inquiryDoc.movements?.length || 0) - 1 ? "الحالة الحالية" : "محطة دوران"}</div>
                                <div className="text-base font-black text-slate-800 tracking-tight">{step.branch || step.to}</div>
                                <div className="text-[10px] text-slate-400 font-medium">من: {step.from}</div>
                              </div>
                              <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 italic">{step.date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Metadata & Actions Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                      <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-full h-2 bg-royal group-hover:bg-gold transition-colors duration-500" />
                        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-royal/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <h4 className="text-[10px] font-black text-gold uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                          <Shield size={14} /> بيانات المصادقة السيادية
                        </h4>
                        
                        <div className="space-y-8 relative z-10">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <div className="text-[9px] font-black text-white/40 uppercase mb-2">رقم الصادر الوزاري</div>
                            <div className="text-white font-mono font-black text-xl tracking-widest">MOI-S-{inquiryDoc.id}-2026</div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="text-[8px] font-black text-white/40 uppercase">درجة السرية</div>
                              <div className="text-red-400 text-xs font-black flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.7)]" />
                                {inquiryDoc.entry?.status === 'urgent' ? 'سري للغاية' : 'عادي'}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-[8px] font-black text-white/40 uppercase">صلاحية العرض</div>
                              <div className="text-emerald-400 text-xs font-black">المستوى الأول</div>
                            </div>
                          </div>

                          <div className="pt-8 border-t border-white/10 space-y-4">
                            <button className="w-full bg-white text-royal py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-gold hover:text-royal transition-all">
                              <Printer size={20} /> طباعة تقرير الدوران
                            </button>
                            <button className="w-full bg-white/5 text-white/60 py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 border border-white/10 hover:bg-white/10 transition-all">
                              <LinkIcon size={20} /> نسخ رابط المتابعة
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                          <Paperclip size={18} className="text-amber-500" />
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المرفقات الرقمية</h4>
                        </div>
                        <div className="space-y-3">
                          {[
                            { name: "صورة الخطاب الأصلي.pdf", size: "2.4 MB" },
                            { name: "المرفقات الفنية_01.jpg", size: "12.1 MB" },
                          ].map((file, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-royal/30 cursor-pointer group transition-all">
                              <div className="flex items-center gap-3">
                                <FileText size={18} className="text-slate-400 group-hover:text-royal transition-colors" />
                                <span className="text-[11px] font-black text-slate-600 truncate max-w-[140px] uppercase tracking-tighter">{file.name}</span>
                              </div>
                              <span className="text-[9px] font-bold text-slate-400 italic">{file.size}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : inquiryError ? (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                   className="bg-red-50 border-2 border-red-100 p-12 rounded-[3rem] text-center max-w-2xl mx-auto shadow-2xl shadow-red-500/5 items-center flex flex-col space-y-6"
                >
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 shadow-inner">
                    <ShieldAlert size={40} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black text-red-900 tracking-tight italic">فشل في استرداد السجل</h4>
                    <p className="text-red-700/70 font-bold max-w-sm mx-auto leading-relaxed">{inquiryError}</p>
                  </div>
                  <button 
                    onClick={() => { setInquiryError(""); setInquirySearch({ docNumber: "", entityNumber: "", name: "" }); }}
                    className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30"
                  >
                    إعادة محاولة الاستعلام
                  </button>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-10 border-2 border-dashed border-slate-200 rounded-[4rem] bg-slate-50/30">
                  <div className="relative">
                    <div className="absolute inset-0 bg-royal/10 blur-3xl rounded-full" />
                    <div className="w-40 h-40 bg-white rounded-[3rem] flex items-center justify-center shadow-xl border border-slate-200 relative z-10 animate-float">
                      <Network size={64} className="text-slate-200" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xl font-black text-slate-400 tracking-widest italic uppercase">انتظار إدخال معايير البحث</h4>
                    <p className="text-slate-400 font-bold text-sm max-w-md mx-auto leading-relaxed">
                      أدخل أي من مرجعيات الوثيقة السيادية (الرقم، الجهة، أو الاسم) لعرض خريطة دوران المعاملة.
                    </p>
                  </div>
                </div>
              )}
            </motion.section>
          )}

          {activeOffice === 'messages' && (
            <motion.section 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="max-w-6xl mx-auto w-full h-[700px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 flex overflow-hidden mb-20"
            >
              <div className="w-80 border-l border-gray-100 flex flex-col bg-slate-50/50">
                <div className="p-6 border-b border-gray-100 bg-white">
                  <h3 className="font-black text-royal text-sm flex items-center gap-2 italic">
                    <User size={16} className="text-gold" /> موظفي الديوان
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {employees.filter(e => e.id !== currentEmployeeId).map((emp) => {
                    const isActive = newMessage.to === emp.id;
                    return (
                      <button 
                        key={emp.id}
                        onClick={() => setNewMessage({...newMessage, to: emp.id})}
                        className={`w-full text-right p-4 rounded-2xl transition-all flex items-center gap-4 group ${isActive ? 'bg-royal text-gold shadow-lg translate-x-1' : 'hover:bg-white hover:shadow-sm'}`}
                      >
                        <div className="relative">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border font-black text-xs ${isActive ? 'bg-white/10 border-white/20' : 'bg-royal/5 border-royal/10 text-royal'}`}>
                            {emp.avatar}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${emp.status === 'online' ? 'bg-green-500' : emp.status === 'busy' ? 'bg-amber-500' : 'bg-gray-300'}`} />
                        </div>
                        <div className="min-w-0 flex-1 text-right">
                          <p className="text-[11px] font-black truncate">{emp.name}</p>
                          <p className={`text-[9px] truncate font-bold ${isActive ? 'text-gold/60' : 'text-gray-400'}`}>
                            {emp.office}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="p-4 bg-white border-t border-gray-100">
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-royal text-gold flex items-center justify-center text-[10px] font-black italic">
                      {employees.find(e => e.id === currentEmployeeId)?.avatar}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-royal leading-none mb-1">حسابك الحالي</p>
                      <p className="text-[9px] text-gray-400 font-bold">{employees.find(e => e.id === currentEmployeeId)?.name}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col bg-white">
                {newMessage.to ? (
                  <>
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-royal text-gold flex items-center justify-center text-xs font-black">
                          {employees.find(e => e.id === newMessage.to)?.avatar}
                        </div>
                        <div className="text-right">
                          <h4 className="font-black text-royal text-sm italic">{employees.find(e => e.id === newMessage.to)?.name}</h4>
                          <p className="text-[9px] text-gray-400 font-bold">{employees.find(e => e.id === newMessage.to)?.office}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"><Archive size={16} /></button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-red-400"><Trash2 size={16} /></button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col-reverse">
                      {internalMessages
                        .filter(m => (m.from === newMessage.to && m.to === currentEmployeeId) || (m.from === currentEmployeeId && m.to === newMessage.to))
                        .map((msg) => {
                          const isMine = msg.from === currentEmployeeId;
                          return (
                            <motion.div 
                              key={msg.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`flex ${isMine ? 'justify-start' : 'justify-end'}`}
                            >
                              <div className={`max-w-[75%] text-right`}>
                                <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                                  isMine 
                                    ? 'bg-royal text-white rounded-tr-none shadow-royal/20' 
                                    : 'bg-slate-100 text-royal rounded-tl-none'
                                }`}>
                                  {msg.body}
                                </div>
                                <p className="text-[8px] text-gray-400 font-black mt-1.5 px-1 uppercase tracking-tighter">
                                  {new Date(msg.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-slate-50/30">
                      <div className="relative">
                        <textarea 
                          rows={2}
                          value={newMessage.body}
                          onChange={(e) => setNewMessage({...newMessage, body: e.target.value})}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder="اكتب رسالتك هنا..."
                          className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 pr-16 text-xs font-bold focus:ring-4 focus:ring-gold/10 focus:border-gold outline-none text-right resize-none shadow-sm transition-all"
                        />
                        <button 
                          onClick={handleSendMessage}
                          disabled={isSendingMsg || !newMessage.body}
                          className="absolute left-4 bottom-4 bg-royal text-gold p-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-royal/20 disabled:opacity-50 disabled:scale-100"
                        >
                          {isSendingMsg ? <LoadingSpinner size={16} /> : <Send size={20} />}
                        </button>
                      </div>
                      <p className="text-[9px] text-gray-400 font-black mt-3 text-center italic tracking-wider">نظام المراسلة الآمن - خاص بموظفي وزارة الداخلية</p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/20">
                    <div className="w-24 h-24 bg-white shadow-xl rounded-[2rem] flex items-center justify-center mb-8 border border-gray-50">
                      <User size={40} className="text-gold" />
                    </div>
                    <h3 className="text-xl font-black text-royal mb-3 italic tracking-tight">مرحباً بك في بريد الموظفين</h3>
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
      <footer className="p-6 text-center text-[10px] text-gray-400 border-t border-gray-100 bg-white">
        <p className="font-bold opacity-50 uppercase tracking-widest">© 2026 وزارة الداخلية - إدارة القوى البشرية - الديوان العام</p>
      </footer>
    </div>
  );
}
// --- Helper Components ---

function LoadingSpinner({ size = 20, color = "gold" }: { size?: number, color?: "gold" | "white" | "royal" }) {
  const colors = {
    gold: "border-gold/20 border-t-gold",
    white: "border-white/20 border-t-white",
    royal: "border-royal/20 border-t-royal"
  };
  return (
    <div 
      style={{ width: size, height: size }}
      className={`border-4 rounded-full animate-spin ${colors[color]}`}
    />
  );
}

function NavBtn({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 relative whitespace-nowrap
        ${active ? 'bg-gold text-royal shadow-lg shadow-black/10' : 'text-white/70 hover:bg-white/10'}`}
    >
      {children}
    </button>
  );
}

function SubTabBtn({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border
        ${active ? 'bg-royal text-gold border-royal shadow-md' : 'bg-gray-100 text-gray-400 border-transparent hover:bg-gray-200'}`}
    >
      {children}
    </button>
  );
}

function Card({ title, accent, children }: { title: string; accent: 'royal' | 'gold' | 'red' | 'blue' | 'green'; children: React.ReactNode }) {
    const accents = {
        royal: 'border-royal text-royal',
        gold: 'border-gold text-gold',
        red: 'border-red-600 text-red-700',
        blue: 'border-blue-600 text-blue-800',
        green: 'border-green-600 text-green-700'
    };
    const [b, t] = accents[accent].split(' ');
    return (
        <div className={`form-card bg-white rounded-2xl shadow-sm border-t-8 ${b} p-8 mb-6`}>
            <h2 className={`font-black ${t} mb-8 border-b pb-2 text-xl flex items-center gap-2`}>
                <ChevronRight size={22} className={t} /> {title}
            </h2>
            {children}
        </div>
    );
}

function Input({ label, type = "text", placeholder, disabled, value, onChange }: { label: string; type?: string; placeholder?: string; disabled?: boolean; value?: string; onChange?: (val: string) => void }) {
  const inputId = React.useId();
  return (
    <div className="flex flex-col">
      <label htmlFor={inputId} className="text-[11px] font-black text-slate-700 mb-1">{label}</label>
      <input 
        id={inputId} 
        type={type} 
        placeholder={placeholder} 
        disabled={disabled}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="input-box border border-slate-200 p-2.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-gold/10 focus:border-gold transition-all text-right disabled:bg-gray-50 disabled:text-gray-400" 
      />
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      role="radio"
      aria-checked={active}
      className={`px-4 py-2 rounded-full text-[10px] font-black border transition-all ${active ? 'bg-gold text-white border-gold shadow-md' : 'bg-white text-gray-400 border-gray-100 hover:border-gold/30'}`}
    >
      {label}
    </button>
  );
}

function Select({ label, options, searchable, hasOther, onSelect, selected: selectedProp }: { label: string; options: string[]; searchable?: boolean; hasOther?: boolean; onSelect?: (val: string) => void; selected?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState("");
  const selected = selectedProp !== undefined ? selectedProp : internalSelected;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const filtered = options.filter(o => o.includes(q));
  const selectId = React.useId();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener("mousedown", handleClick); return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {label && <label id={selectId} className="text-[11px] font-black text-slate-700 mb-1 block">{label}</label>}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={selectId}
        className="w-full border border-slate-200 bg-slate-50/50 p-2.5 rounded-xl text-xs font-bold outline-none cursor-pointer flex justify-between items-center"
      >
        <span className={selected ? 'text-royal' : 'text-slate-300'}>{selected || "اختر من القائمة..."}</span>
        <ChevronRight size={14} className={`transform transition-transform rotate-90 ${isOpen ? 'rotate-[-90deg]' : ''}`} aria-hidden="true" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} 
            className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[500] p-2"
            role="listbox"
          >
            {searchable && (
              <input 
                autoFocus 
                className="w-full p-2 mb-2 text-xs font-bold bg-slate-50 rounded-lg text-right outline-none" 
                placeholder="بحث..." 
                value={q} 
                onChange={(e) => setQ(e.target.value)} 
                onClick={(e) => e.stopPropagation()} 
                aria-label="بحث في الخيارات"
              />
            )}
            <div className="max-h-60 overflow-y-auto no-scrollbar">
              {filtered.map((o, i) => (
                <div 
                  key={i} 
                  onClick={() => { 
                    if (selectedProp === undefined) setInternalSelected(o); 
                    setIsOpen(false); 
                    onSelect?.(o); 
                  }} 
                  role="option"
                  aria-selected={selected === o}
                  className="p-3 text-xs font-bold text-gray-600 hover:bg-gold/10 hover:text-royal rounded-xl cursor-pointer text-right flex items-center justify-between"
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${selected === o ? 'bg-gold' : 'bg-transparent'}`} aria-hidden="true" /> {o}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {hasOther && selected === "غير ذلك" && (
        <input className="w-full mt-2 border-2 border-gold/40 p-2 rounded-xl text-xs font-bold outline-none text-right bg-gold/5" placeholder="أدخل الجهة..." aria-label="أدخل الجهة الأخرى" />
      )}
    </div>
  );
}
