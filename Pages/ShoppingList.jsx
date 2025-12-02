import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ControlBar from '@/components/shopping/ControlBar';
import CategoryCard from '@/components/shopping/CategoryCard';
import SummaryCard from '@/components/shopping/SummaryCard';
import SupermarketChecklist from '@/components/shopping/SupermarketChecklist';
import SavedListsManager from '@/components/shopping/SavedListsManager';
import BudgetSummary from '@/components/shopping/BudgetSummary';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_CATEGORIES = {
  'ירקות': [
    { name: 'ארטישוק ירושלמי', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'בזיליקום', unit: 'צרור', step: 1, min: 1 },
    { name: 'בטטה', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'בצל ירוק', unit: 'צרור', step: 1, min: 1 },
    { name: 'ברוקולי', unit: 'יחידות', step: 1, min: 1 },
    { name: 'גזר', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'דלעת', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'חסה', unit: 'יחידות', step: 1, min: 1 },
    { name: 'טימין', unit: 'צרור', step: 1, min: 1 },
    { name: 'כוסברה', unit: 'צרור', step: 1, min: 1 },
    { name: 'כרוב לבן/סגול', unit: 'יחידות', step: 1, min: 1 },
    { name: 'כרובית', unit: 'יחידות', step: 1, min: 1 },
    { name: 'כרישה', unit: 'יחידות', step: 1, min: 1 },
    { name: 'מלפפונים', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'נענע', unit: 'צרור', step: 1, min: 1 },
    { name: 'עגבניות', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'עלי מנגולד', unit: 'צרור', step: 1, min: 1 },
    { name: 'פטרוזיליה', unit: 'צרור', step: 1, min: 1 },
    { name: 'פטריות', unit: 'חבילה', step: 1, min: 1 },
    { name: 'פלפל חריף', unit: 'יחידות', step: 1, min: 1 },
    { name: 'פלפלים', unit: 'יחידות', step: 1, min: 1 },
    { name: 'קולורבי', unit: 'יחידות', step: 1, min: 1 },
    { name: 'קישוא', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'רוזמרין', unit: 'צרור', step: 1, min: 1 },
    { name: 'רוקט/אורוגולה', unit: 'חבילה', step: 1, min: 1 },
    { name: 'שום', unit: 'יחידות', step: 1, min: 1 },
    { name: 'שומר', unit: 'יחידות', step: 1, min: 1 },
    { name: 'שורש סלרי', unit: 'יחידות', step: 1, min: 1 },
    { name: 'שורש פטרוזיליה', unit: 'יחידות', step: 1, min: 1 },
    { name: 'שמיר', unit: 'צרור', step: 1, min: 1 },
    { name: 'תירס', unit: 'יחידות', step: 1, min: 1 },
    { name: 'תפוחי אדמה', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'תרד טרי', unit: 'צרור', step: 1, min: 1 },
  ],
  'פירות': [
    { name: 'אבוקדו', unit: 'יחידות', step: 1, min: 1 },
    { name: 'אבטיח', unit: 'יחידות', step: 1, min: 1 },
    { name: 'אגס', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'אפרסקים', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'אשכוליות', unit: 'יחידות', step: 1, min: 1 },
    { name: 'בננות', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'ליים', unit: 'יחידות', step: 1, min: 1 },
    { name: 'לימון', unit: 'יחידות', step: 1, min: 1 },
    { name: 'מלון', unit: 'יחידות', step: 1, min: 1 },
    { name: 'מנגו', unit: 'יחידות', step: 1, min: 1 },
    { name: 'נקטרינות', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'ענבים', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'קלמנטינות', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'שזיפים', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'תפוזים', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'תפוחים', unit: 'ק"ג', step: 0.5, min: 0.5 },
  ],
  'מוצרי חלב וביצים': [
    { name: 'אקטימל', unit: 'יחידות', step: 1, min: 1 },
    { name: 'ביצים', unit: 'תבנית', step: 1, min: 1 },
    { name: 'ברי', unit: 'ק"ג', step: 0.1, min: 0.1 },
    { name: 'גאודה', unit: 'ק"ג', step: 0.1, min: 0.1 },
    { name: 'גבינה בולגרית', unit: 'ק"ג', step: 0.1, min: 0.1 },
    { name: 'גבינה כחולה', unit: 'ק"ג', step: 0.1, min: 0.1 },
    { name: 'גבינה לבנה', unit: 'יחידות', step: 1, min: 1 },
    { name: 'גבינה צהובה מגורדת', unit: 'ק"ג', step: 0.1, min: 0.1 },
    { name: 'גבינה צהובה פרוסה', unit: 'ק"ג', step: 0.1, min: 0.1 },
    { name: "גבינת פרמז'ן מגורדת", unit: 'ק"ג', step: 0.1, min: 0.1 },
    { name: 'גבינת שמנת', unit: 'יחידות', step: 1, min: 1 },
    { name: 'דני/מילקי', unit: 'יחידות', step: 1, min: 1 },
    { name: 'חלב/תחליפים', unit: 'ליטר', step: 1, min: 1, hasSubTypes: true, subTypes: [
      'חלב 1%', 'חלב 3%', 'נטול לקטוז', 'דל לקטוז', 'חלב סויה', 'חלב שקדים', 'חלב קוקוס', 'חלב שיבולת שועל', 'חלב אורז'
    ]},
    
    { name: 'חמאה', unit: 'יחידות', step: 1, min: 1 },
    { name: 'יוגורט', unit: 'יחידות', step: 1, min: 1 },
    { name: 'יוגורט טבעי', unit: 'יחידות', step: 1, min: 1 },
    { name: 'לבנה', unit: 'יחידות', step: 1, min: 1 },
    { name: 'מוצרלה', unit: 'ק"ג', step: 0.1, min: 0.1 },
    { name: "מנצ'גו", unit: 'ק"ג', step: 0.1, min: 0.1 },
    { name: 'מסקרפונה', unit: 'יחידות', step: 1, min: 1 },
    { name: 'צפתית', unit: 'יחידות', step: 1, min: 1 },
    { name: "פרמז'ן", unit: 'ק"ג', step: 0.1, min: 0.1 },
    { name: "קוטג'", unit: 'יחידות', step: 1, min: 1 },
    { name: 'קממבר', unit: 'ק"ג', step: 0.1, min: 0.1 },
    { name: 'ריקוטה', unit: 'ק"ג', step: 0.1, min: 0.1 },
    { name: 'שמנת לבישול', unit: 'יחידות', step: 1, min: 1 },
    { name: 'שמנת להקצפה', unit: 'יחידות', step: 1, min: 1 },
  ],
  'מאפים ולחמים': [
    { name: 'טורטיה', unit: 'שקית', step: 1, min: 1 },
              { name: 'לחם פרוס', unit: 'יחידות', step: 1, min: 1 },
              { name: 'לחמניות', unit: 'יחידות', step: 1, min: 1 },
                        { name: 'פיתות', unit: 'יחידות', step: 1, min: 1 },
    { name: 'קורנפלקס/גרנולה', unit: 'קופסה', step: 1, min: 1 },
    { name: 'קרקרים', unit: 'חבילה', step: 1, min: 1 },
  ],
  'מזווה ותבלינים': [
    { name: 'אורז', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'חומוס בשימורים', unit: 'פחית', step: 1, min: 1 },
    { name: 'חומוס יבש', unit: 'שקית', step: 1, min: 1 },
    { name: 'טונה בשימורים', unit: 'פחית', step: 1, min: 1 },
    { name: 'טחינה', unit: 'צנצנת', step: 1, min: 1 },
    { name: 'כמון', unit: 'ק"ג', step: 0.1, min: 0.1 },
    { name: 'מיונז', unit: 'צנצנת', step: 1, min: 1 },
    { name: 'מלח', unit: 'ק"ג', step: 0.1, min: 0.1 },
    { name: 'מרק עוף צמחי', unit: 'קופסה', step: 1, min: 1 },
    { name: "רוטב צ'ילי מתוק", unit: 'בקבוק', step: 1, min: 1 },
    { name: "רוטב צ'ילי חריף", unit: 'בקבוק', step: 1, min: 1 },
    { name: 'סוכר', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'סוכר וניל', unit: 'שקית', step: 1, min: 1 },
    { name: 'עדשים', unit: 'שקית', step: 1, min: 1 },
    { name: 'פלפל שחור', unit: 'ק"ג', step: 0.1, min: 0.1 },
    { name: 'פפריקה', unit: 'ק"ג', step: 0.1, min: 0.1 },
    { name: 'פרורי לחם', unit: 'שקית', step: 1, min: 1 },
    { name: 'קטשופ', unit: 'בקבוק', step: 1, min: 1 },
    { name: 'קמח', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'רוטב סויה', unit: 'בקבוק', step: 1, min: 1 },
    { name: 'רסק עגבניות מוטי', unit: 'פחית', step: 1, min: 1 },
    { name: 'שוקולית', unit: 'צנצנת', step: 1, min: 1 },
    { name: 'שום גבישי', unit: 'ק"ג', step: 0.1, min: 0.1 },
    { name: 'שמן זית', unit: 'בקבוק', step: 1, min: 1 },
    { name: 'שמן קנולה', unit: 'בקבוק', step: 1, min: 1 },
    { name: 'שעועית', unit: 'שקית', step: 1, min: 1 },
              { name: 'תירס בשימורים', unit: 'פחית', step: 1, min: 1 },
              { name: 'פסטה', unit: 'שקית', step: 1, min: 1 },
            ],
  'עוף': [
    { name: 'חזה עוף', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'פילה עוף', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'כנפיים', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'כרעיים', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'שוקיים', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'פרגיות', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'לבבות עוף', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'גרונות הודו', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'נקניקיות עוף', unit: 'חבילה', step: 1, min: 1 },
    { name: 'נקניקיות ילדים', unit: 'חבילה', step: 1, min: 1 },
  ],
  'בשר': [
    { name: 'אוסובוקו', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'אנטריקוט', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'בשר טחון', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'סטייק סינטה', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'צוואר בקר', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'צלי כתף', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'שייטל', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'נקניקיות בקר', unit: 'חבילה', step: 1, min: 1 },
    { name: 'פסטרמה', unit: 'ק"ג', step: 0.1, min: 0.1 },
  ],
  'דגים': [
    { name: 'סלמון פילה', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'דג טרי', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'פילה אמנון', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'פילה בורי', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'פילה דניס', unit: 'ק"ג', step: 0.5, min: 0.5 },
    { name: 'טונה טרייה', unit: 'ק"ג', step: 0.5, min: 0.5 },
  ],
  'קפואים': [
    { name: 'ירקות קפואים', unit: 'שקית', step: 1, min: 1 },
    { name: 'דגים קפואים', unit: 'שקית', step: 1, min: 1 },
    { name: "צ'יפס קפוא", unit: 'שקית', step: 1, min: 1 },
    { name: 'פיצה קפואה', unit: 'יחידות', step: 1, min: 1 },
    { name: 'בורקס קפוא', unit: 'שקית', step: 1, min: 1 },
    { name: 'שניצלים קפואים', unit: 'שקית', step: 1, min: 1 },
    { name: 'נאגטס קפואים', unit: 'שקית', step: 1, min: 1 },
    { name: 'פירות קפואים', unit: 'שקית', step: 1, min: 1 },
    { name: 'גלידה', unit: 'ליטר', step: 1, min: 1 },
    { name: 'טופו', unit: 'חבילה', step: 1, min: 1 },
    { name: 'תחליף בשר', unit: 'חבילה', step: 1, min: 1 },
    { name: 'בצק עלים קפוא', unit: 'יחידות', step: 1, min: 1 },
              { name: 'לחם קפוא', unit: 'יחידות', step: 1, min: 1 },
              { name: "ג'חנון", unit: 'יחידות', step: 1, min: 1 },
              { name: 'מלוואח', unit: 'יחידות', step: 1, min: 1 },
  ],
  'שתייה וחטיפים': [
    { name: 'חטיפים מלוחים', unit: 'שקית', step: 1, min: 1, hasSubTypes: true, subTypes: [
            'במבה', 'ביסלי', 'צ\'יפס', 'פופקורן', 'קרקרים', 'פרינגלס', 'דוריטוס', 'דובונים'
          ]},
      { name: 'פיצוחים', unit: 'שקית', step: 1, min: 1, hasSubTypes: true, subTypes: [
            'בוטנים', 'שקדים', 'אגוזים', 'גרעינים', 'חמניות', 'פיסטוקים', 'קשיו', 'פקאן', 'אגוזי לוז', 'גרעיני דלעת'
          ]},
    { name: 'שתייה מתוקה', unit: 'בקבוק', step: 1, min: 1, hasSubTypes: true, subTypes: [
                'קולה', 'קולה זירו', 'פאנטה', 'ספרייט', 'נסטי', 'פריגת', 'שוופס', 'פיוז טי'
              ]},
              { name: 'מים מינרליים', unit: 'שישיה', step: 1, min: 1 },
              { name: 'מיצים', unit: 'ליטר', step: 1, min: 1 },
              { name: 'סודה', unit: 'בקבוק', step: 1, min: 1 },
    { name: 'עוגיות', unit: 'חבילה', step: 1, min: 1 },
    { name: 'קפה', unit: 'שקית', step: 1, min: 1 },
    { name: 'שוקולד', unit: 'טבלה', step: 1, min: 1 },
    { name: 'תה', unit: 'קופסה', step: 1, min: 1 },
  ],
  'ניקיון וכביסה': [
    { name: '00 ירוק', unit: 'בקבוק', step: 1, min: 1 },
    { name: "אבקת כביסה/ג'ל", unit: 'קופסה', step: 1, min: 1 },
    { name: 'אקונומיקה', unit: 'בקבוק', step: 1, min: 1 },
    { name: 'חומר לניקוי רצפה', unit: 'בקבוק', step: 1, min: 1 },
    { name: 'מבריק נירוסטה', unit: 'בקבוק', step: 1, min: 1 },
    { name: 'מגבונים לחים לניקוי', unit: 'חבילה', step: 1, min: 1 },
    { name: 'מרכך כביסה', unit: 'בקבוק', step: 1, min: 1 },
    { name: 'נוזל כלים', unit: 'בקבוק', step: 1, min: 1 },
    { name: 'ספוגים לכלים', unit: 'חבילה', step: 1, min: 1 },
    { name: 'שקיות זבל', unit: 'גליל', step: 1, min: 1 },
  ],
  'טואלטיקה': [
    { name: 'דאודורנט', unit: 'יחידות', step: 1, min: 1 },
    { name: 'חוט דנטלי', unit: 'יחידות', step: 1, min: 1 },
    { name: 'טמפונים/תחבושות', unit: 'חבילה', step: 1, min: 1 },
    { name: 'כפפות חד פעמיות ללא אבקה', unit: 'קופסה', step: 1, min: 1 },
    { name: 'מברשות שיניים', unit: 'יחידות', step: 1, min: 1 },
    { name: 'מגבוני אף/טישו', unit: 'קופסה', step: 1, min: 1 },
    { name: 'מי פה', unit: 'בקבוק', step: 1, min: 1 },
    { name: 'מרכך שיער', unit: 'בקבוק', step: 1, min: 1 },
    { name: 'משחת שיניים', unit: 'שפופרת', step: 1, min: 1 },
    { name: 'נייר טואלט', unit: 'חבילה', step: 1, min: 1 },
    { name: 'סבון גוף', unit: 'בקבוק', step: 1, min: 1 },
    { name: 'שמפו', unit: 'בקבוק', step: 1, min: 1 },
  ],
  'שונות לבית': [
    { name: 'גפרורים/מצית', unit: 'יחידות', step: 1, min: 1 },
    { name: 'זיפלוק/שקיות עם סגירה', unit: 'חבילה', step: 1, min: 1 },
    { name: 'נייר אלומיניום', unit: 'גליל', step: 1, min: 1 },
    { name: 'נייר אפייה', unit: 'גליל', step: 1, min: 1 },
    { name: 'סוללות', unit: 'חבילה', step: 1, min: 1 },
    { name: "שקיות סנדוויצ'ים", unit: 'חבילה', step: 1, min: 1 },
  ],
};

