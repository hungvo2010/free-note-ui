import { Profiler, ProfilerOnRenderCallback, ReactNode } from "react";

interface AppProfilerProps {
  children: ReactNode;
  id?: string;
  enabled?: boolean;
}

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  console.group(`⚡ Profiler: ${id}`);
  console.log(`Phase: ${phase}`);
  console.log(`Actual duration: ${actualDuration.toFixed(2)}ms`);
  console.log(`Base duration: ${baseDuration.toFixed(2)}ms`);
  console.log(`Start time: ${startTime.toFixed(2)}ms`);
  console.log(`Commit time: ${commitTime.toFixed(2)}ms`);
  console.groupEnd();
};

export function AppProfiler({ children, id = "App", enabled = true }: AppProfilerProps) {
  if (!enabled || import.meta.env.PROD) {
    return <>{children}</>;
  }

  return (
    <Profiler id={id} onRender={onRenderCallback}>
      {children}
    </Profiler>
  );
}
