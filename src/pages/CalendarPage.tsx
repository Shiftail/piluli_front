import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import listPlugin from "@fullcalendar/list";
import ruLocale from "@fullcalendar/core/locales/ru";
import { observer } from "mobx-react-lite";
import { CalendarStore } from "../stores/CalendarStore";

const getResponsiveView = (width: number) => {
  if (width < 480) return "listWeek";
  return "dayGridMonth";
};

const CalendarPage = observer(() => {
  const calendarStore = CalendarStore.use();
  const [loading, setLoading] = useState(true); // Начинаем с загрузки
  const calendarRef = useRef<FullCalendar | null>(null);
  const [currentView, setCurrentView] = useState(
    getResponsiveView(window.innerWidth)
  );

  useEffect(() => {
    const loadEvents = async () => {
      try {
        await calendarStore.fetchEvents();
      } finally {
        setLoading(false); // Убираем лоадер после получения данных
      }
    };

    loadEvents();

    const handleResize = () => {
      const newView = getResponsiveView(window.innerWidth);
      const calendarApi = calendarRef.current?.getApi();

      if (calendarApi && newView !== currentView) {
        calendarApi.changeView(newView);
        setCurrentView(newView);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calendarStore, currentView]);

  let events = calendarStore.events.map((event) => ({
    id: String(event.id),
    title: event.title,
    start: event.start_date,
    end: event.end_date,
  }));
  return (
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 min-h-[400px]">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
          <span className="loader"></span>
        </div>
      ) : (
        <FullCalendar
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            listPlugin,
          ]}
          initialView={currentView}
          headerToolbar={{
            left: "prev,next,today",
            center: "title",
            right: "dayGridMonth,listWeek",
          }}
          titleFormat={{ month: "short", day: "numeric" }}
          events={events}
          locales={[ruLocale]}
          locale={ruLocale}
          eventClick={(info) => {
            alert(`Событие: ${info.event.title}`);
          }}
          dayMaxEvents={9}
          nowIndicator={true}
          height="auto"
          aspectRatio={1.5}
        />
      )}
    </div>
  );
});

export default CalendarPage;
