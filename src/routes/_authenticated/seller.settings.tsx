import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/lib/auth";
import { SettingsPage } from "@/components/shop/SettingsPage";

export const Route = createFileRoute("/_authenticated/seller/settings")({
  component: () => (
    <RoleGate role="seller">
      <SettingsPage module="seller" />
    </RoleGate>
  ),
});
