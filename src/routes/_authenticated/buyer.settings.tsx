import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/lib/auth";
import { SettingsPage } from "@/components/shop/SettingsPage";

export const Route = createFileRoute("/_authenticated/buyer/settings")({
  component: () => (
    <RoleGate role="buyer">
      <SettingsPage module="buyer" />
    </RoleGate>
  ),
});
