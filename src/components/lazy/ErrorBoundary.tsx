"use client";
import React from "react";
export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }
  componentDidCatch(): void {}
  render(): React.ReactNode {
    if (this.state.hasError) {
      return <div className="p-4 text-sm text-red-600">Failed to load component</div>;
    }
    return this.props.children;
  }
}
