import { LogoMark } from "@/components/Logo";

export default function Loading() {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center gap-4">
      <LogoMark className="size-12 animate-pulse" />
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-brand-100">
        <div className="h-full w-1/2 animate-[loading_1.1s_ease-in-out_infinite] rounded-full bg-brand-500" />
      </div>
    </div>
  );
}
