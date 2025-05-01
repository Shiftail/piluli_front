import { makeAutoObservable, runInAction } from "mobx";

interface CalendarEvent {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
}

class CalendarStore {
  events: CalendarEvent[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  async fetchEvents() {
    const user_id = JSON.parse(sessionStorage.getItem("user") || "{}").id;
    const response = await fetch(
      `http://172.20.10.4:5001/schedules/user/${user_id}`
    );
    const data = await response.json();
    runInAction(() => {
      this.events = [];
      const seenStarts = new Set<string>();
      if (data) {
        data.forEach((entry: any) => {
          const {
            id,
            name_drug,
            start_datetime,
            end_datetime,
            schedule_times,
          } = entry;
          const start = new Date(start_datetime);
          const end = new Date(end_datetime);
          const diffMs = end.getTime() - start.getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);

          if (diffDays < 1) {
            // Это приём, не курс
            this.events.push({
              id: `${id}_single`,
              title: `Приём: ${name_drug}`,
              start_date: start_datetime,
              end_date: end_datetime,
            });
          } else {
            // Это курс
            this.events.push({
              id: `${id}_course`,
              title: `Курс: ${name_drug}`,
              start_date: start_datetime,
              end_date: end_datetime,
            });

            //  Добавить приёмы из расписания, если есть
            schedule_times?.forEach((day: any) => {
              day.appointments?.forEach((appointment: any, index: number) => {
                const key = `${appointment.start}-${id}`; // Уникальный ключ для предотвращения дублирования
                if (!seenStarts.has(key)) {
                  seenStarts.add(key);
                  this.events.push({
                    id: `${id}_${day.date}_${index}`,
                    title: `Приём: ${name_drug}`,
                    start_date: appointment.start,
                    end_date: appointment.end,
                  });
                }
              });
            });
          }
        });
      }
    });
  }

  async addEvent(event: Omit<CalendarEvent, "id">) {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });
    const newEvent = await response.json();
    runInAction(() => {
      this.events.push(newEvent);
    });
  }

  static use() {
    return calendarStoreInstance;
  }
}

const calendarStoreInstance = new CalendarStore();
export { CalendarStore };
