import { FC } from 'react';
import "./style.css";

interface PendingFigureProps {
  size: number;
}

const PendingFigure: FC<PendingFigureProps> = ({ size }) => {
  return (
    <div className='pending-figure'>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
      >
        <circle cx="12" cy="12" r="10" fill="none" strokeWidth="2" stroke="currentColor">
          <animate
            attributeName="stroke-dasharray"
            dur="1.5s"
            repeatCount="indefinite"
            from="0 80"
            to="300 20"
          />
          <animate
            attributeName="stroke-dashoffset"
            dur="1.5s"
            repeatCount="indefinite"
            from="0"
            to="-260"
          />
        </circle>
      </svg>
    </div>
  );
};

export default PendingFigure;
