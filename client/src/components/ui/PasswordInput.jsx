import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Input from './Input.jsx';

// Input with a show/hide toggle (a real <button>, reachable by keyboard).
const PasswordInput = forwardRef(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <Input
      ref={ref}
      type={visible ? 'text' : 'password'}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="rounded-lg p-1.5 text-muted hover:bg-white/5 hover:text-white"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
      }
      {...props}
    />
  );
});

export default PasswordInput;
