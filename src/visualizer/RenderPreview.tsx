import React from 'react';
import { useStore } from '../store';
import type { Fiber } from '../engine/types';
import { Wifi, Battery, Signal } from 'lucide-react';

const FiberToReact: React.FC<{ fiber: Fiber | null }> = ({ fiber }) => {
  if (!fiber) return null;

  const children = [];
  let child = fiber.child;
  while (child) {
    children.push(<FiberToReact key={child._debugID} fiber={child} />);
    child = child.sibling;
  }

  if (fiber.tag === 'HostText') {
    return <>{fiber.pendingProps?.nodeValue || ''}</>;
  }

  if (fiber.tag === 'HostComponent') {
    const { children: _, ...restProps } = fiber.pendingProps || {};

    // Intercept onClick to allow global visualization hooks
    const props = { ...restProps };
    if (props.onClick) {
        const originalClick = props.onClick;
        props.onClick = (e: any) => {
            // Stop propagation to prevent global click listeners from firing
            e.stopPropagation();
            originalClick(e);
            // We can add click ripple effect here if we want (CSS based, not confetti)
        };

        // Style buttons to look native to the device
        if (fiber.type === 'button') {
            props.className = "bg-blue-500 text-white px-4 py-2 rounded-lg active:scale-95 transition-transform shadow-md";
        }
    }

    return React.createElement(fiber.type, props, children);
  }

  if (fiber.tag === 'FunctionComponent' || fiber.tag === 'HostRoot') {
    return <>{children}</>;
  }

  return null;
};

export const RenderPreview: React.FC = () => {
  const currentRoot = useStore(s => s.currentRoot);

  return (
    <div id="render-preview-container" className="h-full flex flex-col bg-[#121214] relative overflow-hidden">
      {/* Device Status Bar */}
      <div className="px-4 py-2 bg-black/40 flex justify-between items-center text-[10px] text-gray-400 font-medium">
        <div className="flex items-center gap-1">
            <span>9:41</span>
        </div>
        <div className="flex items-center gap-2">
            <Signal size={10} />
            <Wifi size={10} />
            <Battery size={10} />
        </div>
      </div>

      {/* Screen Content */}
      <div className="flex-1 p-6 relative overflow-auto bg-gray-50 text-gray-900 font-sans">
        {currentRoot ? (
          <div id="preview-root" className="h-full">
             <FiberToReact fiber={currentRoot.child} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin" />
            <span className="text-xs">Booting OS...</span>
          </div>
        )}

        {/* Reflection Glare */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/5 to-transparent pointer-events-none" />
      </div>

      {/* Home Bar */}
      <div className="h-4 bg-black/40 flex justify-center items-center">
          <div className="w-24 h-1 bg-gray-600/50 rounded-full" />
      </div>
    </div>
  );
};
