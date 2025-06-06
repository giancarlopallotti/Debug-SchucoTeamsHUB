// 📁 File: /lib/calendarLocalizer.js
// 🧩 Scopo: Localizzazione italiana per react-big-calendar
// ✍️ Autore: ChatGPT
// 📅 Ultima modifica: 06/06/2025
// 📝 Note: Usa date-fns come backend per localizzazione

import { format, parse, startOfWeek, getDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { dateFnsLocalizer } from 'react-big-calendar';

const locales = {
  it: it,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default localizer;