const STORAGE_KEY = 'marom_shopping_list';

const APP_ICON_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692822d8814bc4e91ed6f83f/3984d7ae0_shopping-icon.png';

export default function ShoppingList() {
  // Add PWA meta tags for app icon
  useEffect(() => {
    // Apple Touch Icon
    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      document.head.appendChild(appleIcon);
    }
    appleIcon.href = APP_ICON_URL;

    // Standard favicon
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = APP_ICON_URL;

    // MS Tile Image
    let msTile = document.querySelector('meta[name="msapplication-TileImage"]');
    if (!msTile) {
      msTile = document.createElement('meta');
      msTile.name = 'msapplication-TileImage';
      document.head.appendChild(msTile);
    }
    msTile.content = APP_ICON_URL;

    // Web app manifest simulation
    let manifest = document.querySelector('link[rel="manifest"]');
    if (!manifest) {
      const manifestData = {
        name: 'רשימת קניות משפחת מרום',
        short_name: 'רשימת קניות',
        icons: [{ src: APP_ICON_URL, sizes: '512x512', type: 'image/png' }],
        start_url: '/',
        display: 'standalone',
        background_color: '#F0F7F4',
        theme_color: '#14b8a6'
      };
      const blob = new Blob([JSON.stringify(manifestData)], { type: 'application/json' });
      manifest = document.createElement('link');
      manifest.rel = 'manifest';
      manifest.href = URL.createObjectURL(blob);
      document.head.appendChild(manifest);
    }
  }, []);
  const [categories, setCategories] = useState({});
  const [selectedItems, setSelectedItems] = useState({});
  const [quantities, setQuantities] = useState({});
  const [boughtItems, setBoughtItems] = useState({});
  const [activeCategory, setActiveCategory] = useState('כל הקטגוריות');
  const [summaryText, setSummaryText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [subTypes, setSubTypes] = useState({});
  const checklistRef = useRef(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const [estimatedPrices, setEstimatedPrices] = useState({});
  const [actualPrices, setActualPrices] = useState({});
  const [budget, setBudget] = useState(0);
  const queryClient = useQueryClient();

  // Fetch saved lists
  const { data: savedLists = [], isLoading: isLoadingLists } = useQuery({
    queryKey: ['savedLists'],
    queryFn: () => base44.entities.SavedList.list('-created_date'),
  });

  // Fetch custom products from DB (shared across all users)
  const { data: customProducts = [] } = useQuery({
    queryKey: ['customProducts'],
    queryFn: () => base44.entities.CustomProduct.list(),
  });

  // Fetch product prices from DB
  const { data: productPrices = [] } = useQuery({
    queryKey: ['productPrices'],
    queryFn: () => base44.entities.ProductPrice.list('-created_date'),
  });

  const saveListMutation = useMutation({
    mutationFn: (data) => base44.entities.SavedList.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedLists'] });
      toast.success('הרשימה נשמרה בהצלחה!');
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedList.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedLists'] });
      toast.success('הרשימה נמחקה');
    },
  });

  const handleSaveList = async (name) => {
    await saveListMutation.mutateAsync({
      name,
      selectedItems,
      quantities,
      subTypes,
    });
  };

  const handleLoadList = (list) => {
    setSelectedItems(list.selectedItems || {});
    setQuantities(list.quantities || {});
    setSubTypes(list.subTypes || {});
    toast.success(`הרשימה "${list.name}" נטענה`);
  };

  const handleDeleteList = async (id) => {
    await deleteListMutation.mutateAsync(id);
  };

  // Build categories from defaults + custom products from DB
  useEffect(() => {
    const mergedCategories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
    
    // Add custom products from DB
    customProducts.forEach(product => {
      if (mergedCategories[product.category]) {
        const exists = mergedCategories[product.category].some(i => i.name === product.name);
        if (!exists) {
          mergedCategories[product.category].push({
            name: product.name,
            unit: product.unit || 'יחידות',
            step: 1,
            min: 1,
            isCustom: true,
            fromDB: true,
          });
        }
      }
    });
    
    setCategories(mergedCategories);
  }, [customProducts]);

  // Load user selections from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setSelectedItems(data.selectedItems || {});
      setQuantities(data.quantities || {});
      setBoughtItems(data.boughtItems || {});
      setSubTypes(data.subTypes || {});
      setEstimatedPrices(data.estimatedPrices || {});
      setActualPrices(data.actualPrices || {});
      setBudget(data.budget || 0);
    }
  }, []);

  // Apply saved prices from DB to estimated prices
  useEffect(() => {
    if (productPrices.length > 0) {
      const priceMap = {};
      // Get latest price for each product
      productPrices.forEach(pp => {
        const key = `${pp.category}|${pp.product_name}`;
        if (!priceMap[key]) {
          priceMap[key] = pp.price;
        }
      });
      setEstimatedPrices(prev => ({ ...priceMap, ...prev }));
    }
  }, [productPrices]);

  // Save user selections to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      selectedItems,
      quantities,
      boughtItems,
      subTypes,
      estimatedPrices,
      actualPrices,
      budget,
    }));
  }, [selectedItems, quantities, boughtItems, subTypes, estimatedPrices, actualPrices, budget]);

  const handleItemToggle = (category, itemName) => {
    const key = `${category}|${itemName}`;
    setSelectedItems(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    if (!quantities[key]) {
      setQuantities(prev => ({
        ...prev,
        [key]: 1,
      }));
    }
  };

  const handleQuantityChange = (category, itemName, value) => {
    const key = `${category}|${itemName}`;
    setQuantities(prev => ({
      ...prev,
      [key]: Math.max(0.5, parseFloat(value) || 1),
    }));
  };

  const handleSubTypeChange = (category, itemName, subType) => {
        const key = `${category}|${itemName}`;
        setSubTypes(prev => ({
          ...prev,
          [key]: subType,
        }));
      };

      const handleEstimatedPriceChange = (category, itemName, price) => {
        const key = `${category}|${itemName}`;
        setEstimatedPrices(prev => ({
          ...prev,
          [key]: price,
        }));
      };

      const handleActualPriceChange = (category, itemName, price) => {
        const key = `${category}|${itemName}`;
        setActualPrices(prev => ({
          ...prev,
          [key]: price,
        }));
      };

      const handleBoughtToggle = (category, itemName) => {
    const key = `${category}|${itemName}`;
    setBoughtItems(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const addNewItem = (category, itemName) => {
    if (!itemName.trim()) return;
    setCategories(prev => ({
      ...prev,
      [category]: [
        ...(prev[category] || []),
        { name: itemName.trim(), unit: 'יחידות', isCustom: true },
      ],
    }));
  };

  const clearAllSelections = () => {
        setSelectedItems({});
        setQuantities({});
        setSubTypes({});
        setEstimatedPrices({});
        setActualPrices({});
        setSearchQuery('');
      };

      // Calculate totals
      const calculateTotals = () => {
        let estimated = 0;
        let actual = 0;
        let count = 0;

        Object.keys(selectedItems).forEach(key => {
          if (selectedItems[key]) {
            count++;
            const qty = quantities[key] || 1;
            if (estimatedPrices[key]) {
              estimated += estimatedPrices[key] * qty;
            }
            if (actualPrices[key]) {
              actual += actualPrices[key] * qty;
            }
          }
        });

        return { estimated, actual, count };
      };

      const { estimated: estimatedTotal, actual: actualTotal, count: selectedCount } = calculateTotals();

  const generateList = () => {
    let text = '🛒 רשימת קניות משפחת מרום\n';
    text += '━━━━━━━━━━━━━━━━━━━━\n\n';
    
    Object.keys(categories).forEach(category => {
      const items = categories[category].filter(item => 
        selectedItems[`${category}|${item.name}`]
      );
      if (items.length > 0) {
        text += `📌 ${category}:\n`;
        items.forEach(item => {
          const key = `${category}|${item.name}`;
          const qty = quantities[key] || 1;
          const subType = subTypes[key];
          text += `   ○ ${item.name}${subType ? ` (${subType})` : ''} - ${qty} ${item.unit}\n`;
        });
        text += '\n';
      }
    });
    
    setSummaryText(text);
  };

  const generateChecklist = () => {
    setBoughtItems({});
    setShowChecklist(true);
    setTimeout(() => {
      checklistRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const summaryRef = useRef(null);

  const generateCompletionList = () => {
    let text = '📋 רשימת השלמות\n';
    text += '━━━━━━━━━━━━━━━━━━━━\n\n';
    
    Object.keys(categories).forEach(category => {
      const items = categories[category].filter(item => {
        const key = `${category}|${item.name}`;
        return selectedItems[key] && !boughtItems[key];
      });
      if (items.length > 0) {
        text += `📌 ${category}:\n`;
        items.forEach(item => {
          const key = `${category}|${item.name}`;
          const qty = quantities[key] || 1;
          const subType = subTypes[key];
          text += `   ○ ${item.name}${subType ? ` (${subType})` : ''} - ${qty} ${item.unit}\n`;
        });
        text += '\n';
      }
    });
    
    setSummaryText(text);
    setTimeout(() => {
      summaryRef.current?.scrollIntoView({ behavior: 'smooth' });
      const textarea = summaryRef.current?.querySelector('textarea');
      if (textarea) {
        textarea.select();
      }
    }, 100);
  };

  const clearSummary = () => {
    setSummaryText('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summaryText);
  };

  const fullReset = () => {
    if (confirm('האם לאפס את כל הבחירות? (המוצרים המותאמים אישית והמחירים יישמרו)')) {
      localStorage.removeItem(STORAGE_KEY);
      setSelectedItems({});
      setQuantities({});
      setBoughtItems({});
      setSubTypes({});
      setEstimatedPrices({});
      setActualPrices({});
      setBudget(0);
      setSummaryText('');
      setSearchQuery('');
      setShowChecklist(false);
    }
  };

  const getSelectedItemsForChecklist = () => {
    const result = {};
    Object.keys(categories).forEach(category => {
      const expandedItems = [];
      categories[category].forEach(item => {
        const key = `${category}|${item.name}`;
        if (selectedItems[key]) {
          // If item has subtypes selected, create separate entry for each
          const itemSubTypes = subTypes[key];
          if (item.hasSubTypes && itemSubTypes && (Array.isArray(itemSubTypes) ? itemSubTypes.length > 0 : itemSubTypes)) {
            const subTypesArray = Array.isArray(itemSubTypes) ? itemSubTypes : [itemSubTypes];
            subTypesArray.forEach(subType => {
              expandedItems.push({
                ...item,
                name: `${item.name} - ${subType}`,
                originalName: item.name,
                subType: subType
              });
            });
          } else {
            expandedItems.push(item);
          }
        }
      });
      if (expandedItems.length > 0) {
        result[category] = expandedItems;
      }
    });
    return result;
  };

  // Filter by search query
  const getFilteredCategories = () => {
    let result = activeCategory === 'כל הקטגוריות' 
      ? categories 
      : { [activeCategory]: categories[activeCategory] };
    
    if (searchQuery.trim()) {
      const filtered = {};
      Object.keys(result).forEach(cat => {
        const matchingItems = (result[cat] || []).filter(item => 
          item.name.includes(searchQuery)
        );
        if (matchingItems.length > 0) {
          filtered[cat] = matchingItems;
        }
      });
      return filtered;
    }
    return result;
  };

  const filteredCategories = getFilteredCategories();

  const categoryList = ['כל הקטגוריות', ...Object.keys(DEFAULT_CATEGORIES)];

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-[#F0F7F4] to-[#E8F4F8]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">
              רשימת קניות לבית משפחת מרום
            </h1>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            בחר/י קטגוריה, סמני מה שצריך לקנות → "יצירת רשימה" → העתקי או עברי לצ'ק ליסט בסופר
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-4 pb-24">
        {/* Saved Lists Manager */}
        <div className="mb-4">
          <SavedListsManager
            savedLists={savedLists}
            isLoading={isLoadingLists}
            onSaveList={handleSaveList}
            onLoadList={handleLoadList}
            onDeleteList={handleDeleteList}
          />
        </div>

        {/* Control Bar */}
        <ControlBar
          categoryList={categoryList}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onShowAll={() => setActiveCategory('כל הקטגוריות')}
          onClearAll={clearAllSelections}
          onAddItem={addNewItem}
          categories={categories}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Category Cards */}
        <div className="space-y-4 mt-4">
          {Object.keys(filteredCategories).map(category => (
            <CategoryCard
              key={category}
              category={category}
              items={filteredCategories[category] || []}
              selectedItems={selectedItems}
              quantities={quantities}
              subTypes={subTypes}
              estimatedPrices={estimatedPrices}
              actualPrices={actualPrices}
              onItemToggle={handleItemToggle}
              onQuantityChange={handleQuantityChange}
              onSubTypeChange={handleSubTypeChange}
              onEstimatedPriceChange={handleEstimatedPriceChange}
              onActualPriceChange={handleActualPriceChange}
            />
          ))}
        </div>

        {/* Budget Summary - always show for receipt scanning */}
        <div className="mt-6">
          <BudgetSummary
              budget={budget}
              onBudgetChange={setBudget}
              estimatedTotal={estimatedTotal}
              actualTotal={actualTotal}
              itemsCount={selectedCount}
              selectedItems={selectedItems}
              categories={categories}
              onAddToList={(category, itemName) => {
                const key = `${category}|${itemName}`;
                setSelectedItems(prev => ({ ...prev, [key]: true }));
                if (!quantities[key]) {
                  setQuantities(prev => ({ ...prev, [key]: 1 }));
                }
              }}
              onUpdatePrice={(category, itemName, price) => {
                const key = `${category}|${itemName}`;
                setActualPrices(prev => ({ ...prev, [key]: price }));
              }}
              onPricesExtracted={async (pricesMap, newItems) => {
                setActualPrices(prev => ({ ...prev, ...pricesMap }));

                // Save prices to DB
                const pricesToSave = [];
                Object.entries(pricesMap).forEach(([key, price]) => {
                  const [category, name] = key.split('|');
                  pricesToSave.push({
                    product_name: name,
                    category,
                    price,
                    receipt_date: new Date().toISOString().split('T')[0],
                  });
                });

                if (pricesToSave.length > 0) {
                  await base44.entities.ProductPrice.bulkCreate(pricesToSave);
                  queryClient.invalidateQueries({ queryKey: ['productPrices'] });
                }

                // Add new items from receipt
                if (newItems && newItems.length > 0) {
                  const updatedCategories = { ...categories };
                  const updatedSelectedItems = { ...selectedItems };
                  const updatedQuantities = { ...quantities };
                  const updatedActualPrices = { ...actualPrices };
                  const customProductsToCreate = [];

                  newItems.forEach(newItem => {
                    const category = newItem.category;
                    if (updatedCategories[category]) {
                      // Check if item already exists
                      const exists = updatedCategories[category].some(i => i.name === newItem.name);
                      if (!exists) {
                        updatedCategories[category] = [
                          ...updatedCategories[category],
                          { name: newItem.name, unit: 'יחידות', step: 1, min: 1, isCustom: true, fromDB: true }
                        ];
                        // Save to DB for all users
                        customProductsToCreate.push({
                          name: newItem.name,
                          category,
                          unit: 'יחידות',
                          last_price: newItem.price,
                        });
                      }
                      // Select the item and set its price
                      const key = `${category}|${newItem.name}`;
                      updatedSelectedItems[key] = true;
                      updatedQuantities[key] = 1;
                      updatedActualPrices[key] = newItem.price;
                    }
                  });

                  if (customProductsToCreate.length > 0) {
                    await base44.entities.CustomProduct.bulkCreate(customProductsToCreate);
                    queryClient.invalidateQueries({ queryKey: ['customProducts'] });
                  }

                  // Also save prices for new items
                  const newPricesToSave = newItems.map(item => ({
                    product_name: item.name,
                    category: item.category,
                    price: item.price,
                    receipt_date: new Date().toISOString().split('T')[0],
                  }));
                  if (newPricesToSave.length > 0) {
                    await base44.entities.ProductPrice.bulkCreate(newPricesToSave);
                    queryClient.invalidateQueries({ queryKey: ['productPrices'] });
                  }

                  setCategories(updatedCategories);
                  setSelectedItems(updatedSelectedItems);
                  setQuantities(updatedQuantities);
                  setActualPrices(updatedActualPrices);
                }
              }}
            />
          </div>

        {/* Summary Card */}
        <div ref={summaryRef}>
          <SummaryCard
            summaryText={summaryText}
            onGenerateList={generateList}
            onGenerateChecklist={generateChecklist}
            onClearSummary={clearSummary}
            onClearSelections={clearAllSelections}
            onCopyToClipboard={copyToClipboard}
            onFullReset={fullReset}
          />
        </div>

        {/* Supermarket Checklist */}
                    {showChecklist && (
                    <div ref={checklistRef}>
                      <SupermarketChecklist
            categories={getSelectedItemsForChecklist()}
            quantities={quantities}
            boughtItems={boughtItems}
            onBoughtToggle={handleBoughtToggle}
            onGenerateCompletionList={generateCompletionList}
                          />
                        </div>
                        )}
                      </main>
    </div>
  );
}
