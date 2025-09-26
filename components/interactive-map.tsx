// "use client"

// import { useState, useMemo } from "react"
// import { MapPin, MapIcon, Building2, Heart, Baby, Zap, Stethoscope, Shield, Activity } from "lucide-react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { MedicalFacilityCard } from "./medical-facility-card"
// import { FilterPanel } from "./filter-panel"

// const medicalFacilities = [
//   {
//     id: 1,
//     name: "Городская клиническая больница №1",
//     address: "ул. Толе би, 95",
//     district: "Алмалинский",
//     facilityType: "Городская",
//     profile: "Многопрофильная",
//     beds: 450,
//     currentLoad: 85,
//     hospitalizations: 1250,
//     discharges: 1180,
//     deaths: 12,
//     ruralPatients: 25,
//     coordinates: { x: 45, y: 35 },
//     loadStatus: "high" as const,
//   },
//   {
//     id: 2,
//     name: "Республиканский кардиологический центр",
//     address: "ул. Айтеке би, 42",
//     district: "Бостандыкский",
//     facilityType: "Республиканская",
//     profile: "Кардиология",
//     beds: 320,
//     currentLoad: 95,
//     hospitalizations: 890,
//     discharges: 845,
//     deaths: 8,
//     ruralPatients: 45,
//     coordinates: { x: 65, y: 25 },
//     loadStatus: "critical" as const,
//   },
//   {
//     id: 3,
//     name: "Детская городская больница",
//     address: "пр. Абая, 158",
//     district: "Ауэзовский",
//     facilityType: "Городская",
//     profile: "Педиатрия",
//     beds: 280,
//     currentLoad: 72,
//     hospitalizations: 650,
//     discharges: 620,
//     deaths: 2,
//     ruralPatients: 18,
//     coordinates: { x: 25, y: 55 },
//     loadStatus: "optimal" as const,
//   },
//   {
//     id: 4,
//     name: "Онкологический центр",
//     address: "ул. Абылай хана, 91",
//     district: "Медеуский",
//     facilityType: "Республиканская",
//     profile: "Онкология",
//     beds: 180,
//     currentLoad: 105,
//     hospitalizations: 420,
//     discharges: 380,
//     deaths: 15,
//     ruralPatients: 35,
//     coordinates: { x: 75, y: 45 },
//     loadStatus: "overload" as const,
//   },
//   {
//     id: 5,
//     name: "Центральная городская больница",
//     address: "ул. Жандосова, 12",
//     district: "Турксибский",
//     facilityType: "Городская",
//     profile: "Многопрофильная",
//     beds: 380,
//     currentLoad: 58,
//     hospitalizations: 980,
//     discharges: 950,
//     deaths: 8,
//     ruralPatients: 22,
//     coordinates: { x: 35, y: 75 },
//     loadStatus: "low" as const,
//   },
//   {
//     id: 6,
//     name: "Травматологический центр",
//     address: "ул. Розыбакиева, 289",
//     district: "Наурызбайский",
//     facilityType: "Республиканская",
//     profile: "Травматология",
//     beds: 220,
//     currentLoad: 112,
//     hospitalizations: 560,
//     discharges: 520,
//     deaths: 6,
//     ruralPatients: 28,
//     coordinates: { x: 55, y: 65 },
//     loadStatus: "extreme" as const,
//   },
//   {
//     id: 7,
//     name: "Частная клиника Медикер",
//     address: "ул. Фурманова, 91",
//     district: "Алмалинский",
//     facilityType: "Частная",
//     profile: "Многопрофильная",
//     beds: 120,
//     currentLoad: 68,
//     hospitalizations: 340,
//     discharges: 325,
//     deaths: 1,
//     ruralPatients: 12,
//     coordinates: { x: 50, y: 30 },
//     loadStatus: "optimal" as const,
//   },
//   {
//     id: 8,
//     name: "Неврологический центр",
//     address: "пр. Достык, 132",
//     district: "Медеуский",
//     facilityType: "Республиканская",
//     profile: "Неврология",
//     beds: 150,
//     currentLoad: 89,
//     hospitalizations: 380,
//     discharges: 365,
//     deaths: 4,
//     ruralPatients: 31,
//     coordinates: { x: 70, y: 40 },
//     loadStatus: "high" as const,
//   },
// ]

// const getLoadColor = (status: string) => {
//   switch (status) {
//     case "low":
//       return "hsl(var(--load-low))"
//     case "optimal":
//       return "hsl(var(--load-optimal))"
//     case "high":
//       return "hsl(var(--load-high))"
//     case "critical":
//       return "hsl(var(--load-critical))"
//     case "overload":
//       return "hsl(var(--load-overload))"
//     case "extreme":
//       return "hsl(var(--load-extreme))"
//     default:
//       return "hsl(var(--muted))"
//   }
// }

// const getMedicalIcon = (profile: string, facilityType: string) => {
//   // Specialized profiles get specific icons
//   if (profile.includes("Кардиология")) return Heart
//   if (profile.includes("Педиатрия")) return Baby
//   if (profile.includes("Онкология")) return Shield
//   if (profile.includes("Травматология")) return Zap
//   if (profile.includes("Неврология")) return Activity

//   // General hospitals get different icons based on type
//   if (facilityType === "Частная") return Building2
//   if (facilityType === "Республиканская") return Stethoscope

//   // Default for city hospitals
//   return MapPin
// }

// interface FilterState {
//   search: string
//   district: string
//   facilityType: string
//   profile: string
//   loadStatus: string[]
//   bedRange: [number, number]
// }

