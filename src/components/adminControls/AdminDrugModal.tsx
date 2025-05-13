import { AnimatePresence, motion } from "framer-motion";

type DrugModalProps = {
  isOpen: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit: () => void;
  form: {
    name: string;
    dosage: number;
    frequency: number;
    interval: number;
    description: string;
  };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
};

export const DrugModal = ({
  isOpen,
  mode,
  onClose,
  onSubmit,
  form,
  onChange,
}: DrugModalProps) => {
  const title =
    mode === "create" ? "Создать лекарство" : "Редактировать лекарство";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  placeholder="Например, Ибупрофен"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дозировка (мг)
                </label>
                <input
                  type="number"
                  name="dosage"
                  value={form.dosage}
                  onChange={onChange}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  placeholder="Например, 200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Частота (в день)
                </label>
                <input
                  type="number"
                  name="frequency"
                  value={form.frequency}
                  onChange={onChange}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  placeholder="Например, 3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Интервал (часы)
                </label>
                <input
                  type="number"
                  name="interval"
                  value={form.interval}
                  onChange={onChange}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  placeholder="Например, 8"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  placeholder="Дополнительная информация"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
              >
                Отмена
              </button>
              <button
                onClick={onSubmit}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition transform hover:scale-105"
              >
                Сохранить
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
