'use client';

import { useEffect, useState } from 'react';

interface HeroHeadingProps {
  mainText: string;
  secondaryText: string;
  typingSpeed?: number;
  typingStartDelay?: number;
  typingRestartDelay?: number;
  typingPauseDelay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function HeroHeading({
  mainText,
  secondaryText,
  typingSpeed = 150,
  typingStartDelay = 500,
  typingRestartDelay = 5000,
  typingPauseDelay = 2000,
  className = '',
  style = {},
}: HeroHeadingProps) {
  const [typedText, setTypedText] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize after component mounts
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Typing effect for main text
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    let currentIndex = 0;
    setTypedText(''); // Reset text

    // Delay before typing starts
    const initialDelay = setTimeout(() => {
      // Start typing
      const typingInterval = setInterval(() => {
        if (currentIndex < mainText.length) {
          setTypedText(mainText.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);

          // Optional: Add blinking cursor effect after typing
          // or restart the animation after a pause
          setTimeout(() => {
            setTypedText('');
            currentIndex = 0;

            // Wait a bit before restarting
            setTimeout(() => {
              const restartTyping = setInterval(() => {
                if (currentIndex < mainText.length) {
                  setTypedText(mainText.substring(0, currentIndex + 1));
                  currentIndex++;
                } else {
                  clearInterval(restartTyping);
                }
              }, typingSpeed);
            }, typingPauseDelay);
          }, typingRestartDelay);
        }
      }, typingSpeed);

      return () => {
        clearInterval(typingInterval);
      };
    }, typingStartDelay);

    return () => clearTimeout(initialDelay);
  }, [isLoaded, mainText, typingSpeed, typingStartDelay, typingRestartDelay, typingPauseDelay]);

  return (
    <h1
      className={`font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 text-white tracking-tighter leading-tight ${className}`}
      style={style}
    >
      <span className="bg-gradient-to-r from-[#304FFE] via-[#5E72E4] to-[#7E57C2] bg-clip-text text-transparent inline-block bg-size-200 animate-gradient relative">
        {typedText}
        <span
          className={`${
            typedText.length < mainText.length ? 'inline-block' : 'hidden'
          } w-0.5 h-[80%] bg-[#5E72E4] ml-[1px] absolute right-0 top-[10%] animate-blink`}
        />
      </span>{' '}
      <span className="whitespace-normal sm:whitespace-nowrap relative inline-block">
        {secondaryText}
        <span className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary/0 via-primary/80 to-primary/0 transform scale-x-0 origin-left transition-transform group-hover:scale-x-100" />
      </span>
    </h1>
  );
}
