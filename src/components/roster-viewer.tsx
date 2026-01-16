'use client';

import React, { useState } from 'react';
import { format, addMonths, differenceInDays, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Printer } from 'lucide-react';
import { generateSchedule, Team } from '@/utils/schedule';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RosterViewer() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addMonths(new Date(), 1),
  });

  const handleDateSelect = (range: DateRange | undefined) => {
    if (!range) {
      setDate(undefined);
      return;
    }

    if (range.from && range.to) {
      const diff = differenceInDays(range.to, range.from);

      if (diff > 90) {
        alert('O período máximo é de 3 meses.');
        setDate({ from: range.from, to: undefined });
        return;
      }
      setDate(range);
    } else {
      setDate(range);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const scheduleData =
    date?.from && date?.to ? generateSchedule(date.from, date.to) : [];

  const startDayOfWeek =
    scheduleData.length > 0 ? getDay(scheduleData[0].date) : 0;
  const emptyDays = Array(startDayOfWeek).fill(null);
  const calendarGrid = [...emptyDays, ...scheduleData];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className='space-y-6 print:space-y-2'>
      {/* Controles - Ocultos na Impressão */}
      <div className='print:hidden flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-secondary p-4 rounded-lg'>
        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium text-muted-foreground'>
            Selecione o Período (Max 3 meses):
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-300px justify-start text-left font-normal',
                  !date && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, 'dd/MM/yyyy')} -{' '}
                      {format(date.to, 'dd/MM/yyyy')}
                    </>
                  ) : (
                    format(date.from, 'dd/MM/yyyy')
                  )
                ) : (
                  <span>Selecione as datas</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                initialFocus
                mode='range'
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleDateSelect}
                numberOfMonths={2}
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

      {/* Visualização da Escala */}
      <div className='print:block print:w-full'>
        {scheduleData.length > 0 ? (
          <div className='space-y-4 print:space-y-2'>
            <div className='text-center mb-6 hidden print:block print:mb-2'>
              <h1 className='text-2xl font-bold print:text-lg'>
                Escala de Trabalho 2x2
              </h1>
              <p className='text-gray-500 print:text-sm'>
                Período: {format(date!.from!, 'dd/MM/yyyy')} até{' '}
                {format(date!.to!, 'dd/MM/yyyy')}
              </p>
            </div>

            {/* Cabeçalho dias da semana */}
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

            {/* Grid do Calendário */}
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

                return (
                  <Card
                    key={day.date.toISOString()}
                    className={cn(
                      // Classes base
                      'border-2 transition-all hover:shadow-md',
                      // Classes de Impressão (importante: break-inside-avoid)
                      'print:shadow-none print:border print:break-inside-avoid print:h-auto',

                      // Cores (Ajustadas para impressão mais forte)
                      isGroup1
                        ? 'border-blue-200 bg-blue-50 dark:bg-blue-950/20 print:bg-blue-100 print:border-blue-400'
                        : 'border-green-200 bg-green-50 dark:bg-green-950/20 print:bg-green-100 print:border-green-400',

                      // Fim de semana visualmente diferente apenas na tela
                      isWeekend && 'opacity-90 print:opacity-100',
                    )}
                  >
                    <CardHeader className='p-3 pb-2 text-center print:p-1 print:pb-0'>
                      <CardTitle className='text-sm font-semibold flex justify-between items-center md:justify-center print:justify-between print:text-[10px]'>
                        <span className='opacity-70 text-xs uppercase md:hidden print:hidden'>
                          {format(day.date, 'EEE', { locale: ptBR })}
                        </span>
                        <span className='text-lg print:text-xs print:font-bold'>
                          {format(day.date, 'dd/MM')}
                        </span>
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
            <p className='text-lg font-medium'>
              Selecione o início e o fim da escala
            </p>
            <p className='text-sm'>
              Clique no botão de data acima para começar.
            </p>
          </div>
        )}
      </div>

      <div className='hidden print:block fixed bottom-2 w-full text-center text-[10px] text-gray-400'>
        <p>Elaborada por Ale Cardoso, para simples consulta.</p>
      </div>
    </div>
  );
}
