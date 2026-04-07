import type { Tenant } from "@prisma/client";
import { restaurantVertical } from "@/verticals/restaurant";
import type {
  CateringPackage,
  DailyUpdate,
  ExtractionReviewItem,
  FAQEntry,
  MenuCategory,
  MenuItem,
  RestaurantConversation,
  RestaurantProfile,
  UploadedArtifact,
} from "@/verticals/restaurant";

export type AssistantPreviewAnswer = {
  id: string;
  prompt: string;
  intent: string;
  confidence: number;
  sourceRefs: string[];
  response: string;
  actions: string[];
};

export type LearningSuggestion = {
  id: string;
  title: string;
  description: string;
  frequency: number;
};

export type ExtractionSummary = {
  hoursFound: boolean;
  addressFound: boolean;
  phoneFound: boolean;
  menuItemsFound: number;
  cateringServicesFound: number;
  reservationDetailsFound: boolean;
  takeoutDetailsFound: boolean;
  itemsNeedingReview: number;
};

export type RestaurantWorkspaceData = {
  verticalKey: "restaurant";
  mode: "starter" | "demo";
  assistantStatus: "draft" | "needs_review" | "live";
  profile: RestaurantProfile;
  menuCategories: MenuCategory[];
  menuItems: MenuItem[];
  cateringPackages: CateringPackage[];
  faqs: FAQEntry[];
  dailyUpdates: DailyUpdate[];
  uploadedArtifacts: UploadedArtifact[];
  reviewItems: ExtractionReviewItem[];
  conversations: RestaurantConversation[];
  extractionSummary: ExtractionSummary;
  previewAnswers: AssistantPreviewAnswer[];
  learningSuggestions: LearningSuggestion[];
  analytics: {
    conversationVolume: number;
    autoAnswerRate: number;
    escalations: number;
    unansweredTopics: string[];
    topQuestions: Array<{ label: string; count: number }>;
    topMenuItemInquiries: Array<{ label: string; count: number }>;
    reservationTrend: number;
    takeoutTrend: number;
    cateringTrend: number;
  };
  quickActions: Array<{ label: string; href: string }>;
  notifications: Array<{ title: string; detail: string }>;
};

const demoTenantSlugs = new Set(["rivera-kitchen", "northside-barber", "atlas-auto-care"]);

function menuRefs(prefix: string) {
  return [`${prefix} menu PDF`, `${prefix} website menu section`];
}

function buildStarterProfile(tenant: Tenant): RestaurantProfile {
  return {
    id: `${tenant.id}-profile`,
    tenantId: tenant.id,
    businessName: tenant.name,
    businessDescription: "",
    cuisineType: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: "",
    website: "",
    timezone: "America/New_York",
    regularHours: [],
    holidayHours: [],
    temporaryClosures: [],
    reservationEnabled: false,
    reservationInstructions: "",
    reservationMethod: "",
    reservationLink: "",
    takeoutEnabled: false,
    takeoutInstructions: "",
    takeoutMethod: "",
    takeoutLink: "",
    cateringEnabled: false,
    cateringInstructions: "",
    cateringContactMethod: "",
    parkingInfo: "",
    socialLinks: [],
    serviceArea: "",
    status: "draft",
  };
}

function buildStarterWorkspace(tenant: Tenant): RestaurantWorkspaceData {
  return {
    verticalKey: "restaurant",
    mode: "starter",
    assistantStatus: "draft",
    profile: buildStarterProfile(tenant),
    menuCategories: [],
    menuItems: [],
    cateringPackages: [],
    faqs: [],
    dailyUpdates: [],
    uploadedArtifacts: [],
    reviewItems: [],
    conversations: [],
    extractionSummary: {
      hoursFound: false,
      addressFound: false,
      phoneFound: false,
      menuItemsFound: 0,
      cateringServicesFound: 0,
      reservationDetailsFound: false,
      takeoutDetailsFound: false,
      itemsNeedingReview: 0,
    },
    previewAnswers: restaurantVertical.previewQuestions.map((item) => ({
      id: item.id,
      prompt: item.prompt,
      intent: item.intent,
      confidence: 0.24,
      sourceRefs: [],
      response: "Once you add your website, menu, and service details, we'll show a realistic preview answer here.",
      actions: [],
    })),
    learningSuggestions: [],
    analytics: {
      conversationVolume: 0,
      autoAnswerRate: 0,
      escalations: 0,
      unansweredTopics: [],
      topQuestions: [],
      topMenuItemInquiries: [],
      reservationTrend: 0,
      takeoutTrend: 0,
      cateringTrend: 0,
    },
    quickActions: [
      { label: "Start setup", href: "/app/restaurant/onboarding" },
      { label: "Add business details", href: "/app/restaurant/profile" },
      { label: "Upload materials", href: "/app/restaurant/setup" },
      { label: "Preview assistant", href: "/app/restaurant/preview" },
    ],
    notifications: [
      { title: "Start with the basics", detail: "Add your website, phone, and address so we can begin building your assistant." },
    ],
  };
}

