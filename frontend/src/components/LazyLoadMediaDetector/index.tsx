import { FC, useEffect, useState } from 'react';
import LazyLoadVideo from '../LazyLoadVideo';
import LazyLoadImage from '../LazyLoadImage';
interface LazyLoadMediaDetectorProps {
  url: string;
  token: string;
}

const LazyLoadMediaDetector: FC<LazyLoadMediaDetectorProps> = ({ url, token }) => {
  const [isImage, setIsImage] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const alt = url.split('/').pop()?.substring(23) || 'File'; // Extract the last part after the last slash as the alt  
  useEffect(() => {
    // Extract the file extension from the URL
    const fileExtension = url.split('.').pop()?.toLowerCase();

    // Check if the file extension corresponds to an image or a video
    setIsImage(['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(fileExtension || ''));
    setIsVideo(['mp4', 'webm', 'ogg'].includes(fileExtension || ''));
  }, [url]);

  if (isImage) {
    return <LazyLoadImage src={url + '?token=' + token} alt={alt} />;
  } else if (isVideo) {
    return <LazyLoadVideo src={url + '?token=' + token} alt={alt} />;
  } else {
    return (
      <a href={url + '?token=' + token} target="_blank" rel="noopener noreferrer">
        {alt}
      </a>
    );
  }
};

export default LazyLoadMediaDetector;
