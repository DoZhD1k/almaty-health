import { X, ClipboardList } from "lucide-react";
import { Hospital } from "@/types/healthcare";

interface DistrictSummaryModalProps {
  onClose: () => void;
  facilities: Hospital[];
}

export function DistrictSummaryModal({ onClose, facilities }: DistrictSummaryModalProps) {
  const summary = facilities.reduce((acc, f) => {
    const d = f.district || "Не указан";
    if (!acc[d]) {
      acc[d] = { count: 0, beds: 0, admitted: 0, occs: [], lethals: [] };
    }
    acc[d].count += 1;
    acc[d].beds += f.total_beds || 0;
    acc[d].admitted += f.admitted || 0;
    acc[d].occs.push(f.pct_occupied || 0);
    acc[d].lethals.push(f.lethal || 0);
    return acc;
  }, {} as Record<string, any>);

  const rows = Object.entries(summary).sort((a, b) => b[1].beds - a[1].beds);

  return (
    <div className="absolute top-4 left-[340px] z-50 w-[450px] bg-white rounded-xl shadow-2xl overflow-hidden border border-blue-200 animate-in fade-in slide-in-from-left-2">
      <div className="bg-[#1565C0] p-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          <span className="text-sm font-bold">📋 Сводка по районам</span>
        </div>
        <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded-full"><X className="h-5 w-5" /></button>
      </div>
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="bg-blue-50 text-[#1565C0] border-b border-blue-100">
              <th className="p-2 text-left">Район</th>
              <th className="p-2 text-center">МО</th>
              <th className="p-2 text-center">Коек</th>
              <th className="p-2 text-center">Поступило</th>
              <th className="p-2 text-center">Загрузка %</th>
              <th className="p-2 text-center">Летальность %</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, data]) => {
              const avgOcc = Math.round(data.occs.reduce((a:any, b:any) => a + b, 0) / data.occs.length);
              const avgLethal = (data.lethals.reduce((a:any, b:any) => a + b, 0) / data.lethals.length).toFixed(2);
              return (
                <tr key={name} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-2 font-medium">{name.replace(" район", "")}</td>
                  <td className="p-2 text-center text-gray-500">{data.count}</td>
                  <td className="p-2 text-center font-semibold">{data.beds.toLocaleString()}</td>
                  <td className="p-2 text-center">{data.admitted.toLocaleString()}</td>
                  <td className={`p-2 text-center font-bold ${avgOcc > 90 ? 'text-red-600' : 'text-green-600'}`}>{avgOcc}%</td>
                  <td className="p-2 text-center text-red-600 font-medium">{avgLethal}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}