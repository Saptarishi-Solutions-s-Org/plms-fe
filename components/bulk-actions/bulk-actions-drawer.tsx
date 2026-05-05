"use client";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerTrigger, DrawerContent } from "@/components/ui/drawer";
import { BulkActionsUI } from "./bulk-actions-ui";

export function BulkActionsDrawer() {
  return (
    <Drawer direction="bottom">
      <DrawerTrigger asChild>
        <Button>Bulk Action</Button>
      </DrawerTrigger>

      <DrawerContent className="h-[95vh] p-0">
        <BulkActionsUI />
      </DrawerContent>
    </Drawer>
  );
}