import RosterViewer from '@/components/roster-viewer';

export default function Home() {
  return (
    <main className='min-h-screen bg-background p-4 md:p-8'>
      <div className='max-w-6xl mx-auto'>
        <header className='mb-8 print:hidden'>
          <h1 className='text-3xl font-bold tracking-tight'>Escala 2x2</h1>
          <p className='text-muted-foreground mt-2'>
            Consulte a escala de trabalho das Equipes
          </p>
        </header>

        <RosterViewer />
      </div>
    </main>
  );
}
