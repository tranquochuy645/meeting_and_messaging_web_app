import { FC, useEffect, useState } from 'react';
interface LazyLoadVideoProps {
    src: string;
    alt: string;
}

const LazyLoadVideo: FC<LazyLoadVideoProps> = ({ src, alt }) => {
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setIsIntersecting(true);
                    observer.unobserve(entry.target); // Stop observing the element once it's visible
                }
            });
        });

        const element = document.getElementById(`lazyload-element-${src}`);
        if (element) {
            observer.observe(element);
        }

        return () => {
            if (element) {
                observer.unobserve(element); // Cleanup the observer on unmount
            }
        };
    }, [src]);

    return (
        <video
            className='lazyload-element'
            id={`lazyload-element-${src}`}
            controls={true}
            autoPlay={false}
            playsInline={true}
            src={isIntersecting ? src : ''}
        >
            {alt}
        </video>
    );
};

export default LazyLoadVideo;
