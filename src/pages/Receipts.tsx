import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

const API_URL = "https://functions.poehali.dev/929714cc-a62b-485c-b2b7-7f73b303d5d1";

interface ReceiptItem {
  product_name: string;
  quantity: number;
  price: number;
}

interface Receipt {
  id: number;
  receipt_number: string;
  supplier: string;
  status: string;
  total_amount: number;
  note: string;
  created_at: string;
}

export default function Receipts() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [supplier, setSupplier] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<ReceiptItem[]>([
    { product_name: "", quantity: 1, price: 0 },
  ]);

  const { data: receipts = [], isLoading } = useQuery<Receipt[]>({
    queryKey: ["receipts"],
    queryFn: () => fetch(API_URL).then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (body: object) =>
      fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => r.json()),
    onSuccess: (data) => {
      toast.success(`Приход ${data.receipt_number} создан`);
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      resetForm();
    },
    onError: () => toast.error("Ошибка при создании прихода"),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }).then((r) => r.json()),
    onSuccess: () => {
      toast.success("Приход подтверждён, остатки обновлены");
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
    },
    onError: () => toast.error("Ошибка при подтверждении"),
  });

  const resetForm = () => {
    setShowForm(false);
    setSupplier("");
    setNote("");
    setItems([{ product_name: "", quantity: 1, price: 0 }]);
  };

  const addItem = () => {
    setItems([...items, { product_name: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ReceiptItem, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter((item) => item.product_name.trim());
    if (!validItems.length) {
      toast.error("Добавьте хотя бы один товар");
      return;
    }
    createMutation.mutate({ supplier, note, items: validItems });
  };

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const statusLabel = (s: string) =>
    s === "confirmed" ? "Подтверждён" : "Новый";

  const statusColor = (s: string) =>
    s === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-neutral-400 hover:text-neutral-900 transition-colors">
              <Icon name="ArrowLeft" size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <Icon name="PackagePlus" size={24} className="text-neutral-900" />
              <h1 className="text-xl font-bold text-neutral-900">Приход товаров</h1>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg hover:bg-neutral-700 transition-colors text-sm cursor-pointer"
          >
            <Icon name={showForm ? "X" : "Plus"} size={16} />
            {showForm ? "Отмена" : "Новый приход"}
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Оформление прихода</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Поставщик</label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Название поставщика"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-neutral-500"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Примечание</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Комментарий к приходу"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-neutral-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-neutral-700">Товары</label>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                >
                  <Icon name="Plus" size={14} />
                  Добавить строку
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={item.product_name}
                      onChange={(e) => updateItem(index, "product_name", e.target.value)}
                      placeholder="Название товара"
                      className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-neutral-500"
                    />
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                      placeholder="Кол-во"
                      className="w-24 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-neutral-500"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price || ""}
                      onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)}
                      placeholder="Цена"
                      className="w-28 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-neutral-500"
                    />
                    <span className="w-28 text-sm text-neutral-600 text-right">
                      {(item.quantity * item.price).toLocaleString("ru-RU")} ₽
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Icon name="Trash2" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              <div className="text-lg font-semibold">
                Итого: {totalAmount.toLocaleString("ru-RU")} ₽
              </div>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-neutral-900 text-white px-6 py-2 rounded-lg hover:bg-neutral-700 transition-colors text-sm cursor-pointer disabled:opacity-50"
              >
                {createMutation.isPending ? "Сохранение..." : "Создать приход"}
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="text-center py-20 text-neutral-400">Загрузка...</div>
        ) : receipts.length === 0 ? (
          <div className="text-center py-20">
            <Icon name="PackageOpen" size={48} className="mx-auto text-neutral-300 mb-4" />
            <p className="text-neutral-500 text-lg">Пока нет приходов</p>
            <p className="text-neutral-400 text-sm mt-1">Создайте первый приход товаров</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Номер</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Поставщик</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Сумма</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Статус</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Дата</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-600"></th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((r) => (
                  <tr key={r.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{r.receipt_number}</td>
                    <td className="px-4 py-3 text-neutral-600">{r.supplier || "—"}</td>
                    <td className="px-4 py-3">{r.total_amount.toLocaleString("ru-RU")} ₽</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(r.status)}`}>
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      {r.status === "new" && (
                        <button
                          onClick={() => confirmMutation.mutate(r.id)}
                          disabled={confirmMutation.isPending}
                          className="text-green-600 hover:text-green-800 transition-colors text-xs font-medium cursor-pointer disabled:opacity-50"
                        >
                          Подтвердить
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
