import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NonresidentsModal } from './NonresidentsModal';
import { expect, describe, test, vi, afterEach } from 'vitest';
import { shortenHospitalName } from "@/lib/utils/hospital-utils";

vi.mock("@/lib/utils/hospital-utils", () => ({
  shortenHospitalName: vi.fn((name: string) => name.replace("Городская клиническая больница", "ГКБ")),
}));

const mockData = [
  { name: "Городская клиническая больница №1", total_patients: 1000, pct_other: 60 },
  { name: "Центральная районная больница", total_patients: 500, pct_other: 20 },
  { name: "Городская клиническая больница №7", total_patients: 300, pct_other: 40 },
  { name: "Медицинский центр", total_patients: 200, pct_other: 10 },
];

describe('NonresidentsModal Component', () => {
  const mockOnClose = vi.fn();

  afterEach(cleanup);

  test('Рендерится и отображает заголовок', () => {
    render(<NonresidentsModal onClose={mockOnClose} data={mockData} />);
    expect(screen.getByText(/Стационары с иногородними/i)).toBeInTheDocument();
  });

  test('Сортирует данные по убыванию pct_other', () => {
    render(<NonresidentsModal onClose={mockOnClose} data={mockData} />);
    
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('ГКБ №1');
    expect(rows[2]).toHaveTextContent('ГКБ №7');
  });

  test('Корректно рассчитывает общие итоги (сумма и средний %)', () => {
    render(<NonresidentsModal onClose={mockOnClose} data={mockData} />);
    
    expect(screen.getByText(/2[\s\u00A0,]000\sпациентов/i)).toBeInTheDocument();

    expect(screen.getByText(/32\.5%/i)).toBeInTheDocument();
  });

  test('Отображает Топ-3 сокращенных названия в футере', () => {
    render(<NonresidentsModal onClose={mockOnClose} data={mockData} />);
    
    const top3Text = screen.getByText(/Топ-3:/i).parentElement?.textContent;
    expect(top3Text).toContain('ГКБ №1');
    expect(top3Text).toContain('ГКБ №7');
    expect(top3Text).toContain('Центральная районная больница');
    expect(shortenHospitalName).toHaveBeenCalled();
  });

  test('Применяет красный цвет для pct_other > 50', () => {
    render(<NonresidentsModal onClose={mockOnClose} data={mockData} />);
    
    const highPctCell = screen.getByText('60%');
    expect(highPctCell).toHaveClass('text-red-600');
    
    const normalPctCell = screen.getByText('40%');
    expect(normalPctCell).toHaveClass('text-orange-600');
  });

  test('Строка подсвечивается красным фоном при pct_other > 50', () => {
    render(<NonresidentsModal onClose={mockOnClose} data={mockData} />);
    
    const highLoadRow = screen.getByText('ГКБ №1').closest('tr');
    expect(highLoadRow).toHaveClass('bg-red-50/30');
  });

  test('Вызывает onClose при закрытии', () => {
    render(<NonresidentsModal onClose={mockOnClose} data={mockData} />);
    
    const closeBtn = screen.getByRole('button');
    fireEvent.click(closeBtn);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});