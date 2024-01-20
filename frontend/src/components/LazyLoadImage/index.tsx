import { FC, useEffect, useState } from 'react';
import "./style.css"
interface LazyLoadImageProps {
    src: string;
    alt: string;
}

const LazyLoadImage: FC<LazyLoadImageProps> = ({ src, alt }) => {
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
        <img
            className="image"
            id={`lazyload-element-${src}`}
            src={isIntersecting ? src : ''}
            loading='lazy'
            alt={alt}
        />
    );
};

export default LazyLoadImage;
