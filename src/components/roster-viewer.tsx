'use client';

import React, { useState } from 'react';
import { format, getDay, addMonths, subDays, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Printer } from 'lucide-react';
import { generateSchedule, Team } from '@/utils/schedule';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// --- LÓGICA DE FERIADOS ---

const getEasterDate = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
};

// Agora retorna um MAP: 'dd/MM' => 'Nome do Feriado'
const getHolidaysForYear = (year: number) => {
  const easter = getEasterDate(year);
  const carnival = subDays(easter, 47);
  const goodFriday = subDays(easter, 2);
  const corpusChristi = addDays(easter, 60);

  const holidays = new Map<string, string>();

  // Função auxiliar para facilitar a inserção
  const add = (date: Date, name: string) => {
    holidays.set(format(date, 'dd/MM'), name);
  };
  const addFixed = (dateStr: string, name: string) => {
    holidays.set(dateStr, name);
  };

  // Feriados Móveis
  add(carnival, 'Carnaval');
  add(goodFriday, 'Sexta-feira Santa');
  add(easter, 'Páscoa');
  add(corpusChristi, 'Corpus Christi');

  // Feriados Fixos
  addFixed('01/01', 'Ano Novo');
  addFixed('21/04', 'Tiradentes');
  addFixed('01/05', 'Dia do Trabalho');
  addFixed('15/08', 'Aniversário Sorocaba');
  addFixed('07/09', 'Independência');
  addFixed('12/10', 'N. Sra. Aparecida');
  addFixed('02/11', 'Finados');
  addFixed('15/11', 'Proclamação Rep.');
  addFixed('20/11', 'Consciência Negra');
  addFixed('25/12', 'Natal');

  return holidays;
};

export default function RosterViewer() {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    if (date) setIsPopoverOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // --- CÁLCULOS ---

  const endDate = startDate ? addMonths(startDate, 3) : undefined;

  // Mapa de feriados ativos para o período selecionado
  const activeHolidays = new Map<string, string>();

  if (startDate && endDate) {
    const yearsToCheck = new Set<number>();
    yearsToCheck.add(startDate.getFullYear());
    yearsToCheck.add(endDate.getFullYear());

    yearsToCheck.forEach((year) => {
      const yearHolidays = getHolidaysForYear(year);
      // Mescla os mapas
      yearHolidays.forEach((name, dateStr) => {
        activeHolidays.set(dateStr, name);
      });
    });
  }

  const scheduleData =
    startDate && endDate ? generateSchedule(startDate, endDate) : [];

  const startDayOfWeek =
    scheduleData.length > 0 ? getDay(scheduleData[0].date) : 0;
  const emptyDays = Array(startDayOfWeek).fill(null);
  const calendarGrid = [...emptyDays, ...scheduleData];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className='space-y-6 print:space-y-2'>
      {/* Controles */}
      <div className='print:hidden flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-secondary p-4 rounded-lg'>
        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium text-muted-foreground'>
            Data de Início (Gera 3 meses):
          </label>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-72 justify-start text-left font-normal',
                  !startDate && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {startDate ? (
                  format(startDate, 'dd/MM/yyyy')
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                mode='single'
                selected={startDate}
                onSelect={handleDateSelect}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button onClick={handlePrint} className='w-full md:w-auto'>
          <Printer className='mr-2 h-4 w-4' />
          Imprimir / Salvar PDF
        </Button>
      </div>

      {/* Visualização */}
      <div className='print:block print:w-full'>
        {scheduleData.length > 0 ? (
          <div className='space-y-4 print:space-y-2'>
            <div className='text-center mb-6 hidden print:block print:mb-2'>
              <h1 className='text-2xl font-bold print:text-lg'>
                Escala de Trabalho 2x2
              </h1>
              <p className='text-gray-500 print:text-sm'>
                Período: {format(startDate!, 'dd/MM/yyyy')} até{' '}
                {format(endDate!, 'dd/MM/yyyy')}
              </p>
            </div>

            <div className='hidden md:grid print:grid grid-cols-7 gap-4 print:gap-1 mb-2'>
              {weekDays.map((day) => (
                <div
                  key={day}
                  className='text-center text-sm font-bold text-muted-foreground uppercase border-b pb-2 print:text-xs print:pb-0 print:border-b-2 print:border-gray-400 print:text-black'
                >
                  {day}
                </div>
              ))}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-7 lg:grid-cols-7 gap-4 print:grid-cols-7 print:gap-1 print:text-xs'>
              {calendarGrid.map((item, idx) => {
                if (item === null) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className='hidden md:block print:block p-3'
                    />
                  );
                }

                const day = item;
                const isWeekend =
                  day.date.getDay() === 0 || day.date.getDay() === 6;
                const isGroup1 = day.workingTeams.includes('T-1');

                const dateStr = format(day.date, 'dd/MM');
                const holidayName = activeHolidays.get(dateStr);
                const isDayHoliday = !!holidayName;

                return (
                  <Card
                    key={day.date.toISOString()}
                    className={cn(
                      'border-2 transition-all hover:shadow-md',
                      'print:shadow-none print:border print:break-inside-avoid print:h-auto',
                      isGroup1
                        ? 'border-blue-200 bg-blue-50 dark:bg-blue-950/20 print:bg-blue-100 print:border-blue-400'
                        : 'border-green-200 bg-green-50 dark:bg-green-950/20 print:bg-green-100 print:border-green-400',
                      isWeekend && 'opacity-90 print:opacity-100',
                    )}
                  >
                    <CardHeader className='p-3 pb-2 text-center print:p-1 print:pb-0'>
                      <CardTitle className='text-sm font-semibold flex justify-between items-start md:justify-center print:justify-between print:text-[10px]'>
                        {/* Dia da semana (mobile) */}
                        <span className='opacity-70 text-xs uppercase md:hidden print:hidden mt-1'>
                          {format(day.date, 'EEE', { locale: ptBR })}
                        </span>

                        {/* Bloco da Data + Nome do Feriado */}
                        <div className='flex flex-col items-end md:items-center w-full'>
                          <span
                            className={cn(
                              'text-lg print:text-xs print:font-bold',
                              isDayHoliday &&
                                'text-red-600 font-bold print:text-red-600',
                            )}
                          >
                            {dateStr}
                          </span>

                          {/* Nome do Feriado em Vermelho Ghost */}
                          {holidayName && (
                            <span className='text-[9px] md:text-[10px] text-red-500 font-medium leading-tight text-right md:text-center truncate w-full print:text-red-600 print:text-[8px] print:block'>
                              {holidayName}
                            </span>
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='p-3 pt-0 text-center print:p-1'>
                      <div className='mt-2 flex flex-col gap-0 items-center justify-center font-bold text-lg print:text-xs leading-none'>
                        {day.workingTeams.map((team: Team) => (
                          <span key={team} className='block'>
                            {team}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <div className='text-center py-10 text-muted-foreground flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg'>
            <CalendarIcon className='h-10 w-10 text-muted-foreground mb-4 opacity-50' />
            <p className='text-lg font-medium'>Selecione a data de início</p>
            <p className='text-sm'>
              A escala de 3 meses será gerada automaticamente.
            </p>
          </div>
        )}
      </div>

      <div className='hidden print:block fixed bottom-2 w-full text-center text-[10px] text-gray-400'>
        Gerado automaticamente - Escala 2x2
      </div>
    </div>
  );
}
