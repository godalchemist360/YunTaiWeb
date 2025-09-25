import BackButtonSmall from '@/components/shared/back-button-small';

/**
 * auth layout is different from other public layouts,
 * so auth directory is not put in (public) directory.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/images/yourtime-bg.png')"
      }}
    >
      <BackButtonSmall className="absolute top-6 left-6 z-20 text-white hover:text-amber-400" />
      <div className="flex h-full items-center justify-center">
        <div className="flex w-full max-w-sm flex-col gap-6 px-6">{children}</div>
      </div>
    </div>
  );
}
