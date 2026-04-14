import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app";
import "./index.css";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

export const queryClient = new QueryClient();

const globalClass = "bg-gray-200 text-gray-800";
// Create a new router instance
export const router = createRouter({
  routeTree,
  defaultPendingComponent: () => (
    <div className={`p-2 text-2xl font-bold ${globalClass}`}>
      <span>Loading...</span>
    </div>
  ),
  defaultErrorComponent: ({ error }) => (
    <div className={`p-2 text-2xl font-bold text-red-500 ${globalClass}`}>
      <span>Error: {error.message}</span>
    </div>
  ),
  context: {
    // queryClient,
    auth: {
      user: null,
      loading: false,
    },
  },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
// omfg https://stackoverflow.com/questions/72851548/permission-denied-to-github-actionsbot
createRoot(document.getElementById("root")!).render(
     <App />
     
  // <StrictMode>
  //   {/* <QueryClientProvider client={queryClient}> */}
  //     <App />
  //   {/* </QueryClientProvider> */}
  // </StrictMode>,
);
