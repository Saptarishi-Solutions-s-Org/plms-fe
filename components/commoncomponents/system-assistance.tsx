"use client";

import { useState, useEffect } from "react";
import { Info, Phone, Mail, HelpCircle, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

type Position = "bottom-right" | "bottom-left" | "top-right" | "top-left";

const positionClasses: Record<Position, string> = {
  "bottom-right": "bottom-6 right-6",
  "bottom-left": "bottom-6 left-6",
  "top-right": "top-6 right-6",
  "top-left": "top-6 left-6",
};

export function SystemAssistancePopover() {
  const [position, setPosition] = useState<Position>("bottom-right");

  useEffect(() => {
    const saved = sessionStorage.getItem("system-assist-position") as Position;
    if (saved && positionClasses[saved]) {
      setPosition(saved);
    }
  }, []);

  const updatePosition = (pos: Position) => {
    setPosition(pos);
    sessionStorage.setItem("system-assist-position", pos);
  };

  return (
    <div className={`fixed z-[999] ${positionClasses[position]}`}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl shadow-md"
          >
            <Info className="h-3 w-3" />
          </Button>
        </PopoverTrigger>

        <PopoverContent side="top" align="end" className="w-64 p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                <h4 className="font-semibold text-xs">System Assistance</h4>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-6 w-6">
                    <Move className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-40 p-2">
                  <div className="grid gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs justify-start"
                      onClick={() => updatePosition("top-left")}
                    >
                      Top Left
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs justify-start"
                      onClick={() => updatePosition("top-right")}
                    >
                      Top Right
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs justify-start"
                      onClick={() => updatePosition("bottom-left")}
                    >
                      Bottom Left
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs justify-start"
                      onClick={() => updatePosition("bottom-right")}
                    >
                      Bottom Right
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium">Sriram Gandrothu</p>

              <a
                href="tel:+917842713943"
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"
              >
                <Phone className="h-3 w-3" />
                +91 78427 13943
              </a>

              <a
                href="mailto:sriram.gandrothu@saptarishi.tech"
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"
              >
                <Mail className="h-3 w-3" />
                sriram.gandrothu@saptarishi.tech
              </a>
            </div>

            <Separator />

            <div className="space-y-1">
              <p className="text-xs font-medium">Nani Rongali</p>

              <a
                href="tel:+918332889468"
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"
              >
                <Phone className="h-3 w-3" />
                +91 83328 89468
              </a>

              <a
                href="mailto:nani.rongali@saptarishi.tech"
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"
              >
                <Mail className="h-3 w-3" />
                nani.rongali@saptarishi.tech
              </a>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
