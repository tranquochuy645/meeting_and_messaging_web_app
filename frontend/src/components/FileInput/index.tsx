import { ChangeEventHandler, FC, useRef, ReactNode } from "react";
interface FileInputProps {
    id: string;
    accept: string;//".txt, .pdf, .doc, .docx, .jpg, .jpeg, .png"
    icon: ReactNode;
    onChange: (file: any) => void;
}
const FileInput: FC<FileInputProps> = ({ onChange, accept, id, icon }) => {
    const fileInputRef = useRef(null);

    const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        if (event.target.files) {
            const file = event.target.files[0];
            onChange(file);
        }
    };

    return (
        <label id={`btn_${id}`} htmlFor={id}>
            {icon}
            <input
                id={id}
                type="file"
                accept={accept}
                ref={fileInputRef}
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
            />
        </label>
    );
};
export default FileInput