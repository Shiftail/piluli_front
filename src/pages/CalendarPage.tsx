import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import ruLocale from "@fullcalendar/core/locales/ru";
import { PlusCircle } from "lucide-react";
import { observer } from "mobx-react-lite";
import { useStores } from "../stores/useStores";
import AddScheduleModal from "../components/AddScheduleModal/AddScheduleModal ";
import { CustomSelect } from "../components/CustomSelect";

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
  const [direction, setDirection] = useState<"left" | "right">("right"); // прокрутка календаря по времени(пу-пу-пу)
  const [calendarKey, setCalendarKey] = useState(0);
  const [showCalendar, setShowCalendar] = useState(true);

  const [calendarDate, setCalendarDate] = useState(new Date());
  const [visibleDate, setVisibleDate] = useState(new Date());
  const [animating, setAnimating] = useState(false);

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

  const animateCalendarRefresh = () => {
    setShowCalendar(false); // запускаем exit-анимацию
    setTimeout(() => {
      setCalendarKey((prev) => prev + 1); // меняем key
      setShowCalendar(true); // рендерим снова → с entry-анимацией
    }, 300); // должно совпадать с duration exit-анимации
  };

  const gotoWeek = (offset: number) => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi || animating) return;

    const current = new Date(visibleDate);
    const next = new Date(current);

    if (offset === 0) {
      next.setTime(new Date().getTime());
    } else {
      next.setDate(current.getDate() + offset * 7);
    }

    setDirection(offset < 0 ? "left" : "right");
    setAnimating(true);

    setVisibleDate(undefined as any); // режет текущий календарь

    setTimeout(() => {
      setVisibleDate(next);
      setAnimating(false);
    }, 300); //  `transition.duration`
  };

  const handleViewChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newView = e.target.value;
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(newView);
      setCurrentView(newView);
      setIsManualView(true);
      animateCalendarRefresh();
    }
  };

  return (
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 min-h-[400px] overflow-hidden">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
          <span className="loader"></span>
        </div>
      ) : (
        <>
          {/* тулик  туда-сюда*/}
          <div className="flex flex-col items-center gap-6 mb-6">
            {/* Навигация по неделям */}
            <div className="flex gap-3">
              <button
                className="px-4 py-2 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-100 active:scale-95 transition flex items-center gap-1 text-gray-700"
                onClick={() => gotoWeek(-1)}
              >
                ← Назад
              </button>
              <button
                className="px-4 py-2   bg-green-300 text-white rounded-xl shadow-sm hover:bg-blue-600 active:scale-95 transition font-semibold"
                onClick={() => gotoWeek(0)}
              >
                Сегодня
              </button>
              <button
                className="px-4 py-2 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-100 active:scale-95 transition flex items-center gap-1 text-gray-700"
                onClick={() => gotoWeek(1)}
              >
                Вперёд →
              </button>
            </div>

            {/* Вид отображения */}
            <CustomSelect
              label="Вид:"
              value={currentView}
              onChange={(val) =>
                handleViewChange({ target: { value: val } } as any)
              }
            />

            {/* Кнопка добавления */}
            <div>
              <button
                onClick={() => {
                  setSelectedDate(new Date());
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105"
              >
                <PlusCircle size={20} />
                Добавить приём
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {showCalendar && visibleDate && (
              <motion.div
                key={visibleDate.toISOString()}
                initial={{ opacity: 0, x: direction === "right" ? 100 : -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction === "right" ? -100 : 100 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <FullCalendar
                  ref={calendarRef}
                  plugins={[
                    dayGridPlugin,
                    timeGridPlugin,
                    interactionPlugin,
                    listPlugin,
                  ]}
                  initialDate={visibleDate}
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
              </motion.div>
            )}
          </AnimatePresence>

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
