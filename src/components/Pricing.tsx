import Icon from "@/components/ui/icon";

const plans = [
  {
    name: "Старт",
    price: "Бесплатно",
    description: "Для малого склада до 500 позиций",
    features: [
      "До 500 товаров",
      "1 склад",
      "Приёмка и списание",
      "Базовые отчёты",
      "Экспорт в Excel",
    ],
    highlighted: false,
    buttonText: "Скачать",
  },
  {
    name: "Бизнес",
    price: "2 490 ₽",
    period: "единоразово",
    description: "Для растущего бизнеса без ограничений",
    features: [
      "Без ограничений по товарам",
      "До 5 складов",
      "Инвентаризация",
      "Аналитика и графики",
      "Штрихкоды и QR-коды",
      "Мультипользовательский режим",
    ],
    highlighted: true,
    buttonText: "Скачать",
  },
  {
    name: "Корпоративный",
    price: "По запросу",
    description: "Индивидуальные доработки под ваш бизнес",
    features: [
      "Всё из тарифа Бизнес",
      "Неограниченное кол-во складов",
      "Интеграция с 1С",
      "API для внешних систем",
      "Приоритетная поддержка",
      "Индивидуальная настройка",
    ],
    highlighted: false,
    buttonText: "Связаться",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-neutral-50 py-20 lg:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="uppercase mb-4 text-sm tracking-wide text-neutral-500">
            Тарифы
          </h3>
          <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900 mb-4">
            Выберите свой план
          </h2>
          <p className="text-neutral-600 text-lg max-w-xl mx-auto">
            Одна покупка — навсегда. Никаких ежемесячных подписок
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 flex flex-col transition-all duration-300 ${
                plan.highlighted
                  ? "bg-neutral-900 text-white shadow-2xl scale-[1.02]"
                  : "bg-white text-neutral-900 border border-neutral-200 hover:shadow-lg"
              }`}
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl lg:text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className={`text-sm ${plan.highlighted ? "text-neutral-400" : "text-neutral-500"}`}>
                      / {plan.period}
                    </span>
                  )}
                </div>
                <p className={`mt-2 text-sm ${plan.highlighted ? "text-neutral-400" : "text-neutral-500"}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Icon
                      name="Check"
                      size={16}
                      className={plan.highlighted ? "text-green-400" : "text-green-600"}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-6 text-sm uppercase tracking-wide font-semibold transition-all duration-300 rounded-lg cursor-pointer ${
                  plan.highlighted
                    ? "bg-white text-neutral-900 hover:bg-neutral-200"
                    : "bg-neutral-900 text-white hover:bg-neutral-700"
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
