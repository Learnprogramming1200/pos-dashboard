"use client";
import React, { useEffect, useRef, useState } from "react";

interface ScrollAnimationProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    animationClass?: string;
    threshold?: number;
    delay?: string;
}

export default function ScrollAnimation({
    children,
    className = "",
    animationClass = "animate-slide-up",
    threshold = 0.1,
    delay = "0s",
    ...props
}: ScrollAnimationProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (ref.current) observer.unobserve(ref.current);
                }
            },
            { threshold }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, [threshold]);

    return (
        <div
            ref={ref}
            className={`${className} ${isVisible ? animationClass : "opacity-0"}`}
            style={{
                animationDelay: isVisible ? delay : "0s",
                animationFillMode: "both",
                ...props.style
            }}
            {...props}
        >
            {children}
        </div>
    );
}
