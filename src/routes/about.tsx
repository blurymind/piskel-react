import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-1 h-full w-full">
      iframe testing ground for integrating other webapps with a react frame
    </div>
  );
}
