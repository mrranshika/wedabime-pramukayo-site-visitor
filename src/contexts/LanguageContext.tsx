'use client'

import React, { createContext, useContext, useState } from 'react'

type Language = 'en' | 'si' | 'ta'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'app.title': 'Wedabime Pramukayo',
    'app.subtitle': 'Site Visitor Management',
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    
    // Form
    'form.title': 'Site Visitor Registration',
    'form.customerId': 'Customer ID',
    'form.customerName': 'Customer Name',
    'form.phone': 'Phone Number',
    'form.address': 'Address',
    'form.district': 'District',
    'form.serviceType': 'Service Type',
    'form.selectDistrict': 'Select District',
    'form.selectService': 'Select Service Type',
    'form.notes': 'Additional Notes',
    'form.submit': 'Submit Registration',
    'form.submitting': 'Submitting...',
    'form.success': 'Registration submitted successfully!',
    'form.error': 'Failed to submit form. Please try again.',
    
    // Services
    'service.ceiling': 'Ceiling Insulation',
    'service.roofing': 'Roofing Insulation',
    'service.gutter': 'Gutter Insulation',
    'service.all': 'All Services',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.visitors': 'Visitors',
    'dashboard.reports': 'Reports',
    'dashboard.quotations': 'Quotations',
    'dashboard.calendar': 'Calendar',
    'dashboard.settings': 'Settings',
    
    // Status
    'status.pending': 'Pending',
    'status.completed': 'Completed',
    'status.cancelled': 'Cancelled',
    'status.rescheduled': 'Rescheduled',
    
    // Actions
    'action.view': 'View',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    'action.whatsapp': 'WhatsApp',
    'action.export': 'Export',
    
    // Credit
    'credit.developed': 'Developed by',
    'credit.company': 'ZIPCARTCO',
    'credit.foundation': "Mr. Ranshika Foundation's IT Company",
  },
  si: {
    // Header
    'app.title': 'වැඩබිම් ප්‍රමුඛයෝ',
    'app.subtitle': 'අමුත්තන් කළමනාකරණය',
    'nav.home': 'මුල් පිටුව',
    'nav.dashboard': 'මෙවලම් පුවරුව',
    
    // Form
    'form.title': 'අමුත්තන් ලියාපදිංචි කිරීම',
    'form.customerId': 'පාරිභෝගික හැඳුනුම්පත',
    'form.customerName': 'පාරිභෝගික නම',
    'form.phone': 'දුරකථන අංකය',
    'form.address': 'ලිපිනය',
    'form.district': 'දිස්ත්‍රික්කය',
    'form.serviceType': 'සේවා වර්ගය',
    'form.selectDistrict': 'දිස්ත්‍රික්කය තෝරන්න',
    'form.selectService': 'සේවා වර්ගය තෝරන්න',
    'form.notes': 'අමතර සටහන්',
    'form.submit': 'ලියාපදිංචි කරන්න',
    'form.submitting': 'ඉදිරිපත් කරමින්...',
    'form.success': 'ලියාපදිංචිය සාර්ථකයි!',
    'form.error': 'ඉදිරිපත් කිරීම අසාර්ථක විය.',
    
    // Services
    'service.ceiling': 'සීලිං තාපාංකනය',
    'service.roofing': 'වහල් තාපාංකනය',
    'service.gutter': 'ගටර් තාපාංකනය',
    'service.all': 'සියලු සේවා',
    
    // Dashboard
    'dashboard.title': 'මෙවලම් පුවරුව',
    'dashboard.visitors': 'අමුත්තන්',
    'dashboard.reports': 'වාර්තා',
    'dashboard.quotations': 'පොරතෝකු',
    'dashboard.calendar': 'දින දසුන',
    'dashboard.settings': 'සැකසුම්',
    
    // Status
    'status.pending': 'බලා සිටියි',
    'status.completed': 'සම්පූර්ණයි',
    'status.cancelled': 'අවලංගු කරන ලදී',
    'status.rescheduled': 'නැවත සැකසූ',
    
    // Actions
    'action.view': 'බලන්න',
    'action.edit': 'සංස්කරණය',
    'action.delete': 'මකන්න',
    'action.whatsapp': 'වට්සැප්',
    'action.export': 'අපනයනය',
    
    // Credit
    'credit.developed': 'සංවර්ධකයින්',
    'credit.company': 'ZIPCARTCO',
    'credit.foundation': 'මිස්ටර් රංශිකා පදනමේ IT සමාගම',
  },
  ta: {
    // Header
    'app.title': 'வேதபிமே பிரமுகயோ',
    'app.subtitle': 'தள பார்வையாளர் மேலாண்மை',
    'nav.home': 'முகப்பு',
    'nav.dashboard': 'டாஷ்போர்டு',
    
    // Form
    'form.title': 'பார்வையாளர் பதிவு',
    'form.customerId': 'வாடிக்கையாளர் ஐடி',
    'form.customerName': 'வாடிக்கையாளர் பெயர்',
    'form.phone': 'தொலைபேசி எண்',
    'form.address': 'முகவரி',
    'form.district': 'மாவட்டம்',
    'form.serviceType': 'சேவை வகை',
    'form.selectDistrict': 'மாவட்டத்தைத் தேர்ந்தெடுக்கவும்',
    'form.selectService': 'சேவை வகையைத் தேர்ந்தெடுக்கவும்',
    'form.notes': 'கூடுதல் குறிப்புகள்',
    'form.submit': 'பதிவு செய்யுங்கள்',
    'form.submitting': 'சமர்ப்பிக்கிறது...',
    'form.success': 'பதிவு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!',
    'form.error': 'பதிவு தோல்வியுற்றது.',
    
    // Services
    'service.ceiling': 'சீலிங் இன்சுலேஷன்',
    'service.roofing': 'கூரை இன்சுலேஷன்',
    'service.gutter': 'கட்டர் இன்சுலேஷன்',
    'service.all': 'அனைத்து சேவைகள்',
    
    // Dashboard
    'dashboard.title': 'டாஷ்போர்டு',
    'dashboard.visitors': 'பார்வையாளர்கள்',
    'dashboard.reports': 'அறிக்கைகள்',
    'dashboard.quotations': 'மேற்கோள்கள்',
    'dashboard.calendar': 'நாட்காட்டி',
    'dashboard.settings': 'அமைப்புகள்',
    
    // Status
    'status.pending': 'நிலுவையில்',
    'status.completed': 'முடிந்தது',
    'status.cancelled': 'ரத்து செய்யப்பட்டது',
    'status.rescheduled': 'மறுசீரமைக்கப்பட்டது',
    
    // Actions
    'action.view': 'பார்வை',
    'action.edit': 'திருத்து',
    'action.delete': 'நீக்கு',
    'action.whatsapp': 'வாட்ஸ்அப்',
    'action.export': 'ஏற்றுமதி',
    
    // Credit
    'credit.developed': 'உருவாக்கியவர்கள்',
    'credit.company': 'ZIPCARTCO',
    'credit.foundation': 'மிஸ்டர் ரன்ஷிகா அறக்கட்டளையின் IT நிறுவனம்',
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
