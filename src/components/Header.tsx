import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  return (
    <header className={`absolute top-0 left-0 right-0 z-10 p-6 ${className ?? ""}`}>
      <div className="flex justify-between items-center">
        <Link to="/" className="text-white text-sm uppercase tracking-wide flex items-center gap-2 hover:text-neutral-300 transition-colors">
          <Icon name="Warehouse" size={20} />
          СкладПро
        </Link>
        <nav className="flex gap-8">
          <a
            href="#features"
            className="text-white hover:text-neutral-400 transition-colors duration-300 uppercase text-sm"
          >
            Возможности
          </a>
          <a
            href="#pricing"
            className="text-white hover:text-neutral-400 transition-colors duration-300 uppercase text-sm"
          >
            Тарифы
          </a>
          <Link
            to="/receipts"
            className="text-white hover:text-neutral-400 transition-colors duration-300 uppercase text-sm"
          >
            Приход
          </Link>
          <a
            href="#download"
            className="text-white hover:text-neutral-400 transition-colors duration-300 uppercase text-sm"
          >
            Скачать
          </a>
        </nav>
      </div>
    </header>
  );
}
