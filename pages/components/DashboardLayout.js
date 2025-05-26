// Percorso: /components/DashboardLayout.js
// Griglia responsive drag&drop, tutti i widget modulari, incluso Statistiche

import { Responsive, WidthProvider } from "react-grid-layout";
import WidgetNotifiche from "./widgets/WidgetNotifiche";
import WidgetMessaggi from "./widgets/WidgetMessaggi";
import WidgetUtenti from "./widgets/WidgetUtenti";
import WidgetFiles from "./widgets/WidgetFiles";
import WidgetDownloads from "./widgets/WidgetDownloads";
import WidgetNote from "./widgets/WidgetNote";
import WidgetStatistiche from "./widgets/WidgetStatistiche";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function DashboardLayout({
  layout,
  setLayout,
  activeWidgets,
  darkMode,
  notifiche,
  notificheLoading,
  setModalNotifica,
  user
}) {
  const filteredWidgets = Object.entries(activeWidgets)
    .filter(([_, v]) => v)
    .map(([key]) => key);

  // Demo: numeri statici, sostituisci con fetch API dove vuoi!
  const usersCount = 15;
  const filesCount = 27;
  const downloadsCount = 52;

  // Responsive breakpoints e colonne
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 3, md: 2, sm: 1, xs: 1, xxs: 1 };

  // Applico il filtro al layout corrente per evitare errori di widget "spenti"
  const filteredLayout = layout.filter(l => filteredWidgets.includes(l.i));

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
      onLayoutChange={setLayout}
      isResizable={true}
      isDraggable={true}
      draggableHandle=".bg-white, .bg-yellow-100, .bg-gray-800, .bg-yellow-900"
      compactType="vertical"
      margin={[10, 10]}
      useCSSTransforms={true}
      autoSize={true}
    >
      {filteredWidgets.map((key) => {
        switch (key) {
          case "notifications":
            return (
              <div key={key}>
                <WidgetNotifiche
                  notifications={notifiche}
                  loading={notificheLoading}
                  darkMode={darkMode}
                  onDettaglio={setModalNotifica}
                />
              </div>
            );
          case "users":
            return (
              <div key={key}>
                <WidgetUtenti count={usersCount} darkMode={darkMode} />
              </div>
            );
          case "files":
            return (
              <div key={key}>
                <WidgetFiles count={filesCount} darkMode={darkMode} />
              </div>
            );
          case "downloads":
            return (
              <div key={key}>
                <WidgetDownloads count={downloadsCount} darkMode={darkMode} />
              </div>
            );
          case "note":
            return (
              <div key={key}>
                <WidgetNote darkMode={darkMode} />
              </div>
            );
          case "messages":
            return (
              <div key={key}>
                <WidgetMessaggi darkMode={darkMode} user={user} />
              </div>
            );
          case "statistiche":
            return (
              <div key={key}>
                <WidgetStatistiche darkMode={darkMode} />
              </div>
            );
          default:
            return null;
        }
      })}
    </ResponsiveGridLayout>
  );
}
