import { useMutation } from "@tanstack/react-query";
import { api, type InsertVisit } from "@shared/routes";

export function useLogVisit() {
  return useMutation({
    mutationFn: async (data: InsertVisit) => {
      const res = await fetch(api.logVisit.path, {
        method: api.logVisit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        throw new Error("Failed to log visit");
      }
      
      return api.logVisit.responses[201].parse(await res.json());
    },
  });
}
