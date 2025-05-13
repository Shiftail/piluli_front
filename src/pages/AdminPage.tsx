import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { useStores } from "../stores/useStores";
import type { Drug, DrugRead } from "../stores/DrugStore";
import AdminControls from "../components/adminControls/AdminControls";
import { DrugModal } from "../components/adminControls/AdminDrugModal";
const AdminPage = observer(() => {
  const { authStore, drugStore } = useStores();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [successMessage, setSuccessMessage] = useState("");
  const [form, setForm] = useState<Drug>({
    name: "",
    dosage: 0,
    frequency: 0,
    interval: 0,
    description: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const handleAddDrug = () => {
    setForm({
      name: "",
      dosage: 0,
      frequency: 0,
      interval: 0,
      description: "",
    });
    setEditingId(null);
    setModalMode("create");
    setShowModal(true);
  };
  const handleEditDrug = (drug: DrugRead) => {
    setForm(drug);
    setEditingId(drug.id);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleDeleteDrug = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить это лекарство?")) {
      await drugStore.deleteDrug(id);
      await drugStore.fetchDrugs();
      setSuccessMessage("Лекарство удалено!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await drugStore.updateDrug(editingId, form);
        setSuccessMessage("Лекарство обновлено!");
      } else {
        await drugStore.addDrug(form);
        setSuccessMessage("Лекарство добавлено!");
      }

      setShowModal(false);
      setForm({
        name: "",
        dosage: 0,
        frequency: 0,
        interval: 0,
        description: "",
      });
      setEditingId(null);
      await drugStore.fetchDrugs();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  useEffect(() => {
    drugStore.fetchDrugs();
  }, [drugStore]);

  return (
    <div className="p-8">
      {authStore.user && (
        <AdminControls
          username={authStore.user.username}
          onAddDrug={handleAddDrug}
        />
      )}
      <div className="overflow-x-auto mb-10">
        {drugStore.drugs && drugStore.drugs.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drugStore.drugs.map((drug: DrugRead) => (
              <div
                key={drug.id}
                className="border rounded-2xl p-4 shadow-md bg-white flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="text-lg font-semibold text-gray-800">
                    {drug.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    Дозировка: {drug.dosage} мг
                  </div>
                  <div className="text-sm text-gray-600">
                    Частота: {drug.frequency} раз/день
                  </div>
                  <div className="text-sm text-gray-600">
                    Интервал: {drug.interval} ч
                  </div>
                  <div className="text-sm text-gray-700 mt-2 whitespace-pre-line">
                    {drug.description}
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={() => handleEditDrug(drug)}
                    className="text-blue-600 hover:text-blue-800 transition"
                    title="Редактировать"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteDrug(drug.id)}
                    className="text-red-600 hover:text-red-800 transition"
                    title="Удалить"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <h2>Лекарства отсутствуют</h2>
          </>
        )}
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
      <DrugModal
        isOpen={showModal}
        mode={modalMode}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        form={form}
        onChange={handleInputChange}
      />
    </div>
  );
});

export default AdminPage;
