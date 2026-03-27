import { LoadingSpinner } from '@/app/components/ui';

export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="md" className="mb-4" />
        <p className="text-sm text-slate-600">Loading...</p>
      </div>
    </div>
  );
}