// export function InteractiveMap() {
//   const [selectedFacility, setSelectedFacility] = useState<(typeof medicalFacilities)[0] | null>(null)
//   const [filters, setFilters] = useState<FilterState>({
//     search: "",
//     district: "Все районы",
//     facilityType: "Все типы",
//     profile: "Все профили",
//     loadStatus: [],
//     bedRange: [0, 500],
//   })

//   const filteredFacilities = useMemo(() => {
//     return medicalFacilities.filter((facility) => {
//       // Search filter
//       if (filters.search && !facility.name.toLowerCase().includes(filters.search.toLowerCase())) {
//         return false
//       }

//       // District filter
//       if (filters.district !== "Все районы" && facility.district !== filters.district) {
//         return false
//       }

//       // Facility type filter
//       if (filters.facilityType !== "Все типы" && facility.facilityType !== filters.facilityType) {
//         return false
//       }

//       // Profile filter
//       if (filters.profile !== "Все профили" && facility.profile !== filters.profile) {
//         return false
//       }

//       // Load status filter
//       if (filters.loadStatus.length > 0 && !filters.loadStatus.includes(facility.loadStatus)) {
//         return false
//       }

//       // Bed range filter
//       if (facility.beds < filters.bedRange[0] || facility.beds > filters.bedRange[1]) {
//         return false
//       }

//       return true
//     })
//   }, [filters])

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//       {/* Filter Panel */}
//       <div className="lg:col-span-1">
//         <FilterPanel onFiltersChange={setFilters} />
//       </div>

//       {/* Map Section */}
//       <div className="lg:col-span-2">
//         <Card className="h-[600px]">
//           <CardHeader>
//             <CardTitle className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <MapIcon className="h-5 w-5" />
//                 Карта медицинских организаций
//               </div>
//               <div className="text-sm text-muted-foreground">
//                 Показано: {filteredFacilities.length} из {medicalFacilities.length}
//               </div>
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="p-0">
//             <div className="relative h-[500px] bg-muted/20 rounded-lg overflow-hidden">
//               {/* Simplified map background */}
//               <div className="absolute inset-0 bg-gradient-to-br from-muted/10 to-muted/30" />

//               {/* Medical facility markers - only show filtered facilities */}
//               {filteredFacilities.map((facility) => {
//                 const IconComponent = getMedicalIcon(facility.profile, facility.facilityType)

//                 return (
//                   <button
//                     key={facility.id}
//                     className="absolute transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
//                     style={{
//                       left: `${facility.coordinates.x}%`,
//                       top: `${facility.coordinates.y}%`,
//                     }}
//                     onClick={() => setSelectedFacility(facility)}
//                   >
//                     <div className="relative">
//                       <div
//                         className="h-10 w-10 rounded-full flex items-center justify-center border-2 border-background shadow-lg"
//                         style={{ backgroundColor: getLoadColor(facility.loadStatus) }}
//                       >
//                         <IconComponent className="h-5 w-5 text-white" />
//                       </div>
//                       <div
//                         className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background"
//                         style={{ backgroundColor: getLoadColor(facility.loadStatus) }}
//                       />
//                     </div>
//                   </button>
//                 )
//               })}

//               {/* Legend */}
//               <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-4 border">
//                 <h4 className="font-semibold mb-2 text-sm">Уровень загруженности</h4>
//                 <div className="space-y-1 text-xs">
//                   {[
//                     { status: "low", label: "Низкая (< 60%)" },
//                     { status: "optimal", label: "Оптимальная (60-80%)" },
//                     { status: "high", label: "Высокая (80-90%)" },
//                     { status: "critical", label: "Критическая (90-100%)" },
//                     { status: "overload", label: "Перегруз (100-110%)" },
//                     { status: "extreme", label: "Критический (>110%)" },
//                   ].map(({ status, label }) => (
//                     <div key={status} className="flex items-center gap-2">
//                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getLoadColor(status) }} />
//                       <span>{label}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Facility Details */}
//       <div className="space-y-4">
//         {selectedFacility ? (
//           <MedicalFacilityCard facility={selectedFacility} />
//         ) : (
//           <Card>
//             <CardContent className="p-6 text-center">
//               <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//               <h3 className="font-semibold mb-2">Выберите медицинскую организацию</h3>
//               <p className="text-sm text-muted-foreground">
//                 Нажмите на маркер на карте для просмотра подробной информации
//               </p>
//             </CardContent>
//           </Card>
//         )}

//         {/* Quick Stats - updated to show filtered data */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-lg">Статистика по фильтру</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-primary">{filteredFacilities.length}</div>
//                 <div className="text-xs text-muted-foreground">МО в фильтре</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-primary">
//                   {filteredFacilities.reduce((sum, f) => sum + f.beds, 0)}
//                 </div>
//                 <div className="text-xs text-muted-foreground">Всего коек</div>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <div className="flex justify-between text-sm">
//                 <span>Средняя загрузка:</span>
//                 <span className="font-semibold">
//                   {filteredFacilities.length > 0
//                     ? Math.round(
//                         filteredFacilities.reduce((sum, f) => sum + f.currentLoad, 0) / filteredFacilities.length,
//                       )
//                     : 0}
//                   %
//                 </span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span>Перегруженных МО:</span>
//                 <span className="font-semibold text-destructive">
//                   {filteredFacilities.filter((f) => f.currentLoad > 100).length}
//                 </span>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }
