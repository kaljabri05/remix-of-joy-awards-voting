import { 
  Trophy, 
  PartyPopper, 
  MessageCircle, 
  Shield, 
  Palette, 
  Sprout, 
  Camera, 
  Drama, 
  Laugh, 
  Target, 
  MessagesSquare, 
  Headphones, 
  Gamepad2, 
  UserCircle2,
  type LucideIcon
} from "lucide-react";

export interface Nominee {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  title: string;
  icon: LucideIcon;
  nominees: Nominee[];
}

export const categories: Category[] = [
  {
    id: "best-group",
    title: "🥇 أفضل مجموعة",
    icon: Trophy,
    nominees: [
      { id: "elite", name: "النخبة" },
      { id: "midnight", name: "ميدنايت" },
      { id: "adeem", name: "عديم" },
      { id: "barks", name: "البركس" },
    ],
  },
  {
    id: "best-event",
    title: "🎉 أفضل إيفنت",
    icon: PartyPopper,
    nominees: [
      { id: "khaled", name: "خالد" },
      { id: "samer", name: "سامر" },
      { id: "jelly", name: "جيلي" },
      { id: "jumhr", name: "جمهر" },
      { id: "shamso", name: "شمسو" },
    ],
  },
  {
    id: "best-active-member",
    title: "💬 أفضل عضو متفاعل",
    icon: MessageCircle,
    nominees: [
      { id: "jumhr", name: "جمهر" },
      { id: "ammar", name: "عمار" },
      { id: "jelly", name: "جيلي" },
      { id: "azooz", name: "عزوز" },
      { id: "samer", name: "سامر" },
      { id: "shamso", name: "شمسو" },
    ],
  },
  {
    id: "best-admin",
    title: "🛡️ أفضل إداري",
    icon: Shield,
    nominees: [
      { id: "ammar", name: "عمار" },
      { id: "azooz", name: "عزوز" },
      { id: "safah", name: "سفاح" },
      { id: "omar", name: "عمر" },
      { id: "raad", name: "رعد" },
      { id: "jelly", name: "جيلي" },
    ],
  },
  {
    id: "best-artist",
    title: "🎨 أفضل رسام",
    icon: Palette,
    nominees: [
      { id: "waleed", name: "وليد" },
      { id: "ruby", name: "روبي" },
      { id: "saadof", name: "سعدوف" },
      { id: "nasser", name: "ناصر" },
    ],
  },
  {
    id: "best-rising-member",
    title: "🌱 أفضل عضو صاعد",
    icon: Sprout,
    nominees: [
      { id: "yuki", name: "يوكي" },
      { id: "shamso", name: "شمسو" },
      { id: "khaled", name: "خالد" },
      { id: "dawood", name: "داود" },
      { id: "mariam", name: "مريم" },
    ],
  },
  {
    id: "best-photographer",
    title: "📸 أفضل مصور",
    icon: Camera,
    nominees: [
      { id: "nasser", name: "ناصر" },
      { id: "abu-amra", name: "أبو عمره" },
      { id: "mjo", name: "مجو" },
      { id: "raad", name: "رعد" },
      { id: "july", name: "جولاي" },
    ],
  },
  {
    id: "best-activity",
    title: "🎭 أفضل فعالية",
    icon: Drama,
    nominees: [
      { id: "crime", name: "الجريمة" },
      { id: "fandra", name: "فندره" },
      { id: "manuscript", name: "المخطوطة" },
      { id: "photography", name: "التصوير" },
      { id: "secret-vault", name: "الخزنة السرية" },
      { id: "snakes-ladders", name: "الثعبان و السلم" },
    ],
  },
  {
    id: "best-comedian",
    title: "🤣 أفضل ذبيب",
    icon: Laugh,
    nominees: [
      { id: "anas", name: "أنس" },
      { id: "abu-ghani", name: "أبو غنى" },
      { id: "omar", name: "عمر" },
      { id: "khwaldz", name: "خويلدز" },
      { id: "yaseen", name: "ياسين" },
      { id: "badr", name: "بدر" },
    ],
  },
  {
    id: "best-participant",
    title: "🎯 أفضل مشارك في الفعاليات",
    icon: Target,
    nominees: [
      { id: "nazeer", name: "نذير" },
      { id: "ahmad-gon", name: "أحمد غون" },
      { id: "waleed", name: "وليد" },
      { id: "ammar", name: "عمار" },
      { id: "yuki", name: "يوكي" },
      { id: "dawood", name: "داود" },
    ],
  },
  {
    id: "best-debater",
    title: "🗣️ أفضل مناقش",
    icon: MessagesSquare,
    nominees: [
      { id: "hasoon", name: "حسون" },
      { id: "raad", name: "رعد" },
      { id: "majeed", name: "مجيد" },
      { id: "dahm", name: "دحم" },
      { id: "alawi", name: "علاوي" },
      { id: "safah", name: "سفاح" },
    ],
  },
  {
    id: "best-voice",
    title: "🎧 أفضل فويساوي",
    icon: Headphones,
    nominees: [
      { id: "dawood", name: "داود" },
      { id: "jelly", name: "جيلي" },
      { id: "jumhr", name: "جمهر" },
      { id: "moaz", name: "معاذ" },
      { id: "saleh", name: "صالح" },
      { id: "hasoon", name: "حسون" },
      { id: "mubarak", name: "مبارك" },
      { id: "rocky", name: "روكي" },
    ],
  },
  {
    id: "best-gamer",
    title: "🎮 أفضل قيمر",
    icon: Gamepad2,
    nominees: [
      { id: "void", name: "فويد" },
      { id: "moaz", name: "معاذ" },
      { id: "agatso", name: "أقاتسو" },
      { id: "rocky", name: "روكي" },
      { id: "rakan", name: "راكان" },
      { id: "meshari", name: "مشاري" },
    ],
  },
  {
    id: "best-alt-account",
    title: "🥸 أفضل حساب ثاني",
    icon: UserCircle2,
    nominees: [
      { id: "majeed", name: "مجيد" },
      { id: "mahshoom", name: "محشوم" },
      { id: "multi", name: "مالتي" },
      { id: "koro", name: "كورو" },
      { id: "sahm", name: "سهم (حسابه تبند سنتين)" },
    ],
  },
];
