import { useState } from 'react';
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import * as m from 'motion/react-m';

export default function WaveButton() {
  const [hasWaved, setHasWaved] = useState(false);

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <div>
          <m.button
            type="button"
            aria-pressed={hasWaved}
            onClick={() => setHasWaved((value) => !value)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="cursor-pointer rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-accent motion-reduce:transition-none"
          >
            {hasWaved ? 'Wave again' : 'Send a wave'}
            <span aria-hidden="true" className="ml-3">↗</span>
          </m.button>
          <p aria-live="polite" className="mt-4 min-h-6 text-sm text-ink/65">
            {hasWaved ? 'Thanks for stopping by.' : '\u00a0'}
          </p>
        </div>
      </LazyMotion>
    </MotionConfig>
  );
}
