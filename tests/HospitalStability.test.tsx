import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import HomePage from '@/app/page'; 
import { healthcareApi } from '@/lib/api/healthcare';

vi.mock('next/dynamic', () => ({
  default: () => () => <div data-testid="map-mock">Карта загружена</div>,
}));

vi.mock('@/lib/api/healthcare', () => ({
  healthcareApi: {
    getHospitals: vi.fn(),
    getSeismicPoints: vi.fn(),
    getRefusals: vi.fn(),
    getPlannedZones: vi.fn(),
    getPlannedObjects: vi.fn(),
    getNonresidents: vi.fn(),
    getBedProfilesSummary: vi.fn(),
    getGridCells: vi.fn(),
  }
}));

describe('Hospital Page Stability - Тестирование отказоустойчивости', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
  });

  it('Критический случай: Один из основных запросов вернул Error 500', async () => {
    (healthcareApi.getHospitals as any).mockRejectedValue(new Error('Server Error'));
    
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText(/Ошибка: Не удалось загрузить данные для Геоанализа/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Повторить/i })).toBeInTheDocument();
  });

  it('Граничный случай: API вернул пустые списки результатов', async () => {
    (healthcareApi.getHospitals as any).mockResolvedValue({ results: [] });
    (healthcareApi.getSeismicPoints as any).mockResolvedValue([]);
    (healthcareApi.getRefusals as any).mockResolvedValue({ results: [] });
    (healthcareApi.getPlannedZones as any).mockResolvedValue({ features: [] });
    (healthcareApi.getPlannedObjects as any).mockResolvedValue({ features: [] });
    (healthcareApi.getNonresidents as any).mockResolvedValue([]);
    (healthcareApi.getBedProfilesSummary as any).mockResolvedValue({});
    (healthcareApi.getGridCells as any).mockResolvedValue({ features: [] });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.queryByText(/Загрузка данных/i)).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('map-mock')).toBeInTheDocument();
  });

  it('Защитное программирование: Объект больницы содержит поврежденные данные (null в bld_tech)', async () => {
    (healthcareApi.getHospitals as any).mockResolvedValue({
      results: [{
        unified_id: 1,
        name: "Поврежденный объект",
        district: "Алмалинский",
        bld_tech: null,
        bld_emergency: false,
        occ_cat: 'norm',
        own_type: "Городская",
        lat: 43.2,
        lng: 76.9
      }]
    });
    
    (healthcareApi.getSeismicPoints as any).mockResolvedValue([]);
    (healthcareApi.getRefusals as any).mockResolvedValue({ results: [] });
    (healthcareApi.getPlannedZones as any).mockResolvedValue({ features: [] });
    (healthcareApi.getPlannedObjects as any).mockResolvedValue({ features: [] });
    (healthcareApi.getGridCells as any).mockResolvedValue({ features: [] });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId('map-mock')).toBeInTheDocument();
    });

    expect(screen.queryByText(/Ошибка/i)).not.toBeInTheDocument();
  });
});