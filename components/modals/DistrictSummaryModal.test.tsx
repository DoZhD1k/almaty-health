import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DistrictSummaryModal } from './DistrictSummaryModal';
import { Hospital } from '@/types/healthcare';
import { expect, describe, test, vi, afterEach } from 'vitest';

const mockFacilities: Hospital[] = [
  {
    unified_id: 1,
    name: "Больница А1",
    district: "Алмалинский район",
    total_beds: 100,
    pct_occupied: 80,
    lethal: 2.5,
    admitted: 50,
    org_type: "Б", ownership: "Г", own_type: "Г", lat: 0, lng: 0, occ_cat: 'norm',
    bld_priority: "", bld_condition: "", bld_emergency: false, bld_seismic: false,
    bld_year: null, bld_tech: null, bld_emergency_label: null, seismic_label: null,
    stop_cat: null, rural_admitted: 0
  },
  {
    unified_id: 2,
    name: "Больница А2",
    district: "Алмалинский район",
    total_beds: 200,
    pct_occupied: 100,
    lethal: 1.5,
    admitted: 160, // Изменено с 150 на 160, чтобы сумма была 210 (уникальное число)
    org_type: "Б", ownership: "Г", own_type: "Г", lat: 0, lng: 0, occ_cat: 'norm',
    bld_priority: "", bld_condition: "", bld_emergency: false, bld_seismic: false,
    bld_year: null, bld_tech: null, bld_emergency_label: null, seismic_label: null,
    stop_cat: null, rural_admitted: 0
  },
  {
    unified_id: 3,
    name: "Больница М1",
    district: "Медеуский район",
    total_beds: 550, // Изменено с 500 на 550
    pct_occupied: 95,
    lethal: 3.0,
    admitted: 320, // Изменено с 300 на 320
    org_type: "Б", ownership: "Г", own_type: "Г", lat: 0, lng: 0, occ_cat: 'vhigh',
    bld_priority: "", bld_condition: "", bld_emergency: false, bld_seismic: false,
    bld_year: null, bld_tech: null, bld_emergency_label: null, seismic_label: null,
    stop_cat: null, rural_admitted: 0
  }
];

describe('DistrictSummaryModal Component', () => {
  const mockOnClose = vi.fn();

  afterEach(cleanup);

  test('Рендерится и отображает заголовок', () => {
    render(<DistrictSummaryModal onClose={mockOnClose} facilities={mockFacilities} />);
    expect(screen.getByText(/Сводка по районам/i)).toBeInTheDocument();
  });

  test('Корректно суммирует данные по районам', () => {
    render(<DistrictSummaryModal onClose={mockOnClose} facilities={mockFacilities} />);
    
    // Алмалинский: койки 100+200=300, поступило 50+160=210
    expect(screen.getByText('300')).toBeInTheDocument();
    expect(screen.getByText('210')).toBeInTheDocument();
    
    // Медеуский: койки 550, поступило 320
    expect(screen.getByText('550')).toBeInTheDocument();
    expect(screen.getByText('320')).toBeInTheDocument();

    // Кол-во МО для Алмалинского
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('Сортирует районы по количеству коек', () => {
    render(<DistrictSummaryModal onClose={mockOnClose} facilities={mockFacilities} />);
    const rows = screen.getAllByRole('row');
    // Медеуский (550) должен быть выше Алмалинского (300)
    expect(rows[1]).toHaveTextContent('Медеуский');
    expect(rows[2]).toHaveTextContent('Алмалинский');
  });

  test('Корректно рассчитывает летальность', () => {
    render(<DistrictSummaryModal onClose={mockOnClose} facilities={mockFacilities} />);
    // Алмалинский: (2.5 + 1.5) / 2 = 2.00
    expect(screen.getByText('2.00%')).toBeInTheDocument();
  });

  test('Вызывает onClose при клике на крестик', () => {
    render(<DistrictSummaryModal onClose={mockOnClose} facilities={mockFacilities} />);
    const closeBtn = screen.getByRole('button');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});