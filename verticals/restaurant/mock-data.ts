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

function menuRefs(prefix: string) {
  return [`${prefix} menu PDF`, `${prefix} website menu section`];
}

export function getRestaurantWorkspaceData(tenant: Tenant): RestaurantWorkspaceData {
  const lowerName = tenant.name.toLowerCase();
  const cuisineType = lowerName.includes("rivera") ? "Contemporary Latin" : "Neighborhood Restaurant";
  const businessName = tenant.name;
  const assistantStatus = tenant.status === "ACTIVE" ? "live" : "needs_review";

  const profile: RestaurantProfile = {
    id: `${tenant.id}-profile`,
    tenantId: tenant.id,
    businessName,
    businessDescription: `${businessName} helps guests with reservations, takeout, catering, and everyday menu questions through WhatsApp.`,
    cuisineType,
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
    status: assistantStatus,
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
    {
      id: "catpack-2",
      tenantId: tenant.id,
      name: "Celebration buffet",
      description: "Buffet-style setup with two mains, three sides, and dessert for larger groups.",
      pricingModel: "starting-price",
      basePrice: 550,
      minGuests: 25,
      maxGuests: 80,
      availabilityRules: "Weekend catering subject to availability.",
      notes: "Final quote depends on staffing and rentals.",
      confidence: 0.8,
      sourceRefs: ["Catering brochure page 4", "Owner note"],
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
      answer: "Yes. Guests usually ask about our charred cauliflower tacos, seasonal vegetable bowl, and dairy-free side options.",
      confidence: 0.87,
      sourceRefs: ["Menu PDF page 1", "Chef note"],
      editable: true,
      escalationRequired: false,
    },
    {
      id: "faq-3",
      tenantId: tenant.id,
      category: "Catering",
      question: "Do you offer catering?",
      answer: "Yes. We offer office lunch spreads and larger celebration packages. We usually recommend at least 48 hours notice.",
      confidence: 0.83,
      sourceRefs: ["Catering brochure page 2"],
      editable: true,
      escalationRequired: false,
    },
    {
      id: "faq-4",
      tenantId: tenant.id,
      category: "Parking",
      question: "Do you have parking?",
      answer: "There is nearby street parking plus a public garage on State Street after 5 PM.",
      confidence: 0.61,
      sourceRefs: ["Owner note"],
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
    {
      id: "art-3",
      tenantId: tenant.id,
      type: "brochure",
      filename: "catering-brochure.pdf",
      processingStatus: "needs_review",
      extractionSummary: "We found 3 catering details that need confirmation.",
      uploadedAt: "2026-04-06T09:06:00.000Z",
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
      entityType: "MenuItem",
      fieldName: "Celebration buffet starting price",
      proposedValue: "$550 starting price",
      confidence: 0.72,
      sourceRef: "Catering brochure page 4",
      reviewStatus: "needs_review",
      reason: "Pricing should be confirmed before going live",
    },
    {
      id: "rev-3",
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
      response: "Yes. We currently have vegan-friendly options including the charred cauliflower tacos and a seasonal vegetable bowl. If you'd like, I can point you to the best takeout choices too.",
      actions: [],
    },
    {
      id: "pa-3",
      prompt: restaurantVertical.previewQuestions[2].prompt,
      intent: "catering_inquiry",
      confidence: 0.79,
      sourceRefs: ["Catering brochure page 2", "Catering brochure page 4"],
      response: "Yes, we offer catering for groups that size. Our office lunch spread starts at 20 guests, and I can help capture your date, headcount, and event details for a follow-up quote.",
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
      escalationReason: undefined,
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
    {
      id: "conv-3",
      tenantId: tenant.id,
      channel: "WhatsApp",
      startedAt: "2026-04-07T13:30:00.000Z",
      status: "unresolved",
      detectedIntent: "location_question",
      resolvedBy: "pending",
      confidence: 0.49,
      escalationReason: undefined,
      customerName: "Chris",
      customerMessage: "Is there parking nearby for dinner tonight?",
      assistantReply: "I found a note about street parking and a nearby garage, but I would like the team to confirm it for tonight.",
      sourceRefs: ["Owner note"],
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
    {
      id: "du-2",
      tenantId: tenant.id,
      type: "promotion",
      effectiveDate: "2026-04-07",
      expiresAt: "2026-04-07T22:00:00.000Z",
      message: "Happy hour agua fresca add-on with any takeout bowl after 3 PM.",
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
    {
      id: "ls-2",
      title: "Clarify large-group reservations",
      description: "Three guests asked whether large groups can reserve online or need a direct follow-up.",
      frequency: 3,
    },
  ];

  const extractionSummary: ExtractionSummary = {
    hoursFound: true,
    addressFound: true,
    phoneFound: true,
    menuItemsFound: 42,
    cateringServicesFound: 2,
    reservationDetailsFound: true,
    takeoutDetailsFound: true,
    itemsNeedingReview: reviewItems.length,
  };

  const analytics = {
    conversationVolume: 124,
    autoAnswerRate: 82,
    escalations: 9,
    unansweredTopics: ["Parking availability", "Large event staffing", "Late-night takeout cutoff"],
    topQuestions: [
      { label: "Do you take reservations?", count: 28 },
      { label: "Do you have vegan options?", count: 22 },
      { label: "Do you offer catering?", count: 16 },
    ],
    topMenuItemInquiries: [
      { label: "Charred cauliflower tacos", count: 14 },
      { label: "Family taco dinner", count: 12 },
      { label: "Citrus grilled chicken bowl", count: 9 },
    ],
    reservationTrend: 18,
    takeoutTrend: 26,
    cateringTrend: 11,
  };

  return {
    verticalKey: "restaurant",
    assistantStatus,
    profile,
    menuCategories,
    menuItems,
    cateringPackages,
    faqs,
    dailyUpdates,
    uploadedArtifacts,
    reviewItems,
    conversations,
    extractionSummary,
    previewAnswers,
    learningSuggestions,
    analytics,
    quickActions: [
      { label: "Review setup", href: "/app/restaurant/setup" },
      { label: "Update hours", href: "/app/restaurant/profile" },
      { label: "Mark item unavailable", href: "/app/restaurant/updates" },
      { label: "Preview assistant", href: "/app/restaurant/preview" },
    ],
    notifications: [
      { title: "We found 3 things that need your review", detail: "They are mostly catering pricing and parking details." },
      { title: "Customers may ask about parking tonight", detail: "This came up repeatedly in recent chats." },
    ],
  };
}
