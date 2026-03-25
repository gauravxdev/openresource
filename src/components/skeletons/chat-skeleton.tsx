import { Skeleton } from "@/components/ui/skeleton";

function ChatHeaderSkeleton() {
  return (
    <header className="border-border/50 bg-background/80 sticky top-0 z-20 flex items-center border-b backdrop-blur-sm">
      <div className="mx-auto flex h-full w-full max-w-[1152px] items-center gap-2 px-5 py-2 md:px-6">
        <Skeleton className="size-8 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="size-4 rounded-sm" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="ml-auto h-8 w-24 rounded-md" />
      </div>
    </header>
  );
}

function GreetingSkeleton() {
  return (
    <div className="mx-auto flex size-full max-w-2xl flex-col items-center justify-center px-4 md:px-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <Skeleton className="size-14 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="mx-auto h-8 w-48" />
          <Skeleton className="mx-auto h-6 w-56" />
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-28 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

function InputSkeleton() {
  return (
    <div className="bg-background sticky bottom-0 z-10 mx-auto flex w-full max-w-4xl gap-2 border-t-0 px-2 pb-3 md:px-4 md:pb-4">
      <div className="flex w-full flex-col gap-4">
        <div className="border-border bg-background rounded-xl border p-3 shadow-xs">
          <Skeleton className="h-11 w-full" />
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-8 w-[180px] rounded-md" />
            </div>
            <Skeleton className="size-8 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="bg-background flex h-full min-w-0 flex-col">
      <ChatHeaderSkeleton />
      <div className="bg-background relative flex-1">
        <div className="bg-background absolute inset-0 touch-pan-y overflow-y-auto">
          <div className="mx-auto flex max-w-4xl min-w-0 flex-col gap-6 px-4 py-6 md:gap-8 md:px-6">
            <GreetingSkeleton />
          </div>
        </div>
      </div>
      <InputSkeleton />
    </div>
  );
}

function AssistantMessageSkeleton() {
  return (
    <div className="flex w-full justify-start">
      <Skeleton className="mt-0.5 mr-3 size-8 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-col gap-2">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-4 w-52" />
      </div>
    </div>
  );
}

function UserMessageSkeleton() {
  return (
    <div className="flex w-full justify-end">
      <div className="flex min-w-0 flex-col gap-2 sm:max-w-[75%]">
        <Skeleton className="ml-auto h-10 w-48 rounded-2xl rounded-br-md" />
      </div>
    </div>
  );
}

export function ChatWithMessagesSkeleton() {
  return (
    <div className="bg-background flex h-full min-w-0 flex-col">
      <ChatHeaderSkeleton />
      <div className="bg-background relative flex-1">
        <div className="bg-background absolute inset-0 touch-pan-y overflow-y-auto">
          <div className="mx-auto flex max-w-4xl min-w-0 flex-col gap-6 px-4 py-6 md:gap-8 md:px-6">
            <UserMessageSkeleton />
            <AssistantMessageSkeleton />
            <UserMessageSkeleton />
            <AssistantMessageSkeleton />
          </div>
        </div>
      </div>
      <InputSkeleton />
    </div>
  );
}
