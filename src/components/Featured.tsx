import Icon from "@/components/ui/icon";

export default function Featured() {
  return (
    <div id="features" className="bg-white py-16 lg:py-24">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center min-h-[80vh] px-6 lg:px-12">
        <div className="flex-1 h-[400px] lg:h-[700px] mb-8 lg:mb-0 lg:order-2 rounded-lg overflow-hidden">
          <img
            src="https://cdn.poehali.dev/projects/258bc207-0d70-42ef-b2e8-6882fdbe436b/files/a5b07161-985a-402b-a14b-34bc36c7604b.jpg"
            alt="Управление складом с планшета"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 text-left lg:h-[700px] flex flex-col justify-center lg:mr-12 lg:order-1">
          <h3 className="uppercase mb-4 text-sm tracking-wide text-neutral-600">
            Всё для вашего склада
          </h3>
          <p className="text-2xl lg:text-4xl mb-10 text-neutral-900 leading-tight">
            Учёт остатков, приёмка поставок, списание и перемещение товаров — всё в одном приложении. Работает без интернета, прямо на вашем компьютере.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            <div className="flex items-start gap-3">
              <div className="bg-neutral-100 p-2 rounded-lg shrink-0">
                <Icon name="PackageSearch" size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 mb-1">Учёт товаров</h4>
                <p className="text-sm text-neutral-600">Полная база с категориями, артикулами и штрихкодами</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-neutral-100 p-2 rounded-lg shrink-0">
                <Icon name="TrendingUp" size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 mb-1">Аналитика</h4>
                <p className="text-sm text-neutral-600">Отчёты по остаткам, оборотам и движению товаров</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-neutral-100 p-2 rounded-lg shrink-0">
                <Icon name="ClipboardList" size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 mb-1">Инвентаризация</h4>
                <p className="text-sm text-neutral-600">Быстрая сверка фактических остатков с учётными</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-neutral-100 p-2 rounded-lg shrink-0">
                <Icon name="Shield" size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 mb-1">Безопасность</h4>
                <p className="text-sm text-neutral-600">Данные хранятся локально — только у вас на компьютере</p>
              </div>
            </div>
          </div>

          <button className="bg-black text-white border border-black px-6 py-3 text-sm transition-all duration-300 hover:bg-white hover:text-black cursor-pointer w-fit uppercase tracking-wide">
            Скачать бесплатно
          </button>
        </div>
      </div>
    </div>
  );
}
