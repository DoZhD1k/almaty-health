"use client";

import { Hospital } from "@/types/healthcare";
import { X, MapPin, Building2, Search } from "lucide-react";
import { getMoSettings } from "@/lib/constants/mo-config";

interface OrgTypeGridPanelProps {
  onClose: () => void;
  hospitals: Hospital[];
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
  onHospitalClick: (h: Hospital) => void;
}

export function OrgTypeGridPanel({ 
  onClose, 
  hospitals, 
  selectedType, 
  onSelectType,
  onHospitalClick 
}: OrgTypeGridPanelProps) {
  
    const typeCounts = hospitals.reduce((acc, h) => {
        acc[h.org_type] = (acc[h.org_type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const allTypes = Object.keys(typeCounts).sort();

    const filteredHospitals = selectedType 
        ? hospitals.filter(h => h.org_type === selectedType)
        : [];

    const hospitalsInType = selectedType ? hospitals.filter(h => h.org_type === selectedType) : [];
    const settings = selectedType ? getMoSettings(selectedType) : null;

    const coveredCount = new Set(hospitalsInType.map(h => h.district)).size;
    
    const avgLoad = hospitalsInType.length > 0 
        ? Math.round(hospitalsInType.reduce((acc, h) => acc + h.pct_occupied, 0) / hospitalsInType.length)
        : 0;

    return (
        <div className="absolute top-4 right-4 z-50 w-80 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-blue-200">
            <div className="bg-blue-800 p-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <span className="text-xs font-bold leading-tight">Транспортная доступность по типу МО</span>
                </div>
                <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded-full transition-colors"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-2.5 bg-blue-50 border-b border-blue-100">
                {!selectedType ? (
                    <p className="text-[10px] text-blue-900 leading-tight">Выберите тип МО для анализа доступности по дорогам Алматы</p>
                ) : (
                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <span className="text-[12px] font-bold text-blue-900">{selectedType}</span>
                            <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                {settings?.mode === 'territorial' ? '📍 Территориальный' : 
                                 settings?.mode === 'zonal' ? '🏘 Зональный' : '🏢 Мощностной'}
                            </span>
                        </div>
                        
                        {settings?.mode === 'territorial' && (
                            <div className="flex gap-3 text-[10px]">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-600"/> ≤{settings.near!/1000}км</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"/> ≤{settings.far!/1000}км</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600"/> &gt;{settings.far!/1000}км</span>
                                <button onClick={() => onSelectType(null)} className="ml-auto text-blue-600 font-bold underline">Сбросить</button>
                            </div>
                        )}

                        {settings?.mode === 'zonal' && (
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-gray-600">Покрытие: <b className="text-green-600">{coveredCount} из 8 районов</b></span>
                                <button onClick={() => onSelectType(null)} className="text-blue-600 font-bold underline">Сбросить</button>
                            </div>
                        )}

                        {settings?.mode === 'capacity' && (
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-gray-600">Ср. нагрузка: <b className={avgLoad > 90 ? "text-red-600" : "text-green-600"}>{avgLoad}%</b></span>
                                <button onClick={() => onSelectType(null)} className="text-blue-600 font-bold underline">Сбросить</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50">
                {!selectedType ? (
                    <div className="divide-y divide-gray-100">
                        {allTypes.map(type => (
                        <button 
                            key={type}
                            onClick={() => onSelectType(type)}
                            className="w-full flex items-center justify-between p-3 hover:bg-blue-50 transition-colors text-left"
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <MapPin className="h-3 w-3 text-blue-400 flex-shrink-0" />
                                <span className="text-[11px] font-medium text-gray-700 truncate">{type}</span>
                            </div>
                            <span className="bg-gray-200 text-gray-600 text-[9px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                {typeCounts[type]}
                            </span>
                        </button>
                        ))}
                        {settings?.mode === "territorial" && (
                            <div className="text-[10px] text-blue-800">
                                🟢 ≤{settings.near! / 1000}км  🟡 ≤{settings.far! / 1000}км  🔴 {settings.far! / 1000}км
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        <div className="p-2 bg-gray-200 text-[9px] font-bold text-gray-500 uppercase tracking-widest px-3">
                            {selectedType} ({filteredHospitals.length})
                        </div>
                        {filteredHospitals.map(h => (
                            <button 
                                key={h.unified_id}
                                onClick={() => onHospitalClick(h)}
                                className="w-full p-3 hover:bg-blue-50 transition-colors text-left flex flex-col gap-1"
                            >
                                <span className="text-[11px] font-bold text-gray-800 leading-tight">{h.name}</span>
                                <span className="text-[10px] text-gray-500">{h.district} · {h.total_beds} коек</span>
                            </button>
                        ))}
                    </div>
                    )}
            </div>
        </div>
    );
}