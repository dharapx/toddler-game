"use client";
import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useDeviceType } from "@/hooks/useDeviceType";
import GlassBackground from "@/components/GlassBackground";
import KeyPressDisplay from "@/components/character";
import AlphabetButtons from "@/components/AlphabetButtons";
// import RenderCharDetails from "@/components/dictionaryParser";
// import GrabKey from "@/hooks/grabKey"

export default function Home() {
  const [selectedChar, setSelectedChar] = useState<{ char: string; id: number }>();
  const { isMobile, isDesktop } = useDeviceType();
  // const isMobile = false
    return (
    <div className="flex items-center justify-center h-screen">
      <GlassBackground>
        <Card className="w-full h-full text-center bg-white/10 backdrop-blur-lg border-amber-50">
          <CardHeader className="space-y-1 p-0">
            <CardTitle>L E A R N  -  A L P H A B E T</CardTitle>
            {/* <CardDescription>PULAKESH DHARA</CardDescription> */}
          </CardHeader>
          <CardContent className="bg-white/10 backdrop-blur-lg">
            <div className="flex items-center justify-center h-screen">
              <div
                className={`grid gap-4 w-[90vw] max-w-[70vw] ${
                  isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
                }`}
              >
                {/* First Card */}
                <div>
                  <Card className="bg-white/10 backdrop-blur-lg">
                    <CardContent>
                      <KeyPressDisplay externalChar={selectedChar} key={Date.now()} />
                    </CardContent>
                  </Card>
                </div>

                {/* Second Card */}
                <div>
                  <KeyPressDisplay externalChar={selectedChar} key={Date.now()} triggerAltMode={true}/>
                </div>

                {/* ✅ Extra Alphabet Grid only for Mobile */}
                {isMobile && (
                  <div>
                    <Card className="bg-white/10 backdrop-blur-lg">
                      <CardContent>
                          <AlphabetButtons onSelect={(letter) => setSelectedChar({ char: letter, id: Date.now() })} />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </GlassBackground>
    </div>
  );

}
