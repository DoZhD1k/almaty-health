import { X, Truck } from "lucide-react";
import { shortenHospitalName } from "@/lib/utils/hospital-utils";

interface NonresidentsModalProps {
  onClose: () => void;
  data: any[];
}

export function NonresidentsModal({ onClose, data }: NonresidentsModalProps) {
  const sortedData = [...data].sort((a, b) => b.pct_other - a.pct_other);
  const totalPatients = data.reduce((sum, item) => sum + item.total_patients, 0);
  const avgPct = (data.reduce((sum, item) => sum + item.pct_other, 0) / data.length).toFixed(1);
  const top3 = sortedData.slice(0, 3).map(i => shortenHospitalName(i.name)).join(' · ');

  return (
    <div className="absolute top-4 left-[340px] z-50 w-[420px] bg-white rounded-xl shadow-2xl overflow-hidden border border-blue-200 animate-in fade-in slide-in-from-left-2">
      <div className="bg-[#1565C0] p-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4" />
          <span className="text-sm font-bold">🚑 Стационары с иногородними</span>
        </div>
        <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded-full"><X className="h-5 w-5" /></button>
      </div>
      <div className="p-2 text-[10px] text-gray-500 italic border-b bg-gray-50">
        «Иногородние» = сельские жители по данным отчётности
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        <table className="w-full text-[11px] border-collapse">
          <thead className="sticky top-0 bg-white shadow-sm z-10">
            <tr className="text-gray-400 border-b">
              <th className="p-2 text-left w-8">#</th>
              <th className="p-2 text-left">Стационар</th>
              <th className="p-2 text-right">Поступило</th>
              <th className="p-2 text-right">Иногор. %</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, idx) => (
              <tr key={idx} className={`border-b border-gray-50 hover:bg-blue-50/50 ${item.pct_other > 50 ? 'bg-red-50/30' : ''}`}>
                <td className="p-2 text-gray-400">{idx + 1}</td>
                <td className="p-2 font-medium">{shortenHospitalName(item.name)}</td>
                <td className="p-2 text-right">{item.total_patients.toLocaleString()}</td>
                <td className={`p-2 text-right font-bold ${item.pct_other > 50 ? 'text-red-600' : 'text-orange-600'}`}>{item.pct_other}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-3 bg-blue-50 border-t border-blue-100">
        <div className="flex justify-between text-xs font-bold text-blue-800 mb-2">
          <span>Σ Итого по городу:</span>
          <span>{totalPatients.toLocaleString()} пациентов | {avgPct}%</span>
        </div>
        <div className="text-[10px] text-gray-600 leading-tight">
          <b>🏆 Топ-3:</b> {top3}
        </div>
      </div>
    </div>
  );
}