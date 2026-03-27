import { ProfileSkeleton } from "@/components/skeletons";

export default function ProfileLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <ProfileSkeleton />
      </div>
    </div>
  );
}
