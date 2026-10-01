import React from 'react';
import { AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';

export function ErrorState({
  title = 'Something interrupted the conversation.',
  subtitle = 'Try again or continue with text.',
  onRetry,
  onContinueText,
}) {
  return (
    <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center max-w-md mx-auto my-6 animate-fadeIn">
      <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-base font-semibold text-vf-text dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-xs text-vf-muted dark:text-zinc-400 mb-5">
        {subtitle}
      </p>

      <div className="flex items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-vf-accent text-white text-xs font-semibold hover:bg-vf-accent-hover transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
        {onContinueText && (
          <button
            onClick={onContinueText}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-vf-border dark:border-zinc-700 text-vf-text dark:text-zinc-200 text-xs font-semibold hover:bg-black/5 dark:hover:bg-zinc-700 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Continue with Text</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorState;