function buildDemoWorkspace(tenant: Tenant): RestaurantWorkspaceData {
  const businessName = tenant.name;
  const profile: RestaurantProfile = {
    id: `${tenant.id}-profile`,
    tenantId: tenant.id,
    businessName,
    businessDescription: `${businessName} helps guests with reservations, takeout, catering, and everyday menu questions through WhatsApp.`,
    cuisineType: "Contemporary Latin",
    address: "12 Market Street",
    city: "Brooklyn",
    state: "NY",
    zip: "11201",
    phone: "(555) 010-1000",
    email: "hello@riverakitchen.example",
    website: "https://riverakitchen.example.com",
    timezone: "America/New_York",
    regularHours: [
      { day: "Mon", open: "11:00 AM", close: "9:00 PM" },
      { day: "Tue", open: "11:00 AM", close: "9:00 PM" },
      { day: "Wed", open: "11:00 AM", close: "9:30 PM" },
      { day: "Thu", open: "11:00 AM", close: "9:30 PM" },
      { day: "Fri", open: "11:00 AM", close: "10:30 PM" },
      { day: "Sat", open: "10:00 AM", close: "10:30 PM" },
      { day: "Sun", open: "10:00 AM", close: "8:30 PM" },
    ],
    holidayHours: [
      { date: "2026-05-10", label: "Mother's Day", hours: "10:00 AM - 3:00 PM brunch only" },
    ],
    temporaryClosures: [{ date: "2026-04-21", reason: "Private dining event after 5:00 PM" }],
    reservationEnabled: true,
    reservationInstructions: "We can hold standard tables up to 15 minutes. Large parties should share any accessibility or seating needs.",
    reservationMethod: "WhatsApp handoff to host stand",
    reservationLink: "https://riverakitchen.example.com/reservations",
    takeoutEnabled: true,
    takeoutInstructions: "Takeout is available during open hours. Popular items can sell out after 7 PM.",
    takeoutMethod: "WhatsApp-assisted handoff",
    takeoutLink: "https://riverakitchen.example.com/order",
    cateringEnabled: true,
    cateringInstructions: "Catering starts at 10 guests. We recommend 48 hours notice for weekend events.",
    cateringContactMethod: "WhatsApp form and follow-up call",
    parkingInfo: "Street parking nearby plus a public garage on State Street after 5 PM.",
    socialLinks: [
      { label: "Instagram", url: "https://instagram.com/riverakitchen" },
      { label: "TikTok", url: "https://tiktok.com/@riverakitchen" },
    ],
    serviceArea: "Brooklyn and lower Manhattan for catering deliveries.",
    status: "live",
  };

  const menuCategories: MenuCategory[] = [
    { id: "cat-1", tenantId: tenant.id, name: "Starters", displayOrder: 1 },
    { id: "cat-2", tenantId: tenant.id, name: "Mains", displayOrder: 2 },
    { id: "cat-3", tenantId: tenant.id, name: "Desserts", displayOrder: 3 },
    { id: "cat-4", tenantId: tenant.id, name: "Family Meals", displayOrder: 4 },
  ];

  const menuItems: MenuItem[] = [
    {
      id: "item-1",
      tenantId: tenant.id,
      categoryId: "cat-1",
      name: "Charred cauliflower tacos",
      description: "Roasted cauliflower, salsa verde, pickled onion, and avocado crema.",
      price: 14,
      currency: "USD",
      dietaryTags: ["vegetarian", "gluten-friendly"],
      modifiers: ["Add grilled shrimp", "No dairy crema"],
      available: true,
      soldOutToday: false,
      seasonal: false,
      notes: "Frequently asked about by vegan guests.",
      confidence: 0.93,
      sourceRefs: menuRefs(businessName),
    },
    {
      id: "item-2",
      tenantId: tenant.id,
      categoryId: "cat-2",
      name: "Citrus grilled chicken bowl",
      description: "Rice, black beans, roasted peppers, cotija, and cilantro dressing.",
      price: 19,
      currency: "USD",
      dietaryTags: ["high-protein"],
      modifiers: ["Swap rice for greens", "Extra avocado"],
      available: true,
      soldOutToday: false,
      seasonal: false,
      notes: "Popular takeout item.",
      confidence: 0.9,
      sourceRefs: menuRefs(businessName),
    },
    {
      id: "item-3",
      tenantId: tenant.id,
      categoryId: "cat-4",
      name: "Family taco dinner",
      description: "Feeds four with tortillas, two proteins, rice, beans, and toppings.",
      price: 48,
      currency: "USD",
      dietaryTags: ["family-style"],
      modifiers: ["Chicken and steak", "Add churros"],
      available: true,
      soldOutToday: true,
      seasonal: false,
      notes: "Mark unavailable during busy weekends.",
      confidence: 0.88,
      sourceRefs: ["Spring flyer", `${businessName} takeout PDF`],
    },
  ];

  const cateringPackages: CateringPackage[] = [
    {
      id: "catpack-1",
      tenantId: tenant.id,
      name: "Office lunch spread",
      description: "Taco bar, sides, dessert bites, and setup for 20-35 guests.",
      pricingModel: "per-person",
      basePrice: 22,
      minGuests: 20,
      maxGuests: 35,
      availabilityRules: "48 hours notice required, weekday lunch preferred.",
      notes: "Add beverage service on request.",
      confidence: 0.86,
      sourceRefs: ["Catering brochure page 2"],
    },
  ];

  const faqs: FAQEntry[] = [
    {
      id: "faq-1",
      tenantId: tenant.id,
      category: "Reservations",
      question: "Do you take reservations?",
      answer: "Yes. We can help with standard reservations over WhatsApp and share the online reservation link for anything more complex.",
      confidence: 0.91,
      sourceRefs: ["Website reservations page"],
      editable: true,
      escalationRequired: false,
    },
    {
      id: "faq-2",
      tenantId: tenant.id,
      category: "Dietary",
      question: "Do you have vegan options?",
      answer: "Yes. Guests usually ask about our charred cauliflower tacos and seasonal vegetable bowl.",
      confidence: 0.87,
      sourceRefs: ["Menu PDF page 1", "Chef note"],
      editable: true,
      escalationRequired: false,
    },
  ];

  const uploadedArtifacts: UploadedArtifact[] = [
    {
      id: "art-1",
      tenantId: tenant.id,
      type: "website",
      filename: "riverakitchen.example.com",
      sourceUrl: "https://riverakitchen.example.com",
      processingStatus: "processed",
      extractionSummary: "Your website has been processed. We found hours, reservation details, and 18 menu references.",
      uploadedAt: "2026-04-06T09:00:00.000Z",
    },
    {
      id: "art-2",
      tenantId: tenant.id,
      type: "menu_pdf",
      filename: "spring-menu.pdf",
      processingStatus: "processed",
      extractionSummary: "Menu uploaded. We found 42 menu items and 7 dietary tags.",
      uploadedAt: "2026-04-06T09:03:00.000Z",
    },
  ];

  const reviewItems: ExtractionReviewItem[] = [
    {
      id: "rev-1",
      tenantId: tenant.id,
      entityType: "RestaurantProfile",
      fieldName: "Holiday hours",
      proposedValue: "Mother's Day brunch only, 10 AM - 3 PM",
      confidence: 0.68,
      sourceRef: "Website event banner",
      reviewStatus: "needs_review",
      reason: "Business-critical schedule change",
    },
    {
      id: "rev-2",
      tenantId: tenant.id,
      entityType: "FAQEntry",
      fieldName: "Parking answer",
      proposedValue: "Street parking plus public garage after 5 PM",
      confidence: 0.61,
      sourceRef: "Owner note",
      reviewStatus: "needs_review",
      reason: "Customers ask this often and we only found a note",
    },
  ];

  const previewAnswers: AssistantPreviewAnswer[] = [
    {
      id: "pa-1",
      prompt: restaurantVertical.previewQuestions[0].prompt,
      intent: "reservation_request",
      confidence: 0.84,
      sourceRefs: ["Website reservations page", "Host stand note"],
      response: "I can help with that. Rivera Kitchen takes reservations, and for a party of 4 at 7 PM I would confirm availability and share the reservation link if needed.",
      actions: ["book_reservation"],
    },
    {
      id: "pa-2",
      prompt: restaurantVertical.previewQuestions[1].prompt,
      intent: "dietary_question",
      confidence: 0.88,
      sourceRefs: ["Menu PDF page 1", "Chef note"],
      response: "Yes. We currently have vegan-friendly options including the charred cauliflower tacos and a seasonal vegetable bowl.",
      actions: [],
    },
    {
      id: "pa-3",
      prompt: restaurantVertical.previewQuestions[2].prompt,
      intent: "catering_inquiry",
      confidence: 0.79,
      sourceRefs: ["Catering brochure page 2"],
      response: "Yes, we offer catering for groups that size. I can help capture your date, headcount, and event details for a follow-up quote.",
      actions: ["submit_catering_request"],
    },
  ];

  const conversations: RestaurantConversation[] = [
    {
      id: "conv-1",
      tenantId: tenant.id,
      channel: "WhatsApp",
      startedAt: "2026-04-07T11:12:00.000Z",
      status: "answered",
      detectedIntent: "menu_question",
      resolvedBy: "assistant",
      confidence: 0.9,
      customerName: "Mia",
      customerMessage: "Do you have vegan options?",
      assistantReply: previewAnswers[1].response,
      sourceRefs: previewAnswers[1].sourceRefs,
    },
    {
      id: "conv-2",
      tenantId: tenant.id,
      channel: "WhatsApp",
      startedAt: "2026-04-07T12:04:00.000Z",
      status: "escalated",
      detectedIntent: "catering_inquiry",
      resolvedBy: "human",
      confidence: 0.54,
      escalationReason: "Guest asked for staffing and rental pricing not found in uploaded materials.",
      customerName: "Jordan",
      customerMessage: "Can you cater a rooftop event for 60 people next month?",
      assistantReply: "We do offer larger catering packages. I can collect your details and have the team follow up with pricing and availability.",
      sourceRefs: ["Catering brochure page 4"],
    },
  ];

  const dailyUpdates: DailyUpdate[] = [
    {
      id: "du-1",
      tenantId: tenant.id,
      type: "sold_out_item",
      effectiveDate: "2026-04-07",
      expiresAt: "2026-04-07T23:59:00.000Z",
      message: "Family taco dinner is sold out tonight.",
      relatedMenuItemId: "item-3",
      active: true,
    },
  ];

  const learningSuggestions: LearningSuggestion[] = [
    {
      id: "ls-1",
      title: "Add a parking FAQ",
      description: "Customers asked about parking 5 times this week. The answer still depends on a low-confidence owner note.",
      frequency: 5,
    },
  ];

  return {
    verticalKey: "restaurant",
    mode: "demo",
    assistantStatus: "live",
    profile,
    menuCategories,
    menuItems,
    cateringPackages,
    faqs,
    dailyUpdates,
    uploadedArtifacts,
    reviewItems,
    conversations,
    extractionSummary: {
      hoursFound: true,
      addressFound: true,
      phoneFound: true,
      menuItemsFound: 42,
      cateringServicesFound: 1,
      reservationDetailsFound: true,
      takeoutDetailsFound: true,
      itemsNeedingReview: reviewItems.length,
    },
    previewAnswers,
    learningSuggestions,
    analytics: {
      conversationVolume: 124,
      autoAnswerRate: 82,
      escalations: 9,
      unansweredTopics: ["Parking availability", "Large event staffing"],
      topQuestions: [
        { label: "Do you take reservations?", count: 28 },
        { label: "Do you have vegan options?", count: 22 },
      ],
      topMenuItemInquiries: [
        { label: "Charred cauliflower tacos", count: 14 },
        { label: "Family taco dinner", count: 12 },
      ],
      reservationTrend: 18,
      takeoutTrend: 26,
      cateringTrend: 11,
    },
    quickActions: [
      { label: "Review setup", href: "/app/restaurant/setup" },
      { label: "Update hours", href: "/app/restaurant/profile" },
      { label: "Mark item unavailable", href: "/app/restaurant/updates" },
      { label: "Preview assistant", href: "/app/restaurant/preview" },
    ],
    notifications: [
      { title: "We found 2 things that need your review", detail: "They are mostly schedule and parking details." },
      { title: "Customers may ask about parking tonight", detail: "This came up repeatedly in recent chats." },
    ],
  };
}

export function getRestaurantWorkspaceData(tenant: Tenant): RestaurantWorkspaceData {
  return demoTenantSlugs.has(tenant.slug) ? buildDemoWorkspace(tenant) : buildStarterWorkspace(tenant);
}
