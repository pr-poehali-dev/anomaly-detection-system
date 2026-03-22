import { useState } from "react";
import Icon from "@/components/ui/icon";

export default function Download() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="download" className="bg-white py-20 lg:py-32 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="bg-neutral-900 rounded-2xl p-8 sm:p-12 lg:p-16 text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6">
            <Icon name="Download" size={32} className="text-white" />
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Скачайте СкладПро
          </h2>
          <p className="text-neutral-400 text-lg mb-8 max-w-md mx-auto">
            Оставьте email — мы отправим ссылку на скачивание и инструкцию по установке
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ваш email"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-neutral-500 outline-none focus:border-white/50 transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-neutral-900 font-semibold rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer uppercase text-sm tracking-wide whitespace-nowrap"
              >
                Получить
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Icon name="Check" size={24} className="text-green-400" />
              </div>
              <p className="text-lg">Ссылка отправлена на {email}</p>
              <p className="text-neutral-400 text-sm">Проверьте почту — письмо придёт в течение минуты</p>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-neutral-400">
            <span className="flex items-center gap-2">
              <Icon name="Monitor" size={16} />
              Windows 10+
            </span>
            <span className="flex items-center gap-2">
              <Icon name="HardDrive" size={16} />
              ~150 МБ
            </span>
            <span className="flex items-center gap-2">
              <Icon name="Wifi" size={16} />
              Работает офлайн
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
