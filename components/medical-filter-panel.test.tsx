import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MedicalFilterPanel } from './medical-filter-panel';
import { Hospital } from '@/types/healthcare';
import { expect, describe, test, vi, beforeEach, afterEach } from 'vitest';

vi.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <select 
      data-testid="select-district" 
      value={value} 
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => (
    <option value={value}>{children}</option>
  ),
  SelectValue: ({ placeholder }: any) => <>{placeholder}</>,
}));

vi.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange, id }: any) => (
    <input
      type="checkbox"
      id={id}
      data-testid={`checkbox-${id}`}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
  ),
}));

const mockFacilities: Hospital[] = [
  {
    unified_id: 1,
    name: "Городская больница №4",
    org_type: "Многопрофильная больница",
    district: "Турксибский",
    ownership: "Государственная",
    own_type: "Городская",
    lat: 43.2,
    lng: 76.9,
    total_beds: 200,
    pct_occupied: 80,
    occ_cat: 'norm',
    bld_priority: "Низкий",
    bld_condition: "Исправное",
    bld_emergency: false,
    bld_seismic: true,
    bld_year: 1985,
    bld_tech: "Хорошее",
    bld_emergency_label: null,
    seismic_label: "Сейсмостойкое",
    stop_cat: null,
    lethal: 2,
    admitted: 15,
    rural_admitted: 5
  }
];

describe('MedicalFilterPanel Component', () => {
  const mockOnFiltersChange = vi.fn();
  const mockOnShowDistrictSummary = vi.fn();
  const mockOnShowNonresidents = vi.fn();
  const mockOnShowBuildingAnalysis = vi.fn();

  const defaultProps = {
    onFiltersChange: mockOnFiltersChange,
    facilities: mockFacilities,
    onShowDistrictSummary: mockOnShowDistrictSummary,
    onShowNonresidents: mockOnShowNonresidents,
    onShowBuildingAnalysis: mockOnShowBuildingAnalysis,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  test('Смена района через Select обновляет фильтр', async () => {
    render(<MedicalFilterPanel {...defaultProps} />);
    
    const select = screen.getByTestId('select-district');
    
    fireEvent.change(select, { target: { value: 'Турксибский' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ district: 'Турксибский' })
    );
  });

  test('Отображает корректные суммарные данные (Койки: 200, МО: 1)', () => {
    render(<MedicalFilterPanel {...defaultProps} />);
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('Вызывает фильтрацию при поиске по названию', () => {
    render(<MedicalFilterPanel {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText(/Введите название организации/i);
    fireEvent.change(searchInput, { target: { value: 'Больница' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ searchQuery: 'Больница' })
    );
  });

  test('Кнопка "Сводка по районам" вызывает пропс onShowDistrictSummary', () => {
    render(<MedicalFilterPanel {...defaultProps} />);
    const btn = screen.getByText(/📋 Сводка по районам/i);
    fireEvent.click(btn);
    expect(mockOnShowDistrictSummary).toHaveBeenCalled();
  });
});