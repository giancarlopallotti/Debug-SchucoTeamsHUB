// Percorso: /components/DashboardLayout.js
// Scopo: Griglia dashboard con drag & drop + resize + salvataggio layout
// Autore: ChatGPT
// Ultima modifica: 29/05/2025

import { Responsive, WidthProvider } from "react-grid-layout";
import WidgetNotifiche from "./widgets/WidgetNotifiche";
import WidgetMessaggi from "./widgets/WidgetMessaggi";
import WidgetUtenti from "./widgets/WidgetUtenti";
import WidgetFiles from "./widgets/WidgetFiles";
import WidgetDownloads from "./widgets/WidgetDownloads";
import WidgetNote from "./widgets/WidgetNote";
import WidgetStatistiche from "./widgets/WidgetStatistiche";
import WidgetStruttura from "./widgets/WidgetStruttura";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function DashboardLayout({
  layout,
  setLayout,
  activeWidgets,
  darkMode,
  notifiche,
  notificheLoading,
  setModalNotifica,
  user,
  saveDashboardPrefs
}) {
  const filteredWidgets = Object.entries(activeWidgets)
    .filter(([_, v]) => v)
    .map(([key]) => key);

  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 3, md: 2, sm: 1, xs: 1, xxs: 1 };

  const filteredLayout = layout.filter(l => filteredWidgets.includes(l.i));

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    saveDashboardPrefs({ layout: newLayout, activeWidgets, darkMode });
  };

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={{
        lg: filteredLayout,
        md: filteredLayout,
        sm: filteredLayout,
        xs: filteredLayout,
        xxs: filteredLayout
      }}
      breakpoints={breakpoints}
      cols={cols}
      rowHeight={90}
      onLayoutChange={handleLayoutChange}
      isResizable={true}
      isDraggable={true}
      draggableHandle=".bg-white, .bg-yellow-100, .bg-gray-800, .bg-yellow-900"
      compactType="vertical"
      margin={[10, 10]}
      useCSSTransforms={true}
      autoSize={true}
    >
      {filteredWidgets.map((key) => {
        const props = {
          darkMode,
          notifications: notifiche,
          loading: notificheLoading,
          onDettaglio: setModalNotifica,
          user
        };

        return (
          <div key={key}>
            {{
              notifications: <WidgetNotifiche {...props} />,
              users: <WidgetUtenti darkMode={darkMode} />,
              files: <WidgetFiles darkMode={darkMode} />,
              downloads: <WidgetDownloads darkMode={darkMode} />,
              note: <WidgetNote darkMode={darkMode} />,
              messages: <WidgetMessaggi darkMode={darkMode} user={user} />,
              statistiche: <WidgetStatistiche darkMode={darkMode} />,
              structure: <WidgetStruttura darkMode={darkMode} />
            }[key] || null}
          </div>
        );
      })}
    </ResponsiveGridLayout>
  );
}
