import React from "react";
import { Button } from "./ui/button";

const HeroComponent = () => {
  return (
    <div
      className="relative h-screen flex items-center px-20"
      //   style={{
      //     backgroundImage: "url('/hero.png')",
      //     backgroundSize: "cover",
      //     backgroundPosition: "center",
      //   }}
    >
      {/* <div className="absolute inset-0 bg-black/30"></div> */}

      <div className="relative z-10 flex flex-col gap-10 max-w-4xl">
        <h1 className="uppercase font-poppins font-bold text-3xl md:text-5xl lg:text-8xl text-primary leading-tight">
          INFLUENCE <br />
          FABRICS
        </h1>

        <div className="flex flex-row gap-4">
          <Button>Explore</Button>
          <Button>Shop Now</Button>
        </div>
      </div>

      <p className="absolute bottom-6 right-20 font-serif font-semibold italic text-base md:text-lg text-black max-w-xs text-right">
        {`"Premium Ankara fabrics crafted for modern elegance and timeless African
        style."`}
      </p>
    </div>
  );
};

export default HeroComponent;
