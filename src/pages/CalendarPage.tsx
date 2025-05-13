import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import ruLocale from "@fullcalendar/core/locales/ru";
import { observer } from "mobx-react-lite";
import { useStores } from "../stores/useStores";
import AddScheduleModal from "../components/AddScheduleModal/AddScheduleModal ";

const getResponsiveView = (width: number) => {
  if (width < 480) return "listWeek";
  return "dayGridMonth";
};

const CalendarPage = observer(() => {
  const { calendarStore } = useStores();
  const calendarRef = useRef<FullCalendar | null>(null);
  const [currentView, setCurrentView] = useState(
    getResponsiveView(window.innerWidth),
  );
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isManualView, setIsManualView] = useState(false);

  useEffect(() => {
    setLoading(false); // Убери после fetchEvents, если подключишь
    const handleResize = () => {
      if (isManualView) return;
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
  }, [calendarStore, currentView, isManualView]);

  const events = calendarStore.events.map((event) => ({
    id: String(event.id),
    title: event.title,
    start: event.start_date,
    end: event.end_date,
    backgroundColor: event.backgroundColor ? event.backgroundColor : undefined,
    dosage: event.dosage,
  }));

  const gotoWeek = (offset: number) => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;

    const currentDate = new Date(calendarApi.getDate());

    if (offset === 0) {
      calendarApi.gotoDate(new Date());
    } else {
      currentDate.setDate(currentDate.getDate() + offset * 7);
      calendarApi.gotoDate(currentDate);
    }
  };

  return (
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 min-h-[400px]">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
          <span className="loader"></span>
        </div>
      ) : (
        <>
          {/* 👇 Кастомный тулбар */}
          {/* Custom Toolbar */}
          <div className="flex flex-col justify-between items-center mb-4">
            <div className="flex gap-2">
              <button
                className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => gotoWeek(-1)}
              >
                ← Назад
              </button>
              <button
                className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => gotoWeek(0)}
              >
                Сегодня
              </button>
              <button
                className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => gotoWeek(1)}
              >
                Вперёд →
              </button>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <label htmlFor="view-select" className="text-sm font-medium">
                Вид:
              </label>
              <select
                id="view-select"
                className="px-3 py-1 border rounded"
                value={currentView}
                onChange={(e) => {
                  const newView = e.target.value;
                  const calendarApi = calendarRef.current?.getApi();
                  if (calendarApi) {
                    calendarApi.changeView(newView);
                    setCurrentView(newView);
                    setIsManualView(true);
                  }
                }}
              >
                <option value="dayGridMonth">Месяц</option>
                <option value="listWeek">Список недели</option>
              </select>
            </div>
          </div>

          <FullCalendar
            ref={calendarRef}
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            initialView={currentView}
            headerToolbar={false}
            titleFormat={{ month: "short", day: "numeric" }}
            eventTimeFormat={undefined}
            events={events}
            locales={[ruLocale]}
            locale={ruLocale}
            eventClick={(info) => {
              if ((window as any).Telegram?.WebApp) {
                try {
                  (window as any).Telegram.WebApp.showAlert(
                    `Препарат: ${
                      info.event.title
                    }\nВремя приема: ${info.event.start
                      ?.toISOString()
                      .slice(11, 16)}\nДозировка: ${
                      info.event.extendedProps.dosage
                    } мг`,
                  );
                } catch (error) {
                  alert(
                    `Препарат: ${
                      info.event.title
                    }\nВремя приема: ${info.event.start
                      ?.toISOString()
                      .slice(11, 16)}\nДозировка: ${
                      info.event.extendedProps.dosage
                    } мг`,
                  );
                }
              }
            }}
            dateClick={(info) => {
              setSelectedDate(new Date(info.dateStr)); // сохраняем выбранную дату
              setShowModal(true); // показываем модалку
            }}
            dayMaxEvents={3}
            timeZone="local"
            nowIndicator={true}
            height="auto"
            aspectRatio={3.0}
          />

          {/* 👇 модалка добавления курса */}
          {showModal && selectedDate && (
            <AddScheduleModal
              show={showModal}
              onClose={() => setShowModal(false)}
              ceil_info={selectedDate}
            />
          )}
        </>
      )}
    </div>
  );
});

export default CalendarPage;
