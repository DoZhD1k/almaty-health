"use client";

interface FilterDisplayProps {
  selectedDistricts: string[];
  selectedFacilityTypes: string[];
  selectedBedProfiles: string[];
  searchQuery: string;
}

export function FilterDisplay({
  selectedDistricts,
  selectedFacilityTypes,
  selectedBedProfiles,
  searchQuery,
}: FilterDisplayProps) {
  const hasFilters =
    selectedDistricts.length > 0 ||
    selectedFacilityTypes.length > 0 ||
    selectedBedProfiles.length > 0 ||
    searchQuery.trim().length > 0;

  if (!hasFilters) {
    return (
      <span className="text-xs text-gray-500 font-normal">
        (все стационары)
      </span>
    );
  }

  const filters = [];

  if (selectedDistricts.length > 0) {
    if (selectedDistricts.length === 1) {
      filters.push(`район: ${selectedDistricts[0]}`);
    } else {
      filters.push(`районы: ${selectedDistricts.length} выбрано`);
    }
  }

  if (selectedFacilityTypes.length > 0) {
    if (selectedFacilityTypes.length === 1) {
      filters.push(`тип: ${selectedFacilityTypes[0]}`);
    } else {
      filters.push(`типы: ${selectedFacilityTypes.length} выбрано`);
    }
  }

  if (selectedBedProfiles.length > 0) {
    if (selectedBedProfiles.length === 1) {
      filters.push(`профиль: ${selectedBedProfiles[0]}`);
    } else {
      filters.push(`профили: ${selectedBedProfiles.length} выбрано`);
    }
  }

  if (searchQuery.trim().length > 0) {
    filters.push(`поиск: "${searchQuery.trim()}"`);
  }

  return (
    <span className="text-xs text-blue-600 font-normal">
      (стационары • {filters.join(" • ")})
    </span>
  );
}
