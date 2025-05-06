import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { observer } from "mobx-react-lite";
import { PlusCircle } from "lucide-react";
import { CalendarStore } from "../../stores/CalendarStore";
import type { DrugSchedule } from "../../stores/CalendarStore";
import { DrugStore } from "../../stores/DrugStore";

const AddScheduleModal = observer(
  ({
    show,
    onClose,
    ceil_info,
  }: {
    show: boolean;
    onClose: () => void;
    ceil_info: Date;
  }) => {
    const calendarStore = CalendarStore.use();
    const drugStore = DrugStore.use();
    const [customDrug, setCustomDrug] = useState(false);
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const userTimeZoneOffset = (user?.time_zone || 0) * 60; // в минутах

    // // Получаем локальную таймзону браузера (например, Europe/Moscow)
    // const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const toUtcISOString = (date: Date): string => {
      // Вернёт ISO строку в UTC
      return new Date(
        date.getTime() - userTimeZoneOffset * 60000,
      ).toISOString();
    };

    const [form, setForm] = useState<DrugSchedule>({
      name_drug: "",
      dosage: 0,
      frequency: 1,
      interval: 24,
      description: "",
      start_datetime: ceil_info.toISOString(),
      end_datetime: ceil_info.toISOString(),
      start_schedule: "",
      is_active: true,
    });

    const handleSelectDrug = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      if (value === "custom") {
        setCustomDrug(true);
        setForm({ ...form, name_drug: "" });
      } else {
        const selected = drugStore.drugs.find((d) => d.id === value);
        if (selected) {
          setCustomDrug(false);
          setForm({
            ...form,
            name_drug: selected.name,
            dosage: selected.dosage,
            frequency: selected.frequency,
            interval: selected.interval,
            description: selected.description,
          });
        }
      }
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const localDate = new Date(e.target.value);
      setForm({
        ...form,
        start_datetime: localDate.toISOString(), // сохраняем в локальном времени
        start_schedule: localDate.toTimeString().slice(0, 5),
      });
    };
    //FIXME: НЕ ПРАВИЛЬНО РАБОТАЕТ
    const handleSubmit = async () => {
      try {
        const payload = {
          ...form,
          start_datetime: toUtcISOString(new Date(form.start_datetime)),
          end_datetime: toUtcISOString(new Date(form.end_datetime)),
        };
        await calendarStore.AddScheduleEvent(payload);
        await calendarStore.fetchEvents();
        onClose(); // Закрыть модальное окно после отправки данных
      } catch (e) {
        alert("Ошибка при добавлении курса приёма");
      }
    };

    useEffect(() => {
      drugStore.fetchDrugs();
    }, []);
    return (
      <AnimatePresence>
        {show && (
          <motion.div className="fixed inset-0 z-50 flex items-center backdrop-blur-sm   justify-center">
            <motion.div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg">
              <h2 className="text-2xl font-semibold text-center mb-6 text-gray-700">
                Добавить курс приёма
              </h2>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600">
                    Название лекарства
                  </label>
                  <input
                    type="text"
                    placeholder="Введите название лекарства"
                    className="input"
                    disabled={!customDrug}
                    value={form.name_drug}
                    onChange={(e) =>
                      setForm({ ...form, name_drug: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600">
                    Выберите лекарство
                  </label>
                  <select
                    className="input"
                    onChange={handleSelectDrug}
                    value={
                      customDrug
                        ? "custom"
                        : drugStore.drugs.find((d) => d.name === form.name_drug)
                            ?.id || ""
                    }
                  >
                    <option value="" disabled>
                      -- Выберите из списка --
                    </option>
                    {drugStore.drugs.map((drug) => (
                      <option key={drug.id} value={drug.id}>
                        {drug.name}
                      </option>
                    ))}
                    <option value="custom">Ввести своё</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600">
                    Дозировка
                  </label>
                  <input
                    type="number"
                    placeholder="Введите дозировку"
                    className="input"
                    value={form.dosage}
                    onChange={(e) =>
                      setForm({ ...form, dosage: +e.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600">
                    Частота (в день)
                  </label>
                  <input
                    type="number"
                    placeholder="Введите частоту"
                    className="input"
                    value={form.frequency}
                    onChange={(e) =>
                      setForm({ ...form, frequency: +e.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600">
                    Интервал (часы)
                  </label>
                  <input
                    type="number"
                    placeholder="Введите интервал (часы)"
                    className="input"
                    value={form.interval}
                    onChange={(e) =>
                      setForm({ ...form, interval: +e.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600">
                    Описание
                  </label>
                  <textarea
                    placeholder="Введите описание"
                    className="input"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600">
                    Время начала
                  </label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={form.start_datetime.slice(0, 16)}
                    onChange={handleStartDateChange}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600">
                    Время первого приема
                  </label>
                  <input
                    type="time"
                    className="input mb-2"
                    value={form.start_schedule}
                    onChange={(e) =>
                      setForm({ ...form, start_schedule: e.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600">
                    Время окончания
                  </label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={form.end_datetime.slice(0, 16)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        end_datetime: new Date(e.target.value).toISOString(),
                      })
                    }
                  />
                </div>

                <div className="flex  mt-10 justify-between gap-4">
                  <button
                    onClick={onClose}
                    // className="btn w-full bg-gray-300 text-gray-800 hover:bg-gray-400"
                    className="items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-gray-300 hover:text-black text-white transition transform hover:scale-105"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition transform hover:scale-105"
                  >
                    <PlusCircle size={18} />
                    Добавить
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);

export default AddScheduleModal;
