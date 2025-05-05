import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthStore } from "../stores/AuthStore";
import AdminControls from "../components/adminControls/AdminControls";
interface Drug {
  id: string;
  name: string;
  dosage: number;
  frequency: number;
  interval: number;
  description: string;
}

export const mockDrugs: Drug[] = [
  {
    id: "1",
    name: "Ибупрофен",
    dosage: 200,
    frequency: 3,
    interval: 8,
    description: "Обезболивающее и противовоспалительное средство",
  },
  {
    id: "2",
    name: "Парацетамол",
    dosage: 500,
    frequency: 2,
    interval: 12,
    description: "Жаропонижающее средство",
  },
  {
    id: "3",
    name: "Амоксициллин",
    dosage: 250,
    frequency: 3,
    interval: 8,
    description: "Антибиотик широкого спектра действия",
  },
];

const AdminPage = () => {
  const authStore = AuthStore.use();

  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [form, setForm] = useState({
    name: "",
    dosage: 0,
    frequency: 0,
    interval: 0,
    description: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "dosage" || name === "frequency" || name === "interval"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async () => {
    // try {
    //   const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/meds`, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${authStore.access_token}`,
    //     },
    //     body: JSON.stringify(form),
    //   });

    //   if (!response.ok) {
    //     throw new Error("Ошибка при добавлении лекарства");
    //   }

    //   const data = await response.json();
    //   console.log("Добавлено:", data);
    //   setShowModal(false);
    //   setForm({
    //     name: "",
    //     dosage: 0,
    //     frequency: 0,
    //     interval: 0,
    //     description: "",
    //   });
    // } catch (error) {
    //   console.error("Ошибка:", error);
    // }
    setSuccessMessage("Лекарство успешно добавлено!");
    setShowModal(false);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  useEffect(() => {
    setDrugs(mockDrugs);
  }, []);

  return (
    <div className="p-8">
      {authStore.user && (
        <AdminControls
          username={authStore.user.username}
          onAddDrug={() => setShowModal(true)}
        />
      )}
      {/* Список всех лекарст, я заебался все это прописывать */}
      <div className="overflow-x-auto mb-10">
        <table className="min-w-full table-auto border border-gray-200 rounded-xl shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b text-left">Название</th>
              <th className="px-4 py-2 border-b text-left">Дозировка</th>
              <th className="px-4 py-2 border-b text-left">Частота</th>
              <th className="px-4 py-2 border-b text-left">Интервал</th>
              <th className="px-4 py-2 border-b text-left">Описание</th>
            </tr>
          </thead>
          <tbody>
            {drugs.map((drug) => (
              <tr key={drug.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{drug.name}</td>
                <td className="px-4 py-2 border-b">{drug.dosage} мг</td>
                <td className="px-4 py-2 border-b">
                  {drug.frequency} раз/день
                </td>
                <td className="px-4 py-2 border-b">{drug.interval} ч</td>
                <td className="px-4 py-2 border-b">{drug.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Сообщение об успехе */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-green-600 text-white py-4 px-8 rounded-xl shadow-2xl z-50 max-w-md w-full text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="font-semibold text-lg">{successMessage}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модальное окно */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Фон */}
            <motion.div
              className="absolute inset-0 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            />

            {/* Модалка */}
            <motion.div
              className="relative z-10 bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Добавить лекарство
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    placeholder="Дополнительная информация"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition transform hover:scale-105"
                >
                  Сохранить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;
